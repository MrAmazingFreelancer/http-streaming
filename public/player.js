/* eslint-env browser */
(() => {
  const status = document.getElementById('playback-status');
  const errorBox = document.getElementById('player-error');
  const name = document.getElementById('stream-name');
  const input = document.getElementById('stream-url');
  const format = document.getElementById('stream-format');
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

  function load(source) {
    errorBox.hidden = true;
    name.textContent = source.name;
    status.textContent = 'Loading…';
    player.pause();
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
  player.on('error', () => {
    status.textContent = 'Unable to play';
    showError('This stream could not be played. Check the URL and format. For HLS or DASH, the media server must allow cross-origin requests. You can also try a sample below.');
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
        showError('Select HLS, DASH, or MP4 for URLs without a recognised file extension.');
        return;
      }
    }
    load({src: url.href, type, name: 'Your stream · ' + url.hostname});
  });

  document.querySelectorAll('[data-sample]').forEach(button => {
    button.addEventListener('click', () => {
      const sample = samples[button.dataset.sample];

      input.value = sample.src;
      format.value = 'auto';
      load(sample);
    });
  });

  load(samples.hls);
})();
