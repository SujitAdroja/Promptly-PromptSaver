importScripts("db.js");

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "savePrompt") {
    savePrompt(message.text).then(() => {
      sendResponse({ status: "ok" });
    });
    return true; // keep channel open for async
  }
});
