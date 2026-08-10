/**
 * Monitor de Sobreprecio: Mercado Central vs Coto
 * Logic & Interactivity Module with Base64 Clean Produce Icons
 */

document.addEventListener('DOMContentLoaded', () => {
  let products = [];
  let currentCategory = 'todos';
  let searchQuery = '';
  let currentSort = 'markup-desc';
  let sortKey = 'markup';
  let sortDir = 'desc';
  let cartQuantities = {};

  const SORT_SELECT_MAP = {
    'markup-desc': { key: 'markup', dir: 'desc' },
    'diff-desc': { key: 'savings', dir: 'desc' },
    'coto-desc': { key: 'coto', dir: 'desc' },
    'mercado-asc': { key: 'mercado', dir: 'asc' },
    'name-asc': { key: 'name', dir: 'asc' },
  };
  // Por defecto, al hacer click por primera vez en una columna: numéricas de mayor a menor, nombre de A a Z
  const DEFAULT_DIR_BY_KEY = { name: 'asc', mercado: 'desc', coto: 'desc', markup: 'desc', savings: 'desc' };

  function compareByKey(key, dir) {
    const mul = dir === 'asc' ? 1 : -1;
    return (a, b) => {
      if (key === 'name') return mul * a.nombre.localeCompare(b.nombre);
      const fieldMap = { mercado: 'precioMercadoCentral', coto: 'precioCoto', markup: 'markup', savings: 'savings' };
      const field = fieldMap[key];
      return mul * (a[field] - b[field]);
    };
  }

  function updateSortHeaderUI() {
    document.querySelectorAll('.th-sortable').forEach(th => {
      const arrow = th.querySelector('.sort-arrow');
      if (th.getAttribute('data-sort') === sortKey) {
        th.classList.add('sorted-active');
        if (arrow) arrow.innerHTML = sortDir === 'asc' ? '&uarr;' : '&darr;';
      } else {
        th.classList.remove('sorted-active');
        if (arrow) arrow.innerHTML = '';
      }
    });
  }

  // Load state from localStorage
  const savedCart = localStorage.getItem('mercado_coto_cart');
  if (savedCart) {
    try { cartQuantities = JSON.parse(savedCart); } catch (e) {}
  }

  // DOM Elements
  const tableBody = document.getElementById('tableBody');
  const barChartContainer = document.getElementById('barChartContainer');
  const searchInput = document.getElementById('searchInput');
  const categoryPills = document.querySelectorAll('.pill');
  const sortSelect = document.getElementById('sortSelect');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const calcItemsCount = document.getElementById('calcItemsCount');
  const calcItemsGrid = document.getElementById('calcItemsGrid');
  
  // KPI Elements
  const avgMarkupVal = document.getElementById('avgMarkupVal');
  const maxMarkupProduct = document.getElementById('maxMarkupProduct');
  const avgSavingsVal = document.getElementById('avgSavingsVal');
  const totalProductsVal = document.getElementById('totalProductsVal');
  const tickerText = document.getElementById('tickerText');

  // Calculator Summary Elements
  const calcCotoTotal = document.getElementById('calcCotoTotal');
  const calcMercadoTotal = document.getElementById('calcMercadoTotal');
  const calcSavingsTotal = document.getElementById('calcSavingsTotal');
  const calcSavingsPercentBadge = document.getElementById('calcSavingsPercentBadge');

  // Modal Elements
  const openCalcBtn = document.getElementById('openCalcBtn');
  const closeCalcModalBtn = document.getElementById('closeCalcModalBtn');
  const calcModalOverlay = document.getElementById('calcModalOverlay');
  const modalCalcBody = document.getElementById('modalCalcBody');
  const goToCalcTabBtn = document.getElementById('goToCalcTabBtn');
  const resetCalcBtn = document.getElementById('resetCalcBtn');
  const shareCalcBtn = document.getElementById('shareCalcBtn');

  function makeB64(svgStr) {
    return 'data:image/svg+xml;base64,' + btoa(svgStr);
  }

  function getProduceSvg(name) {
    const n = (name || '').toLowerCase();

    if (n.includes('zapallito')) {
      return makeB64('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="36" r="22" fill="#10B981"/><circle cx="32" cy="36" r="16" fill="#34D399"/><path d="M32 14c-3 0-6 4-6 4s5 2 6 2 6-2 6-2-3-4-6-4z" fill="#059669"/></svg>');
    }
    if (n.includes('pepino')) {
      return makeB64('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="24" width="36" height="18" rx="9" transform="rotate(-25 32 33)" fill="#059669"/><rect x="18" y="26" width="28" height="14" rx="7" transform="rotate(-25 32 33)" fill="#10B981"/></svg>');
    }
    if (n.includes('tomate')) {
      return makeB64('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="36" r="22" fill="#EF4444"/><path d="M32 14c-4 0-7 5-7 5s5 2 7 2 7-2 7-2-3-5-7-5z" fill="#10B981"/><path d="M32 10v6" stroke="#059669" stroke-width="3" stroke-linecap="round"/></svg>');
    }
    if (n.includes('pimiento') || n.includes('morron')) {
      return makeB64('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M18 24c0-6 6-10 14-10s14 4 14 10c0 16-6 26-14 26S18 40 18 24z" fill="#DC2626"/><path d="M32 8c0 4-2 6-2 6h4s-2-2-2-6z" fill="#059669"/></svg>');
    }
    if (n.includes('acelga') || n.includes('lechuga') || n.includes('achicoria') || n.includes('akusay') || n.includes('espinaca') || n.includes('verdeo') || n.includes('berro')) {
      return makeB64('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M20 48C12 36 14 18 32 14c18 4 20 22 12 34-6 9-18 9-24 0z" fill="#10B981"/><path d="M32 14v34" stroke="#D1FAE5" stroke-width="3" stroke-linecap="round"/><path d="M32 26l-8 6M32 34l8 6" stroke="#D1FAE5" stroke-width="2" stroke-linecap="round"/></svg>');
    }
    if (n.includes('papa')) {
      return makeB64('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="34" rx="22" ry="16" fill="#D97706"/><circle cx="24" cy="28" r="2" fill="#92400E"/><circle cx="38" cy="38" r="2" fill="#92400E"/><circle cx="28" cy="40" r="1.5" fill="#92400E"/></svg>');
    }
    if (n.includes('cebolla')) {
      return makeB64('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 14C20 22 16 34 20 44c4 10 20 10 24 0 4-10 0-22-12-30z" fill="#C084FC"/><path d="M32 14v32" stroke="#E9D5FF" stroke-width="2" stroke-dasharray="3 3"/></svg>');
    }
    if (n.includes('zanahoria')) {
      return makeB64('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M38 16L18 50c-2 3 1 6 4 4l32-22c3-2 0-7-3-6z" fill="#F97316"/><path d="M42 14l6-6M38 18l10-2" stroke="#10B981" stroke-width="3" stroke-linecap="round"/></svg>');
    }
    if (n.includes('banana')) {
      return makeB64('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M16 16c16 0 32 16 32 32 0 4-4 4-6 2-10-10-18-18-28-26-2-2-2-8 2-8z" fill="#FACC15"/><path d="M14 14l4 4" stroke="#713F12" stroke-width="3" stroke-linecap="round"/></svg>');
    }
    if (n.includes('manzana')) {
      return makeB64('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 20c-6-6-18-4-18 8 0 16 12 24 18 24s18-8 18-24c0-12-12-14-18-8z" fill="#EF4444"/><path d="M32 10c2 4 0 8 0 8" stroke="#78350F" stroke-width="3" stroke-linecap="round"/><path d="M32 14c4-2 8 0 8 0" stroke="#10B981" stroke-width="2"/></svg>');
    }
    if (n.includes('naranja') || n.includes('mandarina') || n.includes('limon') || n.includes('pomelo')) {
      const col = n.includes('limon') ? '#FDE047' : '#F97316';
      return makeB64(`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="34" r="20" fill="${col}"/><circle cx="32" cy="34" r="14" fill="#FEF08A"/><path d="M32 18v32M18 34h32" stroke="#FFF" stroke-width="1.5"/></svg>`);
    }

    return makeB64('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="36" r="20" fill="#10B981"/><path d="M32 16c-3 0-6 4-6 4s5 2 6 2 6-2 6-2-3-4-6-4z" fill="#059669"/></svg>');
  }

  // Fetch Products Data
  fetch('data.json')
    .then(res => res.json())
    .then(data => {
      products = data;
      initApp();
    })
    .catch(err => {
      console.error("Error loading JSON", err);
    });

  function initApp() {
    calculateKPIs();
    updateSortHeaderUI();
    renderAll();
    setupEventListeners();
    startTickerRotation();
  }

  function calculateKPIs() {
    let totalMarkup = 0;
    let maxMarkup = -1;
    let maxMarkupObj = null;
    let totalSavings = 0;

    products.forEach(p => {
      const markup = ((p.precioCoto - p.precioMercadoCentral) / p.precioMercadoCentral) * 100;
      const savings = p.precioCoto - p.precioMercadoCentral;
      
      p.markup = markup;
      p.savings = savings;

      totalMarkup += markup;
      totalSavings += savings;

      if (markup > maxMarkup) {
        maxMarkup = markup;
        maxMarkupObj = p;
      }
    });

    const avgMarkup = (totalMarkup / products.length).toFixed(1);
    const avgSavings = Math.round(totalSavings / products.length);

    avgMarkupVal.textContent = `+${avgMarkup}%`;
    avgSavingsVal.textContent = `$ ${formatNumber(avgSavings)}`;
    totalProductsVal.textContent = products.length;

    if (maxMarkupObj) {
      maxMarkupProduct.textContent = `${maxMarkupObj.nombre} (+${Math.round(maxMarkupObj.markup)}%)`;
      tickerText.textContent = `¡ALERTA!: ${maxMarkupObj.nombre} tiene un sobreprecio de +${Math.round(maxMarkupObj.markup)}% ($${formatNumber(maxMarkupObj.precioMercadoCentral)} en Mercado Central vs $${formatNumber(maxMarkupObj.precioCoto)} en Coto)`;
    }
  }
  function getFilteredProducts() {
    let filtered = products.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.variedad.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    if (currentCategory === 'todos') {
      // Retorna todos los productos
    } else if (currentCategory === 'verduras') {
      filtered = filtered.filter(p => p.categoria === 'verduras');
    } else if (currentCategory === 'frutas') {
      filtered = filtered.filter(p => p.categoria === 'frutas');
    } else if (currentCategory === 'top10-verduras') {
      const bestByRank = {};
      filtered.forEach(p => {
        if (p.topVerduraRank) {
          const rank = p.topVerduraRank;
          if (!bestByRank[rank] || p.precioMercadoCentral < bestByRank[rank].precioMercadoCentral) {
            bestByRank[rank] = p;
          }
        }
      });
      filtered = Object.values(bestByRank);
    } else if (currentCategory === 'top10-frutas') {
      const bestByRank = {};
      filtered.forEach(p => {
        if (p.topFrutaRank) {
          const rank = p.topFrutaRank;
          if (!bestByRank[rank] || p.precioMercadoCentral < bestByRank[rank].precioMercadoCentral) {
            bestByRank[rank] = p;
          }
        }
      });
      filtered = Object.values(bestByRank);
    }

    return filtered.sort((a, b) => {
      if (sortKey === 'markup') return sortDir === 'desc' ? b.markup - a.markup : a.markup - b.markup;
      if (sortKey === 'savings') return sortDir === 'desc' ? b.savings - a.savings : a.savings - b.savings;
      if (sortKey === 'mercado') return sortDir === 'asc' ? a.precioMercadoCentral - b.precioMercadoCentral : b.precioMercadoCentral - a.precioMercadoCentral;
      if (sortKey === 'coto') return sortDir === 'asc' ? a.precioCoto - b.precioCoto : b.precioCoto - a.precioCoto;
      if (sortKey === 'name') return sortDir === 'asc' ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre);
      return 0;
    });
  }

  function renderAll() {
    const filtered = getFilteredProducts();
    renderTable(filtered);
    renderCharts(filtered);
    renderCalculatorGrid();
    updateCalculatorSummary();
  }

  function renderTable(list) {
    if (list.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No se encontraron productos que coincidan con la búsqueda.</td></tr>`;
      return;
    }

    tableBody.innerHTML = list.map(p => {
      const markupClass = p.markup >= 250 ? 'markup-extreme' : 'markup-high';
      const iconUrl = (p.imagen && p.imagen.startsWith('data:image/svg')) ? p.imagen : getProduceSvg(p.nombre);
      const rankBadge = p.topVerduraRank ? `<span class="top10-rank-badge"><i class="fa-solid fa-fire"></i> #${p.topVerduraRank} Verdura Arg</span>` :
                        p.topFrutaRank ? `<span class="top10-rank-badge"><i class="fa-solid fa-fire"></i> #${p.topFrutaRank} Fruta Arg</span>` : '';
      
      return `
        <tr>
          <td>
            <div class="product-cell">
              <img src="${iconUrl}" alt="${p.nombre}" class="product-img">
              <div>
                <div class="product-title">${p.nombre} ${rankBadge}</div>
                <div class="product-sub">${p.variedad} • ${p.origen}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="price-mercado">$ ${formatNumber(p.precioMercadoCentral)} / ${p.unidad}</div>
            <small style="font-size:0.75rem; color:var(--text-muted);">${p.bultoMercadoCentral}</small>
          </td>
          <td>
            <div class="price-coto">$ ${formatNumber(p.precioCoto)} / ${p.unidad}</div>
            <small style="font-size:0.75rem; color:var(--text-muted);">Coto Digital Góndola</small>
          </td>
          <td>
            <span class="markup-badge ${markupClass}">
              <i class="fa-solid fa-up-long"></i> +${Math.round(p.markup)}%
            </span>
          </td>
          <td>
            <div class="gap-value">+$ ${formatNumber(p.savings)} / ${p.unidad}</div>
          </td>
          <td>
            <button class="btn-add-calc" data-id="${p.id}">
              <i class="fa-solid fa-cart-plus"></i> +1 ${p.unidad}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.btn-add-calc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        cartQuantities[id] = (cartQuantities[id] || 0) + 1;
        saveCart();
        renderCalculatorGrid();
        updateCalculatorSummary();
        showNotification("Producto agregado al changuito");
      });
    });
  }

  function renderCharts(list) {
    barChartContainer.innerHTML = list.map(p => {
      const cotoPercent = 100; // Coto llega siempre al tope (100% de referencia)
      const mercadoPercent = Math.max(Math.min((p.precioMercadoCentral / p.precioCoto) * 100, 100), 4);

      return `
        <div class="chart-item">
          <div class="chart-item-header">
            <span>${p.nombre} (${p.variedad})</span>
            <span class="text-danger">+${Math.round(p.markup)}% remarcación</span>
          </div>
          <div class="bars-wrapper">
            <div class="bar-row">
              <span class="bar-label"><i class="fa-solid fa-cart-shopping text-danger"></i> Coto Góndola</span>
              <div class="bar-track">
                <div class="bar-fill bar-fill-coto" style="width: ${cotoPercent}%;"></div>
              </div>
              <span class="bar-val text-danger">$ ${formatNumber(p.precioCoto)}</span>
            </div>
            <div class="bar-row">
              <span class="bar-label"><i class="fa-solid fa-building text-success"></i> Mercado Central</span>
              <div class="bar-track">
                <div class="bar-fill bar-fill-mercado" style="width: ${mercadoPercent}%;"></div>
              </div>
              <span class="bar-val text-success">$ ${formatNumber(p.precioMercadoCentral)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderCalculatorGrid() {
    calcItemsGrid.innerHTML = products.map(p => {
      const qty = cartQuantities[p.id] || 0;
      const iconUrl = (p.imagen && p.imagen.startsWith('data:image/svg')) ? p.imagen : getProduceSvg(p.nombre);
      return `
        <div class="calc-item-card">
          <div class="calc-item-header">
            <img src="${iconUrl}" alt="${p.nombre}" class="product-img">
            <div>
              <div style="font-weight:600; font-size:0.9rem;">${p.nombre}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">$${formatNumber(p.precioMercadoCentral)} vs $${formatNumber(p.precioCoto)}</div>
            </div>
          </div>
          <div class="qty-input-group">
            <label for="qty-${p.id}">Cantidad (${p.unidad}):</label>
            <input type="number" id="qty-${p.id}" class="cart-qty-input" data-id="${p.id}" value="${qty}" min="0" max="100">
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.cart-qty-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const val = parseFloat(e.target.value) || 0;
        if (val <= 0) delete cartQuantities[id];
        else cartQuantities[id] = val;
        saveCart();
        updateCalculatorSummary();
      });
    });
  }

  function updateCalculatorSummary() {
    let cotoTotal = 0;
    let mercadoTotal = 0;
    let totalItems = 0;

    products.forEach(p => {
      const qty = cartQuantities[p.id] || 0;
      if (qty > 0) {
        cotoTotal += p.precioCoto * qty;
        mercadoTotal += p.precioMercadoCentral * qty;
        totalItems += qty;
      }
    });

    const savingsTotal = cotoTotal - mercadoTotal;
    const savingsPercent = cotoTotal > 0 ? Math.round((savingsTotal / cotoTotal) * 100) : 0;

    calcItemsCount.textContent = totalItems;
    calcCotoTotal.textContent = `$ ${formatNumber(cotoTotal)}`;
    calcMercadoTotal.textContent = `$ ${formatNumber(mercadoTotal)}`;
    calcSavingsTotal.textContent = `$ ${formatNumber(savingsTotal)}`;

    calcSavingsPercentBadge.textContent = savingsTotal > 0 
      ? `Ahorrás un ${savingsPercent}% ($${formatNumber(savingsTotal)}) comprando a precio de Mercado Central` 
      : `Ingresá cantidades en los productos para calcular tu ahorro`;
  }

  function renderModalBody() {
    const activeItems = products.filter(p => (cartQuantities[p.id] || 0) > 0);
    if (activeItems.length === 0) {
      modalCalcBody.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:2rem;">Tu changuito está vacío. Seleccioná kilogramos de frutas o verduras para comparar.</p>`;
      return;
    }

    modalCalcBody.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:0.75rem;">
        ${activeItems.map(p => `
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2); padding:0.6rem; border-radius:6px;">
            <div>
              <strong>${p.nombre}</strong> (${cartQuantities[p.id]} ${p.unidad})
            </div>
            <div class="text-success" style="font-weight:700;">
              Ahorro: $${formatNumber(p.savings * cartQuantities[p.id])}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function saveCart() {
    localStorage.setItem('mercado_coto_cart', JSON.stringify(cartQuantities));
  }

  function setupEventListeners() {
    const syncLiveBtn = document.getElementById('syncLiveBtn');
    if (syncLiveBtn) {
      syncLiveBtn.addEventListener('click', () => {
        syncLiveBtn.querySelector('i').classList.add('fa-spin');
        fetch(`data.json?t=${Date.now()}`)
          .then(res => res.json())
          .then(data => {
            products = data;
            calculateKPIs();
            renderAll();
            showNotification("✅ ¡79 Productos del Mercado Central y Coto actualizados en vivo!");
          })
          .finally(() => {
            setTimeout(() => syncLiveBtn.querySelector('i').classList.remove('fa-spin'), 600);
          });
      });
    }

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderAll();
    });

    categoryPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        categoryPills.forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = e.target.getAttribute('data-category');
        renderAll();
      });
    });

    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      const mapped = SORT_SELECT_MAP[currentSort];
      if (mapped) { sortKey = mapped.key; sortDir = mapped.dir; }
      updateSortHeaderUI();
      renderAll();
    });

    document.querySelectorAll('.th-sortable').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.getAttribute('data-sort');
        if (sortKey === key) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc'; // toggle: mayor arriba <-> menor arriba
        } else {
          sortKey = key;
          sortDir = DEFAULT_DIR_BY_KEY[key] || 'desc';
        }
        updateSortHeaderUI();
        renderAll();
      });
    });

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        e.currentTarget.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
      });
    });

    openCalcBtn.addEventListener('click', () => {
      renderModalBody();
      calcModalOverlay.classList.add('active');
    });

    closeCalcModalBtn.addEventListener('click', () => {
      calcModalOverlay.classList.remove('active');
    });

    calcModalOverlay.addEventListener('click', (e) => {
      if (e.target === calcModalOverlay) calcModalOverlay.classList.remove('active');
    });

    goToCalcTabBtn.addEventListener('click', () => {
      calcModalOverlay.classList.remove('active');
      document.querySelector('[data-tab="calcView"]').click();
    });

    resetCalcBtn.addEventListener('click', () => {
      if (confirm("¿Deseás reiniciar tu changuito?")) {
        cartQuantities = {};
        saveCart();
        renderCalculatorGrid();
        updateCalculatorSummary();
      }
    });

    shareCalcBtn.addEventListener('click', () => {
      const summaryText = `¡Mirá lo que me ahorro comprando directo a precio de Mercado Central! Ahorro total: ${calcSavingsTotal.textContent}. Monitor de Brechas.`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(summaryText);
        showNotification("¡Copiado al portapapeles! Podés compartirlo en WhatsApp.");
      } else {
        alert(summaryText);
      }
    });
  }

  function startTickerRotation() {
    let index = 0;
    setInterval(() => {
      if (products.length === 0) return;
      index = (index + 1) % products.length;
      const p = products[index];
      tickerText.textContent = `${p.nombre} presenta un sobreprecio de +${Math.round(p.markup)}% ($${formatNumber(p.precioMercadoCentral)}/kg en Mercado Central vs $${formatNumber(p.precioCoto)} en Coto)`;
    }, 6000);
  }

  function showNotification(msg) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.background = '#10b981';
    toast.style.color = '#fff';
    toast.style.padding = '0.8rem 1.2rem';
    toast.style.borderRadius = '8px';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    toast.style.zIndex = '2000';
    toast.textContent = msg;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease';
      setTimeout(() => toast.remove(), 500);
    }, 2500);
  }

  function formatNumber(num) {
    return new Intl.NumberFormat('es-AR').format(num);
  }
});
