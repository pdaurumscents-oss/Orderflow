document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cakeForm");
  const previewBtn = document.querySelector(".preview-btn");

  const modal = document.getElementById("summaryModal");
  const summaryContent = document.getElementById("summaryContent");
  const closeModal = document.getElementById("closeModal");
  const confirmSubmit = document.getElementById("confirmSubmit");
  const toast = document.getElementById("toast");

  // ===== ดึงข้อมูลจากฟอร์ม =====
  function getFormData() {
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
      data[key] = value;
    });

    return data;
  }

  // ===== แสดง summary =====
  function renderSummary(data) {
    summaryContent.innerHTML = `
      <dl>
        <dt>ชื่อลูกค้า</dt><dd>${data.customerName || "-"}</dd>
        <dt>ติดต่อ</dt><dd>${data.contact || "-"}</dd>
        <dt>วันที่รับ</dt><dd>${data.pickupDate || "-"}</dd>
        <dt>งบประมาณ</dt><dd>${data.budget || "-"}</dd>
        <dt>ขนาดเค้ก</dt><dd>${data.cakeSize || "-"}</dd>
        <dt>รสชาติ</dt><dd>${data.flavor || "-"}</dd>
        <dt>ข้อความบนเค้ก</dt><dd>${data.messageOnCake || "-"}</dd>
        <dt>รายละเอียด</dt><dd>${data.notes || "-"}</dd>
      </dl>
    `;
  }

  // ===== เปิด modal =====
  function openModal() {
    modal.classList.remove("hidden");
  }

  // ===== ปิด modal =====
  function closeModalFunc() {
    modal.classList.add("hidden");
  }

  // ===== แสดง toast =====
  function showToast() {
    toast.classList.remove("hidden");
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 2000);
  }

  // ===== กด "ตรวจสอบก่อนส่ง" =====
  previewBtn.addEventListener("click", () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = getFormData();
    renderSummary(data);
    openModal();
  });

  // ===== ปิด modal =====
  closeModal.addEventListener("click", closeModalFunc);

  // ===== กดยืนยัน =====
  confirmSubmit.addEventListener("click", () => {
    const data = getFormData();

    // เก็บลง localStorage (ไว้เดโม่)
    const orders = JSON.parse(localStorage.getItem("cakeOrders") || "[]");

    orders.push({
      ...data,
      createdAt: new Date().toLocaleString(),
      status: "ใหม่"
    });

    localStorage.setItem("cakeOrders", JSON.stringify(orders));

    closeModalFunc();
    form.reset();
    showToast();
  });

  // ===== กัน submit ปกติ =====
  form.addEventListener("submit", (e) => {
    e.preventDefault();
  });
});
