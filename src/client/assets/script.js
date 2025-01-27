/**
 * ## Chat Client
 * By Colin Teahan (1/26/2025)
 *
 * Simple non-fancy state and UI/X management for the chat, make
 * sure the `DEEP_SEEK_API_URL` is set to the correct endpoint and
 * the docker container is running.
 *
 */
class Chat {
  // Model Constants
  static DEEP_SEEK_API_URL = "http://localhost:11434/api/generate";
  static DEEP_SEEK_MODEL = "deepseek-r1:7b";

  // DOM References
  static {
    this.promptRef = document.querySelector("textarea");
    this.resultsRef = document.getElementById("chat-results");

    const modelNameRef = document.getElementById("model-name");
    modelNameRef.innerHTML = Chat.DEEP_SEEK_MODEL;
  }

  static scrollToBottom() {
    const chatOutput = document.getElementsByTagName("main").item(0);
    window.requestAnimationFrame(() => {
      const scrollHeight = chatOutput.scrollHeight;
      chatOutput.scrollTo({
        top: scrollHeight,
        behavior: "smooth",
      });
    });
  }

  static prompt(message) {
    return fetch(Chat.DEEP_SEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Chat.DEEP_SEEK_MODEL,
        prompt: message?.trim(),
      }),
    });
  }

  /* * * * instance properties * * * */

  decoder = new TextDecoder();
  options = {};
  isSending = false;
  messages = [];

  constructor(options = {}) {
    console.log("Hello, world!");
    this.options = options;
  }

  insert({ model = Chat.DEEP_SEEK_MODEL, response = "" }) {
    const message = {
      model,
      response,
      created_at: new Date().toISOString(),
    };

    this.messages.push(message);
    requestAnimationFrame(() => {
      this.render();
    });
    return this.getLastMessage();
  }

  async onTriggerPrompt(message) {
    this.insert({ model: "user", response: message });
    const response = await Chat.prompt(message);
    const messageRef = this.insert({ response: "" });
    for await (const chunk of response.body) {
      const data = this.decodeChunk(chunk);
      messageRef.response += data.response;
      this.render();
    }
    this.render();
  }

  decodeChunk(chunk) {
    const text = this.decoder.decode(chunk);
    return JSON.parse(text);
  }

  clearChat() {
    Chat.resultsRef.innerHTML = "";
  }

  getLastMessage() {
    return this.messages[this.messages.length - 1];
  }

  sanitize(html) {
    return html
      .trim()
      .replace("\n", "<br /><br />")
      .replace("<think><br>", "<think>")
      .replace("<think><br>", "<think>")
      .replace(
        "<think>",
        "<think><label class='chat-think'>Chain of thought</label>",
      )
      .replace(/<think>.*?<\/think>/g, /<pre>.*?<\/pre>/g)
      .replace(/<pre>.*?<\/pre>/g, (match) => {
        return match.replace(/<br \/>/g, "\n");
      });
  }

  render() {
    this.clearChat();
    this.messages.forEach((message, index) => {
      const uniqueId = `chat-message-${index}`;
      const listItem = document.createElement("li");
      const itemContent = document.createElement("div");
      if (message.model === Chat.DEEP_SEEK_MODEL) {
        itemContent.classList.add("chat-message");
      } else {
        itemContent.classList.add("user-message");
      }
      itemContent.innerHTML = this.sanitize(message.response);
      listItem.setAttribute("id", uniqueId);
      listItem.appendChild(itemContent);
      Chat.resultsRef.appendChild(listItem);
      Chat.scrollToBottom();
    });
  }
}

/*
 |
 | ------------------------ Main ------------------------
 |
 */

const chat = new Chat();

/**
 * Attach the event listener to the send button, handle reading
 * the user input and sending it to the chat and toggling
 * disabled states.
 */
document.addEventListener("keydown", async (e) => {
  if (!Chat.promptRef.value) return;
  if (Chat.promptRef.disabled) return;
  if (e.key === "Enter" && e.key !== "Shift") {
    try {
      const message = Chat.promptRef.value;
      Chat.promptRef.disabled = true;
      Chat.promptRef.value = "";
      chat.onTriggerPrompt(message);
    } catch (error) {
      console.error("[chat] uh oh:", error);
      chat.insert({
        model: "error",
        response: error?.message,
      });
    } finally {
      Chat.promptRef.disabled = false;
      chat.render();
    }
  }
});
