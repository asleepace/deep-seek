/**
 * Simple non-fancy state and UI/X management for the chat.
 */
class Chat {
  static DEEP_SEEK_API_URL = "http://localhost:11434/api/generate";
  static DEEP_SEEK_MODEL = "deepseek-r1:7b";

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

  setParentRef(chatListRef) {
    this.chatListRef = chatListRef;
  }

  decodeChunk(chunk) {
    const text = this.decoder.decode(chunk);
    return JSON.parse(text);
  }

  clearChat() {
    this.chatListRef.innerHTML = "";
  }

  getLastMessage() {
    return this.messages[this.messages.length - 1];
  }

  sanitize(html) {
    return html
      .trim()
      .replace("\n", "<br /><br />")
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
      itemContent.classList.add("chat-message");
      itemContent.innerHTML = this.sanitize(message.response);
      listItem.setAttribute("id", uniqueId);
      listItem.appendChild(itemContent);
      this.chatListRef.appendChild(listItem);
    });
  }
}

/*
 |
 | ------------------------ Main ------------------------
 |
 */

const chat = new Chat();

// DOM references
const userPrompt = document.querySelector("textarea");
const chatResults = document.getElementById("chat-results");

chat.setParentRef(chatResults);
chat.render();

/**
 * Attach the event listener to the send button, handle reading
 * the user input and sending it to the chat and toggling
 * disabled states.
 */
document.addEventListener("keydown", async (e) => {
  if (!userPrompt.value) return;
  if (userPrompt.disabled) return;
  if (e.key === "Enter" && e.key !== "Shift") {
    try {
      const message = userPrompt.value;
      userPrompt.disabled = true;
      userPrompt.value = "";
      chat.onTriggerPrompt(message);
    } catch (error) {
      console.error("[chat] uh oh:", error);
      chat.insert({
        model: "error",
        response: error?.message,
      });
    } finally {
      userPrompt.disabled = false;
      chat.render();
    }
  }
});
