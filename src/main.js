import { loadTemplate } from "./loadTemplate.js";
import { fillTemplate, fillGlobals } from "./templating.js";

const BASE_URL = "https://auditcom.onrender.com";
const API_URL = `${BASE_URL}/api`;
const ESTIMATED_FILE_SIZE_MB = 250;
const PROGRESS_UPDATE_INTERVAL_MS = 50;
const SUCCESS_MESSAGE_DURATION_MS = 5000;
const PDF_FILENAME = "rapport-auditcom.pdf";

const API_ENDPOINTS = {
  pdfs: `${API_URL}/pdfs`,
  submit: `${API_URL}/submit`,
};

const SELECTORS = {
  teamList: "#teamList",
  downloadForm: "#downloadForm",
  messageContainer: "#messageContainer",
};

const container = document.querySelector(SELECTORS.teamList);
const form = document.querySelector(SELECTORS.downloadForm);
const messageContainer = document.querySelector(SELECTORS.messageContainer);

const template = await loadTemplate("./templates/teamItem.html");
const messageTemplate = await loadTemplate("./templates/messageItem.html");
function formatDate(dateString) {
  if (!dateString) return "";
  const isoString = dateString.replace(" ", "T");
  const date = new Date(isoString);
  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
}

function bytesToMB(bytes) {
  return bytes / (1024 * 1024);
}

function buildLogoUrl(relativePath) {
  return relativePath ? `${BASE_URL}${relativePath}` : "";
}
function showMessage(message, type = "success", progressPercent = null, progressMax = 100) {
  messageContainer.innerHTML = "";
  
  const showProgress = type === "loading" && progressPercent !== null;
  const progressContainerStyle = showProgress ? "display: block" : "display: none";
  const progressValue = progressPercent !== null ? progressPercent : 0;
  const progressText = progressPercent !== null ? `${Math.round(progressPercent)}%` : "";
  
  const messageElement = fillTemplate(messageTemplate, {
    message,
    messageClass: type,
    progressPercent: progressText,
    progressContainerStyle,
    progressValue,
    progressMax,
  });
  
  messageContainer.appendChild(messageElement);
  
  if (type === "success") {
    setTimeout(() => {
      messageContainer.innerHTML = "";
    }, SUCCESS_MESSAGE_DURATION_MS);
  }
  
  return messageContainer.querySelector("progress");
}
function createProgressUpdater(progressElement, progressText, totalBytes) {
  let lastUpdate = 0;
  
  return (loadedBytes, force = false) => {
    const now = Date.now();
    if (!force && now - lastUpdate < PROGRESS_UPDATE_INTERVAL_MS) return;
    lastUpdate = now;
    
    if (!progressElement || !progressText) return;
    
    progressElement.value = loadedBytes;
    
    if (loadedBytes > progressElement.max) {
      progressElement.max = loadedBytes;
    }
    
    if (totalBytes && totalBytes > 0) {
      const percent = (loadedBytes / progressElement.max) * 100;
      progressText.textContent = `${Math.round(percent)}%`;
    } else {
      const mbDownloaded = bytesToMB(loadedBytes);
      progressText.textContent = `${mbDownloaded.toFixed(1)} MB`;
    }
  };
}
function initializeProgress(progressElement, contentLength) {
  const estimatedTotal = ESTIMATED_FILE_SIZE_MB * 1024 * 1024;
  const maxValue = contentLength && contentLength > 0 ? contentLength : estimatedTotal;
  progressElement.max = maxValue;
  progressElement.value = 0;
  return maxValue;
}

function downloadBlob(blob, filename) {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(link);
  }, 100);
}
async function loadPDFList() {
  try {
    const response = await fetch(API_ENDPOINTS.pdfs);
    const payload = await response.json();
    
    fillGlobals({ count: payload.count });
    
    const items = Array.isArray(payload.pdfs) ? payload.pdfs : [];
    items.forEach((item) => {
      container.append(
        fillTemplate(template, {
          teamName: item.teamName ?? "—",
          title: item.title ?? "",
          author: item.author ?? "",
          uploadedAt: formatDate(item.uploadedAt),
          logoUrl: buildLogoUrl(item.logoUrl),
        })
      );
    });
  } catch (error) {
    console.error("Error loading PDF list:", error);
    showMessage("Erreur lors du chargement de la liste", "error");
  }
}
async function streamPDFDownload(response) {
  const contentLength = response.headers.get("Content-Length");
  const totalBytes = contentLength ? parseInt(contentLength, 10) : null;
  
  const reader = response.body.getReader();
  const chunks = [];
  let loadedBytes = 0;
  
  const progressElement = messageContainer.querySelector("progress");
  const progressText = messageContainer.querySelector(".progress-text");
  
  if (progressElement) {
    initializeProgress(progressElement, totalBytes);
  }
  
  const updateProgress = createProgressUpdater(progressElement, progressText, totalBytes);
  
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) {
      updateProgress(loadedBytes, true);
      break;
    }
    
    chunks.push(value);
    loadedBytes += value.length;
    updateProgress(loadedBytes);
  }
  
  return new Blob(chunks);
}
async function handleFormSubmit(formData) {
  const data = Object.fromEntries(formData);
  data.newsletterAgreement = data.newsletterAgreement ? "true" : "false";
  
  try {
    const response = await fetch(API_ENDPOINTS.submit, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      showMessage("le formulaire contient des champs invalides", "error");
      return;
    }
    
    const blob = await streamPDFDownload(response);
    downloadBlob(blob, PDF_FILENAME);
    showMessage("PDF téléchargé avec succès !", "success");
  } catch (error) {
    showMessage("Le formulaire contient des champs invalides", "error");
    console.error("Error:", error);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageContainer.innerHTML = "";
  
  const estimatedTotal = ESTIMATED_FILE_SIZE_MB * 1024 * 1024;
  showMessage("Téléchargement du PDF en cours...", "loading", 0, estimatedTotal);
  
  const formData = new FormData(form);
  await handleFormSubmit(formData);
});

loadPDFList();
