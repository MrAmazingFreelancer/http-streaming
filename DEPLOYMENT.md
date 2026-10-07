# Node.js deployment

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

Use `npm run dev` for the original Karma server and build watcher. Use
`npm run build-test` to build the test bundle.

Commit the deployment changes, deploy that commit through your hosting service,
and confirm that `/` and `/dist/videojs-http-streaming.min.js` return HTTP 200.
