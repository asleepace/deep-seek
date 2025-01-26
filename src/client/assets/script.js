console.log("Hello, world!");

const DEEP_SEEK_API_URL = "http://localhost:11434/api/generate";

/**
 * Create a new HTML element
 */
function component({ text, html, tag = "div", classList = "" }) {
  const element = document.createElement(tag);
  if (classList) element.classList.add(classList);
  if (html) {
    element.innerHTML = html;
    return element;
  } else {
    element.textContent = text;
    return element;
  }
}

const state = {
  isSending: false,
  messages: [
    {
      model: "deepseek-r1:7b",
      created_at: "2021-10-10T12:00:00Z",
      response: "How may I assist you today?",
    },
    {
      model: "deepseek-r1:7b",
      created_at: "2021-10-10T12:00:00Z",
      response: "What is the current weather in New York City?",
    },
  ],
};

function renderMessages() {
  state.messages.forEach((message) => {
    const listItem = document.createElement("li");
    const itemContent = document.createElement("div");
    itemContent.classList.add("chat-message");
    itemContent.textContent = message.response;
    listItem.appendChild(itemContent);
    chatResults.appendChild(listItem);
  });
}

const userPrompt = document.querySelector("textarea");
const chatResults = document.getElementById("chat-results");

renderMessages();

function sendPrompt(prompt) {
  return fetch(DEEP_SEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });
}

document.addEventListener("keydown", async (e) => {
  if (e.key === "Enter" && e.key !== "Shift") {
    console.log("[client] prompt:", userPrompt.value);
  }
});

document.querySelector("textarea").addEventListener("input", async (e) => {
  // console.log("[client] prompt:", e.target.value);
});
