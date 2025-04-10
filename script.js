// Get references to DOM elements
const sendButton = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

// API URL for LanguageTool
const API_URL = "https://api.languagetool.org/v2/check";

// Event listener for sending message
sendButton.addEventListener("click", () => {
  const userMessage = userInput.value.trim();
  if (userMessage) {
    appendMessage(userMessage, "user-message");
    userInput.value = ''; // Clear input field
    getGrammarSuggestions(userMessage);
  }
});

// Function to display messages in the chat box
function appendMessage(message, type) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", type);
  messageElement.textContent = message;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
}

// Function to get grammar and spelling suggestions from LanguageTool API
async function getGrammarSuggestions(text) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      text: text,
      language: "en-US"
    })
  });

  const data = await response.json();

  if (data.matches.length > 0) {
    // Start with the original text
    let correctedText = text;

    // Apply corrections based on the suggestions
    data.matches.reverse().forEach(match => { // Reverse to avoid messing up positions after replacements
      const replacement = match.replacements.length > 0 ? match.replacements[0].value : match.context.text;
      const start = match.context.offset;
      const end = start + match.context.length;
      
      // Apply the replacement in the sentence
      correctedText = correctedText.slice(0, start) + replacement + correctedText.slice(end);
    });

    // Construct the bot's message with the corrected sentence
    const correctedMessage = `Here’s the corrected version: ${correctedText}`;

    appendMessage(correctedMessage, "bot-message");
  } else {
    appendMessage("Your sentence looks good to me! No errors detected.", "bot-message");
  }
}
