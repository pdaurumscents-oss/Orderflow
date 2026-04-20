const STORAGE_KEY = "orderflow_demo_submissions_v1";

const tabs = document.querySelectorAll(".tab");
const forms = document.querySelectorAll(".order-form");
const modal = document.getElementById("summaryModal");
const summaryContent = document.getElementById("summaryContent");
const closeModalBtn = document.getElementById("closeModal");
const toast = document.getElementById("toast");
const tableBody = document.getElementById("backendTableBody");
const clearDemoDataBtn = document.getElementById("clearDemoData");
const confirmSubmitBtn = document.getElementById("confirmSubmit");

let pendingSubmit = null;

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    forms.forEach((form) => form.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.target).classList.add("active");
  });
});

forms.forEach((form) => {
  const previewBtn = form.querySelector(".preview-btn");

  previewBtn.addEventListener("click", () => {
    if (!form.reportValidity()) return;
    openSummary(form);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    saveSubmission(form);
  });
});

closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

confirmSubmitBtn.addEventListener("click", () => {
  if (typeof pendingSubmit === "function") {
    pendingSubmit();
    pendingSubmit = null;
  }
  closeModal();
});

clearDemoDataBtn.addEventListener("click", () => {
  if (!confirm("ล้างข้อมูลเดโม่ทั้งหมดใช่ไหม")) return;
  localStorage.removeItem(STORAGE_KEY);
  renderTable();
  showToast("ล้างข้อมูลเดโม่แล้ว");
});

function openSummary(form) {
  const formData = new FormData(form);
  const entries = [...formData.entries()];
  const html = entries.map(([key, value]) => {
    const label = getLabelText(form, key);
    return `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || "-")}</dd>`;
  }).join("");

  summaryContent.innerHTML = `<dl>${html}</dl>`;
  pendingSubmit = () => saveSubmission(form);
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

function saveSubmission(form) {
  const formData = new FormData(form);
  const type = form.id === "cakeForm" ? "ร้านเค้ก" : "ร้านสกรีนเสื้อ";

  const record = {
    id: Date.now(),
    createdAt: new Date().toLocaleString("th-TH"),
    type,
    status: "รอรีวิว",
    data: Object.fromEntries(formData.entries())
  };

  const submissions = getSubmissions();
  submissions.unshift(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));

  form.reset();
  renderTable();
  showToast("บันทึกข้อมูลเดโม่แล้ว");
}

function getSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function renderTable() {
  const submissions = getSubmissions();

  if (!submissions.length) {
    tableBody.innerHTML = `<tr><td colspan="6" class="empty-state">ยังไม่มีข้อมูลเดโม่</td></tr>`;
    return;
  }

  tableBody.innerHTML = submissions.map((item) => {
    const name = item.data.customerName || "-";
    const contact = item.data.contact || "-";
    const detail = item.type === "ร้านเค้ก"
      ? `${item.data.cakeSize || "-"} / ${item.data.flavor || "-"} / รับ ${item.data.pickupDate || "-"}`
      : `${item.data.jobType || "-"} / ${item.data.quantity || "-"} ตัว / ใช้ ${item.data.deadline || "-"}`;

    return `
      <tr>
        <td>${escapeHtml(item.createdAt)}</td>
        <td>${escapeHtml(item.type)}</td>
        <td>${escapeHtml(name)}</td>
        <td>${escapeHtml(contact)}</td>
        <td>${escapeHtml(detail)}</td>
        <td>${escapeHtml(item.status)}</td>
      </tr>
    `;
  }).join("");
}

function getLabelText(form, key) {
  const field = form.querySelector(`[name="${key}"]`);
  if (!field) return key;

  const label = field.closest("label");
  if (!label) return key;

  return label.childNodes[0]?.textContent?.trim() || key;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2200);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

renderTable();
