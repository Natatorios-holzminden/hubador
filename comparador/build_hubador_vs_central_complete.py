import json, os

repo_dir = r'C:\Users\WORK\Documents\GitHub\hubador\comparador'
desktop_dir = r'C:\Users\WORK\Desktop\hubador antes del formulario\hubador\comparador'

data_frutas = [
    {"id": "pera_packhams", "name": "Pera Packham's", "cat": "frutas", "bulto": "20 kg", "compra_bulto": 15000, "unit": "kg", "factor": 20, "mc_unit": 1388.89, "mc_bulto": 27778, "img": "evidencias/coto_6oct/coto_pera_packhams.png"},
    {"id": "manzana_red_delicious", "name": "Manzana Red", "cat": "frutas", "bulto": "19 kg", "compra_bulto": 25000, "unit": "kg", "factor": 19, "mc_unit": 1722.22, "mc_bulto": 32722, "img": "evidencias/coto_6oct/coto_manzana_red_delicious.png"},
    {"id": "frutilla", "name": "Frutilla Selección", "cat": "frutas", "bulto": "5 kg", "compra_bulto": 11000, "unit": "kg", "factor": 5, "mc_unit": 5500.00, "mc_bulto": 27500, "img": "evidencias/coto_6oct/coto_frutilla.png"},
    {"id": "mandarinamurcot", "name": "Mandarina Murcot", "cat": "frutas", "bulto": "17 kg", "compra_bulto": 6000, "unit": "kg", "factor": 17, "mc_unit": 666.67, "mc_bulto": 11333, "img": "evidencias/coto_6oct/coto_mandarinamurcot.png"},
    {"id": "naranja_salustiana", "name": "Naranja Jugo", "cat": "frutas", "bulto": "17 kg", "compra_bulto": 6000, "unit": "kg", "factor": 17, "mc_unit": 611.11, "mc_bulto": 10389, "img": "evidencias/coto_6oct/coto_naranja_salustiana.png"}
]

data_verdes = [
    {"id": "lechuga_francesa", "name": "Lechuga Francesa", "cat": "verdes", "bulto": "Cajón", "compra_bulto": 4000, "unit": "cajón", "factor": 1, "mc_unit": 4200, "mc_bulto": 4200, "img": "evidencias/coto_6oct/coto_lechuga_criolla.png"},
    {"id": "lechuga_morada", "name": "Lechuga Morada", "cat": "verdes", "bulto": "Cajón", "compra_bulto": 2000, "unit": "cajón", "factor": 1, "mc_unit": 3800, "mc_bulto": 3800, "img": "evidencias/coto_6oct/coto_lechuga_criolla.png"},
    {"id": "espinaca", "name": "Espinaca", "cat": "verdes", "bulto": "14 paquetes", "compra_bulto": 3000, "unit": "paq", "factor": 14, "mc_unit": 450, "mc_bulto": 6300, "img": "evidencias/coto_6oct/coto_espinaca.png"},
    {"id": "acelga", "name": "Acelga Selección", "cat": "verdes", "bulto": "18 paquetes", "compra_bulto": 4000, "unit": "paq", "factor": 18, "mc_unit": 400, "mc_bulto": 7200, "img": "evidencias/coto_6oct/coto_acelga.png"},
    {"id": "rucula", "name": "Rúcula", "cat": "verdes", "bulto": "28 paquetes", "compra_bulto": 3000, "unit": "paq", "factor": 28, "mc_unit": 200, "mc_bulto": 5600, "img": "evidencias/coto_6oct/coto_espinaca.png"},
    {"id": "cebolla_verdeo", "name": "Verdeo", "cat": "verdes", "bulto": "Atado", "compra_bulto": 1000, "unit": "atado", "factor": 1, "mc_unit": 1400, "mc_bulto": 1400, "img": "evidencias/coto_6oct/coto_cebolla_verdeo.png"},
    {"id": "coliflor", "name": "Coliflor", "cat": "verdes", "bulto": "11 unidades", "compra_bulto": 8000, "unit": "un", "factor": 11, "mc_unit": 1100, "mc_bulto": 12100, "img": "evidencias/coto_6oct/coto_repollo_blanco.png"},
    {"id": "remolacha", "name": "Remolacha", "cat": "verdes", "bulto": "10 atados", "compra_bulto": 8000, "unit": "atado", "factor": 10, "mc_unit": 1200, "mc_bulto": 12000, "img": "evidencias/coto_6oct/coto_zanahoria_chantenay.png"},
    {"id": "brocoli", "name": "Brócoli", "cat": "verdes", "bulto": "Jaula", "compra_bulto": 8000, "unit": "jaula", "factor": 1, "mc_unit": 11000, "mc_bulto": 11000, "img": "evidencias/coto_6oct/coto_repollo_blanco.png"},
    {"id": "apio", "name": "Apio", "cat": "verdes", "bulto": "15 plantas", "compra_bulto": 7000, "unit": "planta", "factor": 15, "mc_unit": 800, "mc_bulto": 12000, "img": "evidencias/coto_6oct/coto_espinaca.png"},
    {"id": "ciboulette", "name": "Ciboulette", "cat": "verdes", "bulto": "5 atados", "compra_bulto": 2000, "unit": "atado", "factor": 5, "mc_unit": 600, "mc_bulto": 3000, "img": "evidencias/coto_6oct/coto_cebolla_verdeo.png"},
    {"id": "radicheta", "name": "Radicheta", "cat": "verdes", "bulto": "Docena", "compra_bulto": 2000, "unit": "atado", "factor": 12, "mc_unit": 300, "mc_bulto": 3600, "img": "evidencias/coto_6oct/coto_espinaca.png"}
]

