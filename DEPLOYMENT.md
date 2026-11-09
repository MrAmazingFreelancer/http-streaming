# Node.js deployment

This player uses the official Video.js HTTP Streaming v3.17.6 source and
dependency updates, with the local Express player retained.

Use Node.js 22 or 24 LTS for deployment.

Configure your hosting service with these commands:

- Install: `npm ci --include=dev`
- Build: `npm run build`
- Start: `npm start`

The build tools are development dependencies, so include them during the build.
After building, you can optionally run `npm prune --omit=dev` before starting.

The Express server listens on `0.0.0.0` and uses the host's `PORT` environment
variable, defaulting to port 3000 locally. It serves the generated `dist/` files
at both `/dist/` and the URL root. For example, the browser bundle is available
at `/dist/videojs-http-streaming.min.js`.

The home page contains a Video.js player with HLS and MP4 samples and a form for
loading HLS, DASH, or MP4 media URLs. The Video.js core, CSS, and streaming bundle
are served locally. Sample media is hosted externally; custom HLS and DASH
sources must permit cross-origin requests and use HTTPS on a secure deployment.

The player checks HLS and DASH playlist content before loading it and can detect
extensionless media URLs from their response. Failed checks time out after 15
seconds. It shows specific HTTP errors when the media server allows the browser
to inspect its response, and provides Retry stream and Copy stream URL actions.
Cross-origin restrictions can prevent the browser from identifying an HTTP error;
the player reports this uncertainty rather than assuming a missing file.

Use `npm run dev` for the original Karma server and build watcher. Use
`npm run build-test` to build the test bundle.

Commit the deployment changes, deploy that commit through your hosting service,
and confirm that `/` and `/dist/videojs-http-streaming.min.js` return HTTP 200.
