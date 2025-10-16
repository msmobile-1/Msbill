document.addEventListener("DOMContentLoaded", () => {
  const invoiceNo = document.getElementById("invoiceNo");
  const invoiceDate = document.getElementById("invoiceDate");
  const addBtn = document.getElementById("addBtn");
  const scanBtn = document.getElementById("scanBtn");
  const imeiInput = document.getElementById("imeiInput");
  const tableBody = document.querySelector("#itemsTable tbody");
  const grandTotal = document.getElementById("grandTotal");
  const printBtn = document.getElementById("printBtn");
  const newBtn = document.getElementById("newBtn");
  const festivalMsg = document.getElementById("festivalMsg");

  let itemCount = 0;
  let totalAmount = 0;
  let serials = new Set();

  // Choose one festival to show (edit below if needed)
  const activeGreeting = "Happy Diwali!"; 
  festivalMsg.innerText = activeGreeting;

  // Auto Invoice and Date
  invoiceNo.value = "INV-" + Date.now().toString().slice(-6);
  invoiceDate.value = new Date().toLocaleDateString("en-GB");

  // Show IMEI scan field when button clicked
  scanBtn.addEventListener("click", () => {
    imeiInput.style.display = "inline-block";
    imeiInput.focus();
  });

  // Add product
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

    // Clear inputs
    document.getElementById("productName").value = "";
    document.getElementById("quantity").value = 1;
    document.getElementById("price").value = "";
    imeiInput.value = "";
    imeiInput.style.display = "none";
  });

  // Print and new bill
  printBtn.addEventListener("click", () => window.print());
  newBtn.addEventListener("click", () => location.reload());
});
