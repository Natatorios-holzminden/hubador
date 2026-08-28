(function() {
  let products = window.FRESCO_DATA || [];
  let searchQuery = '';
  let currentCategory = 'todos';
  let currentTab = 'barsView';

  let currentSort = 'fresco-asc';

  const barsGrid = document.getElementById('barsGrid');
  const tableBody = document.getElementById('tableBody');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const categoryPills = document.querySelectorAll('.category-pills .pill');
  const tabBtns = document.querySelectorAll('.tab-btn');

  const kpiAvgMc = document.getElementById('kpiAvgMc');
  const kpiAvgFresco = document.getElementById('kpiAvgFresco');
  const kpiAvgCoto = document.getElementById('kpiAvgCoto');
  const kpiAvgSavings = document.getElementById('kpiAvgSavings');

  function formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return new Intl.NumberFormat('es-AR').format(Math.round(num));
  }

  function formatFloat(num) {
    if (num === undefined || num === null || isNaN(num)) return '0,00';
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  }

  function getFruitIcon(nombre) {
    const n = nombre.toLowerCase();
    if (n.includes('papa')) return '🥔';
    if (n.includes('tomate')) return '🍅';
    if (n.includes('lechuga') || n.includes('acelga') || n.includes('espinaca') || n.includes('rucula') || n.includes('kale')) return '🥬';
    if (n.includes('naranja') || n.includes('mandarina')) return '🍊';
    if (n.includes('manzana')) return '🍎';
    if (n.includes('banana')) return '🍌';
    if (n.includes('limon')) return '🍋';
    if (n.includes('zanahoria')) return '🥕';
    if (n.includes('cebolla')) return '🧅';
    if (n.includes('zapallito') || n.includes('zucchini') || n.includes('anco')) return '🎃';
    if (n.includes('frutilla')) return '🍓';
    if (n.includes('palta')) return '🥑';
    return '🌱';
  }

  function calculateSummary() {
    if (products.length === 0) return;

    let totalFresco = 0;
    let totalMC = 0;
    let totalCoto = 0;
    let countReal = 0;

    products.forEach(p => {
      if (!p.sinDato && p.precioMercadoCentral !== null && p.precioCoto !== null) {
        totalFresco += p.precioUnidadConIva;
        totalMC += p.precioMercadoCentral;
        totalCoto += p.precioCoto;
        countReal++;
      }
    });

    if (countReal > 0) {
      const avgFresco = totalFresco / countReal;
      const avgMC = totalMC / countReal;
      const avgCoto = totalCoto / countReal;
      const savingsPct = totalCoto > 0 ? Math.round(((totalCoto - totalFresco) / totalCoto) * 100) : 0;

      kpiAvgMc.textContent = `$ ${formatNumber(avgMC)} / kg`;
      kpiAvgFresco.textContent = `$ ${formatFloat(avgFresco)} / kg`;
      kpiAvgCoto.textContent = `$ ${formatNumber(avgCoto)} / kg`;
      kpiAvgSavings.textContent = `Ahorro ${savingsPct}% (${countReal} con datos 3-vías)`;
    }
  }

  function getFilteredList() {
    let filtered = products.filter(p => {
      const matchQ = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
      if (currentCategory === 'verduras') return matchQ && (p.categoria === 'verduras' || !['frutilla', 'banana', 'manzana', 'naranja', 'pera', 'mandarina', 'pomelo', 'uva', 'kiwi', 'arandanos', 'anana', 'mango', 'palta', 'melon'].some(k => p.id.includes(k)));
      if (currentCategory === 'frutas') return matchQ && ['frutilla', 'banana', 'manzana', 'naranja', 'pera', 'mandarina', 'pomelo', 'uva', 'kiwi', 'arandanos', 'anana', 'mango', 'palta', 'melon'].some(k => p.id.includes(k));
      return matchQ;
    });

    if (currentSort === 'fresco-asc') {
      filtered.sort((a, b) => a.precioUnidadConIva - b.precioUnidadConIva);
    } else if (currentSort === 'savings-desc') {
      filtered.sort((a, b) => ((b.precioCoto || 0) - b.precioUnidadConIva) - ((a.precioCoto || 0) - a.precioUnidadConIva));
    } else if (currentSort === 'name-asc') {
      filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (currentSort === 'coto-desc') {
      filtered.sort((a, b) => (b.precioCoto || 0) - (a.precioCoto || 0));
    }

    return filtered;
  }

  // --- RENDER 3-BAR REAL COMPARATIVE CARDS ---
  function render3BarGrid(list) {
    if (!barsGrid) return;
    if (list.length === 0) {
      barsGrid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding:2rem; color:var(--text-muted);">No se encontraron resultados en FRESCO.BA.</p>`;
      return;
    }

    barsGrid.innerHTML = list.map(p => {
      // If sinDato (missing 1-to-1 match in MC or Coto)
      if (p.sinDato) {
        return `
          <div class="bar-card" style="opacity: 0.85;">
            <div class="bar-card-header">
              <div>
                <div class="bar-card-title">${getFruitIcon(p.nombre)} ${p.nombre}</div>
                <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.2rem;">
                  Bulto: <strong>$${formatNumber(p.bultoSinIva)}</strong> + 10.5% IVA = <strong style="color:#60a5fa;">$${formatNumber(p.bultoConIva)}</strong> (${p.cantidadBulto} ${p.unidad})
                </div>
              </div>
            </div>

            <div class="bars-stack">
              <!-- FRESCO.BA -->
              <div class="bar-row">
                <div class="bar-label" style="color: #06b6d4;">
                  <i class="fa-solid fa-leaf"></i> FRESCO.BA (+10.5% IVA)
                </div>
                <div class="bar-track">
                  <div class="bar-fill bar-fill-fresco" style="width: 60%;"></div>
                </div>
                <div class="bar-val" style="color: #06b6d4;">
                  $ ${formatFloat(p.precioUnidadConIva)} <small style="font-weight:500; font-size:0.75rem; color:var(--text-muted);">/ ${p.unidad}</small>
                </div>
              </div>

              <!-- Mercado Central -->
              <div class="bar-row">
                <div class="bar-label" style="color: var(--text-muted);">
                  <i class="fa-solid fa-building-columns"></i> Mercado Central
                </div>
                <div class="bar-track" style="opacity:0.25;"></div>
                <div class="bar-val" style="color: var(--text-muted); font-weight:500;">
                  Sin dato
                </div>
              </div>

              <!-- Coto Góndola -->
              <div class="bar-row">
                <div class="bar-label" style="color: var(--text-muted);">
                  <i class="fa-solid fa-cart-shopping"></i> Coto Góndola
                </div>
                <div class="bar-track" style="opacity:0.25;"></div>
                <div class="bar-val" style="color: var(--text-muted); font-weight:500;">
                  Sin dato
                </div>
              </div>
            </div>

            <div class="bar-card-footer">
              <span class="bulto-info-pill" style="background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.1); color:var(--text-muted);">
                <i class="fa-solid fa-circle-question"></i> Sin dato comparativo 1-a-1
              </span>
              <span style="font-weight:600; color:var(--text-muted); font-size:0.78rem;">
                Sin cálculo artificial
              </span>
            </div>
          </div>
        `;
      }

      // Valid 3-way real data
      const channels = [
        { name: 'Mercado Central', price: p.precioMercadoCentral, icon: 'fa-building-columns', color: '#10b981', fillClass: 'bar-fill-mc', isFloat: false },
        { name: 'FRESCO.BA (+10.5% IVA)', price: p.precioUnidadConIva, icon: 'fa-leaf', color: '#06b6d4', fillClass: 'bar-fill-fresco', isFloat: true },
        { name: 'Coto Góndola', price: p.precioCoto, icon: 'fa-cart-shopping', color: '#ef4444', fillClass: 'bar-fill-coto', isFloat: false }
      ];

      // Sort channels: cheapest top row, most expensive bottom row
      channels.sort((a, b) => a.price - b.price);

      const maxVal = Math.max(p.precioMercadoCentral, p.precioUnidadConIva, p.precioCoto, 1);

      const rowsHtml = channels.map((ch, idx) => {
        const pct = Math.max(Math.round((ch.price / maxVal) * 100), 4);
        const formattedPrice = ch.isFloat ? formatFloat(ch.price) : formatNumber(ch.price);
        const isCheapest = idx === 0;

        return `
          <div class="bar-row ${isCheapest ? 'cheapest-row' : ''}">
            <div class="bar-label" style="color: ${ch.color};">
              <i class="fa-solid ${ch.icon}"></i> ${ch.name}
              ${isCheapest ? `<span style="background:rgba(16,185,129,0.25); color:#34d399; font-size:0.68rem; padding:0.1rem 0.35rem; border-radius:4px; margin-left:0.2rem; font-weight:800;">⭐ MÁS BARATO</span>` : ''}
            </div>
            <div class="bar-track">
              <div class="bar-fill ${ch.fillClass}" style="width: ${pct}%;"></div>
            </div>
            <div class="bar-val" style="color: ${ch.color};">
              $ ${formattedPrice} <small style="font-weight:500; font-size:0.75rem; color:var(--text-muted);">/ ${p.unidad}</small>
            </div>
          </div>
        `;
      }).join('');

      // Position badge
      let badgeHtml = '';
      if (p.precioUnidadConIva <= p.precioMercadoCentral) {
        badgeHtml = `<span class="bulto-info-pill" style="background:rgba(16,185,129,0.2); color:#34d399;"><i class="fa-solid fa-bolt"></i> ¡FRESCO.BA MÁS BARATO QUE EL CENTRAL!</span>`;
      } else if (p.precioUnidadConIva < p.precioCoto) {
        const pctSave = Math.round(((p.precioCoto - p.precioUnidadConIva) / p.precioCoto) * 100);
        badgeHtml = `<span class="bulto-info-pill" style="background:rgba(6,182,212,0.2); color:#06b6d4;"><i class="fa-solid fa-store"></i> FRESCO.BA en el medio (Ahorro ${pctSave}% vs Coto)</span>`;
      } else {
        const pctOver = Math.round(((p.precioUnidadConIva - p.precioCoto) / p.precioCoto) * 100);
        badgeHtml = `<span class="bulto-info-pill" style="background:rgba(239,68,68,0.2); color:#f87171;"><i class="fa-solid fa-tag"></i> Coto de oferta (+${pctOver}%)</span>`;
      }

      return `
        <div class="bar-card">
          <div class="bar-card-header">
            <div>
              <div class="bar-card-title">${getFruitIcon(p.nombre)} ${p.nombre}</div>
              <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.2rem;">
                Bulto: <strong>$${formatNumber(p.bultoSinIva)}</strong> + 10.5% IVA = <strong style="color:#60a5fa;">$${formatNumber(p.bultoConIva)}</strong> (${p.cantidadBulto} ${p.unidad})
              </div>
            </div>
          </div>

          <div class="bars-stack">
            ${rowsHtml}
          </div>

          <div class="bar-card-footer">
            ${badgeHtml}
            <span style="font-weight:700; color:var(--text-muted);">
              ${p.cotoMarkupVsFresco >= 0 ? `Coto +${Math.round(p.cotoMarkupVsFresco)}%` : `Coto -${Math.abs(Math.round(p.cotoMarkupVsFresco))}%`}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- RENDER TABLE VIEW ---
  function renderTable(list) {
    if (!tableBody) return;
    if (list.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No se encontraron productos.</td></tr>`;
      return;
    }

    tableBody.innerHTML = list.map(p => {
      const unitStr = p.unidad;
      const bultoLabel = `${p.cantidadBulto} ${unitStr}`;

      const mcTd = (p.sinDatoMC || p.precioMercadoCentral === null) ?
        `<span style="color:var(--text-muted); font-size:0.85rem;">Sin dato</span>` :
        `<div style="font-weight:700; color:#34d399;">$ ${formatNumber(p.precioMercadoCentral)} <small>/ ${unitStr}</small></div><small style="color:var(--text-muted);">Mayorista origen</small>`;

      const cotoTd = (p.sinDatoCoto || p.precioCoto === null) ?
        `<span style="color:var(--text-muted); font-size:0.85rem;">Sin dato</span>` :
        `<div style="font-weight:800; font-size:1.05rem; color:#ef4444;">$ ${formatNumber(p.precioCoto)} <small>/ ${unitStr}</small></div><small style="color:var(--text-muted);">Coto Góndola</small>`;

      const markupTd = (p.sinDato || p.cotoMarkupVsFresco === null) ?
        `<span style="color:var(--text-muted); font-size:0.85rem;">Sin dato</span>` :
        `<span class="markup-badge ${p.cotoMarkupVsFresco >= 100 ? 'markup-extreme' : 'markup-high'}">
          <i class="fa-solid fa-up-long"></i> ${p.cotoMarkupVsFresco >= 0 ? `+${Math.round(p.cotoMarkupVsFresco)}% en Coto` : `${Math.round(p.cotoMarkupVsFresco)}% en Coto`}
        </span>`;

      return `
        <tr class="product-row" style="${p.sinDato ? 'opacity:0.8;' : ''}">
          <td class="td-product">
            <div class="product-cell">
              <div>
                <div class="product-title">${getFruitIcon(p.nombre)} ${p.nombre}</div>
                <div class="product-sub">Bulto original: ${bultoLabel}</div>
              </div>
            </div>
          </td>

          <td>
            <div style="font-weight:600; color:var(--text-muted);">$ ${formatNumber(p.bultoSinIva)}</div>
            <small style="color:var(--text-muted); font-size:0.75rem;">$ ${formatFloat(p.precioUnidadSinIva)} / ${unitStr}</small>
          </td>

          <td>
            <div style="font-weight:700; color:#3b82f6;">$ ${formatNumber(p.bultoConIva)}</div>
            <small style="color:#60a5fa; font-size:0.75rem;">+10.5% IVA incluido</small>
          </td>

          <td style="border-left:3px solid #06b6d4; padding-left:0.6rem;">
            <div style="font-weight:800; font-size:1.1rem; color:#06b6d4;">
              $ ${formatFloat(p.precioUnidadConIva)} <small>/ ${unitStr}</small>
            </div>
            <span class="fresco-badge">FRESCO.BA + IVA</span>
          </td>

          <td>
            ${mcTd}
          </td>

          <td>
            ${cotoTd}
          </td>

          <td>
            ${markupTd}
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderCurrentView() {
    const list = getFilteredList();
    render3BarGrid(list);
    renderTable(list);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderCurrentView();
    });
  }

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderCurrentView();
  });

  categoryPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      categoryPills.forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.getAttribute('data-category');
      renderCurrentView();
    });
  });

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.getAttribute('data-tab');

      document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
      document.getElementById(currentTab).style.display = 'block';
    });
  });

  calculateSummary();
  renderCurrentView();
})();
