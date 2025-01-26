// run a prompt on the container
import { api } from "./src/api";
import { exec } from "./src/exec";

console.log("[app] started!");

const shouldStartNewContainer = false;

// spawn the container on port 11434

if (shouldStartNewContainer) {
  const continer = await exec(
    "docker run -d --name ollama -p 11434:11434 -v ollama-volume:/root/.ollama ollama-container",
  );
}

api.config({
  port: 11434,
});

api
  .prompt(
    `
[system]: You are a helpful chat agent.
  1. Please only respond with answers to the questions.
  2. Please do not provide any additional information.
  3. Please do not ask any questions.
  4. Please do not provide any opinions.
  5. Please do not provide any information that is not based on facts.
  6. Please keep answers as short as possible.
  7. Please remain professional at all times.

[user]:
  Please tell me an interesting geography fact?
`.trim(),
  )
  .then((data) => console.log("[app] data:", data))
  .catch((error) => console.error("[app] error:", error));