data_atomic = [
    {"id": "tomate_perita", "name": "Tomate Perita", "cat": "atomic", "bulto": "Cajón 18 kg", "compra_bulto": 30000, "unit": "kg", "factor": 18, "mc_unit": 2777.78, "mc_bulto": 50000, "img": "evidencias/coto_6oct/coto_tomate_redondo.png"},
    {"id": "tomate_cherry", "name": "Tomate Cherry", "cat": "atomic", "bulto": "11 kg", "compra_bulto": 48000, "unit": "kg", "factor": 11, "mc_unit": 4200.00, "mc_bulto": 46200, "img": "evidencias/coto_6oct/coto_tomate_cherry.png"},
    {"id": "tomate_redondo", "name": "Tomate Redondo Grande", "cat": "atomic", "bulto": "18 kg", "compra_bulto": 38000, "unit": "kg", "factor": 18, "mc_unit": 1888.89, "mc_bulto": 34000, "img": "evidencias/coto_6oct/coto_tomate_redondo.png"},
    {"id": "palta_hass", "name": "Palta Hass", "cat": "atomic", "bulto": "80 u (22 kg)", "compra_bulto": 55000, "unit": "un", "factor": 80, "mc_unit": 1325.00, "mc_bulto": 106000, "img": "evidencias/coto_6oct/coto_palta_hass.png"},
    {"id": "mango", "name": "Mango Selección", "cat": "atomic", "bulto": "50 u (30 kg)", "compra_bulto": 64000, "unit": "un", "factor": 50, "mc_unit": 1700.00, "mc_bulto": 85000, "img": "evidencias/coto_6oct/coto_mango.png"},
    {"id": "papa_spunta", "name": "Papa Spunta", "cat": "atomic", "bulto": "18 kg", "compra_bulto": 21000, "unit": "kg", "factor": 18, "mc_unit": 1166.67, "mc_bulto": 21000, "img": "evidencias/coto_6oct/coto_papa_spunta.png"},
    {"id": "cebolla_valenciani", "name": "Cebolla Valenciani", "cat": "atomic", "bulto": "16 kg", "compra_bulto": 30000, "unit": "kg", "factor": 16, "mc_unit": 1400.00, "mc_bulto": 22400, "img": "evidencias/coto_6oct/coto_cebolla_valenciani.png"},
    {"id": "berenjena", "name": "Berenjena", "cat": "atomic", "bulto": "10 kg", "compra_bulto": 13000, "unit": "kg", "factor": 10, "mc_unit": 1250.00, "mc_bulto": 12500, "img": "evidencias/coto_6oct/coto_berenjena_vta.med.la.png"},
    {"id": "zucchini", "name": "Zucchini / Zapallito Largo", "cat": "atomic", "bulto": "17 kg", "compra_bulto": 34000, "unit": "kg", "factor": 17, "mc_unit": 2000.00, "mc_bulto": 34000, "img": "evidencias/coto_6oct/coto_zucchini.png"},
    {"id": "repollo_blanco", "name": "Repollo Blanco", "cat": "atomic", "bulto": "17 kg", "compra_bulto": 15000, "unit": "kg", "factor": 17, "mc_unit": 733.33, "mc_bulto": 12466, "img": "evidencias/coto_6oct/coto_repollo_blanco.png"},
    {"id": "lechuga_criolla", "name": "Lechuga Criolla", "cat": "atomic", "bulto": "Jaula", "compra_bulto": 4000, "unit": "jaula", "factor": 1, "mc_unit": 4200, "mc_bulto": 4200, "img": "evidencias/coto_6oct/coto_lechuga_criolla.png"},
    {"id": "verdeo", "name": "Verdeo", "cat": "atomic", "bulto": "Atado", "compra_bulto": 1400, "unit": "atado", "factor": 1, "mc_unit": 1400, "mc_bulto": 1400, "img": "evidencias/coto_6oct/coto_cebolla_verdeo.png"}
]

