document.addEventListener('DOMContentLoaded', () => {
  const products = window.JORGE_DATA || [];

  const barsGrid = document.getElementById('barsGrid');
  const tableBody = document.getElementById('tableBody');
  const productsGrid = document.getElementById('productsGrid');
  
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const categoryPills = document.querySelectorAll('.pill');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  const kpiAvgMc = document.getElementById('kpiAvgMc');
  const kpiAvgJorge = document.getElementById('kpiAvgJorge');
  const kpiAvgCoto = document.getElementById('kpiAvgCoto');
  const headerItemCount = document.getElementById('headerItemCount');
  const printJorgeBtn = document.getElementById('printJorgeBtn');

  let currentCategory = 'todos';
  let currentSearch = '';
  let currentSort = 'jorge-asc';

  function init() {
    updateKPIs();
    renderAllViews();
    setupListeners();
  }

  function updateKPIs() {
    if (!products.length) return;
    headerItemCount.textContent = `${products.length} productos relevados 100% datos reales`;

    const sumMc = products.reduce((a, b) => a + b.precioMercadoCentral, 0);
    const sumJorge = products.reduce((a, b) => a + b.precioJorge, 0);
    const sumCoto = products.reduce((a, b) => a + b.precioCoto, 0);

    const avgMc = Math.round(sumMc / products.length);
    const avgJorge = Math.round(sumJorge / products.length);
    const avgCoto = Math.round(sumCoto / products.length);

    kpiAvgMc.textContent = `$ ${avgMc.toLocaleString('es-AR')}`;
    kpiAvgJorge.textContent = `$ ${avgJorge.toLocaleString('es-AR')}`;
    kpiAvgCoto.textContent = `$ ${avgCoto.toLocaleString('es-AR')}`;
  }

  function getFilteredAndSortedProducts() {
    let filtered = products.filter(p => {
      const matchSearch = p.nombre.toLowerCase().includes(currentSearch.toLowerCase());
      let matchCat = true;

      if (currentCategory === 'verduras') matchCat = p.categoria === 'verduras';
      if (currentCategory === 'frutas') matchCat = p.categoria === 'frutas';
      if (currentCategory === 'ofertas') matchCat = p.precioJorge < p.precioCoto;

      return matchSearch && matchCat;
    });

    if (currentSort === 'savings-desc') {
      filtered.sort((a, b) => (b.precioCoto - b.precioJorge) - (a.precioCoto - a.precioJorge));
    } else if (currentSort === 'name-asc') {
      filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (currentSort === 'jorge-asc') {
      filtered.sort((a, b) => a.precioJorge - b.precioJorge);
    } else if (currentSort === 'coto-desc') {
      filtered.sort((a, b) => b.precioCoto - a.precioCoto);
    }

    return filtered;
  }

  function renderAllViews() {
    const list = getFilteredAndSortedProducts();
    render3BarGrid(list);
    render3WayTable(list);
    renderGridCards(list);
  }

  // --- 1. RENDER 3-BAR REAL COMPARISON GRID ---
  function render3BarGrid(list) {
    if (!barsGrid) return;
    if (list.length === 0) {
      barsGrid.innerHTML = `<p style="text-align:center; padding:2rem; color:#94a3b8;">No se encontraron resultados para "${currentSearch}".</p>`;
      return;
    }

    barsGrid.innerHTML = list.map(p => {
      // REAL MATHEMICALLY ACCURATE PROPORTIONAL BAR SCALING
      const maxVal = Math.max(p.precioMercadoCentral, p.precioJorge, p.precioCoto);
      const pctMc = Math.round((p.precioMercadoCentral / maxVal) * 100);
      const pctJorge = Math.round((p.precioJorge / maxVal) * 100);
      const pctCoto = Math.round((p.precioCoto / maxVal) * 100);

      // Spectrum Badge
      let badgeHtml = '';
      if (p.precioJorge < p.precioMercadoCentral) {
        badgeHtml = `<span class="bar-savings-tag" style="background:rgba(16,185,129,0.2); color:#34d399;"><i class="fa-solid fa-bolt"></i> ¡MÁS BARATO QUE EL CENTRAL!</span>`;
      } else if (p.precioJorge < p.precioCoto) {
        const pctSave = Math.round(((p.precioCoto - p.precioJorge) / p.precioCoto) * 100);
        badgeHtml = `<span class="bar-savings-tag" style="background:rgba(245,158,11,0.15); color:#f59e0b;"><i class="fa-solid fa-store"></i> Jorge en el medio (Ahorro ${pctSave}% vs Coto)</span>`;
      } else {
        const pctOver = Math.round(((p.precioJorge - p.precioCoto) / p.precioCoto) * 100);
        badgeHtml = `<span class="bar-savings-tag" style="background:rgba(239,68,68,0.15); color:#f87171;"><i class="fa-solid fa-triangle-exclamation"></i> Coto más económico (+${pctOver}%)</span>`;
      }

      return `
        <div class="bar-card">
          <div class="bar-card-header">
            <span class="bar-card-title">${getFruitIcon(p.nombre)} ${p.nombre} <small style="font-size:0.8rem; color:#94a3b8;">(${p.unidad})</small></span>
            ${badgeHtml}
          </div>

          <div class="bars-stack">
            <!-- Barra 1: Mercado Central -->
            <div class="bar-row">
              <span class="bar-label" style="color:#10b981;"><i class="fa-solid fa-building-columns"></i> Mercado Central</span>
              <div class="bar-track">
                <div class="bar-fill bar-fill-mc" style="width: ${pctMc}%;"></div>
              </div>
              <span class="bar-val text-mc">$ ${p.precioMercadoCentral.toLocaleString('es-AR')}</span>
            </div>

            <!-- Barra 2: Verdulería Jorge (UBICACIÓN REAL EN EL MEDIO / PROPORCIÓN EXACTA) -->
            <div class="bar-row">
              <span class="bar-label" style="color:#f59e0b;"><i class="fa-solid fa-shop"></i> Verdulería Jorge</span>
              <div class="bar-track">
                <div class="bar-fill bar-fill-jorge" style="width: ${pctJorge}%;"></div>
              </div>
              <span class="bar-val text-jorge">$ ${p.precioJorge.toLocaleString('es-AR')}</span>
            </div>

            <!-- Barra 3: Coto Digital -->
            <div class="bar-row">
              <span class="bar-label" style="color:#ef4444;"><i class="fa-solid fa-cart-shopping"></i> Coto Góndola</span>
              <div class="bar-track">
                <div class="bar-fill bar-fill-coto" style="width: ${pctCoto}%;"></div>
              </div>
              <span class="bar-val text-coto">$ ${p.precioCoto.toLocaleString('es-AR')}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- 2. RENDER 3-WAY REAL TABLE ---
  function render3WayTable(list) {
    if (!tableBody) return;
    if (list.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">Sin resultados.</td></tr>`;
      return;
    }

    tableBody.innerHTML = list.map(p => {
      const diffCotoJorge = p.precioCoto - p.precioJorge;
      const diffTag = diffCotoJorge > 0 
        ? `<span style="background:rgba(16,185,129,0.15); color:#34d399; padding:0.3rem 0.6rem; border-radius:10px; font-weight:700; font-size:0.85rem;">+$ ${diffCotoJorge.toLocaleString('es-AR')} (Ahorro)</span>`
        : `<span style="background:rgba(239,68,68,0.15); color:#f87171; padding:0.3rem 0.6rem; border-radius:10px; font-weight:700; font-size:0.85rem;">-$ ${Math.abs(diffCotoJorge).toLocaleString('es-AR')}</span>`;

      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.6rem; font-weight:700;">
              <span style="font-size:1.4rem;">${getFruitIcon(p.nombre)}</span>
              <div>
                <div>${p.nombre}</div>
                <small style="color:#94a3b8; font-weight:normal;">Unidad: ${p.unidad}</small>
              </div>
            </div>
          </td>
          <td class="price-cell text-mc">$ ${p.precioMercadoCentral.toLocaleString('es-AR')}</td>
          <td class="price-cell text-jorge" style="background:rgba(245,158,11,0.05);">$ ${p.precioJorge.toLocaleString('es-AR')}</td>
          <td class="price-cell text-coto">$ ${p.precioCoto.toLocaleString('es-AR')}</td>
          <td>${diffTag}</td>
          <td>
            <div style="font-size:0.8rem; color:#94a3b8;">
              <div>Jorge vs Central: <strong style="color:#f59e0b;">+${p.jorgeVsMcPct}%</strong></div>
              <div>Coto vs Central: <strong style="color:#ef4444;">+${p.cotoVsMcPct}%</strong></div>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- 3. RENDER GRID CARDS ---
  function renderGridCards(list) {
    if (!productsGrid) return;
    if (list.length === 0) {
      productsGrid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:2rem;">Sin resultados.</p>`;
      return;
    }

    productsGrid.innerHTML = list.map(p => `
      <div class="jorge-card" style="position:relative;">
        <div class="jorge-card-header">
          <span style="font-size:2.2rem;">${getFruitIcon(p.nombre)}</span>
          <div>
            <h3 class="jorge-title">${p.nombre}</h3>
            <span class="jorge-sub">Por ${p.unidad}</span>
          </div>
        </div>
        <div class="jorge-price-box">
          <div>
            <span class="jorge-unit">Verdulería Jorge</span>
            <div class="jorge-price-val text-jorge">$ ${p.precioJorge.toLocaleString('es-AR')}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.75rem; color:#10b981;">MC: $ ${p.precioMercadoCentral.toLocaleString('es-AR')}</div>
            <div style="font-size:0.75rem; color:#ef4444;">Coto: $ ${p.precioCoto.toLocaleString('es-AR')}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  function getFruitIcon(name) {
    const n = name.toLowerCase();
    if (n.includes('tomate')) return '🍅';
    if (n.includes('banana')) return '🍌';
    if (n.includes('naranja') || n.includes('mandarina')) return '🍊';
    if (n.includes('manzana')) return '🍎';
    if (n.includes('pera')) return '🍐';
    if (n.includes('cebolla')) return '🧅';
    if (n.includes('papa') || n.includes('batata')) return '🥔';
    if (n.includes('zanahoria')) return '🥕';
    if (n.includes('morron') || n.includes('zucchini') || n.includes('pepino')) return '🫑';
    if (n.includes('lechuga') || n.includes('acelga') || n.includes('espinaca') || n.includes('rucula')) return '🥬';
    if (n.includes('zapallo')) return '🎃';
    if (n.includes('hongos')) return '🍄';
    return '🧺';
  }

  function setupListeners() {
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderAllViews();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderAllViews();
      });
    }

    categoryPills.forEach(pill => {
      pill.addEventListener('click', () => {
        categoryPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentCategory = pill.getAttribute('data-category');
        renderAllViews();
      });
    });

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-tab');
        if (targetId === 'bars') document.getElementById('tabBars').classList.add('active');
        if (targetId === 'table') document.getElementById('tabTable').classList.add('active');
        if (targetId === 'cards') document.getElementById('tabCards').classList.add('active');
      });
    });

    if (printJorgeBtn) {
      printJorgeBtn.addEventListener('click', () => {
        generateDirectPdf3Way();
      });
    }
  }

  function generateDirectPdf3Way() {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2,'0')}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getFullYear()}_${now.getHours().toString().padStart(2,'0')}-${now.getMinutes().toString().padStart(2,'0')}`;
    const filename = `Reporte_Real_Jorge_vs_Central_vs_Coto_${formattedDate}.pdf`;

    const element = document.createElement('div');
    element.style.padding = '15px';
    element.style.background = '#ffffff';
    element.style.color = '#0f172a';
    element.style.fontFamily = "'Inter', Arial, sans-serif";

    element.innerHTML = `
      <div style="border-bottom:2px solid #f59e0b; padding-bottom:10px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="margin:0; font-size:18px; color:#1e293b;">Reporte 100% Datos Reales: Verdulería Jorge vs Mercado Central vs Coto</h2>
          <p style="margin:4px 0 0 0; font-size:11px; color:#64748b;">Generado el ${now.toLocaleDateString('es-AR')} a las ${now.toLocaleTimeString('es-AR')}</p>
        </div>
      </div>
      <div style="margin-bottom:15px;">
        ${document.querySelector('.kpi-grid').outerHTML}
      </div>
      <div>
        ${document.querySelector('.comparison-table').outerHTML}
      </div>
    `;

    element.querySelectorAll('.glass-card, .kpi-card, .table-container').forEach(el => {
      el.style.background = '#ffffff';
      el.style.color = '#0f172a';
      el.style.border = '1px solid #cbd5e1';
      el.style.boxShadow = 'none';
    });

    element.querySelectorAll('th').forEach(el => {
      el.style.background = '#f1f5f9';
      el.style.color = '#1e293b';
      el.style.fontSize = '10px';
    });

    element.querySelectorAll('td').forEach(el => {
      el.style.color = '#1e293b';
      el.style.borderBottom = '1px solid #e2e8f0';
      el.style.fontSize = '10px';
    });

    const opt = {
      margin:       [0.3, 0.3, 0.3, 0.3],
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    if (window.html2pdf) {
      html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  }

  init();
});
