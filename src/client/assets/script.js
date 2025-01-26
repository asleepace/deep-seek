console.log("Hello, world!");

const DEEP_SEEK_API_URL = "http://localhost:11434/api/generate";
const decoder = new TextDecoder();
const state = {
  isSending: false,
  messages: [
    {
      model: "deepseek-r1:7b",
      created_at: "2021-10-10T12:00:00Z",
      response: "How may I assist you today?",
    },
  ],
};

function sanitizeHTML(text) {
  return text
    .trim()
    .replace(/<think>.*?<\/think>/g, /<pre>.*?<\/pre>/g) // Remove thinking process
    .replace(/\*\*.*?\*\*/g, "") // Remove markdown bold
    .replace(/\\[()[\]]/g, "") // Remove LaTeX markers
    .replace(/\\boxed{(.*?)}/g, "$1") // Clean boxed math
    .replace("\n", "<br />")
    .trim();
}

function renderMessages() {
  chatResults.innerHTML = ""; // Clear the chat results
  state.messages.forEach((message, index) => {
    const uniqueId = `chat-message-${index}`;
    const listItem = document.createElement("li");
    const itemContent = document.createElement("div");
    itemContent.classList.add("chat-message");
    itemContent.innerHTML = sanitizeHTML(message.response);
    listItem.setAttribute("id", uniqueId);
    listItem.appendChild(itemContent);
    chatResults.appendChild(listItem);
  });
}

const userPrompt = document.querySelector("textarea");
const chatResults = document.getElementById("chat-results");

renderMessages(); // Render the initial messages

/**
 * Fetch the Deep Seek API.
 */
function sendPrompt(prompt) {
  return fetch(DEEP_SEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-r1:7b",
      prompt,
    }),
  });
}

/**
 * Trigger the send prompt function
 */
async function triggerSendPrompt() {
  const prompt = userPrompt.value;
  userPrompt.value = "";

  const userMessage = {
    model: "user",
    created_at: new Date().toISOString(),
    response: prompt,
  };

  state.messages.push(userMessage);
  renderMessages();

  try {
    const response = await sendPrompt(prompt);

    const currentMessageRef = {
      model: "deepseek-r1:7b",
      created_at: new Date().toISOString(),
      response: "",
    };
    state.messages.push(currentMessageRef);
    const index = state.messages.length - 1;
    renderMessages();
    for await (const chunk of response.body) {
      const text = decoder.decode(chunk);
      const data = JSON.parse(text);
      console.log(data);
      state.messages[index].response += data.response;
      state.messages[index].created_at = data.created_at;
      renderMessages();
    }
    renderMessages();
  } catch (error) {
    console.error(error);
  } finally {
    state.isSending = false;
    userPrompt.disabled = false;
  }
}

/**
 * Attach the event listener to the send button.
 */
document.addEventListener("keydown", async (e) => {
  if (e.key === "Enter" && e.key !== "Shift") {
    try {
      if (state.isSending) return;
      state.isSending = true;
      userPrompt.disabled = true;
      triggerSendPrompt();
    } catch (error) {
      console.error(error);
      this.messages.push({
        model: "error",
        created_at: new Date().toISOString(),
        response: `An error occurred. ${error?.message}`,
      });
      renderMessages();
    } finally {
      state.isSending = false;
      userPrompt.disabled = false;
    }
  }
});
