# Deep Seek

A wrapper around DeepSeek which exposes an API for functions and json

## Installation

```bash
# If this is your first time build the Docker container,
# you may need to manually increase the memory to 8.8GB+
bun run docker:build
bun run docker:run

# You can test it's running by executing the following:
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Hello!"
}'

# NOTE: To run this program, do the following:
bun install
bun run dev
```

## Llama2 Model

The following example type represents the request body for the Llama2 model:

```ts
type Llama2Request = {
  "model": "string",      // Model name
  "prompt": "string",     // Input prompt
  "stream": boolean,      // Stream responses
  "raw": boolean,         // Raw model output
  "template": "string",   // Custom prompt template
  "context": [],          // Previous context array
  "system": "string",     // System prompt
  "temperature": float,   // 0-1, default 0.8
  "top_p": float,         // 0-1, default 0.9
  "top_k": int,           // 1-100, default 40
  "num_predict": int,     // Max tokens to generate
  "stop": ["string"],     // Stop sequences
  "repeat_penalty": float // 0-2, default 1.1
}
```

## About

Currently this project just creates a docker container with the specified AI model,
the Bun portion exposes an TypeScript API to interact with the model.
