/* app.js
   Place in same folder as index.html and styles.css
*/

(function(){
  const el = id => document.getElementById(id);
  const storageKey = 'ms-mobile-invoice-seq-v1';
  const shopInfoKey = 'ms-mobile-shopinfo-v1';
  const invoicesKey = 'ms-mobile-invoices-v1';

  let items = [];
  let invoiceSeq = Number(localStorage.getItem(storageKey) || 1);

  /* init */
  function setDateAndInvoice(){
    const now = new Date();
    const d = now.toLocaleDateString();
    el('invoiceDate').value = d;
    el('viewDate').textContent = d;
    renderInvoiceNo();
  }
  function renderInvoiceNo(){
    const no = `INV-${String(invoiceSeq).padStart(4,'0')}`;
    el('invoiceNo').value = no;
    el('viewInvoiceNo').textContent = no;
  }

  /* shop info */
  function loadShopInfo(){
    const raw = localStorage.getItem(shopInfoKey);
    if(raw){
      try{
        const s = JSON.parse(raw);
        el('shopName').value = s.name || el('shopName').value;
        el('shopAddress').value = s.address || el('shopAddress').value;
        el('shopContact').value = s.contact || el('shopContact').value;
        el('currency').value = s.currency || el('currency').value;
        el('themeColor').value = s.accent || el('themeColor').value;
      }catch(e){}
    }
    applyShopInfo();
  }
  function applyShopInfo(){
    el('shopInfoName').textContent = el('shopName').value || 'M.S. Mobile';
    el('shopInfoAddr').textContent = (el('shopAddress').value||'') + '\nContact: ' + (el('shopContact').value||'');
    el('viewPayment').textContent = el('paymentMethod').value;
    document.documentElement.style.setProperty('--accent-sky', el('themeColor').value || '#29a9e1');
  }

  /* formatting */
  function fmt(n){
    const cur = el('currency').value || '₹';
    return cur + Number(n || 0).toFixed(2);
  }

  function isIMEI(v){ return /^\d{15}$/.test(String(v||'').trim()); }
  function normalizeID(v){ return String(v||'').trim(); }

  /* items */
  function addItemFromInputs(){
    const name = el('productName').value.trim() || 'Item';
    const type = el('productType').value;
    const rawId = el('scannerInput').value.trim();
    const qty = Math.max(1, Number(el('productQty').value) || 1);
    const price = Math.max(0, Number(el('productPrice').value) || 0);
    const id = normalizeID(rawId);

    if(el('optPreventDup').checked && id){
      const dup = items.find(it => it.imei === id);
      if(dup){ alert('Duplicate IMEI/Serial detected in this invoice.'); return; }
    }

    let finalType = type;
    if(isIMEI(id)) finalType = 'Mobile';

    items.push({ name, type: finalType, imei: id, qty, price, total: qty*price });
    renderItems();
    clearInputs();
  }

  function clearInputs(){
    el('productName').value=''; el('scannerInput').value=''; el('productQty').value=1; el('productPrice').value=0; el('productType').value='Mobile';
    el('scannerInput').focus();
  }

  function removeItem(i){ items.splice(i,1); renderItems(); }

  function renderItems(){
    const tbody = el('itemsBody'); tbody.innerHTML=''; let subtotal=0;
    items.forEach((it, idx)=>{
      subtotal += it.qty*it.price;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${idx+1}</td>
        <td>${escapeHtml(it.name)}</td>
        <td>${escapeHtml(it.type)}</td>
        <td>${escapeHtml(it.imei||'')}</td>
        <td>${it.qty}</td>
        <td>${fmt(it.price)}</td>
        <td>${fmt(it.qty*it.price)}</td>
        <td class="no-print"><button class="btn ghost small" data-idx="${idx}">Del</button></td>`;
      tbody.appendChild(tr);
    });
    el('subtotal').textContent = fmt(subtotal);
    el('discount').textContent = fmt(0);
    el('grandTotal').textContent = fmt(subtotal);
    tbody.querySelectorAll('button[data-idx]').forEach(b=>b.addEventListener('click', ()=>removeItem(Number(b.dataset.idx))));
  }

  function escapeHtml(s){ return (s+'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

  function incrementInvoiceSeq(){ invoiceSeq = Number(invoiceSeq)+1; localStorage.setItem(storageKey, invoiceSeq); renderInvoiceNo(); }

  function saveInvoiceData(){
    try{
      const existing = JSON.parse(localStorage.getItem(invoicesKey)||'[]');
      existing.push({
        invoiceNo: el('invoiceNo').value,
        date: el('invoiceDate').value,
        shop: el('shopName').value,
        customer:{ name:el('customerName').value, contact:el('customerContact').value, address:el('customerAddress').value },
        payment: el('paymentMethod').value,
        items: items.slice(),
        total: el('grandTotal').textContent
      });
      localStorage.setItem(invoicesKey, JSON.stringify(existing));
      incrementInvoiceSeq();
    }catch(e){ console.warn(e); incrementInvoiceSeq(); }
  }

  function newBill(){
    items=[]; renderItems();
    el('customerName').value=''; el('customerContact').value=''; el('customerAddress').value='';
    el('gPongal').checked=false; el('gDiwali').checked=false; el('gHoli').checked=false;
    incrementInvoiceSeq(); setDateAndInvoice(); applyShopInfo();
  }

  function printInvoice(){
    applyShopInfo();
    el('viewPayment').textContent = el('paymentMethod').value;
    const greetings = [];
    if(el('gPongal').checked) greetings.push('Happy Pongal');
    if(el('gDiwali').checked) greetings.push('Happy Diwali');
    if(el('gHoli').checked) greetings.push('Happy Holi');
    el('thankyouText').innerHTML = (greetings.length ? ('<div style="font-weight:700;margin-bottom:6px">'+greetings.join(' • ')+'</div>') : '') + 'Thank You! Visit Again 😊';
    if(el('optSaveInvoices').checked) saveInvoiceData();
    window.print();
    if(el('optClearAfterPrint').checked) newBill(); else incrementInvoiceSeq();
  }

  /* PDF export: html2canvas -> jsPDF A5 (slices if needed) */
  async function exportInvoiceToPDF_A5(){
    applyShopInfo();
    el('viewPayment').textContent = el('paymentMethod').value;
    const greetings = [];
    if(el('gPongal').checked) greetings.push('Happy Pongal');
    if(el('gDiwali').checked) greetings.push('Happy Diwali');
    if(el('gHoli').checked) greetings.push('Happy Holi');
    el('thankyouText').innerHTML = (greetings.length ? ('<div style="font-weight:700;margin-bottom:6px">'+greetings.join(' • ')+'</div>') : '') + 'Thank You! Visit Again 😊';

    // hide no-print elements
    const noPrint = document.querySelectorAll('.no-print');
    const prev = [];
    noPrint.forEach(n => { prev.push({el:n, d:n.style.display}); n.style.display='none'; });

    try{
      const invoiceEl = el('invoice');
      const canvas = await html2canvas(invoiceEl, { scale:2, useCORS:true, backgroundColor:'#ffffff' });

      // restore no-print
      prev.forEach(p=>p.el.style.display = p.d);

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit:'mm', format:'a5', orientation:'portrait' });
      const pdfW = doc.internal.pageSize.getWidth();
      const pdfH = doc.internal.pageSize.getHeight();
      const margin = 6;
      const imgData = canvas.toDataURL('image/png');

      const imgWpx = canvas.width, imgHpx = canvas.height;
      const renderW = pdfW - margin*2;
      const renderHForFull = (imgHpx * renderW) / imgWpx;

      if(renderHForFull <= (pdfH - margin*2) + 0.01){
        doc.addImage(imgData, 'PNG', margin, margin, renderW, renderHForFull);
      } else {
        const pageHpx = Math.floor((imgWpx * (pdfH - margin*2)) / renderW);
        let yOff = 0;
        while(yOff < imgHpx){
          const sliceH = Math.min(pageHpx, imgHpx - yOff);
          const tmp = document.createElement('canvas');
          tmp.width = imgWpx; tmp.height = sliceH;
          const ctx = tmp.getContext('2d');
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,tmp.width,tmp.height);
          ctx.drawImage(canvas, 0, yOff, imgWpx, sliceH, 0, 0, imgWpx, sliceH);
          const sliceData = tmp.toDataURL('image/png');
          const sliceRenderH = (sliceH * renderW) / imgWpx;
          doc.addImage(sliceData, 'PNG', margin, margin, renderW, sliceRenderH);
          yOff += sliceH;
          if(yOff < imgHpx) doc.addPage();
        }
      }
      const fname = (el('invoiceNo').value || 'invoice') + '.pdf';
      doc.save(fname);

      if(el('optSaveInvoices').checked) saveInvoiceData();
      if(el('optClearAfterPrint').checked) newBill(); else incrementInvoiceSeq();

    }catch(err){
      prev.forEach(p=>p.el.style.display = p.d);
      console.error(err); alert('PDF error: ' + (err && err.message ? err.message : String(err)));
    }
  }

  /* wire events */
  function wire(){
    el('btnAddScanned').addEventListener('click', addItemFromInputs);
    el('scannerInput').addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); addItemFromInputs(); } });
    el('productName').addEventListener('keydown', e => { if(e.key === 'Enter' && (e.ctrlKey||e.metaKey)){ e.preventDefault(); addItemFromInputs(); } });
    el('btnPrint').addEventListener('click', ()=>{ if(items.length===0 && !confirm('Invoice has no items. Print anyway?')) return; printInvoice(); });
    el('btnPDF').addEventListener('click', ()=>{ if(items.length===0 && !confirm('Invoice has no items. Create PDF anyway?')) return; exportInvoiceToPDF_A5(); });
    el('btnNew').addEventListener('click', newBill);
    el('btnSavePreset').addEventListener('click', ()=>{
      const preset = { name:el('shopName').value, address:el('shopAddress').value, contact:el('shopContact').value, currency:el('currency').value, accent:el('themeColor').value };
      localStorage.setItem(shopInfoKey, JSON.stringify(preset)); applyShopInfo(); alert('Shop info saved locally.');
    });

    ['shopName','shopAddress','shopContact','paymentMethod','currency'].forEach(id => el(id).addEventListener('input', applyShopInfo));
    el('themeColor').addEventListener('input', applyShopInfo);

    document.addEventListener('keydown', e => { if(e.key === 'F2') el('scannerInput').focus(); if(e.ctrlKey && e.key.toLowerCase() === 's'){ e.preventDefault(); el('btnSavePreset').click(); } });
  }

  /* init */
  function init(){ loadShopInfo(); setDateAndInvoice(); wire(); renderItems(); setTimeout(()=>el('scannerInput').focus(),200); }
  init();

})();
