if (!document.getElementById("capture-btn")) {
  const btn = document.createElement("button");
  btn.id = "capture-btn";
  btn.innerText = "Save Prompt";
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "10px",
    right: "10px",
    zIndex: "9999",
    padding: "6px",
    background: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    boxShadow: "0px 2px 5px rgba(0,0,0,0.3)",
    fontSize: "12px",
  });
  document.body.appendChild(btn);
  let lastFocusedInput = null;

  document.addEventListener("focusin", (e) => {
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.isContentEditable
    ) {
      lastFocusedInput = e.target;
    }
  });

  btn.addEventListener("click", async () => {
    const domainName = window.location.hostname;
    const tagName = domainName?.split(".")[0];
    if (lastFocusedInput) {
      let value = "";
      if (lastFocusedInput.isContentEditable) {
        value = lastFocusedInput.innerText.trim(); // for <div contenteditable>
      } else {
        value = lastFocusedInput.value.trim(); // for <input>/<textarea>
      }

      if (value) {
        chrome.runtime.sendMessage(
          { type: "savePrompt", text: { value, tagName } },
          (res) => {
            if (res?.status === "ok") alert(`Captured: ${value} `);
          }
        );
      } else {
        alert("Input is empty!");
      }
    } else {
      alert("Click inside an input field first!");
    }
  });
}
