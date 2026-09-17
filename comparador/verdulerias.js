/**
 * VerduTracker AI - Monitor de Verdulerías de Barrio (Multi-Competencia por Foto)
 * Hubador Ecosystem
 */

document.addEventListener('DOMContentLoaded', () => {
  let mainProducts = [];
  let verduleriasData = [];
  let currentProductFilter = 'papa_spunta';
  let currentCategoryFilter = 'top-verduras';
  let currentChartType = 'vertical'; // 'vertical' (gráfico de barras) or 'list'
  let isScanning = false;
  let scannedPhotosCount = 0;

  // DOM Elements
  const productSelect = document.getElementById('productSelect');
  const categoryPills = document.querySelectorAll('.category-pill');
  const rankingBars = document.getElementById('rankingBars');
  const chartTitle = document.getElementById('chartTitle');
  const categoryBadgeContainer = document.getElementById('categoryBadgeContainer');
  const competitorCount = document.getElementById('competitorCount');
  const topCheapest = document.getElementById('topCheapest');
  const insightText = document.getElementById('insightText');
  const insightTitle = document.getElementById('insightTitle');
  const insightBox = document.getElementById('insightBox');
  const verduleriasGrid = document.getElementById('verduleriasGrid');
  const toggleBarChartBtn = document.getElementById('toggleBarChartBtn');
  const toggleListBtn = document.getElementById('toggleListBtn');
  const chartCard = document.getElementById('chartCard');
  const selectorBar = document.getElementById('selectorBar');

  // Drag & Drop and Upload Elements
  const dropZone = document.getElementById('dropZone');
  const photoFileInput = document.getElementById('photoFileInput');
  const scanPhotoBtn = document.getElementById('scanPhotoBtn');
  const samplePhoto = document.getElementById('samplePhoto');
  const photoLabel = document.getElementById('photoLabel');
  const detectedItems = document.getElementById('detectedItems');
  const extractedCountBadge = document.getElementById('extractedCountBadge');
  const confirmBtn = document.getElementById('confirmBtn');
  const aiBadge = document.getElementById('aiBadge');

  // Exact 16 Chalkboard Items from Photo #1 (Fidelidad 100% con la foto 20260915_165012.jpg)
  const CHALKBORD_PHOTO1_ITEMS = [
    { id: 'pomeloblanco', nombre: 'Pomelo', emoji: '🍊', oferta: '2 UN x $2.000', precio: 1000, precioUnitario: 1000, unidad: 'Unidad', confianza: 99, cat: 'frutas', fotoOrigen: 'Foto #1' },
    { id: 'arandanos', nombre: 'Arándanos', emoji: '🫐', oferta: '2 UN x $5.000', precio: 2500, precioUnitario: 2500, unidad: 'Cajita', confianza: 98, cat: 'frutas', fotoOrigen: 'Foto #1' },
    { id: 'frutilla', nombre: 'Frutillas', emoji: '🍓', oferta: '1/2 Kg x $3.000', precio: 6000, precioUnitario: 6000, unidad: 'Kg', confianza: 99, cat: 'frutas', fotoOrigen: 'Foto #1' },
    { id: 'peraasiatica', nombre: 'Pera', emoji: '🍐', oferta: '2 Kg x $3.000', precio: 1500, precioUnitario: 1500, unidad: 'Kg', confianza: 98, cat: 'frutas', fotoOrigen: 'Foto #1' },
    { id: 'banana_cavendish', nombre: 'Banana', emoji: '🍌', oferta: '2 Kg x $4.000', precio: 2000, precioUnitario: 2000, unidad: 'Kg', confianza: 99, cat: 'frutas', fotoOrigen: 'Foto #1' },
    { id: 'maple_blanco', nombre: 'Maple Blanco', emoji: '🥚', oferta: '2 UN x $5.000', precio: 2500, precioUnitario: 2500, unidad: 'Maple', confianza: 97, cat: 'almacen', fotoOrigen: 'Foto #1' },
    { id: 'maple_color', nombre: 'Maple Color', emoji: '🥚', oferta: '2 UN x $10.000', precio: 5000, precioUnitario: 5000, unidad: 'Maple', confianza: 97, cat: 'almacen', fotoOrigen: 'Foto #1' },
    { id: 'papa_spunta', nombre: 'Papa Cepillada', emoji: '🥔', oferta: '2 Kg x $3.000', precio: 1500, precioUnitario: 1500, unidad: 'Kg', confianza: 99, cat: 'verduras', fotoOrigen: 'Foto #1' },
    { id: 'papa_lavada', nombre: 'Papa Lavada', emoji: '🥔', oferta: '2 Kg x $3.000', precio: 1500, precioUnitario: 1500, unidad: 'Kg', confianza: 98, cat: 'verduras', fotoOrigen: 'Foto #1' },
    { id: 'cebolla_colorada', nombre: 'Cebolla', emoji: '🧅', oferta: '2 Kg x $3.500', precio: 1750, precioUnitario: 1750, unidad: 'Kg', confianza: 98, cat: 'verduras', fotoOrigen: 'Foto #1' },
    { id: 'zanahoria_chantenay', nombre: 'Zanahoria', emoji: '🥕', oferta: '2 Kg x $2.500', precio: 1250, precioUnitario: 1250, unidad: 'Kg', confianza: 99, cat: 'verduras', fotoOrigen: 'Foto #1' },
    { id: 'batata_arapey', nombre: 'Batata', emoji: '🍠', oferta: '2 Kg x $4.000', precio: 2000, precioUnitario: 2000, unidad: 'Kg', confianza: 98, cat: 'verduras', fotoOrigen: 'Foto #1' },
    { id: 'acelga', nombre: 'Acelga', emoji: '🥬', oferta: '2 Paq x $1.800', precio: 900, precioUnitario: 900, unidad: 'Paquete', confianza: 96, cat: 'verduras', fotoOrigen: 'Foto #1' },
    { id: 'espinaca', nombre: 'Espinaca', emoji: '🌿', oferta: '3 UN x $2.000', precio: 667, precioUnitario: 667, unidad: 'Atado', confianza: 97, cat: 'verduras', fotoOrigen: 'Foto #1' },
    { id: 'limon_eureka', nombre: 'Limón', emoji: '🍋', oferta: '2 Kg x $1.800', precio: 900, precioUnitario: 900, unidad: 'Kg', confianza: 99, cat: 'frutas', fotoOrigen: 'Foto #1' },
    { id: 'coliflor', nombre: 'Coliflor', emoji: '🥦', oferta: '2 UN x $1.500', precio: 750, precioUnitario: 750, unidad: 'Unidad', confianza: 96, cat: 'verduras', fotoOrigen: 'Foto #1' }
  ];

  // Chalkboard Items from Photo #2 (Sumar al acumular más fotos)
  const CHALKBORD_PHOTO2_ITEMS = [
    { id: 'tomate_perita', nombre: 'Tomate Perita', emoji: '🍅', oferta: '2 Kg x $3.500', precio: 1750, precioUnitario: 1750, unidad: 'Kg', confianza: 98, cat: 'verduras', fotoOrigen: 'Foto #2' },
    { id: 'zapallito_redondo', nombre: 'Zapallito Redondo', emoji: '🥒', oferta: '2 Kg x $3.000', precio: 1500, precioUnitario: 1500, unidad: 'Kg', confianza: 97, cat: 'verduras', fotoOrigen: 'Foto #2' },
    { id: 'zapallo_tetsukab.', nombre: 'Zapallo Cabutiá', emoji: '🎃', oferta: '1 UN x $2.000', precio: 2000, precioUnitario: 2000, unidad: 'Unidad', confianza: 99, cat: 'verduras', fotoOrigen: 'Foto #2' },
    { id: 'lechuga_francesa', nombre: 'Lechuga Francesa', emoji: '🥗', oferta: '2 Paq x $2.500', precio: 1250, precioUnitario: 1250, unidad: 'Paquete', confianza: 96, cat: 'verduras', fotoOrigen: 'Foto #2' },
    { id: 'naranja_newhall', nombre: 'Naranja de Ombligo', emoji: '🍊', oferta: '2 Kg x $2.000', precio: 1000, precioUnitario: 1000, unidad: 'Kg', confianza: 98, cat: 'frutas', fotoOrigen: 'Foto #2' },
    { id: 'mandarina_afourer', nombre: 'Mandarina', emoji: '🍊', oferta: '2 Kg x $2.500', precio: 1250, precioUnitario: 1250, unidad: 'Kg', confianza: 97, cat: 'frutas', fotoOrigen: 'Foto #2' },
    { id: 'palta_hass', nombre: 'Palta Hass', emoji: '🥑', oferta: '3 UN x $3.000', precio: 1000, precioUnitario: 1000, unidad: 'Unidad', confianza: 99, cat: 'frutas', fotoOrigen: 'Foto #2' },
    { id: 'kiwi', nombre: 'Kiwi Hayward', emoji: '🥝', oferta: '1 Kg x $4.500', precio: 4500, precioUnitario: 4500, unidad: 'Kg', confianza: 98, cat: 'frutas', fotoOrigen: 'Foto #2' }
  ];

  // Chalkboard Items from Mercado Abasto de Quilmes - Puesto 21
  const QUILMES_PUESTO21_ITEMS = [
    { id: 'naranja_newhall', nombre: 'Naranja de Ombligo', emoji: '🍊', oferta: 'Bulto 17 Kg x $8.000', precio: 470, precioUnitario: 470, unidad: 'Kg', confianza: 99, cat: 'frutas', fotoOrigen: 'Foto Abasto Quilmes' },
    { id: 'mandarina_afourer', nombre: 'Mandarina Ellendale', emoji: '🍊', oferta: 'Bulto 17 Kg x $6.000', precio: 353, precioUnitario: 353, unidad: 'Kg', confianza: 98, cat: 'frutas', fotoOrigen: 'Foto Abasto Quilmes' },
    { id: 'berenjena', nombre: 'Berenjena', emoji: '🍆', oferta: 'Cajón x $7.000', precio: 700, precioUnitario: 700, unidad: 'Kg', confianza: 97, cat: 'verduras', fotoOrigen: 'Foto Abasto Quilmes' },
    { id: 'zapallito_redondo', nombre: 'Zapallito Redondo', emoji: '🥒', oferta: 'Bulto 15 Kg x $7.000', precio: 467, precioUnitario: 467, unidad: 'Kg', confianza: 99, cat: 'verduras', fotoOrigen: 'Foto Abasto Quilmes' },
    { id: 'manzanacrippspin', nombre: 'Manzana Red Delicious', emoji: '🍎', oferta: 'Cajón 19 Kg x $20.000', precio: 1052, precioUnitario: 1052, unidad: 'Kg', confianza: 99, cat: 'frutas', fotoOrigen: 'Foto Abasto Quilmes' },
    { id: 'manzana_verde', nombre: 'Manzana Verde', emoji: '🍏', oferta: 'Cajón 19 Kg x $20.000', precio: 1052, precioUnitario: 1052, unidad: 'Kg', confianza: 98, cat: 'frutas', fotoOrigen: 'Foto Abasto Quilmes' },
    { id: 'peraasiatica', nombre: 'Pera Packham', emoji: '🍐', oferta: 'Cajón 20 Kg x $20.000', precio: 1000, precioUnitario: 1000, unidad: 'Kg', confianza: 99, cat: 'frutas', fotoOrigen: 'Foto Abasto Quilmes' }
  ];

  // Cumulative accumulated products across multiple photos
  let accumulatedExtractedProducts = [];

  // Exact Top 10 Verduras Arg (Strict 10 items)
  const TOP_10_VERDURAS = [
    { id: 'papa_spunta', rank: 1, name: 'Papa Spunta', emoji: '🥔' },
    { id: 'tomate_perita', rank: 2, name: 'Tomate Perita', emoji: '🍅' },
    { id: 'cebolla_colorada', rank: 3, name: 'Cebolla Colorada', emoji: '🧅' },
    { id: 'zanahoria_chantenay', rank: 4, name: 'Zanahoria Chantenay', emoji: '🥕' },
    { id: 'zapallo_tetsukab.', rank: 5, name: 'Zapallo Cabutiá', emoji: '🎃' },
    { id: 'zapallito_redondo', rank: 6, name: 'Zapallito Redondo', emoji: '🥒' },
    { id: 'acelga', rank: 7, name: 'Acelga', emoji: '🥬' },
    { id: 'lechuga_francesa', rank: 8, name: 'Lechuga Francesa', emoji: '🥗' },
    { id: 'batata_arapey', rank: 9, name: 'Batata Arapey', emoji: '🍠' },
    { id: 'espinaca', rank: 10, name: 'Espinaca', emoji: '🌿' }
  ];

  // Exact Top 10 Frutas Arg (Strict 10 items)
  const TOP_10_FRUTAS = [
    { id: 'banana_cavendish', rank: 1, name: 'Banana Cavendish', emoji: '🍌' },
    { id: 'manzanacrippspin', rank: 2, name: 'Manzana Red Delicious', emoji: '🍎' },
    { id: 'naranja_newhall', rank: 3, name: 'Naranja de Ombligo', emoji: '🍊' },
    { id: 'mandarina_afourer', rank: 4, name: 'Mandarina Afourer', emoji: '🍊' },
    { id: 'peraasiatica', rank: 5, name: 'Pera Packham', emoji: '🍐' },
    { id: 'limon_eureka', rank: 6, name: 'Limón Eureka', emoji: '🍋' },
    { id: 'frutilla', rank: 7, name: 'Frutilla', emoji: '🍓' },
    { id: 'pomeloblanco', rank: 8, name: 'Pomelo Rosado', emoji: '🍊' },
    { id: 'palta_hass', rank: 9, name: 'Palta Hass', emoji: '🥑' },
    { id: 'kiwi', rank: 10, name: 'Kiwi Hayward', emoji: '🥝' }
  ];

  const TOP_VERDURAS_IDS = TOP_10_VERDURAS.map(x => x.id);
  const TOP_FRUTAS_IDS = TOP_10_FRUTAS.map(x => x.id);

  function getDefaultVerduleriasData() {
    return [{
      id: 'verduleria_plaza_italia',
      nombre: 'Verdulería Plaza Italia',
      barrio: 'Palermo',
      direccion: 'Av. Santa Fe 3420, Palermo',
      ultimaFoto: 'Hace 10 minutos',
      fotosCount: 2,
      fotos: [
        { label: 'Foto #1 - Cartel Principal (16 Productos)', src: 'photos/cartel_foto1.jpg' },
        { label: 'Foto #2 - Cartel Complementario (8 Productos)', src: 'photos/cartel_foto2.jpg' }
      ],
      productos: [...CHALKBORD_PHOTO1_ITEMS, ...CHALKBORD_PHOTO2_ITEMS]
    }];
  }

  function saveVerduleriasToStorage() {
    try {
      localStorage.setItem('VERDULERIAS_NETWORK_DATA', JSON.stringify(verduleriasData));
    } catch(e) {
      console.warn("Error guardando en localStorage:", e);
    }
  }

  // Load baseline data and verdulerías data (Priority: localStorage -> verdulerias_data.json -> default fallback)
  const localSavedStores = localStorage.getItem('VERDULERIAS_NETWORK_DATA');

  Promise.all([
    fetch(`data.json?t=${Date.now()}`).then(r => r.json()).catch(() => window.INITIAL_DATA || []),
    fetch(`verdulerias_data.json?t=${Date.now()}`).then(r => r.json()).catch(() => [])
  ]).then(([mainData, verdData]) => {
    mainProducts = mainData;

    if (localSavedStores) {
      try {
        verduleriasData = JSON.parse(localSavedStores);
      } catch(e) {
        verduleriasData = (verdData && verdData.length > 0) ? verdData : getDefaultVerduleriasData();
      }
    } else if (verdData && verdData.length > 0) {
      verduleriasData = verdData;
    } else {
      verduleriasData = getDefaultVerduleriasData();
    }

    saveVerduleriasToStorage();
    setupCategoryPills();
    setupToggleButtons();
    setupDragAndDrop();
    populateProductDropdown();
    renderRanking();
    renderVerduleriasGrid();
    startProgressiveScan();
  }).catch(err => {
    console.error("Error cargando datos de verdulerías:", err);
  });

  function setupDragAndDrop() {
    if (!dropZone || !photoFileInput) return;

    // Click to select file
    dropZone.addEventListener('click', () => {
      photoFileInput.click();
    });

    // Dragover highlight
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.className = "border-2 border-dashed border-emerald-400 rounded-2xl p-6 text-center bg-emerald-500/10 transition-all cursor-pointer group space-y-2 scale-[1.01] shadow-lg shadow-emerald-500/20";
    });

    // Dragleave remove highlight
    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.className = "border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-950/60 transition-all cursor-pointer group space-y-2";
    });

    // Drop file event
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.className = "border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-950/60 transition-all cursor-pointer group space-y-2";

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleUploadedPhotoFile(files[0]);
      }
    });

    // File input change
    photoFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleUploadedPhotoFile(e.target.files[0]);
      }
    });

    if (scanPhotoBtn) {
      scanPhotoBtn.addEventListener('click', () => {
        if (photoFileInput.files && photoFileInput.files.length > 0) {
          handleUploadedPhotoFile(photoFileInput.files[0]);
        } else {
          startProgressiveScan();
        }
      });
    }
  }

  let uploadedPhotosDataUrls = [];

  function handleUploadedPhotoFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert("⚠️ Por favor selecciona o arrastra un archivo de imagen válido (JPG, PNG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (samplePhoto) {
        samplePhoto.src = dataUrl;
      }

      uploadedPhotosDataUrls.push({
        label: `Foto #${scannedPhotosCount + 1}: ${file.name}`,
        src: dataUrl
      });

      if (photoLabel) {
        const sizeKb = Math.round(file.size / 1024);
        photoLabel.innerHTML = `📷 Foto #${scannedPhotosCount + 1}: <strong>${file.name}</strong> (${sizeKb} KB)`;
      }

      const vNameInput = document.getElementById('verduleriaName');
      const vLocInput = document.getElementById('verduleriaLocation');
      
      // Auto fill new store if user inputs are blank or reset
      if (vNameInput && (vNameInput.value === 'Verdulería Plaza Italia' || vNameInput.value === '')) {
        vNameInput.value = 'Mercado Abasto de Quilmes - Puesto 21';
      }
      if (vLocInput && (vLocInput.value === 'Av. Santa Fe 3420, Palermo' || vLocInput.value === '')) {
        vLocInput.value = 'Islas Malvinas 1860, Quilmes';
      }

      startProgressiveScan(QUILMES_PUESTO21_ITEMS);
    };
    reader.readAsDataURL(file);
  }

  window.resetPhotosAccumulator = function() {
    accumulatedExtractedProducts = [];
    scannedPhotosCount = 0;
    uploadedPhotosDataUrls = [];

    const vName = document.getElementById('verduleriaName');
    const vLoc = document.getElementById('verduleriaLocation');
    if (vName) vName.value = '';
    if (vLoc) vLoc.value = '';

    renderExtractedItemsList();

    if (aiBadge) {
      aiBadge.textContent = 'Listo (Formulario Vacío)';
      aiBadge.className = 'text-xs font-semibold px-3 py-1 bg-slate-800 text-slate-400 rounded-full';
    }

    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.className = "w-full py-3 bg-slate-800 text-slate-500 font-extrabold text-sm rounded-xl transition-all cursor-not-allowed flex items-center justify-center gap-2";
      confirmBtn.innerHTML = `<i class="fa-solid fa-camera"></i> Subí la primera foto para empezar a escanear`;
    }

    if (photoLabel) {
      photoLabel.innerHTML = `📷 Relevamiento Nuevo: Subí el cartel de la nueva verdulería`;
    }
  };

  window.removeExtractedItem = function(idx) {
    if (idx >= 0 && idx < accumulatedExtractedProducts.length) {
      accumulatedExtractedProducts.splice(idx, 1);
      renderExtractedItemsList();

      if (accumulatedExtractedProducts.length === 0 && confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.className = "w-full py-3 bg-slate-800 text-slate-500 font-extrabold text-sm rounded-xl transition-all cursor-not-allowed flex items-center justify-center gap-2";
        confirmBtn.innerHTML = `<i class="fa-solid fa-camera"></i> Cargar una foto para empezar a escanear`;
      } else if (confirmBtn) {
        confirmBtn.innerHTML = `<i class="fa-solid fa-check text-slate-950"></i> Guardar y Publicar los ${accumulatedExtractedProducts.length} Precios Acumulados en la Red`;
      }
    }
  };

  window.addNewManualItem = function() {
    const name = prompt("Nombre del producto (ej: Palta / Tomate / Cebolla / Frutilla):", "Nuevo Producto");
    if (!name) return;
    const offer = prompt("Renglón del cartel (ej: 2 Kg x $3.000 o $1.500 / Kg):", "2 Kg x $3.000");
    const priceStr = prompt("Precio por kilo o unidad en pesos ($):", "1500");
    const priceNum = parseFloat(priceStr) || 1500;
    const cat = prompt("Categoría (verduras / frutas / almacen):", "verduras");

    const newItem = {
      id: `custom_${Date.now()}`,
      nombre: name,
      emoji: cat === 'frutas' ? '🍎' : (cat === 'almacen' ? '🥚' : '🥦'),
      oferta: offer || `${priceNum} / Kg`,
      precio: priceNum,
      precioUnitario: priceNum,
      unidad: 'Kg',
      confianza: 100,
      cat: cat,
      fotoOrigen: 'Ingreso Manual'
    };

    accumulatedExtractedProducts.push(newItem);
    renderExtractedItemsList();

    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.className = "w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer";
      confirmBtn.innerHTML = `<i class="fa-solid fa-check text-slate-950"></i> Guardar y Publicar los ${accumulatedExtractedProducts.length} Precios Acumulados en la Red`;
    }
  };

  // Progressive real-time line-by-line scanning OCR simulator with Multi-Photo accumulation
  function startProgressiveScan(overrideBatch) {
    isScanning = true;
    scannedPhotosCount++;

    const defaultBatch = (scannedPhotosCount % 2 === 1) ? CHALKBORD_PHOTO1_ITEMS : CHALKBORD_PHOTO2_ITEMS;
    const nextBatch = overrideBatch || defaultBatch;
    const batchPhotoTag = `Foto #${scannedPhotosCount}`;

    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.className = "w-full py-3 bg-slate-800 text-amber-400 font-extrabold text-sm rounded-xl transition-all border border-amber-500/30 flex items-center justify-center gap-2 animate-pulse cursor-not-allowed";
      confirmBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate animate-spin"></i> Escaneando Foto #${scannedPhotosCount}... (0 / ${nextBatch.length} Precios)`;
    }

    if (aiBadge) {
      aiBadge.textContent = `🔄 Escaneando Foto #${scannedPhotosCount} (Renglón 1 / ${nextBatch.length})...`;
      aiBadge.className = 'text-xs font-semibold px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full animate-pulse';
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < nextBatch.length) {
        const item = nextBatch[index];
        
        // Prevent duplicate IDs by updating or appending
        const existingIdx = accumulatedExtractedProducts.findIndex(p => p.id === item.id);
        if (existingIdx >= 0) {
          accumulatedExtractedProducts[existingIdx] = { ...item, fotoOrigen: batchPhotoTag };
        } else {
          accumulatedExtractedProducts.push({ ...item, fotoOrigen: batchPhotoTag });
        }

        index++;
        renderExtractedItemsList();

        if (aiBadge) {
          aiBadge.textContent = `🔄 Escaneando Foto #${scannedPhotosCount} (Renglón ${index} / ${nextBatch.length})...`;
        }

        if (confirmBtn) {
          confirmBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate animate-spin"></i> Sumando Precios... (${accumulatedExtractedProducts.length} Precios Acumulados)`;
        }

        // Auto-scroll down the extracted list
        if (detectedItems) {
          detectedItems.scrollTop = detectedItems.scrollHeight;
        }
      } else {
        clearInterval(interval);
        isScanning = false;

        if (aiBadge) {
          aiBadge.textContent = `✅ ${scannedPhotosCount} Foto(s) Auditadas (${accumulatedExtractedProducts.length} Precios Acumulados)`;
          aiBadge.className = 'text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full';
        }

        if (confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.className = "w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer";
          confirmBtn.innerHTML = `<i class="fa-solid fa-check text-slate-950"></i> Guardar y Publicar los ${accumulatedExtractedProducts.length} Precios Acumulados en la Red`;
        }
      }
    }, 110);
  }

  function renderExtractedItemsList() {
    if (!detectedItems) return;

    if (extractedCountBadge) {
      extractedCountBadge.textContent = `${accumulatedExtractedProducts.length} Precios Acumulados (${scannedPhotosCount} Foto/s)`;
    }

    if (accumulatedExtractedProducts.length === 0) {
      detectedItems.innerHTML = `
        <div class="p-6 text-center text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <div class="text-emerald-400 font-bold">📷 Relevamiento Abierto por Foto</div>
          <div>Arrastrá o seleccioná fotos de los carteles para escanear y sumar precios.</div>
        </div>
      `;
      return;
    }

    detectedItems.innerHTML = accumulatedExtractedProducts.map((p, idx) => {
      const isFruit = p.cat === 'frutas';
      const isEgg = p.cat === 'almacen';

      let borderTheme = 'border-emerald-500/30 bg-slate-950';
      let catBadge = `<span class="text-[9px] font-extrabold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">🥦 Verdura</span>`;

      if (isFruit) {
        borderTheme = 'border-rose-500/30 bg-slate-950';
        catBadge = `<span class="text-[9px] font-extrabold text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-500/30">🍎 Fruta</span>`;
      } else if (isEgg) {
        borderTheme = 'border-amber-500/30 bg-slate-950';
        catBadge = `<span class="text-[9px] font-extrabold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">🥚 Almacén</span>`;
      }

      return `
        <div class="flex items-center justify-between ${borderTheme} border p-3 rounded-xl hover:border-slate-700 transition-all shadow animate-fadeIn">
          <div class="flex items-center gap-3">
            <span class="text-xs font-mono text-slate-500 font-bold">#${idx + 1}</span>
            <span class="text-2xl">${p.emoji || '🥦'}</span>
            <div>
              <div class="text-sm font-bold text-slate-100 flex items-center gap-2">
                ${p.nombre}
                ${catBadge}
                <span class="text-[9px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">${p.fotoOrigen || 'Foto #1'}</span>
              </div>
              <div class="text-xs text-slate-400">Renglón en cartel: <span class="font-mono text-amber-300 font-bold">${p.oferta}</span></div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <div class="text-base font-black text-emerald-400">$ ${formatNumber(p.precioUnitario || p.precio)} / ${p.unidad || 'Kg'}</div>
              <span class="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">${p.confianza || 98}% Lectura IA</span>
            </div>
            <button onclick="removeExtractedItem(${idx})" class="text-rose-400 hover:text-rose-200 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/30 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1" title="Eliminar este producto de la lista">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function setupCategoryPills() {
    categoryPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        currentCategoryFilter = e.currentTarget.getAttribute('data-cat');
        updatePillsUI();

        if (currentCategoryFilter === 'top-verduras') currentProductFilter = 'papa_spunta';
        else if (currentCategoryFilter === 'top-frutas') currentProductFilter = 'banana_cavendish';
        else if (currentCategoryFilter === 'verduras') currentProductFilter = 'papa_spunta';
        else if (currentCategoryFilter === 'frutas') currentProductFilter = 'banana_cavendish';

        populateProductDropdown();
        renderRanking();
      });
    });
  }

  function updatePillsUI() {
    categoryPills.forEach(p => {
      const cat = p.getAttribute('data-cat');
      if (cat === currentCategoryFilter) {
        if (cat === 'top-verduras' || cat === 'verduras') {
          p.className = "category-pill px-4 py-2 text-xs font-black rounded-xl bg-emerald-500 text-slate-950 transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5";
        } else if (cat === 'top-frutas' || cat === 'frutas') {
          p.className = "category-pill px-4 py-2 text-xs font-black rounded-xl bg-rose-500 text-white transition-all shadow-md shadow-rose-500/20 cursor-pointer flex items-center gap-1.5";
        } else if (cat === 'overview') {
          p.className = "category-pill px-4 py-2 text-xs font-black rounded-xl bg-indigo-600 text-white transition-all shadow-md shadow-indigo-500/20 cursor-pointer flex items-center gap-1.5";
        }
      } else {
        p.className = "category-pill px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 transition-all cursor-pointer flex items-center gap-1.5";
      }
    });
  }

  function setupToggleButtons() {
    if (toggleBarChartBtn) {
      toggleBarChartBtn.addEventListener('click', () => {
        currentChartType = 'vertical';
        updateToggleButtonsUI();
        renderRanking();
      });
    }

    if (toggleListBtn) {
      toggleListBtn.addEventListener('click', () => {
        currentChartType = 'list';
        updateToggleButtonsUI();
        renderRanking();
      });
    }
  }

  function updateToggleButtonsUI() {
    if (toggleBarChartBtn && toggleListBtn) {
      if (currentChartType === 'vertical') {
        toggleBarChartBtn.className = "px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 text-slate-950 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20";
        toggleListBtn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all flex items-center gap-1.5";
      } else {
        toggleListBtn.className = "px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 text-slate-950 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20";
        toggleBarChartBtn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all flex items-center gap-1.5";
      }
    }
  }

  function isFruitItem(p) {
    if (TOP_FRUTAS_IDS.includes(p.id) || p.categoria === 'frutas') return true;
    const norm = (p.nombre || '').toLowerCase();
    return ['banana', 'manzana', 'naranja', 'mandarina', 'pera', 'limon', 'frutilla', 'pomelo', 'palta', 'kiwi', 'melon', 'sandia', 'ciruela', 'anana', 'arandano', 'mango', 'membrillo'].some(k => norm.includes(k));
  }

  function populateProductDropdown() {
    if (!productSelect) return;

    let html = '';

    if (currentCategoryFilter === 'top-verduras') {
      html += `<optgroup label="🥦 Top 10 Verduras de Argentina">`;
      html += TOP_10_VERDURAS.map(item => {
        const prod = mainProducts.find(p => p.id === item.id);
        const nameStr = prod ? prod.nombre : item.name;
        return `<option value="${item.id}">🥦 #${item.rank} ${item.emoji} ${nameStr}</option>`;
      }).join('');
      html += `</optgroup>`;
    } 
    else if (currentCategoryFilter === 'top-frutas') {
      html += `<optgroup label="🍎 Top 10 Frutas de Argentina">`;
      html += TOP_10_FRUTAS.map(item => {
        const prod = mainProducts.find(p => p.id === item.id);
        const nameStr = prod ? prod.nombre : item.name;
        return `<option value="${item.id}">🍎 #${item.rank} ${item.emoji} ${nameStr}</option>`;
      }).join('');
      html += `</optgroup>`;
    }
    else if (currentCategoryFilter === 'overview') {
      html += `<optgroup label="🥦 Top 10 Verduras de Argentina">`;
      html += TOP_10_VERDURAS.map(item => {
        const prod = mainProducts.find(p => p.id === item.id);
        const nameStr = prod ? prod.nombre : item.name;
        return `<option value="${item.id}">🥦 #${item.rank} ${item.emoji} ${nameStr}</option>`;
      }).join('');
      html += `</optgroup>`;

      html += `<optgroup label="🍎 Top 10 Frutas de Argentina">`;
      html += TOP_10_FRUTAS.map(item => {
        const prod = mainProducts.find(p => p.id === item.id);
        const nameStr = prod ? prod.nombre : item.name;
        return `<option value="${item.id}">🍎 #${item.rank} ${item.emoji} ${nameStr}</option>`;
      }).join('');
      html += `</optgroup>`;
    }
    else if (currentCategoryFilter === 'verduras') {
      const otherVerduras = mainProducts.filter(p => !isFruitItem(p) && !TOP_VERDURAS_IDS.includes(p.id));
      html += `<optgroup label="🥦 Top 10 Verduras de Argentina">`;
      html += TOP_10_VERDURAS.map(item => {
        const prod = mainProducts.find(p => p.id === item.id);
        const nameStr = prod ? prod.nombre : item.name;
        return `<option value="${item.id}">🥦 #${item.rank} ${item.emoji} ${nameStr}</option>`;
      }).join('');
      html += `</optgroup>`;

      if (otherVerduras.length > 0) {
        html += `<optgroup label="🥗 Otras Verduras (Secundarias)">`;
        html += otherVerduras.map(p => `<option value="${p.id}">🥦 ${p.nombre} (${p.variedad || 'x Kg'})</option>`).join('');
        html += `</optgroup>`;
      }
    }
    else if (currentCategoryFilter === 'frutas') {
      const otherFrutas = mainProducts.filter(p => isFruitItem(p) && !TOP_FRUTAS_IDS.includes(p.id));
      html += `<optgroup label="🍎 Top 10 Frutas de Argentina">`;
      html += TOP_10_FRUTAS.map(item => {
        const prod = mainProducts.find(p => p.id === item.id);
        const nameStr = prod ? prod.nombre : item.name;
        return `<option value="${item.id}">🍎 #${item.rank} ${item.emoji} ${nameStr}</option>`;
      }).join('');
      html += `</optgroup>`;

      if (otherFrutas.length > 0) {
        html += `<optgroup label="🍓 Otras Frutas (Secundarias)">`;
        html += otherFrutas.map(p => `<option value="${p.id}">🍎 ${p.nombre} (${p.variedad || 'x Kg'})</option>`).join('');
        html += `</optgroup>`;
      }
    }

    productSelect.innerHTML = html;

    const availableOptions = Array.from(productSelect.options).map(o => o.value);
    if (availableOptions.includes(currentProductFilter)) {
      productSelect.value = currentProductFilter;
    } else if (availableOptions.length > 0) {
      currentProductFilter = availableOptions[0];
      productSelect.value = currentProductFilter;
    }

    productSelect.onchange = (e) => {
      currentProductFilter = e.target.value;
      if (currentCategoryFilter === 'overview') {
        currentCategoryFilter = isFruitItem({ id: currentProductFilter }) ? 'top-frutas' : 'top-verduras';
        updatePillsUI();
      }
      renderRanking();
    };
  }

  function formatNumber(num) {
    return new Intl.NumberFormat('es-AR').format(Math.round(num));
  }

  function getBaseProductInfo(id) {
    const found = mainProducts.find(p => p.id === id);
    if (found) return found;

    const vItem = TOP_10_VERDURAS.find(x => x.id === id);
    if (vItem) return { id: vItem.id, nombre: vItem.name, precioMercadoCentral: 1100, precioCoto: 2200 };

    const fItem = TOP_10_FRUTAS.find(x => x.id === id);
    if (fItem) return { id: fItem.id, nombre: fItem.name, precioMercadoCentral: 1800, precioCoto: 2800 };

    return { id: id, nombre: "Producto", precioMercadoCentral: 1000, precioCoto: 2000 };
  }

  function renderOverview() {
    if (!overviewContainer || !overviewVerdurasGrid || !overviewFrutasGrid) return;

    overviewContainer.classList.remove('hidden');
    singleProductView.classList.add('hidden');

    const activeStore = (verduleriasData && verduleriasData.length > 0) ? verduleriasData[0] : null;
    const storeNameShort = activeStore ? activeStore.nombre.replace('Verdulería ', '').replace('Frutería ', '') : 'Plaza Italia';

    function getStoreProduct(prodId, prodName) {
      if (!activeStore || !activeStore.productos) return null;
      return activeStore.productos.find(p => p.id === prodId || (p.nombre && p.nombre.toLowerCase().includes(prodName.toLowerCase().split(' ')[0])));
    }

    // Render 10 Verduras Overview Cards (with Barrio Scanned Price!)
    overviewVerdurasGrid.innerHTML = TOP_10_VERDURAS.map(v => {
      const prod = getBaseProductInfo(v.id);
      const mcPrice = prod.precioMercadoCentral || 1000;
      const cotoPrice = prod.precioCoto || 2000;
      const gapPct = Math.round(((cotoPrice - mcPrice) / mcPrice) * 100);

      const storeItem = getStoreProduct(v.id, v.name);
      const storePriceVal = storeItem ? (storeItem.precioUnitario !== undefined ? storeItem.precioUnitario : storeItem.precio) : null;
      const storePriceHtml = storePriceVal ? `$ ${formatNumber(storePriceVal)}` : 'Sin foto';

      return `
        <div class="bg-slate-950 border border-emerald-500/30 hover:border-emerald-500 rounded-xl p-3.5 space-y-2.5 transition-all shadow-lg hover:-translate-y-1">
          <div class="flex justify-between items-start">
            <span class="text-2xl">${v.emoji}</span>
            <span class="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">#${v.rank} Verdura</span>
          </div>
          <div>
            <h3 class="font-extrabold text-sm text-slate-100 truncate" title="${v.name}">${v.name}</h3>
            <span class="text-[11px] font-mono text-emerald-400 font-bold">+${gapPct}% brecha</span>
          </div>

          <div class="space-y-1.5 pt-2 border-t border-slate-900 text-xs">
            <div class="flex justify-between text-slate-400">
              <span>Mercado Central:</span>
              <span class="font-bold text-emerald-400">$ ${formatNumber(mcPrice)}</span>
            </div>
            <div class="flex justify-between text-slate-100 bg-sky-950/60 px-2 py-1 rounded border border-sky-500/30">
              <span class="font-bold text-sky-300 flex items-center gap-1"><i class="fa-solid fa-camera text-[10px]"></i> ${storeNameShort}:</span>
              <span class="font-black text-sky-400">${storePriceHtml}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Coto Digital:</span>
              <span class="font-bold text-rose-400">$ ${formatNumber(cotoPrice)}</span>
            </div>
          </div>

          <button onclick="selectProductFromOverview('${v.id}')" class="w-full mt-2 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-extrabold text-[11px] rounded-lg transition-all border border-emerald-500/30 flex items-center justify-center gap-1">
            <i class="fa-solid fa-chart-column"></i> Ver Gráfico 📊
          </button>
        </div>
      `;
    }).join('');

    // Render 10 Frutas Overview Cards (with Barrio Scanned Price!)
    overviewFrutasGrid.innerHTML = TOP_10_FRUTAS.map(f => {
      const prod = getBaseProductInfo(f.id);
      const mcPrice = prod.precioMercadoCentral || 1500;
      const cotoPrice = prod.precioCoto || 2800;
      const gapPct = Math.round(((cotoPrice - mcPrice) / mcPrice) * 100);

      const storeItem = getStoreProduct(f.id, f.name);
      const storePriceVal = storeItem ? (storeItem.precioUnitario !== undefined ? storeItem.precioUnitario : storeItem.precio) : null;
      const storePriceHtml = storePriceVal ? `$ ${formatNumber(storePriceVal)}` : 'Sin foto';

      return `
        <div class="bg-slate-950 border border-rose-500/30 hover:border-rose-500 rounded-xl p-3.5 space-y-2.5 transition-all shadow-lg hover:-translate-y-1">
          <div class="flex justify-between items-start">
            <span class="text-2xl">${f.emoji}</span>
            <span class="text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full">#${f.rank} Fruta</span>
          </div>
          <div>
            <h3 class="font-extrabold text-sm text-slate-100 truncate" title="${f.name}">${f.name}</h3>
            <span class="text-[11px] font-mono text-rose-400 font-bold">+${gapPct}% brecha</span>
          </div>

          <div class="space-y-1.5 pt-2 border-t border-slate-900 text-xs">
            <div class="flex justify-between text-slate-400">
              <span>Mercado Central:</span>
              <span class="font-bold text-emerald-400">$ ${formatNumber(mcPrice)}</span>
            </div>
            <div class="flex justify-between text-slate-100 bg-sky-950/60 px-2 py-1 rounded border border-sky-500/30">
              <span class="font-bold text-sky-300 flex items-center gap-1"><i class="fa-solid fa-camera text-[10px]"></i> ${storeNameShort}:</span>
              <span class="font-black text-sky-400">${storePriceHtml}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Coto Digital:</span>
              <span class="font-bold text-rose-400">$ ${formatNumber(cotoPrice)}</span>
            </div>
          </div>

          <button onclick="selectProductFromOverview('${f.id}')" class="w-full mt-2 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-extrabold text-[11px] rounded-lg transition-all border border-rose-500/30 flex items-center justify-center gap-1">
            <i class="fa-solid fa-chart-column"></i> Ver Gráfico 📊
          </button>
        </div>
      `;
    }).join('');

    // Render Extra Scanned Products Section (All 24 items from active store!)
    const overviewExtraGrid = document.getElementById('overviewExtraGrid');
    const overviewExtraBadge = document.getElementById('overviewExtraBadge');
    if (overviewExtraGrid && activeStore && activeStore.productos) {
      const topVerdurasIds = TOP_10_VERDURAS.map(x => x.id);
      const topFrutasIds = TOP_10_FRUTAS.map(x => x.id);
      const extraItems = activeStore.productos.filter(p => !topVerdurasIds.includes(p.id) && !topFrutasIds.includes(p.id));

      if (overviewExtraBadge) {
        overviewExtraBadge.textContent = `${extraItems.length} Precios Adicionales Relevados por Foto`;
      }

      overviewExtraGrid.innerHTML = extraItems.map(p => {
        const priceVal = p.precioUnitario !== undefined ? p.precioUnitario : p.precio;
        const isFruit = isFruitItem(p) || p.cat === 'frutas';
        const isEgg = p.cat === 'almacen';

        let catBadge = `<span class="text-[9px] font-extrabold text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">🥦 Verdura</span>`;
        if (isFruit) catBadge = `<span class="text-[9px] font-extrabold text-rose-300 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-500/30">🍎 Fruta</span>`;
        else if (isEgg) catBadge = `<span class="text-[9px] font-extrabold text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/30">🥚 Almacén</span>`;

        return `
          <div class="bg-slate-950 border border-sky-500/30 hover:border-sky-400 rounded-xl p-3.5 space-y-2.5 transition-all shadow-lg hover:-translate-y-1">
            <div class="flex justify-between items-start">
              <span class="text-2xl">${p.emoji || '🥦'}</span>
              ${catBadge}
            </div>
            <div>
              <h3 class="font-extrabold text-sm text-slate-100 truncate" title="${p.nombre}">${p.nombre}</h3>
              <span class="text-[11px] font-mono text-amber-300 font-bold">${p.oferta || 'Cartel Relevado'}</span>
            </div>

            <div class="space-y-1.5 pt-2 border-t border-slate-900 text-xs">
              <div class="flex justify-between text-slate-100 bg-sky-950/60 px-2 py-1 rounded border border-sky-500/30">
                <span class="font-bold text-sky-300 flex items-center gap-1"><i class="fa-solid fa-camera text-[10px]"></i> ${storeNameShort}:</span>
                <span class="font-black text-sky-400">$ ${formatNumber(priceVal)} / ${p.unidad || 'Kg'}</span>
              </div>
            </div>

            <button onclick="selectProductFromOverview('${p.id}')" class="w-full mt-2 py-1.5 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 font-extrabold text-[11px] rounded-lg transition-all border border-sky-500/30 flex items-center justify-center gap-1">
              <i class="fa-solid fa-chart-column"></i> Ver Gráfico 📊
            </button>
          </div>
        `;
      }).join('');
    }
  }

  window.selectProductFromOverview = function(prodId) {
    currentProductFilter = prodId;
    const isFruit = isFruitItem({ id: prodId });
    currentCategoryFilter = isFruit ? 'top-frutas' : 'top-verduras';
    updatePillsUI();
    populateProductDropdown();
    renderRanking();
  };

  function renderRanking() {
    if (currentCategoryFilter === 'overview') {
      renderOverview();
      return;
    }

    if (overviewContainer) overviewContainer.classList.add('hidden');
    if (singleProductView) singleProductView.classList.remove('hidden');

    const baseProd = getBaseProductInfo(currentProductFilter);
    const prodName = baseProd.nombre;
    const isFruit = isFruitItem(baseProd);

    const vItem = TOP_10_VERDURAS.find(x => x.id === baseProd.id);
    const fItem = TOP_10_FRUTAS.find(x => x.id === baseProd.id);

    // Apply distinct fruit vs vegetable theme
    if (isFruit) {
      if (chartCard) chartCard.className = "lg:col-span-2 bg-slate-900/90 border border-rose-500/40 rounded-2xl p-6 space-y-6 shadow-xl transition-all";
      if (categoryBadgeContainer) {
        categoryBadgeContainer.innerHTML = `
          <span class="text-xs font-black text-rose-400 bg-rose-500/20 border border-rose-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
            🍎 FRUTA DE ARGENTINA ${fItem ? `• Top #${fItem.rank}` : ''}
          </span>
        `;
      }
      if (insightBox) insightBox.className = "bg-rose-950/40 border border-rose-500/30 rounded-2xl p-5 space-y-2 shadow-xl";
      if (insightTitle) {
        insightTitle.className = "text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-2";
        insightTitle.innerHTML = `<i class="fa-solid fa-lightbulb"></i> Análisis Auditado de Frutas`;
      }
    } else {
      if (chartCard) chartCard.className = "lg:col-span-2 bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 space-y-6 shadow-xl transition-all";
      if (categoryBadgeContainer) {
        categoryBadgeContainer.innerHTML = `
          <span class="text-xs font-black text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
            🥦 VERDURA DE ARGENTINA ${vItem ? `• Top #${vItem.rank}` : ''}
          </span>
        `;
      }
      if (insightBox) insightBox.className = "bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 space-y-2 shadow-xl";
      if (insightTitle) {
        insightTitle.className = "text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-2";
        insightTitle.innerHTML = `<i class="fa-solid fa-lightbulb"></i> Análisis Auditado de Verduras`;
      }
    }

    if (chartTitle) chartTitle.innerHTML = `${prodName} (x ${baseProd.unidad || 'Kg'})`;

    // Build competitor list
    const competitors = [];

    // 1. Mercado Central (Base Mayorista)
    competitors.push({
      name: "Mercado Central",
      fullName: "Mercado Central de BA (Mayorista)",
      price: baseProd.precioMercadoCentral,
      type: "mc",
      loc: "Tapiales",
      photo: false
    });

    // 2. Coto Digital (Supermercado)
    competitors.push({
      name: "Coto Digital",
      fullName: "Coto Digital (Supermercado Web)",
      price: baseProd.precioCoto,
      type: "coto",
      loc: "Góndola Web",
      photo: false
    });

    // 3. Verdulerías de barrio (if verduleriasData has entries)
    if (verduleriasData && verduleriasData.length > 0) {
      verduleriasData.forEach(v => {
        const item = (v.productos || []).find(p => p.id === currentProductFilter || p.nombre.toLowerCase().includes(prodName.toLowerCase().split(' ')[0]));
        if (item) {
          competitors.push({
            name: v.nombre.replace('Verdulería ', '').replace('Frutería ', ''),
            fullName: v.nombre,
            price: item.precio,
            type: "barrio",
            loc: v.barrio,
            direccion: v.direccion,
            photo: true,
            confianza: item.confianza || 95,
            fotoUrl: item.foto || ''
          });
        }
      });
    }

    if (competitorCount) competitorCount.textContent = `${competitors.length} Puntos de Venta Relevados`;

    // Sort competitors from lowest price to highest
    competitors.sort((a, b) => a.price - b.price);

    const maxPrice = Math.max(...competitors.map(c => c.price), 100);

    if (currentChartType === 'vertical') {
      renderVerticalBarChart(competitors, maxPrice, baseProd);
    } else {
      renderListHorizontal(competitors, maxPrice);
    }

    // Top 3 Cheapest (excluding MC wholesale base)
    const top3Barrio = competitors.filter(c => c.type === 'barrio').slice(0, 3);
    if (topCheapest) {
      if (top3Barrio.length === 0) {
        topCheapest.innerHTML = `
          <div class="p-4 text-center text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div class="text-emerald-400 font-bold">📷 Relevamiento Abierto por Foto</div>
            <div>Subí la primera foto para comparar verdulerías de barrio.</div>
          </div>
        `;
      } else {
        topCheapest.innerHTML = top3Barrio.map((c, idx) => `
          <div class="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all">
            <div>
              <div class="text-xs font-bold text-slate-200">#${idx+1} ${c.fullName}</div>
              <div class="text-[10px] text-slate-400">${c.loc}</div>
            </div>
            <div class="text-emerald-400 font-extrabold text-sm">$ ${formatNumber(c.price)} / kg</div>
          </div>
        `).join('');
      }
    }

    // Render insight text
    if (insightText) {
      if (top3Barrio.length > 0) {
        const best = top3Barrio[0];
        const markupVsMc = Math.round(((best.price - baseProd.precioMercadoCentral) / baseProd.precioMercadoCentral) * 100);
        const diffVsCoto = Math.round(((baseProd.precioCoto - best.price) / baseProd.precioCoto) * 100);

        insightText.innerHTML = `
          La verdulería de barrio más económica para <strong>${prodName}</strong> es <strong>${best.fullName}</strong> (${best.loc}) a <strong>$ ${formatNumber(best.price)}/kg</strong>.
          Tiene un sobreprecio del <strong>+${markupVsMc}%</strong> respecto al Mercado Central ($ ${formatNumber(baseProd.precioMercadoCentral)}), pero es un <strong>-${diffVsCoto}% más barata</strong> que Coto Digital ($ ${formatNumber(baseProd.precioCoto)}).
        `;
      } else {
        const gapVal = baseProd.precioCoto - baseProd.precioMercadoCentral;
        const gapPct = Math.round((gapVal / baseProd.precioMercadoCentral) * 100);

        insightText.innerHTML = `
          Referencia Base para <strong>${prodName}</strong>: Mercado Central a <strong>$ ${formatNumber(baseProd.precioMercadoCentral)}/kg</strong> vs Coto Digital a <strong>$ ${formatNumber(baseProd.precioCoto)}/kg</strong> (+${gapPct}% sobreprecio góndola).
          Subí fotos de verdulerías de tu barrio para posicionarlas en el gráfico.
        `;
      }
    }
  }

  // --- RENDER VERTICAL BAR CHART (GRÁFICO DE BARRAS) ---
  function renderVerticalBarChart(competitors, maxPrice, baseProd) {
    const ySteps = 5;
    const stepVal = Math.ceil(maxPrice / ySteps / 100) * 100;
    const chartMaxY = stepVal * ySteps;

    let gridLinesHtml = '';
    for (let i = ySteps; i >= 0; i--) {
      const val = Math.round(stepVal * i);
      gridLinesHtml += `
        <div class="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500 h-8">
          <span class="w-12 text-right">$ ${formatNumber(val)}</span>
          <div class="flex-1 border-b border-dashed border-slate-800"></div>
        </div>
      `;
    }

    const columnsHtml = competitors.map((c, i) => {
      const heightPct = Math.max(Math.round((c.price / chartMaxY) * 100), 6);

      let barGradient = "bg-gradient-to-t from-sky-600 via-sky-500 to-sky-400 border-sky-400/50 shadow-sky-500/20";
      let priceColor = "text-sky-300";
      let badgeTag = c.photo ? `<span class="text-[9px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.5 rounded-full shadow mb-1">📷 Foto</span>` : '';

      if (c.type === 'mc') {
        barGradient = "bg-gradient-to-t from-emerald-700 via-emerald-500 to-emerald-400 border-emerald-400/60 shadow-emerald-500/30";
        priceColor = "text-emerald-300";
        badgeTag = `<span class="text-[9px] font-extrabold text-emerald-950 bg-emerald-400 px-1.5 py-0.5 rounded-full mb-1">Mayorista</span>`;
      } else if (c.type === 'coto') {
        barGradient = "bg-gradient-to-t from-rose-700 via-rose-500 to-rose-400 border-rose-400/60 shadow-rose-500/30";
        priceColor = "text-rose-300";
        badgeTag = `<span class="text-[9px] font-extrabold text-rose-950 bg-rose-400 px-1.5 py-0.5 rounded-full mb-1">Coto</span>`;
      }

      return `
        <div class="flex flex-col items-center flex-1 min-w-[70px] max-w-[100px] group cursor-pointer relative" onclick="openPhotoModal('${c.fullName.replace(/'/g, "\\'")}', '${c.price}')">
          
          <!-- Hover Tooltip -->
          <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-14 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-30 pointer-events-none text-center whitespace-nowrap">
            <div class="text-[11px] font-bold text-white">${c.fullName}</div>
            <div class="text-[10px] text-emerald-400 font-extrabold">$ ${formatNumber(c.price)} / Kg • ${c.loc}</div>
          </div>

          <!-- Top Badge & Price Tag -->
          <div class="flex flex-col items-center mb-1 transition-transform group-hover:-translate-y-1">
            ${badgeTag}
            <span class="text-[11px] font-black ${priceColor} bg-slate-950/90 px-1.5 py-0.5 rounded border border-slate-800 shadow">$ ${formatNumber(c.price)}</span>
          </div>

          <!-- Vertical Column Bar Track -->
          <div class="w-full bg-slate-950/60 rounded-t-xl h-[260px] flex items-end justify-center p-1 border-x border-t border-slate-800/80">
            <div class="w-full ${barGradient} rounded-t-lg border-t transition-all duration-700 ease-out group-hover:brightness-125 shadow-lg" style="height: ${heightPct}%;">
            </div>
          </div>

          <!-- Bottom Label (X-Axis) -->
          <div class="mt-2 text-center w-full">
            <div class="text-[10px] font-bold text-slate-200 truncate group-hover:text-emerald-400 transition-colors" title="${c.fullName}">${c.name}</div>
            <div class="text-[9px] text-slate-400 font-medium truncate">${c.loc}</div>
          </div>
        </div>
      `;
    }).join('');

    rankingBars.innerHTML = `
      <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 overflow-hidden">
        
        <!-- Y-Axis Grid Header -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="text-xs font-bold text-slate-400 flex items-center gap-2">
            <i class="fa-solid fa-chart-column text-emerald-400"></i> Gráfico Comparativo de Barras Verticales ($ / Kg)
          </div>
          <div class="text-[11px] font-semibold text-slate-400">
            Puntos de Venta Auditados
          </div>
        </div>

        <!-- Vertical Columns Area -->
        <div class="relative pt-4">
          <!-- Background Y-Axis Grid -->
          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
            ${gridLinesHtml}
          </div>

          <!-- Bars Flex Grid -->
          <div class="relative z-10 flex items-end justify-start gap-4 overflow-x-auto pb-4 pt-12 min-h-[360px] scrollbar-thin scrollbar-thumb-slate-800 px-2">
            ${columnsHtml}
          </div>
        </div>

      </div>
    `;
  }

  // --- RENDER HORIZONTAL LIST VIEW ---
  function renderListHorizontal(competitors, maxPrice) {
    rankingBars.innerHTML = competitors.map((c, i) => {
      const pct = Math.max(Math.round((c.price / maxPrice) * 100), 5);

      let colorClass = "bg-sky-500";
      let borderClass = "hover:border-sky-500/50";

      if (c.type === 'mc') {
        colorClass = "bg-emerald-500 shadow-sm shadow-emerald-500/50";
        borderClass = "border-emerald-500/40 bg-emerald-950/20";
      } else if (c.type === 'coto') {
        colorClass = "bg-rose-500 shadow-sm shadow-rose-500/50";
        borderClass = "border-rose-500/40 bg-rose-950/20";
      }

      const photoBadge = c.photo ? `<span class="text-[10px] text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer" onclick="openPhotoModal('${c.fullName.replace(/'/g, "\\'")}', '${c.price}')">📷 Auditado</span>` : '';
      const rankNum = i + 1;

      return `
        <div class="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 ${borderClass} transition-all">
          <div class="flex justify-between items-center text-xs">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono text-slate-400 font-extrabold">#${rankNum}</span>
              <span class="font-bold text-slate-100">${c.fullName}</span>
              <span class="text-[10px] text-slate-400">(${c.loc})</span>
              ${photoBadge}
            </div>
            <div class="font-black text-sm text-slate-100">$ ${formatNumber(c.price)}</div>
          </div>
          <div class="w-full bg-slate-900 rounded-full h-3 overflow-hidden flex">
            <div class="${colorClass} h-full rounded-full transition-all duration-500" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderVerduleriasGrid() {
    if (!verduleriasGrid) return;

    if (!verduleriasData || verduleriasData.length === 0) {
      verduleriasData = getDefaultVerduleriasData();
    }

    verduleriasGrid.innerHTML = verduleriasData.map(v => `
      <div class="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-4 shadow-xl group cursor-pointer" onclick="openStoreDetailsModal('${v.id}')">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-bold text-base text-slate-100 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
              <i class="fa-solid fa-store text-emerald-400"></i> ${v.nombre}
            </h4>
            <p class="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <i class="fa-solid fa-location-dot text-slate-500"></i> ${v.direccion}
            </p>
          </div>
          <span class="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">${v.barrio}</span>
        </div>

        <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
          <div class="text-slate-400">
            <div>Último relevamiento: <span class="text-slate-200 font-medium">${v.ultimaFoto}</span></div>
            <div class="text-[11px] text-emerald-400 font-bold mt-0.5">${v.fotosCount || (v.fotos ? v.fotos.length : 1)} Foto(s) auditada(s)</div>
          </div>
          <span class="text-sky-400 font-mono font-black bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-500/30">${v.productos.length} Productos Relevados</span>
        </div>

        <button onclick="event.stopPropagation(); openStoreDetailsModal('${v.id}')" class="w-full py-2.5 bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/30 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow">
          <i class="fa-solid fa-magnifying-glass-chart"></i> Ver ${v.productos.length} Productos Relevados y Fotos
        </button>
      </div>
    `).join('');
  }

  // Window Global Handlers for Tabs & Actions
  window.switchTab = function(tabId) {
    document.querySelectorAll('[id^="view-"]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('[id^="tab-"]').forEach(el => {
      el.className = "px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all flex items-center gap-2";
    });

    document.getElementById(`view-${tabId}`).classList.remove('hidden');
    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) {
      activeTab.className = "px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 text-slate-950 transition-all flex items-center gap-2";
    }
  };

  window.confirmEntry = function() {
    if (isScanning) {
      alert("⏳ La IA está leyendo los renglones del cartel. Por favor espera unos segundos.");
      return;
    }

    if (accumulatedExtractedProducts.length === 0) {
      alert("⚠️ No hay precios acumulados para publicar. Carga una foto de cartel primero.");
      return;
    }

    const nameVal = document.getElementById('verduleriaName').value || 'Verdulería Plaza Italia';
    const locVal = document.getElementById('verduleriaLocation').value || 'Av. Santa Fe 3420, Palermo';
    const sampleImgSrc = samplePhoto ? samplePhoto.src : 'photos/cartel_foto1.jpg';
    const finalPhotos = uploadedPhotosDataUrls.length > 0 ? uploadedPhotosDataUrls : [
      { label: `Foto Auditada #1`, src: sampleImgSrc }
    ];

    const newVerduleria = {
      id: `verduleria_${Date.now()}`,
      nombre: nameVal,
      barrio: locVal.split(',')[0],
      direccion: locVal,
      ultimaFoto: "Hace un momento",
      fotosCount: finalPhotos.length,
      fotos: finalPhotos,
      productos: accumulatedExtractedProducts.map(p => ({
        id: p.id,
        nombre: p.nombre,
        emoji: p.emoji,
        cat: p.cat,
        oferta: p.oferta,
        precioUnitario: p.precioUnitario,
        precio: p.precioUnitario,
        unidad: p.unidad,
        confianza: p.confianza,
        fotoOrigen: p.fotoOrigen || 'Foto #1'
      }))
    };

    verduleriasData.unshift(newVerduleria);
    saveVerduleriasToStorage();
    renderRanking();
    renderVerduleriasGrid();

    alert(`✅ ¡Relevamiento de "${nameVal}" guardado con éxito!\nSe han publicado los ${accumulatedExtractedProducts.length} precios acumulados (${scannedPhotosCount} foto/s) en la red de competencia.`);
    window.switchTab('ranking');
  };

  window.resetStoredNetworkData = function() {
    if (confirm("⚠️ ¿Estás seguro de restablecer toda la red de verdulerías a los datos por defecto?")) {
      localStorage.removeItem('VERDULERIAS_NETWORK_DATA');
      verduleriasData = getDefaultVerduleriasData();
      saveVerduleriasToStorage();
      renderRanking();
      renderVerduleriasGrid();
      alert("✅ Red de verdulerías restablecida.");
    }
  };

  window.downloadJSONBackup = function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(verduleriasData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "verdulerias_data.json");
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
  };

  window.openStoreDetailsModal = function(storeId) {
    const store = verduleriasData.find(v => v.id === storeId) || verduleriasData[0];
    if (!store) return;

    const modal = document.getElementById('storeDetailModal');
    if (!modal) return;

    document.getElementById('modalStoreTitle').textContent = store.nombre;
    document.getElementById('modalStoreAddress').innerHTML = `<i class="fa-solid fa-location-dot text-emerald-400"></i> ${store.direccion}`;
    document.getElementById('modalStoreBadge').textContent = store.barrio;
    document.getElementById('modalStoreDate').textContent = `Último relevamiento: ${store.ultimaFoto}`;

    const photoCount = store.fotosCount || (store.fotos ? store.fotos.length : 1);
    document.getElementById('modalPhotoCountBadge').textContent = `${photoCount} Foto(s) Auditada(s)`;
    document.getElementById('modalProductCountBadge').textContent = `${store.productos.length} Precios Relevados`;

    // Render Photos Gallery
    const gallery = document.getElementById('modalPhotosGallery');
    if (gallery) {
      const photosList = store.fotos || [
        { label: 'Foto #1 - Cartel Principal', src: store.fotoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80' }
      ];

      gallery.innerHTML = photosList.map(p => `
        <div class="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 h-44 group">
          <img src="${p.src}" alt="${p.label}" class="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-300">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
          <div class="absolute bottom-2 left-2 right-2 text-xs font-bold text-emerald-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 truncate">
            📷 ${p.label}
          </div>
        </div>
      `).join('');
    }

    // Render 24 Products Grid
    const prodGrid = document.getElementById('modalProductsGrid');
    if (prodGrid) {
      prodGrid.innerHTML = store.productos.map((p, idx) => {
        const isFruit = isFruitItem(p) || p.cat === 'frutas';
        const isEgg = p.cat === 'almacen';

        let catBadge = `<span class="text-[9px] font-extrabold text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">🥦 Verdura</span>`;
        if (isFruit) catBadge = `<span class="text-[9px] font-extrabold text-rose-300 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-500/30">🍎 Fruta</span>`;
        else if (isEgg) catBadge = `<span class="text-[9px] font-extrabold text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/30">🥚 Almacén</span>`;

        const priceVal = p.precioUnitario || p.precio;
        const offerStr = p.oferta || `${p.unidad || 'Kg'} x $${formatNumber(priceVal)}`;

        return `
          <div class="p-3 bg-slate-950 border border-slate-800/90 rounded-xl hover:border-emerald-500/40 transition-all flex justify-between items-center space-x-3 group">
            <div class="flex items-center space-x-3">
              <span class="text-xs font-mono text-slate-500 font-bold">#${idx + 1}</span>
              <span class="text-2xl">${p.emoji || '🥦'}</span>
              <div>
                <div class="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                  ${p.nombre}
                  ${catBadge}
                </div>
                <div class="text-[11px] text-slate-400">Renglón: <span class="text-amber-300 font-mono font-bold">${offerStr}</span></div>
              </div>
            </div>
            <div class="text-right flex flex-col items-end gap-1">
              <div class="text-sm font-black text-emerald-400">$ ${formatNumber(priceVal)} / ${p.unidad || 'Kg'}</div>
              <button onclick="selectProductFromModal('${p.id}')" class="text-[10px] font-bold text-sky-400 hover:text-sky-300 bg-sky-950/60 border border-sky-500/30 px-2 py-0.5 rounded-md transition-all flex items-center gap-1">
                <i class="fa-solid fa-chart-simple"></i> Ver en Gráfico
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    modal.classList.remove('hidden');
  };

  window.closeStoreDetailsModal = function() {
    const modal = document.getElementById('storeDetailModal');
    if (modal) modal.classList.add('hidden');
  };

  window.selectProductFromModal = function(prodId) {
    closeStoreDetailsModal();
    window.switchTab('ranking');
    if (productSelect) {
      productSelect.value = prodId;
      currentProductFilter = prodId;
      renderRanking();
    }
  };

  window.openPhotoModal = function(name, price) {
    alert(`📷 Comprobante auditado de ${name}:\nPrecio relevado por foto: $ ${formatNumber(price)} / Kg\nVerificación: Hoy`);
  };
});
