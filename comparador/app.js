/**
 * Monitor de Sobreprecio: Mercado Central vs Coto
 * Logic & Interactivity Module with Multi-Session Timeline & Historical Comparator
 */

document.addEventListener('DOMContentLoaded', () => {
  let products = [];
  let currentCategory = 'todos';
  let searchQuery = '';
  let currentSort = 'markup-desc';
  let sortKey = 'markup';
  let sortDir = 'desc';
  let cartQuantities = {};

  // --- MULTI-SESSION TIMELINE ENGINE ---
  let sessions = [];
  let activeSessionId = 'session-live';
  let baseSessionId = 'session-yesterday';

  const SORT_SELECT_MAP = {
    'markup-desc': { key: 'markup', dir: 'desc' },
    'diff-desc': { key: 'savings', dir: 'desc' },
    'coto-desc': { key: 'coto', dir: 'desc' },
    'mercado-asc': { key: 'mercado', dir: 'asc' },
    'name-asc': { key: 'name', dir: 'asc' },
    'delta-desc': { key: 'delta', dir: 'desc' },
  };

  const DEFAULT_DIR_BY_KEY = { name: 'asc', mercado: 'desc', coto: 'desc', markup: 'desc', savings: 'desc', delta: 'desc' };

  function compareByKey(key, dir) {
    const mul = dir === 'asc' ? 1 : -1;
    return (a, b) => {
      if (key === 'name') return mul * a.nombre.localeCompare(b.nombre);
      if (key === 'delta') return mul * (a.cotoDelta - b.cotoDelta);
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

  // Timeline DOM Elements
  const viewSessionSelect = document.getElementById('viewSessionSelect');
  const compareSessionSelect = document.getElementById('compareSessionSelect');
  const saveSnapshotBtn = document.getElementById('saveSnapshotBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const timelineStatusText = document.getElementById('timelineStatusText');
  const timelineStatusBadge = document.getElementById('timelineStatusBadge');

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

  // --- FETCH INITIAL PRODUCT DATA WITH HYBRID FALLBACK ---
  function loadInitialData() {
    fetch('data.json')
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(data => {
        products = data;
        initSessionManager(data);
        initApp();
      })
      .catch(err => {
        console.warn("Fetch data.json falló o fue bloqueado por CORS (protocolo file://). Usando fallback window.INITIAL_DATA:", err);
        if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA)) {
          products = window.INITIAL_DATA;
          initSessionManager(window.INITIAL_DATA);
          initApp();
        } else {
          console.error("Error crítico: No se encontraron datos de productos.");
        }
      });
  }

  loadInitialData();

  // --- SESSION MANAGER LOGIC (PURE REAL DATA) ---
  function initSessionManager(liveData) {
    const saved = localStorage.getItem('mercado_coto_sessions_v4');
    if (saved) {
      try { sessions = JSON.parse(saved); } catch(e) { sessions = []; }
    }

    if (!sessions || sessions.length === 0) {
      sessions = generateDefaultSessions(liveData);
      saveSessions();
    } else {
      // Update session-live with current live products
      const liveIndex = sessions.findIndex(s => s.id === 'session-live');
      if (liveIndex >= 0) {
        sessions[liveIndex].products = JSON.parse(JSON.stringify(liveData));
      } else {
        const now = new Date();
        sessions.unshift({
          id: 'session-live',
          timestamp: now.getTime(),
          dateStr: formatDateStr(now),
          label: `🟢 Hoy 11-Ago - Datos Reales (${formatTimeStr(now)})`,
          isLive: true,
          products: JSON.parse(JSON.stringify(liveData))
        });
      }
    }

    activeSessionId = 'session-live';
    baseSessionId = sessions.length > 1 ? sessions[1].id : 'none';

    populateSessionDropdowns();
    setupSessionListeners();
  }

  function generateDefaultSessions(liveData) {
    const now = new Date();
    const liveCopy = JSON.parse(JSON.stringify(liveData));

    const sLive = {
      id: 'session-live',
      timestamp: now.getTime(),
      dateStr: formatDateStr(now),
      label: `🟢 Hoy 11-Ago - Datos Reales Relevados (${formatTimeStr(now)})`,
      isLive: true,
      products: liveCopy
    };

    // PURE REAL DATA ONLY - No simulated/mocked historical sessions!
    return [sLive];
  }

  function saveSessions() {
    localStorage.setItem('mercado_coto_sessions_v4', JSON.stringify(sessions));
  }

  function populateSessionDropdowns() {
    if (!viewSessionSelect || !compareSessionSelect) return;

    // Active View Session Options
    viewSessionSelect.innerHTML = sessions.map(s => `
      <option value="${s.id}" ${s.id === activeSessionId ? 'selected' : ''}>${s.label}</option>
    `).join('');

    // Baseline Comparison Options
    let compareOptions = sessions.length > 1
      ? `<option value="none">Sin comparativa (Solo lectura)</option>`
      : `<option value="none">Sin comparativa aún (Esperando captura de mañana)</option>`;

    sessions.forEach(s => {
      if (s.id !== activeSessionId) {
        compareOptions += `<option value="${s.id}" ${s.id === baseSessionId ? 'selected' : ''}>Comparar vs ${s.label}</option>`;
      }
    });
    compareSessionSelect.innerHTML = compareOptions;

    updateTimelineStatusText();
  }

  function updateTimelineStatusText() {
    const activeSess = sessions.find(s => s.id === activeSessionId) || sessions[0];
    const baseSess = sessions.find(s => s.id === baseSessionId);

    if (baseSess && baseSessionId !== 'none') {
      timelineStatusText.textContent = `Comparando: ${activeSess.label.split('(')[0].trim()} vs ${baseSess.label.split('(')[0].trim()}`;
      timelineStatusBadge.style.background = 'rgba(59, 130, 246, 0.15)';
      timelineStatusBadge.style.color = '#60a5fa';
    } else {
      timelineStatusText.textContent = sessions.length > 1 
        ? `Viendo precios de: ${activeSess.label}`
        : `🟢 Captura Base Real Registrada (Hoy 11-Ago)`;
      timelineStatusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      timelineStatusBadge.style.color = '#34d399';
    }
  }

  function setupSessionListeners() {
    viewSessionSelect.addEventListener('change', (e) => {
      activeSessionId = e.target.value;
      if (baseSessionId === activeSessionId) {
        const fallback = sessions.find(s => s.id !== activeSessionId);
        baseSessionId = fallback ? fallback.id : 'none';
      }
      populateSessionDropdowns();
      calculateKPIs();
      renderAll();
    });

    compareSessionSelect.addEventListener('change', (e) => {
      baseSessionId = e.target.value;
      updateTimelineStatusText();
      calculateKPIs();
      renderAll();
    });

    saveSnapshotBtn.addEventListener('click', () => {
      snapshotCurrentState(`📸 Captura Manual (${formatTimeStr(new Date())})`);
      showNotification("📸 Captura guardada con éxito en la línea de tiempo");
    });

    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener('click', () => {
        generateDirectPdfDownload();
      });
    }

    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', () => {
        exportCurrentSessionToCsv();
      });
    }

    clearHistoryBtn.addEventListener('click', () => {
      if (confirm("¿Seguro que deseas reiniciar el historial de capturas? Se restaurará la línea de tiempo base.")) {
        sessions = generateDefaultSessions(products);
        activeSessionId = 'session-live';
        baseSessionId = 'none';
        saveSessions();
        populateSessionDropdowns();
        calculateKPIs();
        renderAll();
        showNotification("🔄 Historial de capturas reajustado.");
      }
    });
  }

  function exportCurrentSessionToCsv() {
    const list = getCurrentActiveProductList();
    const baseMap = getBaseProductsMap();
    const activeSess = sessions.find(s => s.id === activeSessionId) || sessions[0];
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "ID,Producto,Categoria,Variedad,Precio Mercado Central ($/Kg),Precio Coto Gondola ($/Kg),Sobreprecio (%),Brecha ($/Kg),Variacion Coto vs Base ($),Variacion Central vs Base ($)\n";

    list.forEach(p => {
      const baseP = baseMap ? baseMap[p.id] : null;
      const cotoDelta = baseP ? p.precioCoto - baseP.precioCoto : 0;
      const mcDelta = baseP ? p.precioMercadoCentral - baseP.precioMercadoCentral : 0;

      const row = [
        `"${p.id}"`,
        `"${p.nombre}"`,
        `"${p.categoria}"`,
        `"${p.variedad}"`,
        p.precioMercadoCentral,
        p.precioCoto,
        p.markup.toFixed(1),
        p.savings,
        cotoDelta,
        mcDelta
      ].join(",");

      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_precios_${activeSess.dateStr.replace(/[\/\s:]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showNotification("📊 Datos de la sesión exportados a CSV.");
  }

  function generateDirectPdfDownload() {
    const activeSess = sessions.find(s => s.id === activeSessionId) || sessions[0];
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2,'0')}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getFullYear()}_${now.getHours().toString().padStart(2,'0')}-${now.getMinutes().toString().padStart(2,'0')}`;
    const filename = `Reporte_Brechas_MercadoCentral_vs_Coto_${formattedDate}.pdf`;

    showNotification("📄 Generando y descargando PDF automáticamente...");

    const element = document.createElement('div');
    element.style.padding = '15px';
    element.style.background = '#ffffff';
    element.style.color = '#0f172a';
    element.style.fontFamily = "'Inter', Arial, sans-serif";

    const kpiGridEl = document.querySelector('.kpi-grid');
    const tableEl = document.querySelector('.comparison-table');

    element.innerHTML = `
      <div style="border-bottom:2px solid #2563eb; padding-bottom:10px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="margin:0; font-size:18px; color:#1e293b; font-family:'Outfit', sans-serif;">Monitor de Sobreprecio: Mercado Central de BSAS vs. Coto Digital</h2>
          <p style="margin:4px 0 0 0; font-size:11px; color:#64748b;">Reporte Descargado: ${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR')} | Sesión: ${activeSess.label}</p>
        </div>
      </div>
      <div style="margin-bottom:15px;">
        ${kpiGridEl ? kpiGridEl.outerHTML : ''}
      </div>
      <div style="margin-top:15px;">
        ${tableEl ? tableEl.outerHTML : ''}
      </div>
      <div style="margin-top:15px; font-size:9px; color:#94a3b8; text-align:center; border-top:1px solid #e2e8f0; padding-top:8px;">
        © Monitor de Sobreprecio - Mercado Central vs. Coto Digital. Documento exportado automáticamente en formato PDF.
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

    element.querySelectorAll('.product-title, .kpi-value').forEach(el => {
      el.style.color = '#0f172a';
    });

    element.querySelectorAll('.td-action, .sort-arrow').forEach(el => {
      el.style.display = 'none';
    });

    const opt = {
      margin:       [0.3, 0.3, 0.3, 0.3],
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    if (window.html2pdf) {
      html2pdf().set(opt).from(element).save().then(() => {
        showNotification(`✅ PDF descargado: ${filename}`);
      }).catch(err => {
        console.error("Error html2pdf:", err);
        window.print();
      });
    } else {
      window.print();
    }
  }

  function snapshotCurrentState(labelName) {
    const now = new Date();
    const newId = `session-${now.getTime()}`;
    const newSnapshot = {
      id: newId,
      timestamp: now.getTime(),
      dateStr: formatDateStr(now),
      label: labelName || `📸 Captura (${formatTimeStr(now)})`,
      products: JSON.parse(JSON.stringify(getCurrentActiveProductList()))
    };

    sessions.splice(1, 0, newSnapshot);
    if (sessions.length > 20) sessions.pop();

    baseSessionId = newId;
    saveSessions();
    populateSessionDropdowns();
  }

  function getCurrentActiveProductList() {
    const s = sessions.find(sess => sess.id === activeSessionId);
    return s ? s.products : products;
  }

  function getBaseProductsMap() {
    if (baseSessionId === 'none' || baseSessionId === activeSessionId) return null;
    const baseS = sessions.find(s => s.id === baseSessionId);
    if (!baseS) return null;
    const map = {};
    baseS.products.forEach(p => { map[p.id] = p; });
    return map;
  }

  // --- APP INITIALIZATION ---
  function initApp() {
    calculateKPIs();
    updateSortHeaderUI();
    renderAll();
    populateSeasonalityDropdown();
    setupEventListeners();
    startTickerRotation();
  }

  function calculateKPIs() {
    const activeList = getCurrentActiveProductList();
    const baseMap = getBaseProductsMap();

    let totalMarkup = 0;
    let maxMarkup = -1;
    let maxMarkupObj = null;
    let totalSavings = 0;

    activeList.forEach(p => {
      const markup = ((p.precioCoto - p.precioMercadoCentral) / p.precioMercadoCentral) * 100;
      const savings = p.precioCoto - p.precioMercadoCentral;
      
      p.markup = markup;
      p.savings = savings;

      if (baseMap && baseMap[p.id]) {
        const baseP = baseMap[p.id];
        p.cotoDelta = p.precioCoto - baseP.precioCoto;
        p.cotoDeltaPct = baseP.precioCoto > 0 ? (p.cotoDelta / baseP.precioCoto) * 100 : 0;
        p.mercadoDelta = p.precioMercadoCentral - baseP.precioMercadoCentral;
        p.markupDelta = p.markup - baseP.markup;
      } else {
        p.cotoDelta = 0;
        p.cotoDeltaPct = 0;
        p.mercadoDelta = 0;
        p.markupDelta = 0;
      }

      totalMarkup += markup;
      totalSavings += savings;

      if (markup > maxMarkup) {
        maxMarkup = markup;
        maxMarkupObj = p;
      }
    });

    const avgMarkup = (totalMarkup / (activeList.length || 1)).toFixed(1);
    const avgSavings = Math.round(totalSavings / (activeList.length || 1));

    avgMarkupVal.textContent = `+${avgMarkup}%`;
    avgSavingsVal.textContent = `$ ${formatNumber(avgSavings)}`;
    totalProductsVal.textContent = activeList.length;

    if (maxMarkupObj) {
      maxMarkupProduct.textContent = `${maxMarkupObj.nombre} (+${Math.round(maxMarkupObj.markup)}%)`;
      tickerText.textContent = `¡ALERTA!: ${maxMarkupObj.nombre} presenta un sobreprecio de +${Math.round(maxMarkupObj.markup)}% ($${formatNumber(maxMarkupObj.precioMercadoCentral)} en Mercado Central vs $${formatNumber(maxMarkupObj.precioCoto)} en Coto)`;
    }
  }

  function getFilteredProducts() {
    const activeList = getCurrentActiveProductList();
    let filtered = activeList.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.variedad.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    if (currentCategory === 'todos') {
      // Todos
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
      if (sortKey === 'delta') return sortDir === 'desc' ? Math.abs(b.cotoDelta) - Math.abs(a.cotoDelta) : Math.abs(a.cotoDelta) - Math.abs(b.cotoDelta);
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
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No se encontraron productos que coincidan con la búsqueda.</td></tr>`;
      return;
    }

    const hasComparison = baseSessionId !== 'none' && baseSessionId !== activeSessionId;
    const baseMap = getBaseProductsMap();

    tableBody.innerHTML = list.map(p => {
      const markupClass = p.markup >= 250 ? 'markup-extreme' : 'markup-high';
      const iconUrl = (p.imagen && p.imagen.startsWith('data:image/svg')) ? p.imagen : getProduceSvg(p.nombre);
      const rankBadge = p.topVerduraRank ? `<span class="top10-rank-badge"><i class="fa-solid fa-fire"></i> #${p.topVerduraRank} Verdura Arg</span>` :
                        p.topFrutaRank ? `<span class="top10-rank-badge"><i class="fa-solid fa-fire"></i> #${p.topFrutaRank} Fruta Arg</span>` : '';
      
      const baseP = (hasComparison && baseMap) ? baseMap[p.id] : null;

      let mcDeltaBadge = '';
      let cotoDeltaBadge = '';
      let compCardHtml = '';

      if (baseP) {
        // 1. Mercado Central Deltas
        const mcDelta = p.precioMercadoCentral - baseP.precioMercadoCentral;
        const mcDeltaPct = baseP.precioMercadoCentral > 0 ? (mcDelta / baseP.precioMercadoCentral) * 100 : 0;
        if (mcDelta > 0) {
          mcDeltaBadge = `<span class="mini-delta up" title="Suba en Mercado Central vs sesión base"><i class="fa-solid fa-arrow-trend-up"></i> +$${formatNumber(mcDelta)} (+${mcDeltaPct.toFixed(1)}%)</span>`;
        } else if (mcDelta < 0) {
          mcDeltaBadge = `<span class="mini-delta down" title="Baja en Mercado Central vs sesión base"><i class="fa-solid fa-arrow-trend-down"></i> -$${formatNumber(Math.abs(mcDelta))} (${mcDeltaPct.toFixed(1)}%)</span>`;
        } else {
          mcDeltaBadge = `<span class="mini-delta neutral"><i class="fa-solid fa-minus"></i> $0</span>`;
        }

        // 2. Coto Deltas
        const cotoDelta = p.precioCoto - baseP.precioCoto;
        const cotoDeltaPct = baseP.precioCoto > 0 ? (cotoDelta / baseP.precioCoto) * 100 : 0;
        if (cotoDelta > 0) {
          cotoDeltaBadge = `<span class="mini-delta up" title="Aumento en Coto vs sesión base"><i class="fa-solid fa-arrow-trend-up"></i> +$${formatNumber(cotoDelta)} (+${cotoDeltaPct.toFixed(1)}%)</span>`;
        } else if (cotoDelta < 0) {
          cotoDeltaBadge = `<span class="mini-delta down" title="Reducción en Coto vs sesión base"><i class="fa-solid fa-arrow-trend-down"></i> -$${formatNumber(Math.abs(cotoDelta))} (${cotoDeltaPct.toFixed(1)}%)</span>`;
        } else {
          cotoDeltaBadge = `<span class="mini-delta neutral"><i class="fa-solid fa-minus"></i> $0</span>`;
        }

        // 3. Mini Visual Progress Bar Math
        const maxCoto = Math.max(p.precioCoto, baseP.precioCoto, 1);
        const cotoBaseW = Math.round((baseP.precioCoto / maxCoto) * 100);
        const cotoCurrW = Math.round((p.precioCoto / maxCoto) * 100);
        const cotoBarClass = cotoDelta > 0 ? 'mini-bar-coto-up' : cotoDelta < 0 ? 'mini-bar-coto-down' : 'mini-bar-base';
        const cotoTextClass = cotoDelta > 0 ? 'up' : cotoDelta < 0 ? 'down' : 'neutral';
        const cotoStr = cotoDelta > 0 ? `+$${formatNumber(cotoDelta)}` : cotoDelta < 0 ? `-$${formatNumber(Math.abs(cotoDelta))}` : `$0`;

        const maxMC = Math.max(p.precioMercadoCentral, baseP.precioMercadoCentral, 1);
        const mcBaseW = Math.round((baseP.precioMercadoCentral / maxMC) * 100);
        const mcCurrW = Math.round((p.precioMercadoCentral / maxMC) * 100);
        const mcBarClass = mcDelta > 0 ? 'mini-bar-mc-up' : mcDelta < 0 ? 'mini-bar-mc-down' : 'mini-bar-base';
        const mcTextClass = mcDelta > 0 ? 'up' : mcDelta < 0 ? 'down' : 'neutral';
        const mcStr = mcDelta > 0 ? `+$${formatNumber(mcDelta)}` : mcDelta < 0 ? `-$${formatNumber(Math.abs(mcDelta))}` : `$0`;

        compCardHtml = `
          <div class="temporal-comp-card">
            <div class="comp-item">
              <div class="comp-item-title">
                <span><i class="fa-solid fa-cart-shopping text-danger"></i> Coto:</span>
                <span class="${cotoTextClass}">${cotoStr}</span>
              </div>
              <div class="mini-bar-track-dual" title="Gris: Base ($${formatNumber(baseP.precioCoto)}) | Color: Actual ($${formatNumber(p.precioCoto)})">
                <div class="mini-bar-row mini-bar-base" style="width: ${cotoBaseW}%;"></div>
                <div class="mini-bar-row ${cotoBarClass}" style="width: ${cotoCurrW}%;"></div>
              </div>
            </div>

            <div class="comp-item">
              <div class="comp-item-title">
                <span><i class="fa-solid fa-building text-success"></i> Central:</span>
                <span class="${mcTextClass}">${mcStr}</span>
              </div>
              <div class="mini-bar-track-dual" title="Gris: Base ($${formatNumber(baseP.precioMercadoCentral)}) | Color: Actual ($${formatNumber(p.precioMercadoCentral)})">
                <div class="mini-bar-row mini-bar-base" style="width: ${mcBaseW}%;"></div>
                <div class="mini-bar-row ${mcBarClass}" style="width: ${mcCurrW}%;"></div>
              </div>
            </div>
          </div>
        `;
      } else {
        compCardHtml = `<span style="color:var(--text-muted); font-size:0.82rem;">-</span>`;
      }

      return `
        <tr class="product-row">
          <td class="td-product">
            <div class="product-cell">
              <img src="${iconUrl}" alt="${p.nombre}" class="product-img">
              <div>
                <div class="product-title">${p.nombre} ${rankBadge}</div>
                <div class="product-sub">${p.variedad} • ${p.origen}</div>
              </div>
            </div>
          </td>

          <td class="td-mercado">
            <div class="price-strip strip-mercado">
              <span class="price-source"><i class="fa-solid fa-building text-success"></i> Mercado Central</span>
              <div class="price-mercado">$ ${formatNumber(p.precioMercadoCentral)} / ${p.unidad}</div>
            </div>
            ${mcDeltaBadge}
            <small class="desktop-subtext">${p.bultoMercadoCentral}</small>
          </td>

          <td class="td-coto">
            <div class="price-strip strip-coto">
              <span class="price-source"><i class="fa-solid fa-cart-shopping text-danger"></i> Coto Góndola</span>
              <div class="price-coto">$ ${formatNumber(p.precioCoto)} / ${p.unidad}</div>
            </div>
            ${cotoDeltaBadge}
            <small class="desktop-subtext">Coto Digital Góndola</small>
          </td>

          <td class="td-markup">
            <span class="desktop-label">Sobreprecio</span>
            <span class="markup-badge ${markupClass}">
              <i class="fa-solid fa-up-long"></i> +${Math.round(p.markup)}%
            </span>
          </td>

          <td class="td-gap">
            <span class="desktop-label">Brecha ($/kg)</span>
            <div class="gap-value">+$ ${formatNumber(p.savings)} / ${p.unidad}</div>
          </td>

          <td class="td-delta">
            <span class="desktop-label">Variación Temporal</span>
            <div>${compCardHtml}</div>
          </td>

          <td class="td-action">
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
    const hasComparison = baseSessionId !== 'none' && baseSessionId !== activeSessionId;
    const baseMap = getBaseProductsMap();

    barChartContainer.innerHTML = list.map(p => {
      const baseP = (hasComparison && baseMap) ? baseMap[p.id] : null;
      const maxRef = Math.max(p.precioCoto, baseP ? baseP.precioCoto : 0, 1);

      const cotoPercent = Math.max(Math.min((p.precioCoto / maxRef) * 100, 100), 4);
      const mercadoPercent = Math.max(Math.min((p.precioMercadoCentral / maxRef) * 100, 100), 4);

      let baseBarsHtml = '';
      let compSubtitleHtml = `<span class="text-danger">+${Math.round(p.markup)}% remarcación</span>`;

      if (baseP) {
        const cotoBasePercent = Math.max(Math.min((baseP.precioCoto / maxRef) * 100, 100), 4);
        const mercadoBasePercent = Math.max(Math.min((baseP.precioMercadoCentral / maxRef) * 100, 100), 4);

        const cotoDelta = p.precioCoto - baseP.precioCoto;
        const cotoStr = cotoDelta > 0 ? `+$${formatNumber(cotoDelta)}` : cotoDelta < 0 ? `-$${formatNumber(Math.abs(cotoDelta))}` : `$0`;
        const cotoColClass = cotoDelta > 0 ? 'text-danger' : cotoDelta < 0 ? 'text-success' : '';

        baseBarsHtml = `
          <div class="bar-row opacity-75">
            <span class="bar-label"><i class="fa-solid fa-cart-shopping text-muted"></i> Coto (Base)</span>
            <div class="bar-track">
              <div class="bar-fill bar-fill-coto-base" style="width: ${cotoBasePercent}%;"></div>
            </div>
            <span class="bar-val text-muted">$ ${formatNumber(baseP.precioCoto)}</span>
          </div>
          <div class="bar-row opacity-75">
            <span class="bar-label"><i class="fa-solid fa-building text-muted"></i> Central (Base)</span>
            <div class="bar-track">
              <div class="bar-fill bar-fill-mercado-base" style="width: ${mercadoBasePercent}%;"></div>
            </div>
            <span class="bar-val text-muted">$ ${formatNumber(baseP.precioMercadoCentral)}</span>
          </div>
        `;

        compSubtitleHtml = `<span class="${cotoColClass}">Variación Coto: ${cotoStr} vs Base</span>`;
      }

      return `
        <div class="chart-item">
          <div class="chart-item-header">
            <span>${p.nombre} (${p.variedad})</span>
            ${compSubtitleHtml}
          </div>
          <div class="bars-wrapper">
            <div class="bar-row">
              <span class="bar-label"><i class="fa-solid fa-cart-shopping text-danger"></i> Coto Actual</span>
              <div class="bar-track">
                <div class="bar-fill bar-fill-coto" style="width: ${cotoPercent}%;"></div>
              </div>
              <span class="bar-val text-danger">$ ${formatNumber(p.precioCoto)}</span>
            </div>

            <div class="bar-row">
              <span class="bar-label"><i class="fa-solid fa-building text-success"></i> Central Actual</span>
              <div class="bar-track">
                <div class="bar-fill bar-fill-mercado" style="width: ${mercadoPercent}%;"></div>
              </div>
              <span class="bar-val text-success">$ ${formatNumber(p.precioMercadoCentral)}</span>
            </div>

            ${baseBarsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderCalculatorGrid() {
    const activeList = getCurrentActiveProductList();
    calcItemsGrid.innerHTML = activeList.map(p => {
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
    const activeList = getCurrentActiveProductList();

    activeList.forEach(p => {
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
    const activeList = getCurrentActiveProductList();
    const activeItems = activeList.filter(p => (cartQuantities[p.id] || 0) > 0);
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
        
        // Auto snapshot current state into session timeline before fetching update
        snapshotCurrentState(`🔄 Prev. a recarga (${formatTimeStr(new Date())})`);

        fetch(`data.json?t=${Date.now()}`)
          .then(res => {
            if (!res.ok) throw new Error("HTTP error " + res.status);
            return res.json();
          })
          .then(data => {
            products = data;
            const liveS = sessions.find(s => s.id === 'session-live');
            if (liveS) liveS.products = JSON.parse(JSON.stringify(data));
            saveSessions();
            populateSessionDropdowns();
            calculateKPIs();
            renderAll();
            showNotification("✅ ¡Datos actualizados y captura anterior guardada en la línea de tiempo!");
          })
          .catch(err => {
            console.warn("No se pudo cargar data.json vía fetch, usando fallback:", err);
            const fallbackData = window.INITIAL_DATA || products;
            const liveS = sessions.find(s => s.id === 'session-live');
            if (liveS) liveS.products = JSON.parse(JSON.stringify(fallbackData));
            saveSessions();
            populateSessionDropdowns();
            calculateKPIs();
            renderAll();
            showNotification("✅ ¡Captura de estado guardada en la línea de tiempo!");
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
          sortDir = sortDir === 'asc' ? 'desc' : 'asc';
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
      const activeList = getCurrentActiveProductList();
      if (activeList.length === 0) return;
      index = (index + 1) % activeList.length;
      const p = activeList[index];
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

  function populateSeasonalityDropdown() {
    const seasonSelect = document.getElementById('seasonProductSelect');
    if (!seasonSelect) return;

    const activeList = getCurrentActiveProductList();
    seasonSelect.innerHTML = activeList.map(p => `
      <option value="${p.id}">${p.nombre} (${p.variedad})</option>
    `).join('');

    seasonSelect.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const prod = activeList.find(p => p.id === selectedId);
      if (prod) renderSeasonalityView(prod);
    });

    if (activeList.length > 0) {
      renderSeasonalityView(activeList[0]);
    }
  }

  function renderSeasonalityView(p) {
    const est = p.estacionalidad || {};

    document.getElementById('seasonHarvestMonths').textContent = est.picoCosecha || 'Enero - Mayo';
    document.getElementById('seasonHarvestZone').textContent = `Zona: ${est.zonaProductora || 'Zona núcleo argentina'}`;

    document.getElementById('seasonScarcityMonths').textContent = est.mesesEscasez || 'Sin registro';
    document.getElementById('seasonScarcityReason').textContent = est.motivoEscasez || 'Condiciones climáticas normales';

    document.getElementById('seasonForecastText').textContent = est.proyeccion || 'Estable';
    document.getElementById('seasonForecastReason').textContent = est.motivoProyeccion || 'Abastecimiento continuo';

    document.getElementById('agronomicNotesText').textContent = est.notasAgronomicas || 'Abastecimiento nacional regular.';

    // 1. Line chart
    const chartTitleElem = document.getElementById('officialChartTitle');
    if (chartTitleElem) chartTitleElem.textContent = (p.nombre || 'PRODUCTO').toUpperCase();

    const chartQualityElem = document.getElementById('officialChartQuality');
    if (chartQualityElem) chartQualityElem.textContent = `Calidad: ${p.variedad || 'Primera / Segunda'}`;

    const origins = est.origeneSeries || [
      { nombre: `Origen: SE BS.AS | ${p.nombre}`, color: '#84cc16', puntos: [900, 950, 1000, 1100, 1200, 1500, 1600, 1500] },
      { nombre: `Origen: CORDOBA | ${p.nombre}`, color: '#06b6d4', puntos: [950, 970, 1020, 1150, 1250, 1550, 1500, 1450] }
    ];
    const fechas = est.fechasSeries || ["26-06-26", "02-07-26", "08-07-26", "14-07-26", "20-07-26", "26-07-26", "01-08-26", "09-08-26"];

    const originsBadgesContainer = document.getElementById('originsBadgesContainer');
    if (originsBadgesContainer) {
      originsBadgesContainer.innerHTML = origins.map(o => `
        <span class="origin-badge" style="border-color: ${o.color};">
          <span style="width:10px; height:10px; border-radius:3px; background:${o.color};"></span> ${o.nombre}
        </span>
      `).join('');
    }

    const svgLineChartContainer = document.getElementById('svgLineChartContainer');
    if (svgLineChartContainer) {
      const allValues = origins.flatMap(o => o.puntos);
      const minVal = Math.floor(Math.min(...allValues, 500) / 100) * 100;
      const maxVal = Math.ceil(Math.max(...allValues, 1800) / 100) * 100;
      
      const width = 750;
      const height = 300;
      const paddingLeft = 60;
      const paddingRight = 30;
      const paddingTop = 30;
      const paddingBottom = 45;

      const chartW = width - paddingLeft - paddingRight;
      const chartH = height - paddingTop - paddingBottom;

      const steps = 5;
      const stepVal = (maxVal - minVal) / steps;
      let gridLines = '';
      for (let i = 0; i <= steps; i++) {
        const val = Math.round(minVal + stepVal * i);
        const y = height - paddingBottom - (i / steps) * chartH;
        gridLines += `
          <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>
          <text x="${paddingLeft - 10}" y="${y + 4}" fill="#64748b" font-size="11" text-anchor="end" font-weight="600">$${formatNumber(val)}</text>
        `;
      }

      let xAxisLabels = '';
      const pointCount = fechas.length;
      const stepX = chartW / (pointCount - 1);
      fechas.forEach((f, idx) => {
        const x = paddingLeft + idx * stepX;
        xAxisLabels += `
          <line x1="${x}" y1="${height - paddingBottom}" x2="${x}" y2="${height - paddingBottom + 5}" stroke="#94a3b8" stroke-width="1"/>
          <text x="${x}" y="${height - paddingBottom + 20}" fill="#64748b" font-size="10" text-anchor="middle" transform="rotate(-30 ${x} ${height - paddingBottom + 20})">${f}</text>
        `;
      });

      let linesSvg = '';
      origins.forEach(o => {
        const pts = o.puntos;
        const coords = pts.map((val, idx) => {
          const x = paddingLeft + idx * (chartW / (pts.length - 1));
          const y = height - paddingBottom - ((val - minVal) / (maxVal - minVal)) * chartH;
          return { x, y, val };
        });

        const pointsStr = coords.map(c => `${c.x},${c.y}`).join(' ');
        linesSvg += `<polyline fill="none" stroke="${o.color}" stroke-width="2.5" points="${pointsStr}" stroke-linejoin="round" stroke-linecap="round"/>`;

        coords.forEach(c => {
          linesSvg += `<circle cx="${c.x}" cy="${c.y}" r="3.5" fill="${o.color}" stroke="#fff" stroke-width="1.5"><title>${o.nombre}: $${formatNumber(c.val)}/kg</title></circle>`;
        });
      });

      svgLineChartContainer.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
          <text x="15" y="${paddingTop - 10}" fill="#64748b" font-size="11" font-weight="700">Precio/Kg</text>
          ${gridLines}
          ${xAxisLabels}
          <line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${height - paddingBottom}" stroke="#cbd5e1" stroke-width="2"/>
          <line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" stroke="#cbd5e1" stroke-width="2"/>
          ${linesSvg}
        </svg>
      `;
    }

    // 2. Render 12 Monthly Bars
    const monthlyBarsContainer = document.getElementById('monthlyBarsContainer');
    if (!monthlyBarsContainer) return;

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mcHistory = est.historiaMesesMC || [p.precioMercadoCentral];
    const cotoHistory = est.historiaMesesCoto || [p.precioCoto];

    const maxMonthlyVal = Math.max(...cotoHistory, ...mcHistory, 1);

    monthlyBarsContainer.innerHTML = monthNames.map((m, idx) => {
      const mcVal = mcHistory[idx % mcHistory.length];
      const cotoVal = cotoHistory[idx % cotoHistory.length];

      const mcH = Math.max(Math.round((mcVal / maxMonthlyVal) * 140), 12);
      const cotoH = Math.max(Math.round((cotoVal / maxMonthlyVal) * 140), 12);

      return `
        <div class="month-column">
          <div class="month-bars-pair">
            <div class="m-bar m-bar-mercado" style="height: ${mcH}px;" title="Mercado Central: $${formatNumber(mcVal)}"></div>
            <div class="m-bar m-bar-coto" style="height: ${cotoH}px;" title="Coto Góndola: $${formatNumber(cotoVal)}"></div>
          </div>
          <span class="month-label">${m}</span>
        </div>
      `;
    }).join('');
  }

  // --- HELPERS ---
  function formatNumber(num) {
    return new Intl.NumberFormat('es-AR').format(num);
  }

  function formatTimeStr(d) {
    const hrs = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hrs}:${mins}`;
  }

  function formatDateStr(d) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month} ${formatTimeStr(d)}`;
  }

  function formatDateShort(d) {
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day}-${months[d.getMonth()]}`;
  }
});
