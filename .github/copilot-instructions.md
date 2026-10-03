# HTTP Streaming (VideoJS Plugin)

## Stack
- **Runtime**: Node.js 14+
- **Framework**: Video.js plugin for HLS/DASH playback
- **Language**: TypeScript
- **Build**: Rollup (CJS + ESM)
- **Testing**: Karma + Jasmine
- **Package**: npm / npmjs
- **Documentation**: JSDoc + Markdown

## Project Structure
```
src/
  streaming-manifest-plugin.ts  # Main plugin entry
  controller/                   # Stream control logic
  loader/                       # Network I/O
  demux/                        # Manifest/segment parsing
  utils/                        # Helpers
test/                           # Karma test suite
docs/                           # API docs, architecture diagrams
scripts/
  rollup.config.js              # Build configuration
  karma.conf.js                 # Test configuration
```

## Key Patterns
- **Video.js Plugin**: Registers as `httpStreaming` plugin with Video.js
- **HLS + DASH**: Supports both HTTP Live Streaming and MPEG-DASH
- **Fallback**: Works where native HLS/DASH isn't supported
- **Adaptive Bitrate**: Automatic quality switching
- **Type-Safe**: Full TypeScript definitions

## Common Commands
```bash
npm install                    # Install dependencies
npm run build                  # Full production build
npm run build-prod             # Production optimized build
npm run test                   # Lint + build + test suite
npm run lint                   # ESLint check
npm start                      # Dev server + file watcher
npm run docs                   # Generate API docs
npm run docs:images            # Render architecture diagrams
```

## Important Files
- `src/streaming-manifest-plugin.ts` — Plugin main entry point
- `src/controller/` — Streaming state machine & control
- `src/loader/` — Segment & manifest fetching
- `scripts/rollup.config.js` — Build config
- `docs/` — Architecture diagrams & API docs (generated)

## Notes
- This is a fork of videojs/http-streaming on branch `MrAmazingFreelancer/issue1597` (issue fix)
- Always test with Video.js version pinned in package.json before merging
- Build output is consumed by VideoJS ecosystem; avoid breaking API changes
- Run `npm run docs` to update architecture diagrams & API reference
