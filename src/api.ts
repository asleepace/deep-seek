export type Prompt = {
  model: string;
  prompt: string;
  stream: boolean;
};

export const api = {
  stream: false,
  protocol: "http",
  host: "localhost",
  port: 11434,
  config(params: Partial<typeof this>) {
    Object.assign(this, params);
  },
  getOptions(): RequestInit {
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };
  },
  getBaseURL() {
    return `${this.protocol}://${this.host}:${this.port}`;
  },
  path(path: string) {
    return new URL(`/api${path}`, this.getBaseURL());
  },
  async fetchPromptAtPath(path: string, prompt: Prompt) {
    const apiRoute = this.path(path);
    const apiOptions = this.getOptions();

    console.log(`[api] ${apiOptions.method} ${apiRoute}`, apiOptions, prompt);

    return fetch(apiRoute, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prompt),
    }).catch((error) => {
      console.error("[api] error:", error);
      throw error;
    });
  },
  async prompt(message: string) {
    const response = await this.fetchPromptAtPath("/generate", {
      model: "llama2",
      prompt: message,
      stream: false,
    });
    console.log("[api] response:", response.status, response.statusText);

    if (!response.body) throw new Error("No response body");
    if (!(response.body instanceof ReadableStream))
      throw new Error("No async iterator");

    const textDecoder = new TextDecoder();
    const outputBuffer: any[] = [];

    // @ts-expect-error - TS doesn't know about for-await-of
    for await (const chunk of response.body) {
      const text = textDecoder.decode(chunk);
      console.log("[api] chunk: ", text);
      const json = JSON.parse(text);
      outputBuffer.push(json);
    }

    return outputBuffer;
  },
};
