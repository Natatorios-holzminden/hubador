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

  const MONTH_NAMES_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  function formatTodayLabel(d) {
    const now = d || new Date();
    const day = now.getDate();
    const monthStr = MONTH_NAMES_SHORT[now.getMonth()];
    const timeStr = formatTimeStr(now);
    return `🟢 Hoy ${day}-${monthStr} - Relevamiento Vivo en Tiempo Real (${timeStr})`;
  }

  // --- SESSION MANAGER LOGIC (PURE REAL HISTORICAL DATA) ---
  function initSessionManager(liveData) {
    const saved = localStorage.getItem('mercado_coto_sessions_v6');
    if (saved) {
      try { sessions = JSON.parse(saved); } catch(e) { sessions = []; }
    }

    if (!sessions || sessions.length === 0) {
      sessions = generateDefaultSessions(liveData);
      saveSessions();
    } else {
      // Update session-live with current live products for Today
      const liveIndex = sessions.findIndex(s => s.id === 'session-live');
      if (liveIndex >= 0) {
        sessions[liveIndex].products = JSON.parse(JSON.stringify(liveData));
        sessions[liveIndex].label = formatTodayLabel(new Date());
      } else {
        const now = new Date();
        sessions.unshift({
          id: 'session-live',
          timestamp: now.getTime(),
          dateStr: formatDateStr(now),
          label: formatTodayLabel(now),
          isLive: true,
          products: JSON.parse(JSON.stringify(liveData))
        });
      }

      // Ensure August 19 session exists in history
      const hasBase19 = sessions.some(s => s.id === 'session-19aug');
      if (!hasBase19 && window.BASELINE_19AUG_DATA) {
        sessions.push({
          id: 'session-19aug',
          timestamp: new Date('2026-08-19T17:00:00').getTime(),
          dateStr: '19/08/2026',
          label: '📅 Relevamiento Real 19-Ago (Papa Coto $2.299 / Central $1.097)',
          products: JSON.parse(JSON.stringify(window.BASELINE_19AUG_DATA))
        });
      }

      // Ensure August 11 baseline session exists in history
      const hasBase11 = sessions.some(s => s.id === 'session-11aug');
      if (!hasBase11 && window.BASELINE_11AUG_DATA) {
        sessions.push({
          id: 'session-11aug',
          timestamp: new Date('2026-08-11T17:54:00').getTime(),
          dateStr: '11/08/2026',
          label: '📅 Base Real 11-Ago (Relevamiento Inicial)',
          products: JSON.parse(JSON.stringify(window.BASELINE_11AUG_DATA))
        });
      }
    }

    activeSessionId = 'session-live';
    const base19Sess = sessions.find(s => s.id === 'session-19aug');
    const base11Sess = sessions.find(s => s.id === 'session-11aug');
    baseSessionId = base19Sess ? 'session-19aug' : (base11Sess ? 'session-11aug' : (sessions.length > 1 ? sessions[1].id : 'none'));

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
      label: formatTodayLabel(now),
      isLive: true,
      products: liveCopy
    };

    const base19Copy = window.BASELINE_19AUG_DATA ? JSON.parse(JSON.stringify(window.BASELINE_19AUG_DATA)) : liveCopy;
    const base11Copy = window.BASELINE_11AUG_DATA ? JSON.parse(JSON.stringify(window.BASELINE_11AUG_DATA)) : liveCopy;

    const s19Aug = {
      id: 'session-19aug',
      timestamp: new Date('2026-08-19T17:00:00').getTime(),
      dateStr: '19/08/2026',
      label: '📅 Relevamiento Real 19-Ago (Papa Coto $2.299 / Central $1.097)',
      products: base19Copy
    };

    const s11Aug = {
      id: 'session-11aug',
      timestamp: new Date('2026-08-11T17:54:00').getTime(),
      dateStr: '11/08/2026',
      label: '📅 Base Real 11-Ago (Relevamiento Inicial)',
      products: base11Copy
    };

    // PURE REAL HISTORICAL SESSIONS ONLY (Live 21-Ago vs 19-Ago vs 11-Ago Baseline)!
    return [sLive, s19Aug, s11Aug];
  }

  function saveSessions() {
    localStorage.setItem('mercado_coto_sessions_v6', JSON.stringify(sessions));
  }

  function populateSessionDropdowns() {
    if (!viewSessionSelect || !compareSessionSelect) return;

    // Active View Session Options
    viewSessionSelect.innerHTML = sessions.map(s => `
      <option value="${s.id}" ${s.id === activeSessionId ? 'selected' : ''}>${s.label}</option>
    `).join('');

    // Baseline Comparison Options
    let compareOptions = `<option value="none">Sin comparativa (Solo lectura)</option>`;

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
      timelineStatusText.textContent = `Comparando: ${activeSess.label.split('-')[0].trim()} (${activeSess.label.includes('19-Ago') ? '19-Ago' : 'Sesión'}) vs ${baseSess.label.split('-')[0].trim()} (${baseSess.label.includes('11-Ago') ? '11-Ago' : 'Base'})`;
      timelineStatusBadge.style.background = 'rgba(59, 130, 246, 0.15)';
      timelineStatusBadge.style.color = '#60a5fa';
    } else {
      timelineStatusText.textContent = `Viendo precios de: ${activeSess.label}`;
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

  const TOP_VERDURAS_MAP = {
    'papa': 1, 'tomate': 2, 'cebolla': 3, 'zanahoria': 4, 'zapallo': 5,
    'zapallito': 6, 'acelga': 7, 'lechuga': 8, 'batata': 9, 'espinaca': 10,
    'pepino': 10, 'berenjena': 10
  };

  const TOP_FRUTAS_MAP = {
    'banana': 1, 'manzana': 2, 'naranja': 3, 'mandarina': 4, 'pera': 5,
    'limon': 6, 'frutilla': 7, 'pomelo': 8, 'palta': 9
  };

  function ensureTopRanks(list) {
    if (!list) return;
    list.forEach(p => {
      const norm = (p.nombre || '').toLowerCase();
      if (!p.topVerduraRank) {
        for (let key in TOP_VERDURAS_MAP) {
          if (norm.includes(key)) {
            p.topVerduraRank = TOP_VERDURAS_MAP[key];
            break;
          }
        }
      }
      if (!p.topFrutaRank) {
        for (let key in TOP_FRUTAS_MAP) {
          if (norm.includes(key)) {
            p.topFrutaRank = TOP_FRUTAS_MAP[key];
            break;
          }
        }
      }
    });
  }

  function getCurrentActiveProductList() {
    const s = sessions.find(sess => sess.id === activeSessionId);
    const list = s ? s.products : products;
    ensureTopRanks(list);
    return list;
  }

  function getBaseProductsMap() {
    if (baseSessionId === 'none' || baseSessionId === activeSessionId) return null;
    const baseS = sessions.find(s => s.id === baseSessionId);
    if (!baseS) return null;
    ensureTopRanks(baseS.products);
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

  let currentTemporalFilter = 'all';

  let currentStackedCategory = 'top10-verduras';

  function renderAll() {
    const filtered = getFilteredProducts();
    renderTable(filtered);
    renderCharts(filtered);
    renderCalculatorGrid();
    updateCalculatorSummary();
    renderTemporalComparisonTable();
    renderStackedCardsGrid();
  }

  function renderStackedCardsGrid() {
    const grid1 = document.getElementById('stackedCardsGrid');
    const grid2 = document.getElementById('stackedCardsGridAlt');

    if (!grid1 && !grid2) return;

    const baseMap = getBaseProductsMap();
    const activeList = getCurrentActiveProductList();

    let htmlOutput = '';

    if (!baseMap) {
      htmlOutput = `<p style="color:var(--text-muted); padding:1.5rem; text-align:center;">Por favor selecciona una sesión base en la Línea de Tiempo para visualizar la evolución gráfica.</p>`;
    } else {
      let filteredItems = activeList.filter(p => {
        if (currentStackedCategory === 'top10-verduras') return p.topVerduraRank > 0;
        if (currentStackedCategory === 'top10-frutas') return p.topFrutaRank > 0;
        return true;
      });

      filteredItems.sort((a, b) => {
        const rA = a.topVerduraRank || a.topFrutaRank || 99;
        const rB = b.topVerduraRank || b.topFrutaRank || 99;
        return rA - rB;
      });

      if (filteredItems.length === 0) {
        htmlOutput = `<p style="color:var(--text-muted); padding:1.5rem; text-align:center;">No se encontraron productos para esta categoría.</p>`;
      } else {
        htmlOutput = filteredItems.map(p => {
          const baseP = findBaseMatch(p, baseMap);
          if (!baseP) return '';

          const baseMC = baseP.precioMercadoCentral;
          const baseCoto = baseP.precioCoto;
          const baseGap = baseCoto - baseMC;
          const baseMult = (baseCoto / Math.max(1, baseMC)).toFixed(1).replace('.', ',');

          const currMC = p.precioMercadoCentral;
          const currCoto = p.precioCoto;
          const currGap = currCoto - currMC;
          const currMult = (currCoto / Math.max(1, currMC)).toFixed(1).replace('.', ',');

          const gapDiff = currGap - baseGap;
          const gapDiffPct = baseGap > 0 ? Math.round((gapDiff / baseGap) * 100) : 0;
          const gapSign = gapDiff > 0 ? '+' : '';

          const maxPrice = Math.max(baseCoto, currCoto, 1);
          const leftTotalH = Math.round((baseCoto / maxPrice) * 160);
          const rightTotalH = Math.round((currCoto / maxPrice) * 160);

          const leftGreenH = Math.round((baseMC / Math.max(1, baseCoto)) * leftTotalH);
          const leftRedH = Math.max(0, leftTotalH - leftGreenH);

          const rightGreenH = Math.round((currMC / Math.max(1, currCoto)) * rightTotalH);
          const rightRedH = Math.max(0, rightTotalH - rightGreenH);

          const baseSess = sessions.find(s => s.id === baseSessionId);
          const activeSess = sessions.find(s => s.id === activeSessionId);

          const baseDateStr = baseSess ? (baseSess.label.includes('11-Ago') ? '11-Ago' : (baseSess.label.includes('19-Ago') ? '19-Ago' : 'Base')) : '11-Ago';
          const currDateStr = activeSess ? (activeSess.label.includes('21-Ago') ? '21-Ago' : (activeSess.label.includes('19-Ago') ? '19-Ago' : 'Hoy')) : 'Hoy';

          return `
            <div class="stacked-card">
              <div class="stacked-card-header">
                <div>
                  <h3 class="stacked-card-title">${p.nombre}</h3>
                  <div class="stacked-card-subtitle">Precio de góndola = costo mayorista + recargo</div>
                </div>
                <div class="stacked-card-multiplier">
                  <div class="multiplier-value">${currMult}×</div>
                  <div class="multiplier-label">lo que Coto cobra sobre el mayorista</div>
                  <div class="multiplier-prev">antes ${baseMult}×</div>
                </div>
              </div>

              <div class="stacked-bars-area">
                <div class="stacked-column-group">
                  <div class="stacked-top-label">$${formatNumber(baseCoto)}</div>
                  <div class="stacked-bar-track" style="height:${leftTotalH}px;">
                    <div class="stacked-segment-red" style="height:${leftRedH}px;">
                      ${leftRedH > 22 ? `Brecha<br>$${formatNumber(baseGap)}` : ''}
                    </div>
                    <div class="stacked-segment-green" style="height:${leftGreenH}px;">
                      ${leftGreenH > 22 ? `Central<br>$${formatNumber(baseMC)}` : ''}
                    </div>
                  </div>
                  <div class="stacked-bottom-date">${baseDateStr}</div>
                </div>

                <div class="stacked-column-group">
                  <div class="stacked-top-label">$${formatNumber(currCoto)}</div>
                  <div class="stacked-bar-track" style="height:${rightTotalH}px;">
                    <div class="stacked-segment-red" style="height:${rightRedH}px;">
                      ${rightRedH > 22 ? `Brecha<br>$${formatNumber(currGap)}` : ''}
                    </div>
                    <div class="stacked-segment-green" style="height:${rightGreenH}px;">
                      ${rightGreenH > 22 ? `Central<br>$${formatNumber(currMC)}` : ''}
                    </div>
                  </div>
                  <div class="stacked-bottom-date">${currDateStr}</div>
                </div>
              </div>

              <div class="stacked-card-legend">
                <span class="stacked-legend-item"><span class="stacked-legend-dot" style="background:#10b981;"></span> Central (mayorista)</span>
                <span class="stacked-legend-item"><span class="stacked-legend-dot" style="background:#ef4444;"></span> Brecha (recargo de góndola)</span>
              </div>

              <div class="stacked-card-footer-pill">
                La brecha pasó de $${formatNumber(baseGap)} a <strong style="color:#f87171;">$${formatNumber(currGap)}</strong> (${gapSign}$${formatNumber(gapDiff)}, ${gapSign}${gapDiffPct}%).
              </div>
            </div>
          `;
        }).join('');
      }
    }

    if (grid1) grid1.innerHTML = htmlOutput;
    if (grid2) grid2.innerHTML = htmlOutput;
  }

  function findBaseMatch(p, baseMap) {
    if (!baseMap) return null;
    if (baseMap[p.id]) return baseMap[p.id];

    const normId = (p.id || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
    for (let k in baseMap) {
      const normK = k.replace(/[^a-z0-9]/gi, '').toLowerCase();
      if (normId === normK) return baseMap[k];
    }

    const normName = (p.nombre || '').toLowerCase().trim();
    for (let k in baseMap) {
      const bName = (baseMap[k].nombre || '').toLowerCase().trim();
      if (bName && (bName === normName || normName.includes(bName) || bName.includes(normName))) {
        return baseMap[k];
      }
    }

    return null;
  }

  function renderTemporalComparisonTable() {
    const temporalTableBody = document.getElementById('temporalTableBody');
    if (!temporalTableBody) return;

    const baseMap = getBaseProductsMap();
    const activeList = getFilteredProducts();

    if (!baseMap) {
      temporalTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:3rem; color:var(--text-muted);">
            <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem; margin-bottom:0.5rem;"></i>
            <p>Por favor selecciona una sesión base en la Línea de Tiempo arriba para visualizar los cambios de precios.</p>
          </td>
        </tr>
      `;
      return;
    }

    let mcUpCount = 0, mcDownCount = 0, mcSameCount = 0;
    let cotoUpCount = 0, cotoDownCount = 0, cotoSameCount = 0;

    let items = activeList.map(p => {
      const baseP = findBaseMatch(p, baseMap);
      if (!baseP) return null;

      const mcDelta = p.precioMercadoCentral - baseP.precioMercadoCentral;
      const mcPct = baseP.precioMercadoCentral > 0 ? (mcDelta / baseP.precioMercadoCentral) * 100 : 0;

      const cotoDelta = p.precioCoto - baseP.precioCoto;
      const cotoPct = baseP.precioCoto > 0 ? (cotoDelta / baseP.precioCoto) * 100 : 0;

      if (mcDelta > 0) mcUpCount++;
      else if (mcDelta < 0) mcDownCount++;
      else mcSameCount++;

      if (cotoDelta > 0) cotoUpCount++;
      else if (cotoDelta < 0) cotoDownCount++;
      else cotoSameCount++;

      return {
        ...p,
        baseMC: baseP.precioMercadoCentral,
        baseCoto: baseP.precioCoto,
        mcDelta,
        mcPct,
        cotoDelta,
        cotoPct
      };
    }).filter(Boolean);

    const kpiMcSummary = document.getElementById('kpiMcTempSummary');
    const kpiCotoSummary = document.getElementById('kpiCotoTempSummary');
    if (kpiMcSummary) kpiMcSummary.textContent = `${mcUpCount} Subieron / ${mcDownCount} Bajaron (${mcSameCount} sin cambio)`;
    if (kpiCotoSummary) kpiCotoSummary.textContent = `${cotoUpCount} Subieron / ${cotoDownCount} Bajaron (${cotoSameCount} sin cambio)`;

    if (currentTemporalFilter === 'mc-up') items = items.filter(x => x.mcDelta > 0);
    if (currentTemporalFilter === 'mc-down') items = items.filter(x => x.mcDelta < 0);
    if (currentTemporalFilter === 'coto-up') items = items.filter(x => x.cotoDelta > 0);
    if (currentTemporalFilter === 'coto-down') items = items.filter(x => x.cotoDelta < 0);

    // Prioritize Top 10 Argentine Consumed Items at the top by default
    items.sort((a, b) => {
      const isTopA = (a.topVerduraRank || a.topFrutaRank) ? 1 : 0;
      const isTopB = (b.topVerduraRank || b.topFrutaRank) ? 1 : 0;
      if (isTopA !== isTopB) return isTopB - isTopA;
      return a.nombre.localeCompare(b.nombre);
    });

    if (items.length === 0) {
      temporalTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:3rem; color:var(--text-muted);">
            No hay productos que coincidan con el filtro seleccionado.
          </td>
        </tr>
      `;
      return;
    }

    temporalTableBody.innerHTML = items.map(p => {
      const rankBadge = p.topVerduraRank ? `<span class="top10-rank-badge" style="font-size:0.7rem; padding:0.15rem 0.4rem; margin-left:0.4rem;"><i class="fa-solid fa-fire"></i> #${p.topVerduraRank} Top Consumo</span>` :
                        p.topFrutaRank ? `<span class="top10-rank-badge" style="font-size:0.7rem; padding:0.15rem 0.4rem; margin-left:0.4rem;"><i class="fa-solid fa-fire"></i> #${p.topFrutaRank} Top Consumo</span>` : '';
      let mcBadge = '';
      if (p.mcDelta > 0) {
        mcBadge = `<span class="mini-delta up" style="font-weight:700;"><i class="fa-solid fa-arrow-trend-up"></i> +$${formatNumber(p.mcDelta)} (+${p.mcPct.toFixed(1)}%)</span>`;
      } else if (p.mcDelta < 0) {
        mcBadge = `<span class="mini-delta down" style="font-weight:700;"><i class="fa-solid fa-arrow-trend-down"></i> -$${formatNumber(Math.abs(p.mcDelta))} (${p.mcPct.toFixed(1)}%)</span>`;
      } else {
        mcBadge = `<span class="mini-delta neutral"><i class="fa-solid fa-minus"></i> Sin cambio</span>`;
      }

      let cotoBadge = '';
      if (p.cotoDelta > 0) {
        cotoBadge = `<span class="mini-delta up" style="font-weight:700;"><i class="fa-solid fa-arrow-trend-up"></i> +$${formatNumber(p.cotoDelta)} (+${p.cotoPct.toFixed(1)}%)</span>`;
      } else if (p.cotoDelta < 0) {
        cotoBadge = `<span class="mini-delta down" style="font-weight:700;"><i class="fa-solid fa-arrow-trend-down"></i> -$${formatNumber(Math.abs(p.cotoDelta))} (${p.cotoPct.toFixed(1)}%)</span>`;
      } else {
        cotoBadge = `<span class="mini-delta neutral"><i class="fa-solid fa-minus"></i> Sin cambio</span>`;
      }

      let trendText = '';
      if (p.cotoDelta < 0 && p.mcDelta > 0) {
        trendText = `<span style="color:#34d399; font-weight:700;"><i class="fa-solid fa-thumbs-up"></i> Coto redujo brecha (Coto bajó, Central subió)</span>`;
      } else if (p.cotoDelta > 0 && p.mcDelta < 0) {
        trendText = `<span style="color:#f87171; font-weight:700;"><i class="fa-solid fa-triangle-exclamation"></i> Coto aumentó remarcación (Coto subió, Central bajó)</span>`;
      } else if (p.cotoDelta < 0 && p.mcDelta < 0) {
        trendText = `<span style="color:#60a5fa;"><i class="fa-solid fa-arrow-down"></i> Ambos bajaron de precio</span>`;
      } else if (p.cotoDelta > 0 && p.mcDelta > 0) {
        trendText = `<span style="color:#f97316;"><i class="fa-solid fa-arrow-up"></i> Ambos subieron de precio</span>`;
      } else {
        trendText = `<span style="color:var(--text-muted);"><i class="fa-solid fa-minus"></i> Tendencia estable</span>`;
      }

      return `
        <tr>
          <td>
            <div style="font-weight:700; color:var(--text-bright); display:flex; align-items:center; flex-wrap:wrap; gap:0.2rem;">
              <span>${p.nombre}</span> ${rankBadge}
            </div>
            <small style="color:var(--text-muted);">${p.variedad}</small>
          </td>
          <td>
            <div style="font-size:0.95rem; font-weight:700; color:#10b981;">
              $${formatNumber(p.baseMC)} <i class="fa-solid fa-arrow-right" style="font-size:0.75rem; color:var(--text-muted);"></i> $${formatNumber(p.precioMercadoCentral)}
            </div>
          </td>
          <td>${mcBadge}</td>
          <td>
            <div style="font-size:0.95rem; font-weight:700; color:#ef4444;">
              $${formatNumber(p.baseCoto)} <i class="fa-solid fa-arrow-right" style="font-size:0.75rem; color:var(--text-muted);"></i> $${formatNumber(p.precioCoto)}
            </div>
          </td>
          <td>${cotoBadge}</td>
          <td style="font-size:0.85rem;">${trendText}</td>
        </tr>
      `;
    }).join('');

    // Render 4-Price Bars & Gap Expansion Chart
    const temporalBarsContainer = document.getElementById('temporalBarsContainer');
    if (temporalBarsContainer) {
      const chartItems = items.slice(0, 10);

      temporalBarsContainer.innerHTML = chartItems.map(p => {
        const maxPrice = Math.max(p.baseMC, p.precioMercadoCentral, p.baseCoto, p.precioCoto, 1);
        
        const wBaseMC = Math.round((p.baseMC / maxPrice) * 100);
        const wCurrMC = Math.round((p.precioMercadoCentral / maxPrice) * 100);
        const wBaseCoto = Math.round((p.baseCoto / maxPrice) * 100);
        const wCurrCoto = Math.round((p.precioCoto / maxPrice) * 100);

        const baseGap = p.baseCoto - p.baseMC;
        const currGap = p.precioCoto - p.precioMercadoCentral;
        const gapDiff = currGap - baseGap;
        const gapDiffStr = gapDiff > 0 ? `+$${formatNumber(gapDiff)} (Ensanchamiento de sobreprecio 🚀)` : gapDiff < 0 ? `-$${formatNumber(Math.abs(gapDiff))} (Reducción de sobreprecio 📉)` : `Brecha constante`;

        return `
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
              <div style="font-weight:700; color:var(--text-bright); font-size:1.05rem;">
                ${p.nombre} <small style="color:var(--text-muted); font-weight:400;">(${p.variedad})</small>
              </div>
              <div style="font-size:0.85rem; background:rgba(59,130,246,0.12); color:#60a5fa; padding:0.35rem 0.85rem; border-radius:20px; border:1px solid rgba(59,130,246,0.3);">
                Brecha 11-Ago: <strong>$${formatNumber(baseGap)}</strong> ➔ Brecha 19-Ago: <strong style="color:#f87171;">$${formatNumber(currGap)}</strong> (${gapDiffStr})
              </div>
            </div>

            <!-- 4 Bar Rows -->
            <div style="display:flex; flex-direction:column; gap:0.5rem; font-size:0.85rem;">
              <!-- 1. Central 11-Ago -->
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div style="width:130px; text-align:right; color:var(--text-muted); font-size:0.78rem;">Central 11-Ago</div>
                <div style="flex:1; background:rgba(255,255,255,0.05); height:22px; border-radius:6px; overflow:hidden; position:relative;">
                  <div style="width:${wBaseMC}%; background:#34d399; height:100%; border-radius:6px; display:flex; align-items:center; padding-left:0.5rem; color:#064e3b; font-weight:700; font-size:0.75rem;">
                    $${formatNumber(p.baseMC)}
                  </div>
                </div>
              </div>

              <!-- 2. Central 19-Ago (Hoy) -->
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div style="width:130px; text-align:right; color:#10b981; font-weight:700; font-size:0.78rem;">Central 19-Ago</div>
                <div style="flex:1; background:rgba(255,255,255,0.05); height:22px; border-radius:6px; overflow:hidden; position:relative;">
                  <div style="width:${wCurrMC}%; background:#10b981; height:100%; border-radius:6px; display:flex; align-items:center; padding-left:0.5rem; color:#fff; font-weight:700; font-size:0.75rem;">
                    $${formatNumber(p.precioMercadoCentral)} (${p.mcDelta < 0 ? '📉 -$'+formatNumber(Math.abs(p.mcDelta)) : p.mcDelta > 0 ? '📈 +$'+formatNumber(p.mcDelta) : '$0'})
                  </div>
                </div>
              </div>

              <!-- 3. Coto 11-Ago -->
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div style="width:130px; text-align:right; color:var(--text-muted); font-size:0.78rem;">Coto 11-Ago</div>
                <div style="flex:1; background:rgba(255,255,255,0.05); height:22px; border-radius:6px; overflow:hidden; position:relative;">
                  <div style="width:${wBaseCoto}%; background:#f87171; height:100%; border-radius:6px; display:flex; align-items:center; padding-left:0.5rem; color:#7f1d1d; font-weight:700; font-size:0.75rem;">
                    $${formatNumber(p.baseCoto)}
                  </div>
                </div>
              </div>

              <!-- 4. Coto 19-Ago (Hoy) -->
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div style="width:130px; text-align:right; color:#ef4444; font-weight:700; font-size:0.78rem;">Coto 19-Ago</div>
                <div style="flex:1; background:rgba(255,255,255,0.05); height:22px; border-radius:6px; overflow:hidden; position:relative;">
                  <div style="width:${wCurrCoto}%; background:#ef4444; height:100%; border-radius:6px; display:flex; align-items:center; padding-left:0.5rem; color:#fff; font-weight:700; font-size:0.75rem;">
                    $${formatNumber(p.precioCoto)} (${p.cotoDelta > 0 ? '📈 +$'+formatNumber(p.cotoDelta) : p.cotoDelta < 0 ? '📉 -$'+formatNumber(Math.abs(p.cotoDelta)) : '$0'})
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
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
          mcDeltaBadge = '';
        }

        // 2. Coto Deltas
        const cotoDelta = p.precioCoto - baseP.precioCoto;
        const cotoDeltaPct = baseP.precioCoto > 0 ? (cotoDelta / baseP.precioCoto) * 100 : 0;
        if (cotoDelta > 0) {
          cotoDeltaBadge = `<span class="mini-delta up" title="Aumento en Coto vs sesión base"><i class="fa-solid fa-arrow-trend-up"></i> +$${formatNumber(cotoDelta)} (+${cotoDeltaPct.toFixed(1)}%)</span>`;
        } else if (cotoDelta < 0) {
          cotoDeltaBadge = `<span class="mini-delta down" title="Reducción en Coto vs sesión base"><i class="fa-solid fa-arrow-trend-down"></i> -$${formatNumber(Math.abs(cotoDelta))} (${cotoDeltaPct.toFixed(1)}%)</span>`;
        } else {
          cotoDeltaBadge = '';
        }

        // 3. Mini Visual Progress Bar Math
        if (mcDelta === 0 && cotoDelta === 0) {
          compCardHtml = `<span class="mini-delta neutral" style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-minus"></i> Sin cambio de precio</span>`;
        } else {
          const maxCoto = Math.max(p.precioCoto, baseP.precioCoto, 1);
          const cotoBaseW = Math.round((baseP.precioCoto / maxCoto) * 100);
          const cotoCurrW = Math.round((p.precioCoto / maxCoto) * 100);
          const cotoBarClass = cotoDelta > 0 ? 'mini-bar-coto-up' : cotoDelta < 0 ? 'mini-bar-coto-down' : 'mini-bar-base';
          const cotoTextClass = cotoDelta > 0 ? 'up' : cotoDelta < 0 ? 'down' : 'neutral';
          const cotoStr = cotoDelta > 0 ? `+$${formatNumber(cotoDelta)}` : cotoDelta < 0 ? `-$${formatNumber(Math.abs(cotoDelta))}` : `Sin cambio`;

          const maxMC = Math.max(p.precioMercadoCentral, baseP.precioMercadoCentral, 1);
          const mcBaseW = Math.round((baseP.precioMercadoCentral / maxMC) * 100);
          const mcCurrW = Math.round((p.precioMercadoCentral / maxMC) * 100);
          const mcBarClass = mcDelta > 0 ? 'mini-bar-mc-up' : mcDelta < 0 ? 'mini-bar-mc-down' : 'mini-bar-base';
          const mcTextClass = mcDelta > 0 ? 'up' : mcDelta < 0 ? 'down' : 'neutral';
          const mcStr = mcDelta > 0 ? `+$${formatNumber(mcDelta)}` : mcDelta < 0 ? `-$${formatNumber(Math.abs(mcDelta))}` : `Sin cambio`;

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
        }
      } else {
        compCardHtml = `<span style="color:var(--text-muted); font-size:0.82rem;">-</span>`;
      }

      const unitStr = p.unidad || 'kg';
      const origStr = p.origen || 'Nacional';

      return `
        <tr class="product-row">
          <td class="td-product">
            <div class="product-cell">
              <img src="${iconUrl}" alt="${p.nombre}" class="product-img">
              <div>
                <div class="product-title">${p.nombre} ${rankBadge}</div>
                <div class="product-sub">${p.variedad} • ${origStr}</div>
              </div>
            </div>
          </td>

          <td class="td-mercado">
            <div class="price-strip strip-mercado">
              <span class="price-source"><i class="fa-solid fa-building text-success"></i> Mercado Central</span>
              <div class="price-mercado">$ ${formatNumber(p.precioMercadoCentral)} / ${unitStr}</div>
            </div>
            ${mcDeltaBadge}
            <small class="desktop-subtext">${p.bultoMercadoCentral || 'Venta mayorista'}</small>
          </td>

          <td class="td-coto">
            <div class="price-strip strip-coto">
              <span class="price-source"><i class="fa-solid fa-cart-shopping text-danger"></i> Coto Góndola</span>
              <div class="price-coto">$ ${formatNumber(p.precioCoto)} / ${unitStr}</div>
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
            <div class="gap-value">+$ ${formatNumber(p.savings)} / ${unitStr}</div>
          </td>

          <td class="td-delta">
            <span class="desktop-label">Variación Temporal</span>
            <div>${compCardHtml}</div>
          </td>

          <td class="td-action">
            <button class="btn-add-calc" data-id="${p.id}">
              <i class="fa-solid fa-cart-plus"></i> +1 ${unitStr}
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
            if (liveS) {
              liveS.products = JSON.parse(JSON.stringify(data));
              liveS.label = formatTodayLabel(new Date());
            }
            saveSessions();
            populateSessionDropdowns();
            calculateKPIs();
            renderAll();
            showNotification("✅ ¡Datos actualizados y fecha ajustada a hoy!");
          })
          .catch(err => {
            console.warn("No se pudo cargar data.json vía fetch, usando fallback:", err);
            const fallbackData = window.INITIAL_DATA || products;
            const liveS = sessions.find(s => s.id === 'session-live');
            if (liveS) {
              liveS.products = JSON.parse(JSON.stringify(fallbackData));
              liveS.label = formatTodayLabel(new Date());
            }
            saveSessions();
            populateSessionDropdowns();
            calculateKPIs();
            renderAll();
            showNotification("✅ ¡Datos sincronizados!");
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
        const targetEl = document.getElementById(targetTab);
        if (targetEl) targetEl.classList.add('active');
      });
    });

    const temporalPills = document.querySelectorAll('#temporalFilterPills .pill');
    temporalPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        temporalPills.forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentTemporalFilter = e.currentTarget.getAttribute('data-temp-filter');
        renderTemporalComparisonTable();
      });
    });

    const stackedPills = document.querySelectorAll('#stackedCategoryFilterPills .pill');
    stackedPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        stackedPills.forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentStackedCategory = e.currentTarget.getAttribute('data-stacked-cat');
        renderStackedCardsGrid();
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
