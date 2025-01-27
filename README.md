# Deep Seek

A wrapper around DeepSeek which exposes an API via Bun and Docker.

<img width="1725" alt="Screenshot 2025-01-26 at 4 34 20 PM" src="https://github.com/user-attachments/assets/9d730e27-ba5c-4d50-b949-dda701127e1e" />

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Bun](https://bun.sh/) (Optional)

## Quick Start

```bash
# Start the docker container (first time running may take longer)
docker compose up -d

# List all available models
ollama list

# Test via Docker Desktop CLI
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1:7b",
  "prompt": "Please tell me an interesting factoid?"
}'

# Start the Bun server to interact with web chat,
# NOTE: this is optional and not required, and is
# run outside the docker container.
# url: http://localhost:3000/
bun run dev

# Stop the container
docker compose down
```

## DeepSeek Models

- https://ollama.com/library/deepseek-r1

```bash
# DeepSeek Models
ollama run deepseek-r1:1.5b
ollama run deepseek-r1:7b       # Default
ollama run deepseek-r1:8b
ollama run deepseek-r1:14b
ollama run deepseek-r1:32b
ollama run deepseek-r1:70b
ollama run deepseek-r1:671b     # o1 Level
```

## Installation

```bash
# If this is your first time build the Docker container,
# you may need to manually increase the memory to 8.8GB+
bun run docker:build
bun run docker:run

# You can test it's running by executing the following:
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1:7b",
  "prompt": "Hello!"
}'

# NOTE: To run this program, do the following:
bun install
bun run dev
```

## Ollama Commands

The following are useful commands for interacting with the Ollama CLI:

```bash
# List all available models
ollama list

# Download a model
ollama pull deepseek-r1:1.5b

# Run a model
ollama run deepseek-r1:1.5b
```

## Project Structure

This project is faily minimal and contains some code for the Bun server which returns some basic frontend code for a chat interface.

- `./docker-compose.yml` - Docker compose file for running the DeepSeek container.
- `./index.ts` - Bun entry point
- `./src/*` - Root project directory.
- `./src/server/*` - Contains the Bun server-side code.
- `./src/client/*` - Contains the HTML, CSS & JS client-side code for chat.

The UI is just basic HTML, CSS, and JS and is really only meant to help test the model.

## Llama2 Model

The following example type represents the request body for the Llama2 model, although it seems all models on Ollama support these params, however, the deep seek team says the latest model may not work as expected with items like **context** or **system**.

```ts
type OllamaRequest = {
  "model": "deepseek-r1:7b",// Model name
  "prompt": "string",       // Input prompt
  "stream": boolean,        // Stream responses
  "raw": boolean,           // Raw model output
  "template": "string",     // Custom prompt template
  "context": [],            // Previous context array
  "system": "string",       // System prompt
  "temperature": float,     // 0-1, default 0.8
  "top_p": float,           // 0-1, default 0.9
  "top_k": int,             // 1-100, default 40
  "num_predict": int,       // Max tokens to generate
  "stop": ["string"],       // Stop sequences
  "repeat_penalty": float   // 0-2, default 1.1
}
```

## Additional Resources

- [DeepSeek-R1 GitHub Page](https://github.com/deepseek-ai/DeepSeek-R1)
- [Ollama Website](https://ollama.com/)
