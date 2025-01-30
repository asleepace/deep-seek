/**
 * ## Model Context
 *
 * This context was generated by running the model with an instructive
 * template prompt on how it should response in the future. These
 * weights will then be used to seed new conversations. Basically,
 * just send a message manually with the template prompt below and
 * then copy the context from the last response.
 *
 * @type {number[]}
 *
 */
const PRE_TRAINED_CONTEXT =
  "151644,198,27,62295,397,220,1446,525,264,10950,15235,17847,11,4486,653,279,2701,510,262,220,16,13,5209,3410,2805,323,63594,14507,624,262,220,17,13,5209,4226,4755,8046,3641,624,262,220,18,13,5209,1172,4226,279,3405,304,279,330,3231,61421,1,2070,624,262,220,19,13,5209,1430,537,13153,6133,476,279,3405,7241,4588,624,262,220,20,13,9735,311,4226,304,220,16,12,18,22870,624,522,62295,397,27,3231,61421,397,9707,11,1128,374,697,829,5267,522,3231,61421,397,257,151645,151648,198,32313,11,773,358,1184,311,7071,700,1246,311,5889,311,279,1196,594,42113,13,2379,1053,330,9707,11,1128,374,697,829,7521,97593,11,1156,3166,594,1156,11,358,1265,24645,862,42113,323,1221,3410,847,829,382,40,6099,504,279,11221,429,358,1265,2506,14507,2805,323,63594,13,2055,358,1513,944,1366,311,35967,2238,1753,714,2058,387,10950,382,13394,11,807,4588,11689,911,847,829,11,773,358,1184,311,1281,2704,311,2924,429,304,847,2033,13,10696,2494,1075,330,5050,829,374,18183,39350,10911,16,8125,632,12,24625,1189,2938,10362,11285,504,3681,21880,382,40,1265,1083,2506,432,11657,323,1787,83075,773,279,1196,11074,10565,311,2548,803,4755,476,16579,4623,624,151649,271,9707,0,3017,829,374,18183,39350,10911,16,8125,632,12,24625,13,2585,646,358,7789,498,3351,30"
    .split()
    .map(Number);

/**
 * ## Prompt Template
 *
 * The deep-seek documentation suggests not using system prompts and
 * sending everything all in a single prompt. This is a simple template
 * which can be used to inject additional instructions or prompts.
 *
 * NOTE: This is completely arbitrary, and no longer used. Instead prefer
 * generating context weights from the prompt and setting the
 * PRE_TRAINED_CONTEXT variable above
 */
