/* eslint-env browser */
(() => {
  const status = document.getElementById('playback-status');
  const errorBox = document.getElementById('player-error');
  const name = document.getElementById('stream-name');
  const input = document.getElementById('stream-url');
  const format = document.getElementById('stream-format');
  const details = document.getElementById('stream-details');
  const copy = document.getElementById('copy-stream');
  const labels = {'application/x-mpegURL': 'HLS', 'application/dash+xml': 'DASH', 'video/mp4': 'MP4'};
  const samples = {
    hls: {
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      type: 'application/x-mpegURL',
      name: 'HLS sample · Big Buck Bunny'
    },
    mp4: {
      src: 'https://vjs.zencdn.net/v/oceans.mp4',
      type: 'video/mp4',
      name: 'MP4 sample · Oceans'
    }
  };

  if (!window.videojs || !window.videojs.Vhs) {
    errorBox.hidden = false;
    errorBox.textContent = 'The video player could not load. Refresh the page or try again shortly.';
    status.textContent = 'Player unavailable';
    return;
  }

  const player = window.videojs('stream-player', {
    controls: true,
    autoplay: false,
    preload: 'metadata',
    playbackRates: [0.5, 1, 1.5, 2]
  });

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  let loadId = 0;
  let controller;
  let currentSource;

  function httpError(code) {
    if (code === 404 || code === 410) {
      return 'This media URL is unavailable (HTTP ' + code + '). The file may have been removed or the link may have expired. Get a fresh media URL from its source.';
    }
    if (code === 401 || code === 403) {
      return 'The media server denied access (HTTP ' + code + '). This link may require sign-in or may have expired.';
    }
    return 'The media server returned HTTP ' + code + '. Try again later or use another media URL.';
  }

  async function load(source) {
    const requestId = ++loadId;

    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    const requestController = controller;
    const signal = requestController.signal;
    const timeout = setTimeout(() => requestController.abort(), 15000);

    currentSource = source;
    copy.disabled = true;
    errorBox.hidden = true;
    player.reset();
    name.textContent = source.name;
    status.textContent = 'Loading…';
    details.textContent = 'Checking stream…';
    input.value = source.src;
    if (source.type !== 'video/mp4') {
      try {
        const response = await fetch(source.src, {signal});

        if (requestId !== loadId) {
          return;
        }
        if (!response.ok) {
          if (response.body) {
            response.body.cancel();
          }
          throw new Error(httpError(response.status));
        }
        const contentType = response.headers.get('content-type') || '';

        if (!source.type && /video\/mp4/i.test(contentType)) {
          source.type = 'video/mp4';
          if (response.body) {
            response.body.cancel();
          }
        } else if (/text\/html/i.test(contentType)) {
          if (response.body) {
            response.body.cancel();
          }
          throw new Error('This URL returns a webpage. Paste a direct HLS, DASH, or MP4 media URL instead.');
        } else {
          // Limit inspection so an unknown media response cannot be downloaded in full.
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let manifest = '';

          try {
            while (manifest.length < 65536) {
              const chunk = await reader.read();

              if (chunk.done) {
                break;
              }
              manifest += decoder.decode(chunk.value, {stream: true});
              if (manifest.includes('#EXTM3U') || /<MPD[\s>]/i.test(manifest)) {
                break;
              }
            }
          } finally {
            reader.cancel();
          }
          let detected = '';

          if (manifest.trimStart().startsWith('#EXTM3U')) {
            detected = 'application/x-mpegURL';
          } else if (/<MPD[\s>]/i.test(manifest)) {
            detected = 'application/dash+xml';
          }

          if (!detected || (source.type && source.type !== detected)) {
            throw new Error('This URL does not return a valid ' + (labels[source.type] || 'HLS or DASH') + ' playlist. Check the URL and selected format. A file extension alone does not make a URL playable.');
          }
          source.type = detected;
        }
      } catch (error) {
        if (requestId !== loadId) {
          return;
        }
        status.textContent = 'Unable to load stream';
        details.textContent = 'Stream check failed';
        let message = error.message;

        if (error.name === 'AbortError') {
          message = 'The stream check timed out. Retry or check the media server.';
        } else if (error instanceof TypeError) {
          message = 'The stream could not be reached. Check your connection and URL. The media server may also be blocking cross-origin requests; the browser cannot distinguish these failures.';
        }
        showError(message);
        return;
      } finally {
        clearTimeout(timeout);
      }
    }
    clearTimeout(timeout);
    if (requestId !== loadId) {
      return;
    }
    copy.disabled = false;
    details.textContent = labels[source.type] + ' · ' + new URL(source.src).hostname;
    player.src({src: source.src, type: source.type});
  }

  player.on('loadedmetadata', () => {
    status.textContent = 'Ready to play';
  });
  player.on('playing', () => {
    status.textContent = 'Playing';
    errorBox.hidden = true;
  });
  player.on('pause', () => {
    if (!player.error()) {
      status.textContent = 'Paused';
    }
  });
  player.on('waiting', () => {
    status.textContent = 'Buffering…';
  });
  player.on('ended', () => {
    status.textContent = 'Playback complete';
  });
  player.on('error', async () => {
    const requestId = loadId;
    const source = currentSource;
    const error = player.error();

    status.textContent = 'Unable to play';
    showError(error && error.code === 3 ? 'The browser could not decode this media. Try a stream with a supported video and audio codec.' : 'Playback failed. The media may be unavailable, use an unsupported codec, or require access permissions. Try a sample to check the player.');
    try {
      const response = await fetch(source.src, {method: 'HEAD', signal: AbortSignal.timeout(8000)});

      if (requestId === loadId && !response.ok) {
        showError(httpError(response.status));
      }
    } catch (ignored) {
      // A failed cross-origin check cannot reliably identify an HTTP status.
    }
  });

  document.getElementById('source-form').addEventListener('submit', event => {
    event.preventDefault();
    let url;

    try {
      url = new URL(input.value.trim());
    } catch (error) {
      showError('Enter a valid, complete video URL.');
      return;
    }
    if (!['https:', 'http:'].includes(url.protocol)) {
      showError('Use an HTTP or HTTPS media URL.');
      return;
    }
    if (window.location.protocol === 'https:' && url.protocol === 'http:') {
      showError('Use an HTTPS media URL so your browser can play it on this secure page.');
      return;
    }
    let type = format.value;

    if (type === 'auto') {
      if (/\.m3u8$/i.test(url.pathname)) {
        type = 'application/x-mpegURL';
      } else if (/\.mpd$/i.test(url.pathname)) {
        type = 'application/dash+xml';
      } else if (/\.mp4$/i.test(url.pathname)) {
        type = 'video/mp4';
      } else {
        type = '';
      }
    }
    load({src: url.href, type, name: 'Your stream · ' + url.hostname});
  });

  document.querySelectorAll('[data-sample]').forEach(button => {
    button.addEventListener('click', () => {
      const sample = samples[button.dataset.sample];

      input.value = sample.src;
      format.value = 'auto';
      load({...sample});
    });
  });

  document.getElementById('retry-stream').addEventListener('click', () => {
    if (currentSource) {
      load({...currentSource});
    }
  });
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(currentSource.src);
      copy.textContent = 'Copied';
      setTimeout(() => {
        copy.textContent = 'Copy stream URL';
      }, 2000);
    } catch (error) {
      showError('Copy was blocked by the browser. You can copy the URL from the Stream URL field.');
    }
  });

  load({...samples.hls});
})();
