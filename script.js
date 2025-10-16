document.addEventListener("DOMContentLoaded", () => {
  const invoiceNo = document.getElementById("invoiceNo");
  const invoiceDate = document.getElementById("invoiceDate");
  const addBtn = document.getElementById("addBtn");
  const tableBody = document.querySelector("#itemsTable tbody");
  const grandTotal = document.getElementById("grandTotal");
  const printBtn = document.getElementById("printBtn");
  const newBtn = document.getElementById("newBtn");
  const greetChecks = document.querySelectorAll(".greetCheck");
  const festivalMsg = document.getElementById("festivalMsg");
  const imeiInput = document.getElementById("imeiInput");

  let itemCount = 0;
  let totalAmount = 0;
  let serials = new Set();

  // Auto Invoice number and date
  invoiceNo.value = "INV-" + Date.now().toString().slice(-6);
  const today = new Date();
  invoiceDate.value = today.toLocaleDateString("en-GB");

  // Add item
  addBtn.addEventListener("click", () => {
    const name = document.getElementById("productName").value.trim();
    const type = document.getElementById("productType").value;
    const imei = imeiInput.value.trim();
    const qty = parseInt(document.getElementById("quantity").value);
    const price = parseFloat(document.getElementById("price").value);

    if (!name || !imei || !qty || !price) {
      alert("Please fill all product fields and scan IMEI/Serial.");
      return;
    }

    if (serials.has(imei)) {
      alert("Duplicate IMEI/Serial not allowed.");
      imeiInput.focus();
      return;
    }

    serials.add(imei);
    itemCount++;
    const total = qty * price;
    totalAmount += total;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${itemCount}</td>
      <td>${name}</td>
      <td>${type}</td>
      <td>${imei}</td>
      <td>${qty}</td>
      <td>${price.toFixed(2)}</td>
      <td>${total.toFixed(2)}</td>`;
    tableBody.appendChild(row);

    grandTotal.innerText = `Grand Total: ₹${totalAmount.toFixed(2)}`;
    document.getElementById("productName").value = "";
    imeiInput.value = "";
    document.getElementById("quantity").value = 1;
    document.getElementById("price").value = "";
    imeiInput.focus();
  });

  // Greetings checkboxes
  greetChecks.forEach(box => {
    box.addEventListener("change", () => {
      const selected = Array.from(greetChecks)
        .filter(ch => ch.checked)
        .map(ch => ch.value);
      festivalMsg.innerHTML = selected.join(" • ");
    });
  });

  // Print
  printBtn.addEventListener("click", () => {
    window.print();
  });

  // New Bill
  newBtn.addEventListener("click", () => {
    location.reload();
  });
});
