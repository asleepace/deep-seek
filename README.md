# Deep Seek

A wrapper around DeepSeek which exposes an API for functions and json

## Installation

```bash
# NOTE: this only needs to be done once, and you may need
# to manually increase the memory limits in Docker.
bun run docker:build
bun run docker:run

# NOTE: To run this program, do the following:
bun install
bun run dev
```

## About

Currently this project just creates a docker container with the specified AI model,
the Bun portion exposes an TypeScript API to interact with the model.
