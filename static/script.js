let currentThreadId = localStorage.getItem("travel_thread_id") || null;
let latestAnswerMarkdown = "";
let waitingForApproval = false;

const AGENT_LABELS = {
  flight_agent: "✈️ Flight Agent",
  hotel_agent: "🏨 Hotel Agent",
  weather_agent: "🌤️ Weather Agent",
  budget_agent: "💰 Budget Agent",
  itinerary_agent: "🗓️ Itinerary Agent"
};

function setPrompt(text) {
  document.getElementById("userInput").value = text;
}

function setLoading(isLoading, mode = "draft") {
  const sendBtn = document.getElementById("sendBtn");
  const btnText = document.getElementById("btnText");
  const btnLoader = document.getElementById("btnLoader");
  const approveBtn = document.getElementById("approveBtn");
  const reviseBtn = document.getElementById("reviseBtn");

  if (sendBtn) sendBtn.disabled = isLoading;
  if (approveBtn) approveBtn.disabled = isLoading;
  if (reviseBtn) reviseBtn.disabled = isLoading;

  if (isLoading && mode === "draft") {
    if (btnText) btnText.classList.add("hidden");
    if (btnLoader) btnLoader.classList.remove("hidden");
  } else {
    if (btnText) btnText.classList.remove("hidden");
    if (btnLoader) btnLoader.classList.add("hidden");
  }
}

function showError(message) {
  const errorBox = document.getElementById("errorBox");
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
  errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideError() {
  const errorBox = document.getElementById("errorBox");
  if (!errorBox) return;
  errorBox.classList.add("hidden");
  errorBox.textContent = "";
}

function renderMarkdown(element, markdown) {
  if (typeof marked !== "undefined") {
    element.innerHTML = marked.parse(markdown || "");
  } else {
    element.innerText = markdown || "";
  }
}

function showWorkflow(data) {
  const section = document.getElementById("workflowSection");
  const reasoning = document.getElementById("supervisorReasoning");
  const chips = document.getElementById("agentChips");
  const guardrailBadge = document.getElementById("guardrailBadge");

  if (!section) return;

  if (reasoning) {
    reasoning.textContent = data.supervisor_reasoning || "Supervisor routing completed.";
  }
  
  if (chips) {
    chips.innerHTML = "";
    (data.selected_agents || []).forEach((agent) => {
      const chip = document.createElement("span");
      chip.className = "agent-chip";
      chip.textContent = AGENT_LABELS[agent] || agent;
      chips.appendChild(chip);
    });
  }

  if (guardrailBadge) {
    if (data.guardrail_allowed === false) {
      guardrailBadge.textContent = "Guardrail Blocked";
      guardrailBadge.classList.add("blocked");
    } else {
      guardrailBadge.textContent = "Guardrail Passed";
      guardrailBadge.classList.remove("blocked");
    }
  }

  section.classList.remove("hidden");
}

function showResult(answer, threadId, isDraft = false) {
  latestAnswerMarkdown = answer || "";

  const resultSection = document.getElementById("resultSection");
  const resultBox = document.getElementById("resultBox");
  const threadInfo = document.getElementById("threadInfo");
  const resultTitle = document.getElementById("resultTitle");

  let formatted = latestAnswerMarkdown;

  // Convert any plain or numbered section titles into Markdown H2 headings for beautiful card styling
  const sections = [
    { name: "Trip Summary", emoji: "📝" },
    { name: "Flight Information", emoji: "✈️" },
    { name: "Hotel Suggestions", emoji: "🏨" },
    { name: "Weather Information", emoji: "🌤️" },
    { name: "Weather & Packing Advice", emoji: "🌤️" },
    { name: "Day-by-Day Itinerary", emoji: "🗓️" },
    { name: "Estimated Budget", emoji: "💰" },
    { name: "Final Recommendations", emoji: "💡" }
  ];

  sections.forEach(sec => {
    const regex = new RegExp(`(?:^|\\n)(?:\\d+\\.\\s*|\\*\\*|#+\\s*)?(${sec.name})(?:\\*\\*)?[:\\s]*`, 'gi');
    formatted = formatted.replace(regex, `\n\n## ${sec.emoji} $1\n\n`);
  });

  renderMarkdown(resultBox, formatted);

  if (threadInfo) {
    threadInfo.textContent = `Thread ID: ${threadId}`;
  }
  
  if (resultTitle) {
    resultTitle.textContent = isDraft ? "Draft Travel Plan (Review Needed)" : "Your AI Travel Plan";
  }

  resultSection.classList.remove("hidden");

  resultSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function showApproval(data) {
  waitingForApproval = true;
  const section = document.getElementById("approvalSection");
  const approvalRequest = document.getElementById("approvalRequest");
  if (!section) return;

  if (approvalRequest) {
    approvalRequest.textContent = data.approval_request ||
      "Approve the draft or provide feedback before the final plan is generated.";
  }
  
  section.classList.remove("hidden");
  section.scrollIntoView({ behavior: "smooth" });
}

function hideApproval() {
  waitingForApproval = false;
  const section = document.getElementById("approvalSection");
  if (!section) return;

  section.classList.add("hidden");
  const feedbackInput = document.getElementById("approvalFeedback");
  if (feedbackInput) feedbackInput.value = "";
}

async function sendMessage() {
  hideError();

  if (waitingForApproval) {
    showError("Please approve or revise the current draft before starting another plan.");
    return;
  }

  const input = document.getElementById("userInput");
  const message = input ? input.value.trim() : "";

  if (!message) {
    showError("Please enter your travel request first.");
    return;
  }

  setLoading(true, "draft");

  try {
    const response = await fetch("/api/travel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message,
        thread_id: currentThreadId
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Something went wrong.");
    }

    currentThreadId = data.thread_id;
    localStorage.setItem("travel_thread_id", currentThreadId);

    showWorkflow(data);

    if (data.requires_approval) {
      showResult(data.itinerary || data.answer, data.thread_id, true);
      showApproval(data);
    } else {
      hideApproval();
      showResult(data.answer, data.thread_id, false);
    }
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false, "draft");
  }
}

async function submitApproval(approved) {
  hideError();

  if (!currentThreadId || !waitingForApproval) {
    showError("There is no draft waiting for approval.");
    return;
  }

  const feedbackInput = document.getElementById("approvalFeedback");
  const feedback = feedbackInput ? feedbackInput.value.trim() : "";

  if (!approved && !feedback) {
    showError("Please enter revision feedback before requesting changes.");
    if (feedbackInput) feedbackInput.focus();
    return;
  }

  setLoading(true, "approval");

  try {
    const response = await fetch("/api/travel/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        thread_id: currentThreadId,
        approved: approved,
        feedback: feedback
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Could not resume the travel workflow.");
    }

    showWorkflow(data);
    hideApproval();
    showResult(data.answer, data.thread_id, false);
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false, "approval");
  }
}

