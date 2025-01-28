/**
 * Utilites for parsing elements.
 */

const nextCodeBlockIndex = (str) => str.indexOf("```");
const nextCodeInlineIndex = (str) => str.indexOf("`");

/**
 * ## Chat Message
 *
 * This renders the content of a chat message to the client.
 *
 */
class ChatMessage extends HTMLElement {
  static get observedAttributes() {
    return ["message"];
  }

  static {
    console.log("[chat-message] registering <chat-message />");
    customElements.define("chat-message", ChatMessage);
  }

  #state = {
    fullMessage: "",
    isThinking: true,
    lastIndex: 0,
  };

  constructor(props) {
    console.log("[chat-message] props:", props);
    super();
    this.attachShadow({ mode: "open" });
    this.containerRef = document.createElement("div");
    this.shadowRoot.appendChild(this.containerRef);
  }

  connectedCallback() {
    console.log("[chat-message] onMount");
  }

  disconnectedCallback() {
    console.log("[chat-message] onDisconnect!");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log("[base] attr changed:", name, newValue);
    // TODO: Handle parsing message content here.
    if (name !== "message") return;
    // Append full message to state.
    this.#state.fullMessage += newValue;

    // Parse content in order of importance.
    if (this.#state.isThinking) {
      const isDoneThinking = newValue.includes("</think>");
    }
  }
}