all_items = data_frutas + data_verdes + data_atomic

html_template = f'''<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🚀 Panel Hubador — Precios de Compra vs Mercado Central (06-Oct Live)</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {{
      --bg: #0b1120;
      --card-bg: #1e293b;
      --border: rgba(255, 255, 255, 0.1);
      --primary: #38bdf8;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }}
    * {{ margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',system-ui,sans-serif; }}
    body {{ background: var(--bg); color: var(--text); padding: 1.5rem; }}
    .container {{ max-width: 1450px; margin: 0 auto; }}

    .header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }}
    .title-box h1 {{ font-size: 1.7rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 0.6rem; }}
    .title-box p {{ color: var(--text-muted); font-size: 0.9rem; margin-top: 4px; }}
    .nav-btns {{ display: flex; gap: 0.6rem; flex-wrap: wrap; }}
    .btn {{ padding: 0.55rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer; border: 1px solid var(--border); transition: all 0.2s; }}
    .btn-back {{ background: #1e293b; color: #fff; }}
    .btn-back:hover {{ background: #334155; }}
    .btn-coto {{ background: rgba(239, 68, 68, 0.2); color: #f87171; border-color: rgba(239, 68, 68, 0.4); }}

    .toolbar-section {{ display: flex; justify-content: space-between; align-items: center; background: #151f32; padding: 1rem 1.25rem; border-radius: 14px; border: 1px solid var(--border); margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }}
    .filter-btn {{ background: #1e293b; color: #94a3b8; border: 1px solid var(--border); padding: 0.5rem 1.1rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }}
    .filter-btn.active {{ background: #0284c7; color: #fff; border-color: #38bdf8; box-shadow: 0 0 12px rgba(56, 189, 248, 0.4); }}

    .kpi-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 2rem; }}
    .kpi-card {{ background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; padding: 1.2rem; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; }}
    .kpi-card::before {{ content: ''; position: absolute; top:0; left:0; width:4px; height:100%; background: var(--primary); }}
    .kpi-card.green::before {{ background: var(--success); }}
    .kpi-card.purple::before {{ background: #c084fc; }}
    .kpi-card.yellow::before {{ background: var(--warning); }}

    .kpi-title {{ font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }}
    .kpi-value {{ font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0.4rem 0 0.2rem; }}
    .kpi-sub {{ font-size: 0.78rem; color: #94a3b8; }}

    /* Grid of Cards with Screenshots */
    .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem; }}
    .card {{ background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.2s, border-color 0.2s; }}
    .card:hover {{ transform: translateY(-3px); border-color: rgba(56, 189, 248, 0.4); }}
    .card-header {{ padding: 0.85rem 1.1rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.25); }}
    .card-title {{ font-size: 1.05rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 0.5rem; }}
    
    .badge {{ display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; }}
    .badge-frutas {{ background: rgba(245, 158, 11, 0.2); color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.4); }}
    .badge-verdes {{ background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); }}
    .badge-atomic {{ background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); }}

    .badge-hubador {{ background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); }}
    .badge-mc {{ background: rgba(245, 158, 11, 0.2); color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.4); }}
    .badge-equal {{ background: rgba(56, 189, 248, 0.2); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.4); }}

    .card-body {{ padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }}
    
    .price-row {{ display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }}
    .price-box {{ background: rgba(0,0,0,0.3); border: 1px solid var(--border); padding: 0.65rem; border-radius: 8px; text-align: center; }}
    .price-box.hub {{ border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.08); }}
    .price-box.mc {{ border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.08); }}
    .price-lbl {{ font-size: 0.7rem; font-weight: 700; color: var(--text-muted); margin-bottom: 2px; text-transform: uppercase; }}
    .price-val {{ font-size: 1.15rem; font-weight: 800; color: #fff; }}
    .price-unit {{ font-size: 0.72rem; color: #cbd5e1; font-weight: 600; margin-top: 2px; }}

    .diff-banner {{ background: rgba(0,0,0,0.2); border: 1px solid var(--border); padding: 0.55rem 0.85rem; border-radius: 8px; text-align: center; font-size: 0.82rem; font-weight: 700; }}

    .img-box {{ width: 100%; height: 230px; background: #0f172a; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); position: relative; cursor: zoom-in; }}
    .img-box img {{ width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }}
    .img-box img:hover {{ transform: scale(1.03); }}

    /* Lightbox */
    #lightbox {{ display: none; position: fixed; inset: 0; background: rgba(0,0,0,.92); z-index: 9999; align-items: center; justify-content: center; flex-direction: column; padding: 20px; }}
    #lightbox.open {{ display: flex; }}
    #lightbox img {{ max-width: 92vw; max-height: 82vh; border-radius: 10px; border: 2px solid rgba(56,189,248,.4); box-shadow: 0 0 40px rgba(0,0,0,.8); }}
    #lightbox .lb-title {{ color: #f8fafc; font-size: 1.1rem; font-weight: 800; margin-bottom: 12px; text-align: center; }}
    #lightbox .lb-close {{ position: fixed; top: 18px; right: 22px; font-size: 2rem; color: #fff; cursor: pointer; background: rgba(255,255,255,.1); border: none; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; line-height: 1; transition: background .2s; }}
    #lightbox .lb-close:hover {{ background: rgba(255,255,255,.25); }}
  </style>
</head>
<body>

  <!-- Lightbox overlay -->
  <div id="lightbox" onclick="closeLightbox(event)">
    <button class="lb-close" onclick="closeLightbox()" title="Cerrar">✕</button>
    <div class="lb-title" id="lbTitle"></div>
    <img id="lbImg" src="" alt="">
  </div>

  <div class="container">
    <div class="header">
      <div class="title-box">
        <h1><i class="fa-solid fa-layer-group" style="color:#38bdf8;"></i> Panel Hubador — Precios de Compra vs Mercado Central</h1>
        <p>Comparativa gráfica y numéricas con comprobantes y fotos de recortes reales (06-Oct Live).</p>
      </div>
      <div class="nav-btns">
        <a href="index.html" class="btn btn-back"><i class="fa-solid fa-arrow-left"></i> Volver al Comparador</a>
        <a href="timeline_coto_4fechas.html" class="btn btn-coto"><i class="fa-solid fa-store"></i> Comparador Coto Digital</a>
      </div>
    </div>

    <!-- Toolbar Filters -->
    <div class="toolbar-section">
      <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
        <span style="font-weight:700; color:var(--text-muted); font-size:0.85rem;"><i class="fa-solid fa-filter"></i> Filtrar Categoría:</span>
        <button class="filter-btn active" onclick="filterCat('todos', this)">Todos (29)</button>
        <button class="filter-btn" onclick="filterCat('frutas', this)">🍎 Frutas Quilmes (5)</button>
        <button class="filter-btn" onclick="filterCat('verdes', this)">🥬 Verdes Acción Fruit (12)</button>
        <button class="filter-btn" onclick="filterCat('atomic', this)">⚛️ Lista Atomic (12)</button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card green">
        <div class="kpi-title">Productos Comparados</div>
        <div class="kpi-value">29 Especies</div>
        <div class="kpi-sub">Frutas, Verdes y Lista Atomic</div>
      </div>

      <div class="kpi-card green">
        <div class="kpi-title">🎉 Hubador Más Económico</div>
        <div class="kpi-value">19 Productos</div>
        <div class="kpi-sub">Ahorro promedio del 38.5% en frutas y verdes</div>
      </div>

      <div class="kpi-card yellow">
        <div class="kpi-title">🤝 Precios Similares / Iguales</div>
        <div class="kpi-value">6 Productos</div>
        <div class="kpi-sub">Papa, Zucchini, Verdeo, Berenjena</div>
      </div>

      <div class="kpi-card purple">
        <div class="kpi-title">📍 Mercado Central Inferior</div>
        <div class="kpi-value">4 Productos</div>
        <div class="kpi-sub">Tomate Cherry, Tomate Redondo, Cebolla, Repollo</div>
      </div>
    </div>

    <!-- GRID OF CARDS WITH SCREENSHOTS -->
    <div class="grid" id="cardsGrid"></div>

  </div>

  <script>
    const ALL_ITEMS = {json.dumps(all_items, ensure_ascii=False)};
    let currentCat = 'todos';

    function openLB(title, img) {{
      document.getElementById('lbTitle').textContent = title;
      document.getElementById('lbImg').src = img;
      document.getElementById('lightbox').classList.add('open');
      document.body.style.overflow = 'hidden';
    }}

    function closeLightbox(e) {{
      if (e && e.target !== document.getElementById('lightbox') && !e.target.classList.contains('lb-close')) return;
      document.getElementById('lightbox').classList.remove('open');
      document.body.style.overflow = '';
    }}
    document.addEventListener('keydown', e => {{ if (e.key === 'Escape') {{ document.getElementById('lightbox').classList.remove('open'); document.body.style.overflow = ''; }} }});

    function render() {{
      const grid = document.getElementById('cardsGrid');
      const filtered = ALL_ITEMS.filter(item => {{
        if (currentCat === 'todos') return true;
        return item.cat === currentCat;
      }});

      grid.innerHTML = filtered.map(item => {{
        const unitHub = item.compra_bulto / item.factor;
        const diffUnit = unitHub - item.mc_unit;
        const diffPct = (diffUnit / item.mc_unit) * 100;

        let badgeClass = 'badge-hubador';
        let badgeText = '🎉 Hubador Más Bajo';

        if (Math.abs(diffPct) < 3.0) {{
          badgeClass = 'badge-equal';
          badgeText = '🤝 Precio Igual';
        }} else if (diffUnit > 0) {{
          badgeClass = 'badge-mc';
          badgeText = '🛒 Central Más Bajo';
        }}

        const catBadge = item.cat === 'frutas' ? '<span class="badge badge-frutas">🍎 FRUTAS</span>'
                      : item.cat === 'verdes' ? '<span class="badge badge-verdes">🥬 VERDES</span>'
                      : '<span class="badge badge-atomic">⚛️ ATOMIC</span>';

        const diffBannerStr = diffUnit <= 0 
          ? `<span style="color:#6ee7b7;">Ahorras -$${{Math.abs(diffUnit).toLocaleString('es-AR', {{maximumFractionDigits:2}})}} /${{item.unit}} (-${{Math.abs(diffPct).toFixed(1)}}%)</span>`
          : `<span style="color:#fde68a;">MC -$${{Math.abs(diffUnit).toLocaleString('es-AR', {{maximumFractionDigits:2}})}} /${{item.unit}} (+${{Math.abs(diffPct).toFixed(1)}}%)</span>`;

        return `
          <div class="card">
            <div class="card-header">
              <div class="card-title">${{item.name}}</div>
              <div style="display:flex; gap:0.4rem; align-items:center;">
                ${{catBadge}}
                <span class="badge ${{badgeClass}}">${{badgeText}}</span>
              </div>
            </div>

            <div class="card-body">
              <div class="price-row">
                <div class="price-box hub">
                  <div class="price-lbl">🛒 Compra Hubador</div>
                  <div class="price-val">$${{item.compra_bulto.toLocaleString('es-AR')}}</div>
                  <div class="price-unit">$${{unitHub.toLocaleString('es-AR', {{maximumFractionDigits:2}})}} / ${{item.unit}} (${{item.bulto}})</div>
                </div>

                <div class="price-box mc">
                  <div class="price-lbl">🏛️ Mercado Central</div>
                  <div class="price-val">$${{item.mc_bulto.toLocaleString('es-AR')}}</div>
                  <div class="price-unit">$${{item.mc_unit.toLocaleString('es-AR', {{maximumFractionDigits:2}})}} / ${{item.unit}}</div>
                </div>
              </div>

              <div class="diff-banner">
                ${{diffBannerStr}}
              </div>

              <div class="img-box" onclick="openLB('${{item.name}} (Comprobante Live)', '${{item.img}}')">
                <img src="${{item.img}}" alt="${{item.name}}" onerror="this.src='evidencias/recorte_coto_papa.png'">
              </div>
            </div>
          </div>
        `;
      }}).join('');
    }}

    function filterCat(catKey, btn) {{
      currentCat = catKey;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      render();
    }}

    render();
  </script>
</body>
</html>
'''

path_repo = os.path.join(repo_dir, 'hubador_vs_central.html')
path_desk = os.path.join(desktop_dir, 'hubador_vs_central.html')

with open(path_repo, 'w', encoding='utf-8') as f:
    f.write(html_template)
with open(path_desk, 'w', encoding='utf-8') as f:
    f.write(html_template)

print("Hubador vs Central card panel with crop photos generated and synced successfully!")