function copyResult() {
  const resultBox = document.getElementById("resultBox");
  const text = resultBox ? resultBox.innerText : "";

  if (!text) {
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => {
      const copyBtn = document.querySelector(".copy-btn");
      if (copyBtn) {
        const oldText = copyBtn.textContent;
        copyBtn.textContent = "Copied!";

        setTimeout(() => {
          copyBtn.textContent = oldText;
        }, 1400);
      }
    })
    .catch(() => {
      showError("Could not copy result.");
    });
}

function downloadPDF() {
  const pdfContent = document.getElementById("pdfContent");

  if (!latestAnswerMarkdown || !pdfContent) {
    showError("No travel plan available to download.");
    return;
  }

  const downloadBtn = document.querySelector(".download-btn");
  const oldText = downloadBtn ? downloadBtn.textContent : "Download PDF";
  if (downloadBtn) {
    downloadBtn.textContent = "Preparing PDF...";
    downloadBtn.disabled = true;
  }

  const options = {
    margin: [0.4, 0.4, 0.4, 0.4],
    filename: "voyaige-travel-plan.pdf",
    image: {
      type: "jpeg",
      quality: 0.92
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: "#ffffff"
    },
    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "portrait"
    },
    pagebreak: {
      mode: ["css", "legacy"],
      avoid: ["h2", "h3", "li", "tr", "table"]
    }
  };

  html2pdf()
    .set(options)
    .from(pdfContent)
    .save()
    .then(() => {
      if (downloadBtn) {
        downloadBtn.textContent = oldText;
        downloadBtn.disabled = false;
      }
    })
    .catch(() => {
      if (downloadBtn) {
        downloadBtn.textContent = oldText;
        downloadBtn.disabled = false;
      }
      showError("Could not download PDF.");
    });
}

document.addEventListener("keydown", function(event) {
  if (event.ctrlKey && event.key === "Enter") {
    sendMessage();
  }
});