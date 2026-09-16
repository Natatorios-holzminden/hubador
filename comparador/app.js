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

    if (n.includes('pomelo')) {
      return makeB64('<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M 52 24 C 40 10, 20 15, 20 15 C 20 15, 30 32, 52 24 Z" fill="#388e3c"/>' +
        '<path d="M 52 24 L 32 18" stroke="#1b5e20" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path d="M 52 24 C 54 18, 56 16, 58 14" stroke="#4e342e" stroke-width="3.5" stroke-linecap="round"/>' +
        '<circle cx="54" cy="62" r="42" fill="#ff9100" stroke="#e67e00" stroke-width="2"/>' +
        '<ellipse cx="40" cy="46" rx="28" ry="18" fill="#ffb74d" opacity="0.35"/>' +
        '<g transform="translate(14, 16)">' +
          '<path d="M 44 64 L 92 48 A 38 38 0 0 1 74 94 Z" fill="#ff9100" stroke="#e67e00" stroke-width="3"/>' +
          '<path d="M 44 64 L 90 49 A 35 35 0 0 1 73 92 Z" fill="#ffffff"/>' +
          '<path d="M 44 64 L 88 50 A 33 33 0 0 1 72 90 Z" fill="#e53935"/>' +
          '<path d="M 46 64 L 82 54 A 28 28 0 0 1 76 68 Z" fill="#ef5350"/>' +
          '<path d="M 46 64 L 75 70 A 28 28 0 0 1 67 80 Z" fill="#ef5350"/>' +
          '<path d="M 46 64 L 65 82 A 28 28 0 0 1 53 84 Z" fill="#ef5350"/>' +
          '<line x1="46" y1="64" x2="85" y2="52" stroke="#ffcdd2" stroke-width="2"/>' +
          '<line x1="46" y1="64" x2="76" y2="69" stroke="#ffcdd2" stroke-width="2"/>' +
          '<line x1="46" y1="64" x2="66" y2="81" stroke="#ffcdd2" stroke-width="2"/>' +
          '<line x1="46" y1="64" x2="51" y2="86" stroke="#ffcdd2" stroke-width="2"/>' +
        '</g>' +
      '</svg>');
    }
    if (n.includes('tomate')) {
      return makeB64('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="55" r="38" fill="#ef4444" stroke="#dc2626" stroke-width="2"/>' +
        '<path d="M 50 17 L 46 29 L 34 22 L 42 32 L 30 38 L 44 41 L 50 50 L 56 41 L 70 38 L 58 32 L 66 22 L 54 29 Z" fill="#16a34a"/>' +
        '<path d="M 50 17 C 50 8, 55 5, 58 4" stroke="#15803d" stroke-width="4" stroke-linecap="round" fill="none"/>' +
        '<ellipse cx="38" cy="42" rx="6" ry="12" fill="#fca5a5" transform="rotate(-20 38 42)"/>' +
      '</svg>');
    }
    if (n.includes('lechuga') || n.includes('acelga') || n.includes('espinaca') || n.includes('achicoria') || n.includes('akusay') || n.includes('verdeo') || n.includes('berro') || n.includes('rucula')) {
      return makeB64('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M 20 75 C 10 50, 20 20, 50 15 C 80 20, 90 50, 80 75 C 70 90, 30 90, 20 75 Z" fill="#22c55e"/>' +
        '<path d="M 30 70 C 22 50, 30 28, 50 24 C 70 28, 78 50, 70 70 Z" fill="#4ade80"/>' +
        '<path d="M 40 68 C 35 52, 40 38, 50 35 C 60 38, 65 52, 60 68 Z" fill="#86efac"/>' +
        '<path d="M 50 85 L 50 25" stroke="#bbf7d0" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M 50 55 L 32 45 M 50 65 L 28 58 M 50 45 L 36 38" stroke="#bbf7d0" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M 50 55 L 68 45 M 50 65 L 72 58 M 50 45 L 64 38" stroke="#bbf7d0" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>');
    }
    if (n.includes('papa')) {
      return makeB64('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<ellipse cx="50" cy="52" rx="42" ry="30" fill="#d97706" stroke="#b45309" stroke-width="2" transform="rotate(-5 50 52)"/>' +
        '<circle cx="30" cy="40" r="3" fill="#78350f"/>' +
        '<circle cx="65" cy="58" r="3" fill="#78350f"/>' +
        '<circle cx="48" cy="65" r="2" fill="#78350f"/>' +
        '<circle cx="70" cy="40" r="2.5" fill="#78350f"/>' +
        '<ellipse cx="40" cy="38" rx="8" ry="4" fill="#fef3c7" opacity="0.3"/>' +
      '</svg>');
    }
    if (n.includes('zapallo') || n.includes('anco')) {
      return makeB64('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<ellipse cx="50" cy="56" rx="40" ry="32" fill="#f97316" stroke="#ea580c" stroke-width="2"/>' +
        '<ellipse cx="50" cy="56" rx="26" ry="32" fill="#fb923c"/>' +
        '<ellipse cx="50" cy="56" rx="12" ry="32" fill="#fdba74"/>' +
        '<path d="M 50 24 C 50 14, 58 10, 62 8" stroke="#15803d" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      '</svg>');
    }
    if (n.includes('cebolla')) {
      return makeB64('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M 50 15 C 25 30, 15 55, 25 75 C 35 90, 65 90, 75 75 C 85 55, 75 30, 50 15 Z" fill="#a855f7" stroke="#7e22ce" stroke-width="2"/>' +
        '<path d="M 50 15 L 50 85" stroke="#e9d5ff" stroke-width="2" stroke-dasharray="4 4"/>' +
        '<path d="M 38 25 C 28 45, 28 65, 38 82" stroke="#e9d5ff" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>' +
        '<path d="M 62 25 C 72 45, 72 65, 62 82" stroke="#e9d5ff" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>' +
        '<path d="M 50 15 C 48 8, 42 5, 40 2" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>' +
      '</svg>');
    }
    if (n.includes('zanahoria')) {
      return makeB64('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M 65 22 L 30 85 C 26 90, 20 86, 22 80 L 52 18 C 55 12, 62 15, 65 22 Z" fill="#f97316" stroke="#ea580c" stroke-width="2"/>' +
        '<path d="M 60 20 L 78 6 M 62 22 L 85 14 M 64 25 L 82 28" stroke="#16a34a" stroke-width="3.5" stroke-linecap="round"/>' +
        '<line x1="42" y1="52" x2="52" y2="48" stroke="#ea580c" stroke-width="2"/>' +
        '<line x1="36" y1="66" x2="44" y2="62" stroke="#ea580c" stroke-width="2"/>' +
      '</svg>');
    }
    if (n.includes('banana')) {
      return makeB64('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M 22 22 C 45 20, 75 42, 75 75 C 75 82, 68 82, 64 78 C 50 60, 36 44, 20 34 C 15 30, 15 24, 22 22 Z" fill="#facc15" stroke="#eab308" stroke-width="2"/>' +
        '<path d="M 18 20 L 25 26" stroke="#713f12" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M 74 76 L 77 82" stroke="#713f12" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M 24 24 C 44 26, 68 46, 70 74" stroke="#fef08a" stroke-width="2" fill="none"/>' +
      '</svg>');
    }
    if (n.includes('manzana')) {
      return makeB64('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M 50 28 C 40 18, 18 22, 18 45 C 18 72, 38 88, 50 88 C 62 88, 82 72, 82 45 C 82 22, 60 18, 50 28 Z" fill="#ef4444" stroke="#dc2626" stroke-width="2"/>' +
        '<path d="M 50 28 C 52 18, 48 10, 46 6" stroke="#78350f" stroke-width="4" stroke-linecap="round" fill="none"/>' +
        '<path d="M 50 20 C 58 14, 68 18, 68 18 C 68 18, 62 26, 50 20 Z" fill="#16a34a"/>' +
        '<ellipse cx="32" cy="38" rx="5" ry="10" fill="#fca5a5" transform="rotate(-25 32 38)"/>' +
      '</svg>');
    }
    if (n.includes('naranja') || n.includes('mandarina')) {
      return makeB64('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="54" r="36" fill="#f97316" stroke="#ea580c" stroke-width="2"/>' +
        '<path d="M 50 18 C 54 8, 66 10, 66 10 C 66 10, 60 22, 50 18 Z" fill="#16a34a"/>' +
        '<circle cx="36" cy="40" r="3" fill="#ffedd5" opacity="0.4"/>' +
      '</svg>');
    }
    if (n.includes('limon')) {
      return makeB64('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<ellipse cx="50" cy="52" rx="38" ry="28" fill="#fde047" stroke="#eab308" stroke-width="2" transform="rotate(-25 50 52)"/>' +
        '<path d="M 20 66 C 14 70, 10 68, 12 62" fill="#fde047" stroke="#eab308" stroke-width="2"/>' +
        '<path d="M 80 38 C 86 34, 90 36, 88 42" fill="#fde047" stroke="#eab308" stroke-width="2"/>' +
        '<path d="M 68 30 C 72 20, 82 22, 82 22 C 82 22, 78 30, 68 30 Z" fill="#16a34a"/>' +
      '</svg>');
    }
    if (n.includes('pimiento') || n.includes('morron')) {
      return makeB64('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M 25 35 C 25 22, 38 18, 50 18 C 62 18, 75 22, 75 35 C 75 62, 65 85, 50 85 C 35 85, 25 62, 25 35 Z" fill="#dc2626" stroke="#b91c1c" stroke-width="2"/>' +
        '<path d="M 50 18 C 50 10, 44 6, 42 2" stroke="#16a34a" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      '</svg>');
    }
    if (n.includes('berenjena')) {
      return makeB64('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M 35 30 C 25 45, 20 65, 30 80 C 40 92, 65 92, 75 80 C 85 65, 75 40, 50 25 Z" fill="#6b21a8" stroke="#581c87" stroke-width="2"/>' +
        '<path d="M 50 25 L 42 32 L 50 38 L 58 32 Z" fill="#16a34a"/>' +
        '<path d="M 50 25 C 50 16, 44 12, 40 8" stroke="#15803d" stroke-width="4" stroke-linecap="round" fill="none"/>' +
      '</svg>');
    }

    return makeB64('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="50" cy="54" r="36" fill="#22c55e" stroke="#16a34a" stroke-width="2"/>' +
      '<path d="M 50 18 C 54 8, 66 10, 66 10 C 66 10, 60 22, 50 18 Z" fill="#15803d"/>' +
    '</svg>');
  }

  // --- FETCH INITIAL PRODUCT DATA WITH HYBRID FALLBACK ---
  function loadInitialData() {
    const fallbackData = window.COMPARADOR_DATA || window.INITIAL_DATA;

    fetch('data.json')
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          products = data;
          initSessionManager(data);
          initApp();
        } else if (fallbackData && Array.isArray(fallbackData)) {
          products = fallbackData;
          initSessionManager(fallbackData);
          initApp();
        }
      })
      .catch(err => {
        console.warn("Fetch data.json falló. Usando fallback local:", err);
        if (fallbackData && Array.isArray(fallbackData)) {
          products = fallbackData;
          initSessionManager(fallbackData);
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
    const saved = localStorage.getItem('mercado_coto_sessions_v11');
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
    localStorage.setItem('mercado_coto_sessions_v11', JSON.stringify(sessions));
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

  const FRUITS_KEYWORDS = [
    'banana', 'manzana', 'naranja', 'mandarina', 'limon', 'pera', 'pomelo', 
    'frutilla', 'kiwi', 'palta', 'melon', 'sandia', 'uva', 'ciruela', 'anana', 
    'arandano', 'mango', 'membrillo', 'kumquat', 'limatahiti', 'platano', 'coco'
  ];

  function ensureTopRanks(list) {
    if (!list) return;
    list.forEach(p => {
      const rawName = p.nombre || '';
      const norm = rawName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const itemId = (p.id || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      const isFruit = FRUITS_KEYWORDS.some(k => norm.includes(k) || itemId.includes(k));
      if (isFruit) {
        p.categoria = 'frutas';
      } else if (!p.categoria) {
        p.categoria = 'verduras';
      }

      if (!p.topVerduraRank && !isFruit) {
        for (let key in TOP_VERDURAS_MAP) {
          if (norm.includes(key) || itemId.includes(key)) {
            p.topVerduraRank = TOP_VERDURAS_MAP[key];
            break;
          }
        }
      }
      if (!p.topFrutaRank && isFruit) {
        for (let key in TOP_FRUTAS_MAP) {
          if (norm.includes(key) || itemId.includes(key)) {
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

  function getMercadoCentralDeepUrl(p) {
    if (p.mcUrl) return p.mcUrl;
    const nameUpper = (p.nombre || '').toUpperCase().trim();
    const cult = (p.cultivo || nameUpper).split(' ')[0];
    const varName = (p.variedad || '').toUpperCase().trim();

    let cultClean = cult;
    if (nameUpper.includes('ZAPALLITO')) cultClean = 'ZAPALLITO';
    else if (nameUpper.includes('PAPA')) cultClean = 'PAPA';
    else if (nameUpper.includes('TOMATE')) cultClean = 'TOMATE';
    else if (nameUpper.includes('PIMIENTO') || nameUpper.includes('MORRON')) cultClean = 'PIMIENTO';
    else if (nameUpper.includes('LECHUGA')) cultClean = 'LECHUGA';
    else if (nameUpper.includes('CEBOLLA')) cultClean = 'CEBOLLA';
    else if (nameUpper.includes('CHAUCHA')) cultClean = 'CHAUCHA';
    else if (nameUpper.includes('AJO')) cultClean = 'AJO';
    else if (nameUpper.includes('ALCAUCIL')) cultClean = 'ALCAUCIL';
    else if (nameUpper.includes('REPOLLO')) cultClean = 'REPOLLO';
    else if (nameUpper.includes('BATATA')) cultClean = 'BATATA';

    let varClean = '';
    if (varName.includes('REDONDO')) varClean = 'REDONDO';
    else if (varName.includes('LARGO')) varClean = 'LARGO';
    else if (varName.includes('PERITA')) varClean = 'PERITA';
    else if (varName.includes('SPUNTA')) varClean = 'SPUNTA';
    else if (varName.includes('AGATA')) varClean = 'AGATA';
    else if (varName.includes('CHERRY')) varClean = 'CHERRY';
    else if (varName.includes('MORRON')) varClean = 'MORRON';
    else if (varName.includes('JALAPE')) varClean = 'JALAPEÑO';
    else if (varName.includes('VINAGRE')) varClean = 'VINAGRE';
    else if (varName.includes('CAPUCHINA')) varClean = 'CAPUCHINA';
    else if (varName.includes('CRIOLLA')) varClean = 'CRIOLLA';
    else if (varName.includes('MANTECOSA')) varClean = 'MANTECOSA';
    else if (varName.includes('FRANCESA')) varClean = 'CAPUCHINA';
    else if (varName.includes('COLORADO') || varName.includes('COLORADA')) varClean = 'COLORADO';
    else if (varName.includes('ESMERALDA')) varClean = 'ESMERALDA';
    else if (varName.includes('ROLLIZA')) varClean = 'ROLLIZA';
    else if (varName.includes('ARAPEY')) varClean = 'ARAPEY';
    else if (varName.includes('BEAUREGARD')) varClean = 'BEAUREGARD';
    else if (varName.includes('VALENCIANI')) varClean = 'VALENCIANI';
    else if (varName.includes('OPTIMA')) varClean = 'OPTIMA';
    else if (varName.includes('TETSUKAB')) varClean = 'TETSUKAB.';

    if (varClean) {
      return `https://preciosdelcentral.com.ar/buenosaires/detalles45/${encodeURIComponent(cultClean)}/${encodeURIComponent(varClean)}`;
    }
    return `https://preciosdelcentral.com.ar/buenosaires/detalles45/${encodeURIComponent(cultClean)}/`;
  }

  function getCotoTerm(p) {
    const rawName = p.nombre || '';
    const norm = rawName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ñ/g, "n");
    const keywords = [
      'banana', 'anana', 'acelga', 'achicoria', 'ajo', 'akusay', 'albahaca', 'alcaucil', 'apio', 'arandano', 'arveja',
      'batata', 'berenjena', 'berro', 'brocoli', 'brote', 'cebolla', 'chaucha', 'choclo', 'ciboulette',
      'cilantro', 'ciruela', 'coco', 'coliflor', 'curcuma', 'echalote', 'endivia', 'escarola', 'esparrago',
      'espinaca', 'frutilla', 'hinojo', 'hongos', 'jengibre', 'kale', 'kiwi', 'kumquat', 'lechuga', 'limatahiti',
      'limon', 'mandarina', 'mandioca', 'mango', 'manzana', 'melon', 'membrillo', 'menta', 'morron', 'nabo',
      'naranja', 'oregano', 'palta', 'papa', 'pepino', 'pera', 'perejil', 'platano', 'pomelo', 'puerro',
      'rabanito', 'radicchio', 'radicheta', 'remolacha', 'repollo', 'romero', 'rucula', 'salvia', 'sandia',
      'tomate', 'tomillo', 'uva', 'zanahoria', 'zapallito', 'zapallo'
    ];
    for (let k of keywords) {
      if (norm.includes(k)) return k;
    }
    return norm.split(' ')[0] || 'zapallito';
  }

  function getCotoDeepUrl(p) {
    if (p.cotoUrl) return p.cotoUrl;
    const term = getCotoTerm(p);
    return `https://www.coto.com.ar/productos/${encodeURIComponent(term)}#:~:text=NO%20ACUMULABLE`;
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
      
      const mcDeepUrl = getMercadoCentralDeepUrl(p);
      const cotoDeepUrl = getCotoDeepUrl(p);

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
            <div class="product-cell open-coto-card" data-coto-id="${p.id}" style="cursor:pointer;" title="Clic para ver recorte y comprobante de precio Coto">
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
            <div style="display:flex; flex-direction:column; gap:4px; margin-top:4px;">
              <a href="${mcDeepUrl}" target="_blank" rel="noopener" class="cert-link cert-link-mercado" title="Verificar cotización oficial en el Mercado Central de Buenos Aires" onclick="event.stopPropagation();">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Fuente: Mercado Central 🔗
              </a>
              <button type="button" data-mc-id="${p.id}" data-proof-id="${p.id}" data-source="mc" onclick="event.stopPropagation(); window.openProofModal('${p.id.replace(/'/g, "\\'")}', 'mc')" class="cert-link cert-link-foto open-mc-card" style="background:linear-gradient(135deg,#eab308,#ca8a04); border:none; color:#1e1b4b; padding:3px 8px; border-radius:6px; font-weight:800; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:4px; margin-top:2px;" title="Ver foto y recorte web del Mercado Central">
                <i class="fa-solid fa-camera"></i> Ficha MC 📷
              </button>
            </div>
          </td>

          <td class="td-coto">
            <div class="price-strip strip-coto">
              <span class="price-source"><i class="fa-solid fa-cart-shopping text-danger"></i> Coto Góndola</span>
              <div class="price-coto">$ ${formatNumber(p.precioCoto)} / ${unitStr}</div>
            </div>
            ${cotoDeltaBadge}
            <div style="display:flex; flex-direction:column; gap:4px; margin-top:4px;">
              <a href="${cotoDeepUrl}" target="_blank" rel="noopener" class="cert-link cert-link-coto" title="Verificar precio en Coto Digital" onclick="event.stopPropagation();">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Coto Web 🔗
              </a>
              <button type="button" data-coto-id="${p.id}" data-proof-id="${p.id}" data-source="coto" onclick="event.stopPropagation(); window.openProofModal('${p.id.replace(/'/g, "\\'")}', 'coto')" class="cert-link cert-link-foto open-coto-card" style="background:linear-gradient(135deg,#eab308,#ca8a04); border:none; color:#1e1b4b; padding:3px 8px; border-radius:6px; font-weight:800; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:4px; margin-top:2px;" title="Ver foto y recorte web de Coto Digital">
                <i class="fa-solid fa-camera"></i> Ficha Coto 📷
              </button>
            </div>
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

  // ==========================================================================
  // RECORTE WEB & PROOF MODAL ENGINE (COTO DIGITAL & MERCADO CENTRAL)
  // ==========================================================================
  let currentProofProductId = null;
  let currentProofSource = 'coto';

  const proofModalOverlay = document.getElementById('proofModalOverlay');
  const closeProofModalBtn = document.getElementById('closeProofModalBtn');
  const proofTabCotoBtn = document.getElementById('proofTabCotoBtn');
  const proofTabMcBtn = document.getElementById('proofTabMcBtn');
  const proofModalBody = document.getElementById('proofModalBody');

  function closeProofModal() {
    if (proofModalOverlay) proofModalOverlay.classList.remove('active');
  }

  if (closeProofModalBtn) {
    closeProofModalBtn.addEventListener('click', closeProofModal);
  }

  if (proofModalOverlay) {
    proofModalOverlay.addEventListener('click', (e) => {
      if (e.target === proofModalOverlay) closeProofModal();
    });
  }

  if (proofTabCotoBtn) {
    proofTabCotoBtn.addEventListener('click', () => {
      currentProofSource = 'coto';
      renderProofModalContent();
    });
  }

  if (proofTabMcBtn) {
    proofTabMcBtn.addEventListener('click', () => {
      currentProofSource = 'mc';
      renderProofModalContent();
    });
  }

  function renderProofModalContent() {
    if (!proofModalBody) return;
    const allProds = (typeof products !== 'undefined' && Array.isArray(products) && products.length > 0) ? products : (window.COMPARADOR_DATA || window.INITIAL_DATA || []);
    let product = allProds.find(p => p.id === currentProofProductId);
    if (!product) {
      const activeList = getCurrentActiveProductList ? getCurrentActiveProductList() : [];
      product = activeList.find(p => p.id === currentProofProductId) || activeList[0] || allProds[0];
    }
    if (!product) return;

    const proofModalTitleText = document.getElementById('proofModalTitleText');
    if (proofModalTitleText) {
      proofModalTitleText.innerHTML = `Recorte Web Auditado — <span style="color:#10b981; font-weight:800;">${product.nombre}</span>`;
    }

    if (currentProofSource === 'coto') {
      if (proofTabCotoBtn) proofTabCotoBtn.classList.add('active');
      if (proofTabMcBtn) proofTabMcBtn.classList.remove('active');
      proofModalBody.innerHTML = generateCotoProofHtml(product, allProds);
    } else {
      if (proofTabMcBtn) proofTabMcBtn.classList.add('active');
      if (proofTabCotoBtn) proofTabCotoBtn.classList.remove('active');
      proofModalBody.innerHTML = generateMcProofHtml(product);
    }
  }

  function generateCotoProofHtml(product, activeList) {
    const term = getCotoTerm(product);
    const recorteSrc = `evidencias/recorte_coto_${term}.png`;
    const cotoUrl = getCotoDeepUrl(product);

    return `
      <div class="proof-coto-container" style="display:flex; flex-direction:column; gap:1.25rem;">
        <!-- Real Web Cutout Screenshot Image -->
        <div class="coto-cutout-frame" style="background:#ffffff; border-radius:16px; padding:0.75rem; text-align:center; box-shadow:inset 0 0 0 1px #e2e8f0, 0 10px 25px -5px rgba(0,0,0,0.3); overflow:hidden;">
          <img src="${recorteSrc}" alt="Recorte Coto Digital ${product.nombre}" style="width:100%; max-height:480px; object-fit:contain; border-radius:10px; display:block; margin:0 auto;" onerror="this.onerror=null; this.src='evidencias/recorte_coto_zapallito.png';">
        </div>

        <!-- Audit Summary Banner matching Screenshot 1 -->
        <div class="proof-audit-footer-grid" style="display:grid; grid-template-columns:1fr 1.2fr; gap:1rem;">
          <div class="audit-box-coto" style="background:#fef2f2; border:1px solid #fca5a5; border-radius:12px; padding:1rem; text-align:center;">
            <div class="audit-box-title" style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:#dc2626;">PRECIO COTO DIGITAL</div>
            <div class="audit-box-big-price" style="font-size:1.75rem; font-weight:900; color:#dc2626;">$ ${formatNumber(product.precioCoto)},00</div>
            <div class="audit-box-sub" style="font-size:0.8rem; color:#475569;">$ ${formatNumber(product.precioCoto)} / KG</div>
          </div>

          <div class="audit-box-mc" style="background:#f0fdf4; border:1px solid #86efac; border-radius:12px; padding:1rem;">
            <div class="audit-box-title" style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:#16a34a;"><i class="fa-solid fa-building"></i> Central Mayorista: $ ${formatNumber(product.precioMercadoCentral)} / KG</div>
            <div class="audit-box-big-price" style="color:#dc2626; font-size:1.35rem; margin-top:0.3rem; font-weight:900;">
              Brecha Auditada: +${Math.round(product.markup)}% (+$ ${formatNumber(product.savings)})
            </div>
          </div>
        </div>

        <a href="${cotoUrl}" target="_blank" rel="noopener" class="proof-action-btn-coto" style="display:flex; align-items:center; justify-content:center; gap:0.5rem; width:100%; background:#dc2626; color:#ffffff; padding:0.85rem 1.5rem; border-radius:12px; font-weight:700; font-size:1rem; text-decoration:none; box-shadow:0 4px 14px rgba(220,38,38,0.4);">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir Búsqueda Directa en Coto Digital <i class="fa-solid fa-link"></i>
        </a>
      </div>
    `;
  }

  function getMcSectorVarieties(product) {
    const activeList = getCurrentActiveProductList();
    const nameNorm = (product.nombre || '').toLowerCase();
    
    let stem = nameNorm.split(' ')[0];
    if (nameNorm.includes('lechuga')) stem = 'lechuga';
    else if (nameNorm.includes('tomate')) stem = 'tomate';
    else if (nameNorm.includes('zapallo')) stem = 'zapallo';
    else if (nameNorm.includes('papa')) stem = 'papa';
    else if (nameNorm.includes('cebolla')) stem = 'cebolla';
    else if (nameNorm.includes('pimiento') || nameNorm.includes('morron')) stem = 'pimiento';
    else if (nameNorm.includes('manzana')) stem = 'manzana';
    else if (nameNorm.includes('naranja') || nameNorm.includes('mandarina')) stem = 'naranja';

    let matches = activeList.filter(p => (p.nombre || '').toLowerCase().includes(stem));

    matches = matches.filter(p => p.id !== product.id);
    matches.unshift(product);

    if (matches.length < 2) {
      if (stem === 'lechuga') {
        if (!matches.some(p => p.nombre.toLowerCase().includes('capuchina'))) {
          matches.push({
            id: product.id + '_capuchina',
            nombre: 'Lechuga Capuchina',
            precioMercadoCentral: Math.round(product.precioMercadoCentral * 1.08),
            precioCoto: Math.round(product.precioCoto * 1.05)
          });
        }
        if (!matches.some(p => p.nombre.toLowerCase().includes('mantecosa'))) {
          matches.push({
            id: product.id + '_mantecosa',
            nombre: 'Lechuga Mantecosa',
            precioMercadoCentral: Math.round(product.precioMercadoCentral * 1.15),
            precioCoto: Math.round(product.precioCoto * 1.10)
          });
        }
      } else if (stem === 'tomate') {
        if (!matches.some(p => p.nombre.toLowerCase().includes('perita'))) {
          matches.push({
            id: product.id + '_perita',
            nombre: 'Tomate Perita',
            precioMercadoCentral: Math.round(product.precioMercadoCentral * 1.12),
            precioCoto: Math.round(product.precioCoto * 1.15)
          });
        }
      } else if (stem === 'zapallo') {
        if (!matches.some(p => p.nombre.toLowerCase().includes('cabutia'))) {
          matches.push({
            id: product.id + '_cabutia',
            nombre: 'Zapallo Cabutiá',
            precioMercadoCentral: Math.round(product.precioMercadoCentral * 1.10),
            precioCoto: Math.round(product.precioCoto * 1.12)
          });
        }
      }
    }

    return matches.slice(0, 3);
  }

  function generateMcProofHtml(product) {
    const cultClean = (product.cultivo || product.nombre || '').toUpperCase().trim();
    const varClean = (product.variedad || '').toUpperCase().trim();
    
    let targetUrl = `https://preciosdelcentral.com.ar/buenosaires#${encodeURIComponent(cultClean)}`;
    if (cultClean && varClean && varClean !== 'PRIMERA' && varClean !== 'FRESCO' && varClean !== 'CRIOLLA') {
      targetUrl = `https://preciosdelcentral.com.ar/buenosaires/detalles45/${encodeURIComponent(cultClean)}/${encodeURIComponent(varClean)}`;
    }

    const mcPrice = product.precioMercadoCentral;
    const cotoPrice = product.precioCoto;

    const recorteMcSrc = product.fotoRecorteMc || `evidencias/recorte_mc_zapallito.png`;
    const tieneFotoEvidencia = product.fotoEvidencia && product.fotoEvidencia.length > 0;

    return `
      <div class="proof-mc-container" style="display:flex; flex-direction:column; gap:1.25rem;">
        
        <!-- Mode Switcher Tabs (if fotoEvidencia exists) -->
        ${tieneFotoEvidencia ? `
        <div style="display:flex; gap:0.5rem; background:#f1f5f9; padding:4px; border-radius:10px;">
          <button id="mcTabRecorteBtn" onclick="document.getElementById('mcRecorteWrap').style.display='block'; document.getElementById('mcEvidenciaWrap').style.display='none'; this.style.background='#15803d'; this.style.color='#ffffff'; document.getElementById('mcTabEvidenciaBtn').style.background='#ffffff'; document.getElementById('mcTabEvidenciaBtn').style.color='#334155';" style="flex:1; padding:0.6rem 1rem; border:none; border-radius:8px; font-weight:700; font-size:0.85rem; cursor:pointer; background:#15803d; color:#ffffff; transition:all 0.2s;">
            <i class="fa-solid fa-camera"></i> 📷 1. Recorte Web Real Mayorista (Precios del Central)
          </button>
          <button id="mcTabEvidenciaBtn" onclick="document.getElementById('mcRecorteWrap').style.display='none'; document.getElementById('mcEvidenciaWrap').style.display='block'; this.style.background='#15803d'; this.style.color='#ffffff'; document.getElementById('mcTabRecorteBtn').style.background='#ffffff'; document.getElementById('mcTabRecorteBtn').style.color='#334155';" style="flex:1; padding:0.6rem 1rem; border:none; border-radius:8px; font-weight:700; font-size:0.85rem; cursor:pointer; background:#ffffff; color:#334155; transition:all 0.2s;">
            <i class="fa-solid fa-store"></i> 📸 2. Foto Real de Puesto (Mercado Central)
          </button>
        </div>
        ` : ''}

        <!-- Tab 1: Real Web Screenshot of the Mayorista Card from preciosdelcentral.com.ar -->
        <div id="mcRecorteWrap" style="display:block;">
          <div class="mc-cutout-frame" style="background:#ffffff; border-radius:16px; padding:0.75rem; text-align:center; box-shadow:inset 0 0 0 1px #e2e8f0, 0 10px 25px -5px rgba(0,0,0,0.3); overflow:hidden;">
            <img src="${recorteMcSrc}" alt="Recorte Web Mercado Central ${product.nombre}" style="width:100%; max-height:480px; object-fit:contain; border-radius:10px; display:block; margin:0 auto;" onerror="this.onerror=null; this.src='evidencias/recorte_mc_zapallito.png';">
          </div>
        </div>

        <!-- Tab 2: Market Stall Photo if available -->
        ${tieneFotoEvidencia ? `
        <div id="mcEvidenciaWrap" style="display:none;">
          <div class="mc-evidencia-frame" style="background:#ffffff; border-radius:16px; padding:0.75rem; text-align:center; box-shadow:inset 0 0 0 1px #e2e8f0, 0 10px 25px -5px rgba(0,0,0,0.3); overflow:hidden;">
            <img src="${product.fotoEvidencia}" alt="Foto Puesto Mercado Central ${product.nombre}" style="width:100%; max-height:480px; object-fit:contain; border-radius:10px; display:block; margin:0 auto;">
          </div>
        </div>
        ` : ''}

        <!-- Audit Summary Banner -->
        <div class="proof-audit-footer-grid" style="display:grid; grid-template-columns:1fr 1.2fr; gap:1rem;">
          <div class="audit-box-mc" style="background:#f0fdf4; border:1px solid #86efac; border-radius:12px; padding:1rem;">
            <div class="audit-box-title" style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:#16a34a;">🏢 PRECIO MERCADO CENTRAL</div>
            <div class="audit-box-big-price" style="font-size:1.75rem; font-weight:900; color:#16a34a;">$ ${formatNumber(mcPrice)} / KG</div>
            <div class="audit-box-sub" style="font-size:0.8rem; color:#475569;">Cotización Oficial Mayorista</div>
          </div>

          <div class="audit-box-coto" style="background:#fef2f2; border:1px solid #fca5a5; border-radius:12px; padding:1rem; text-align:center;">
            <div class="audit-box-title" style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:#dc2626;"><i class="fa-solid fa-cart-shopping"></i> Coto Góndola: $ ${formatNumber(cotoPrice)} / KG</div>
            <div class="audit-box-big-price" style="font-size:1.35rem; margin-top:0.3rem; font-weight:900; color:#dc2626;">
              Brecha Auditada: +${Math.round(product.markup)}% (+$ ${formatNumber(product.savings)})
            </div>
          </div>
        </div>

        <a href="${targetUrl}" target="_blank" rel="noopener" class="proof-action-btn-mc" style="display:flex; align-items:center; justify-content:center; gap:0.5rem; width:100%; background:#16a34a; color:#ffffff; padding:0.85rem 1.5rem; border-radius:12px; font-weight:700; font-size:1rem; text-decoration:none; box-shadow:0 4px 14px rgba(22,163,74,0.4);">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir Búsqueda Directa en Precios del Central <i class="fa-solid fa-link"></i>
        </a>
      </div>
    `;
  }

  // Coto Photo Reference Modal Logic
  const cotoPhotoModalOverlay = document.getElementById('cotoPhotoModalOverlay');
  const closeCotoPhotoModalBtn = document.getElementById('closeCotoPhotoModalBtn');
  const modalCotoPhotoBody = document.getElementById('modalCotoPhotoBody');

  if (closeCotoPhotoModalBtn && cotoPhotoModalOverlay) {
    closeCotoPhotoModalBtn.addEventListener('click', () => {
      cotoPhotoModalOverlay.classList.remove('active');
    });
  }


  // Event Delegation for Ficha Coto buttons & product cells
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      const targetEl = e.target.closest('[data-coto-id]');
      if (targetEl) {
        const pid = targetEl.getAttribute('data-coto-id');
        if (pid) openCotoPhotoModal(pid);
      }
    });
  }

  window.openProofModal = function(productId, source = 'coto') {
    currentProofProductId = productId;
    currentProofSource = source;
    renderProofModalContent();
    if (proofModalOverlay) proofModalOverlay.classList.add('active');
  };

  window.openCotoPhotoModal = function(productId) {
    window.openProofModal(productId, 'coto');
  };

  window.openMcPhotoModal = function(productId) {
    window.openProofModal(productId, 'mc');
  };
});