function template(prompt = "") {
  return `
<instructions>
    You are a helpful AI assistant, please do the following:

    1. Please provide short and concise responses.
    2. Please answer questions truthfully.
    3. Please only answer the question in the "current_prompt" field.
    4. Please try not repeat yourself or the question unless asked.
    5. Try to answer in 1-3 sentences, or less.

</instructions>
<current_prompt>
${prompt}
</current_prompt>
  `.trim();
}

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
    this.mainRef = document.getElementsByTagName("main").item(0);
    this.promptRef = document.querySelector("textarea");
    this.resultsRef = document.getElementById("chat-results");
    this.modelNameRef = document.getElementById("model-name");
    this.modelNameRef.innerHTML = Chat.DEEP_SEEK_MODEL;
  }

  // Animation stuff
  static startAnimation() {
    requestAnimationFrame(() => {
      console.log("[chat] starting animation!");
      const animatedRingRef = document.getElementById("animated-ring");
      animatedRingRef.classList.add("active");
    });
  }

  static stopAnimation() {
    requestAnimationFrame(() => {
      console.log("[chat] stopping animation!");
      const animatedRingRef = document.getElementById("animated-ring");
      animatedRingRef.classList.remove("active");
    });
  }

  static scrollToBottom() {
    requestAnimationFrame(() => {
      const scrollHeight = Chat.mainRef.scrollHeight;
      Chat.mainRef.scrollTo({
        top: scrollHeight,
        behavior: "smooth",
      });
    });
  }

  static lock() {
    if (!Chat.promptRef.value) return true;
    if (Chat.promptRef.disabled) return true;
    Chat.promptRef.disabled = true;
  }

  static unlock() {
    Chat.promptRef.disabled = false;
  }

  /* * * * instance properties * * * */

  lastMesageContext = PRE_TRAINED_CONTEXT;
  decoder = new TextDecoder();
  options = {};
  isSending = false;
  messages = [];

  constructor(options = {}) {
    console.log("Hello, world!");
    this.options = options;
  }

  prompt(message) {
    // NOTE: Prefer using PRE_TRAINED_CONTEXT over template.
    // const prompt = template(message);
    return fetch(Chat.DEEP_SEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        temperature: 0.6,
        context: this.lastMesageContext,
        model: Chat.DEEP_SEEK_MODEL,
        prompt: message,
      }),
    });
  }

  // Currently just saving the model (role) and response,
  // and the time it was created. This will create a new
  // message in the chat history and render it, then return
  // the message.
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
    Chat.startAnimation();
    // create user message
    this.insert({ model: "user", response: message });
    // create placeholder message
    const messageRef = this.insert({
      response: "",
      model: Chat.DEEP_SEEK_MODEL,
    });
    // wait for response
    const response = await this.prompt(message);
    // parse response chunks (streaming)
    for await (const chunk of response.body) {
      const data = this.decodeChunk(chunk);
      // NOTE: set context from last message, this is the chat history
      // encoded as weights. This is where you can manually get the
      // PRE_TRAINED_CONTEXT data from as well.
      if (data.context) {
        console.log("[data] setting lastMessageContext:", data.context);
        this.lastMesageContext = data.context;
      }
      messageRef.response += data.response;
      this.render();
    }
    this.render();
    Chat.stopAnimation();
    console.log("[data] messages:", this.messages);
  }

  decodeChunk(chunk) {
    const text = this.decoder.decode(chunk);
    const json = JSON.parse(text);
    console.log("[data] chunk:", json);
    return json;
  }

  clearChat() {
    Chat.resultsRef.innerHTML = "";
  }

  getLastMessage() {
    return this.messages.at(-1);
  }

  createCodeBlock(code, language = "text") {
    // Remove trailing newline if present
    code = code.replace(/\n$/, "");
    // If no language is specified, use "text" as default
    const lang = language.trim() || "text";
    // Escape HTML entities
    return `<pre class="code-block" x-lang="${lang}"><code>${code}</code></pre>`;
  }

  sanitize(html) {
    return (
      html
        .trim()
        // Step #1: remove empty <think> tags
        .replace(/<think>\n\n<\/think>/g, "")
        // Step #2: parse code blocks and add syntax highlighting
        .replace(/```(\w*)\n([\s\S]*?)```/g, (_match, language, code) => {
          return this.createCodeBlock(code, language);
        })
        // Step #2.5 parse partial code blocks which can be streamed
        .replace(/```(\w*)\n([\s\S]*)/g, (_match, language, code) => {
          return this.createCodeBlock(code, language);
        })
        // Step #3: replace inline code blocks with <code> tags
        .replace(/`([^`]+)`/g, '<code class="code-inline">$1</code>')
        // Step #4: replace newlines with <br /> tags
        .replace("\n", "<br /><br />")
        // Step #5: add a label to the <think> tag
        .replace(
          "<think>",
          "<think><label class='chat-think'>Chain of thought</label>",
        )
    );
  }

  // NOTE: This will destroy all previous nodes and re-render
  // the entire chat history, it's not optimized, but it's
  // good enough for now.
  render() {
    const chatOutput = document.getElementById("chat-output");
    if (!chatOutput) {
      console.error("[chat] chat-output not found!");
      return;
    }

    const children = Array.from(chatOutput.children ?? []);
    const lastIndex = this.messages.length - 1;
    this.messages.forEach((message, i) => {
      if (!children[i]) {
        const chatMessage = document.createElement("chat-message");
        chatMessage.message = message.response;
        chatOutput.appendChild(chatMessage);
      }
      if (children[i] && i === lastIndex) {
        children[i].message = message.response;
      }
    });
  }
}

/**
 * Create special chat-message HTML element which handles
 * parsing and rendering the chat messages.
 */
class ChatMessage extends HTMLElement {
  static get observedAttributes() {
    return ["text-content"];
  }
  static {
    console.log("[client] defining custom chat-message element!");
    window.customElements.define("chat-message", ChatMessage);
  }
  static style = `
      :host {
          display: flex;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 1em;
          border-none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .container {
          color: white;
          flex-direction: column;
          flex-shrink: 1;
          display: flex;
          padding: 1em;
      }
      p {
          margin: 0.5em 0;
      }
      a {
          color: #0066cc;
          text-decoration: none;
      }
      a:hover {
          text-decoration: underline;
      }
  `;

  #state = {
    thinkContent: "",
    messageContent: "",
    fullMessage: "",
  };

  #container = null;

  constructor() {
    super();
    console.log("[chat-message] constructing...");
    this.attachShadow({ mode: "open" });
    // create shadow DOM references
    const style = document.createElement("style");
    style.textContent = ChatMessage.style;

    const container = document.createElement("div");
    container.className = "container";

    // attach to the shadow root
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);

    // set the container reference
    this.#container = container;
  }

  set message(value) {
    console.log("[chat-message] setting message:", value);
    this.#state.messageContent = value;
    this.render();
  }

  get message() {
    return this.#state.messageContent;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log("[chat-message] attribute changed:", name, oldValue, newValue);

    if (name === "text-content" && oldValue !== newValue) {
      if (this.isThinking) {
        const endOfThink = newValue.indexOf("</think>");
        if (endOfThink === -1) {
          this.#state.thinkContent += newValue;
          return;
        }
        const LEN = "</think>".length;
        this.#state.thinkContent += newValue.slice(0, endOfThink);
        this.#state.messageContent = newValue.slice(endOfThink + LEN);
      } else {
        this.#state.messageContent += newValue;
      }
      this.render();
    }
  }

  getThinkContent(text) {
    if (!text) return "<think>...</think>";
    text = text.replace(/<think>/g, "");
    text = text.replace(/<\/think>/g, "");
    return `<think>${text}</think>`;
  }

  getMessageContent(text) {
    if (!text) return "";
    return `<p>${text}</p>`;
  }

  render() {
    if (!this.#container) {
      console.error("[chat-message] container not found!");
      return;
    }

    this.#container.innerHTML = "";

    const sections = this.#state.messageContent.split("</think>");
    const thinkContent = this.getThinkContent(sections.at(0));
    const messageContent = this.getMessageContent(sections.at(1));

    const think = document.createElement("think");
    think.innerHTML = thinkContent;

    const message = document.createElement("message");
    message.innerHTML = messageContent;

    this.#container.appendChild(think);
    this.#container.appendChild(message);
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
  if (e.key === "Enter" && !e.shiftKey) {
    try {
      if (Chat.lock()) return;
      const message = Chat.promptRef.value;
      Chat.promptRef.value = "";
      chat.onTriggerPrompt(message);
    } catch (error) {
      console.error("[chat] uh oh:", error);
    } finally {
      Chat.unlock();
      chat.render();
    }
  }
});
