import { loadTemplate } from "./loadTemplate.js";
import { fillTemplate, fillGlobals } from "./templating.js";


const API_URL="https://auditcom.onrender.com/api"



const urls = {
    pdfs: `${API_URL}/pdfs`,
    submit: `${API_URL}/submit`
}

const container = document.querySelector("#teamList");
const form = document.querySelector("#downloadForm");

const template = await loadTemplate("/templates/teamItem.html");

const response = await fetch(urls.pdfs);
const payload = await response.json();

// global metadata
fillGlobals({
  count: payload.count
});

// repeated items
const items = Array.isArray(payload.pdfs) ? payload.pdfs : [];

for (const p of items) {
  container.append(
    fillTemplate(template, {
      teamName: p.teamName ?? "—",
      title: p.title ?? "",
      uploadedAt: formatDate(p.uploadedAt)
    })

  );
}

function formatDate(s) {
  if (!s) return "";
  const iso = s.replace(" ", "T");
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString();
}


form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  data.newsletterAgreement = data.newsletterAgreement ? "true" : "false";
  console.log(data);
  const response = await fetch(urls.submit, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  
  // Handle PDF response
  if (!response.ok) {
    console.error("Error:", response.status, response.statusText);
    return;
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "document.pdf"; // You can customize the filename
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
});

