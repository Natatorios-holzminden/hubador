import json, os

repo_dir = r'C:\Users\WORK\Documents\GitHub\hubador\comparador'
desktop_dir = r'C:\Users\WORK\Desktop\hubador antes del formulario\hubador\comparador'

# Dataset definitions
data_frutas = [
    {"name": "Pera", "bulto": "20 kg", "compra_bulto": 15000, "unit": "kg", "factor": 20, "mc_unit": 1388.89, "mc_bulto": 27778},
    {"name": "Manzana Red", "bulto": "19 kg", "compra_bulto": 25000, "unit": "kg", "factor": 19, "mc_unit": 1722.22, "mc_bulto": 32722},
    {"name": "Frutilla", "bulto": "5 kg", "compra_bulto": 11000, "unit": "kg", "factor": 5, "mc_unit": 5500.00, "mc_bulto": 27500},
    {"name": "Mandarina Murcot", "bulto": "17 kg", "compra_bulto": 6000, "unit": "kg", "factor": 17, "mc_unit": 666.67, "mc_bulto": 11333},
    {"name": "Naranja Jugo", "bulto": "17 kg", "compra_bulto": 6000, "unit": "kg", "factor": 17, "mc_unit": 611.11, "mc_bulto": 10389}
]

data_verdes = [
    {"name": "Lechuga Francesa", "bulto": "Cajón", "compra_bulto": 4000, "unit": "cajón", "factor": 1, "mc_unit": 4200, "mc_bulto": 4200},
    {"name": "Lechuga Morada", "bulto": "Cajón", "compra_bulto": 2000, "unit": "cajón", "factor": 1, "mc_unit": 3800, "mc_bulto": 3800},
    {"name": "Espinaca", "bulto": "14 paquetes", "compra_bulto": 3000, "unit": "paq", "factor": 14, "mc_unit": 450, "mc_bulto": 6300},
    {"name": "Acelga", "bulto": "18 paquetes", "compra_bulto": 4000, "unit": "paq", "factor": 18, "mc_unit": 400, "mc_bulto": 7200},
    {"name": "Rúcula", "bulto": "28 paquetes", "compra_bulto": 3000, "unit": "paq", "factor": 28, "mc_unit": 200, "mc_bulto": 5600},
    {"name": "Verdeo", "bulto": "Atado", "compra_bulto": 1000, "unit": "atado", "factor": 1, "mc_unit": 1400, "mc_bulto": 1400},
    {"name": "Coliflor", "bulto": "11 unidades", "compra_bulto": 8000, "unit": "un", "factor": 11, "mc_unit": 1100, "mc_bulto": 12100},
    {"name": "Remolacha", "bulto": "10 atados", "compra_bulto": 8000, "unit": "atado", "factor": 10, "mc_unit": 1200, "mc_bulto": 12000},
    {"name": "Brócoli", "bulto": "Jaula", "compra_bulto": 8000, "unit": "jaula", "factor": 1, "mc_unit": 11000, "mc_bulto": 11000},
    {"name": "Apio", "bulto": "15 plantas", "compra_bulto": 7000, "unit": "planta", "factor": 15, "mc_unit": 800, "mc_bulto": 12000},
    {"name": "Ciboulette", "bulto": "5 atados", "compra_bulto": 2000, "unit": "atado", "factor": 5, "mc_unit": 600, "mc_bulto": 3000},
    {"name": "Radicheta", "bulto": "Docena", "compra_bulto": 2000, "unit": "atado", "factor": 12, "mc_unit": 300, "mc_bulto": 3600}
]

data_atomic = [
    {"name": "Tomate Perita", "bulto": "Cajón 18 kg", "compra_bulto": 30000, "unit": "kg", "factor": 18, "mc_unit": 2777.78, "mc_bulto": 50000},
    {"name": "Tomate Cherry", "bulto": "11 kg", "compra_bulto": 48000, "unit": "kg", "factor": 11, "mc_unit": 4200.00, "mc_bulto": 46200},
    {"name": "Tomate Redondo Grande", "bulto": "18 kg", "compra_bulto": 38000, "unit": "kg", "factor": 18, "mc_unit": 1888.89, "mc_bulto": 34000},
    {"name": "Palta Hass", "bulto": "80 u (22 kg)", "compra_bulto": 55000, "unit": "un", "factor": 80, "mc_unit": 1325.00, "mc_bulto": 106000},
    {"name": "Mango Selección", "bulto": "50 u (30 kg)", "compra_bulto": 64000, "unit": "un", "factor": 50, "mc_unit": 1700.00, "mc_bulto": 85000},
    {"name": "Papa Spunta", "bulto": "18 kg", "compra_bulto": 21000, "unit": "kg", "factor": 18, "mc_unit": 1166.67, "mc_bulto": 21000},
    {"name": "Cebolla Valenciani", "bulto": "16 kg", "compra_bulto": 30000, "unit": "kg", "factor": 16, "mc_unit": 1400.00, "mc_bulto": 22400},
    {"name": "Berenjena", "bulto": "10 kg", "compra_bulto": 13000, "unit": "kg", "factor": 10, "mc_unit": 1250.00, "mc_bulto": 12500},
    {"name": "Zucchini / Zapallito Largo", "bulto": "17 kg", "compra_bulto": 34000, "unit": "kg", "factor": 17, "mc_unit": 2000.00, "mc_bulto": 34000},
    {"name": "Repollo Blanco", "bulto": "17 kg", "compra_bulto": 15000, "unit": "kg", "factor": 17, "mc_unit": 733.33, "mc_bulto": 12466},
    {"name": "Lechuga Criolla", "bulto": "Jaula", "compra_bulto": 4000, "unit": "jaula", "factor": 1, "mc_unit": 4200, "mc_bulto": 4200},
    {"name": "Cebolla de Verdeo", "bulto": "Atado", "compra_bulto": 1400, "unit": "atado", "factor": 1, "mc_unit": 1400, "mc_bulto": 1400}
]

html_template = f'''<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🏷️ Comparador Hubador — Precios de Compra vs Mercado Central Hoy</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {{
      --bg: #090d16;
      --card-bg: #131c2e;
      --card-border: rgba(255, 255, 255, 0.08);
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
    .btn {{ padding: 0.55rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer; border: 1px solid var(--card-border); transition: all 0.2s; }}
    .btn-back {{ background: #1e293b; color: #fff; }}
    .btn-back:hover {{ background: #334155; }}
    .btn-coto {{ background: rgba(239, 68, 68, 0.2); color: #f87171; border-color: rgba(239, 68, 68, 0.4); }}

    .kpi-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 2rem; }}
    .kpi-card {{ background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; padding: 1.2rem; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; }}
    .kpi-card::before {{ content: ''; position: absolute; top:0; left:0; width:4px; height:100%; background: var(--primary); }}
    .kpi-card.green::before {{ background: var(--success); }}
    .kpi-card.purple::before {{ background: #c084fc; }}
    .kpi-card.yellow::before {{ background: var(--warning); }}

    .kpi-title {{ font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }}
    .kpi-value {{ font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0.4rem 0 0.2rem; }}
    .kpi-sub {{ font-size: 0.78rem; color: #94a3b8; }}

    .section-title {{ font-size: 1.3rem; font-weight: 800; color: #fff; margin: 2rem 0 1rem; display: flex; align-items: center; gap: 0.6rem; border-bottom: 2px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem; }}

    .table-box {{ background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; overflow: hidden; margin-bottom: 2.5rem; box-shadow: 0 4px 16px rgba(0,0,0,0.3); }}
    table {{ width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem; }}
    thead {{ background: rgba(0,0,0,0.4); color: var(--text-muted); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px; }}
    th, td {{ padding: 0.9rem 1.1rem; border-bottom: 1px solid rgba(255,255,255,0.05); }}
    tbody tr:hover {{ background: rgba(255,255,255,0.02); }}

    .badge {{ display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; font-weight: 800; padding: 3px 9px; border-radius: 6px; text-transform: uppercase; }}
    .badge-hubador {{ background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); }}
    .badge-mc {{ background: rgba(245, 158, 11, 0.2); color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.4); }}
    .badge-equal {{ background: rgba(56, 189, 248, 0.2); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.4); }}

    .unit-price {{ font-size: 0.76rem; color: var(--text-muted); display: block; margin-top: 2px; }}
    .bulto-price {{ font-weight: 800; color: #fff; font-size: 0.95rem; }}

    .price-hubador {{ color: #6ee7b7; font-weight: 800; }}
    .price-mc {{ color: #fde68a; font-weight: 800; }}
  </style>
</head>
<body>

  <div class="container">
    <div class="header">
      <div class="title-box">
        <h1><i class="fa-solid fa-coins text-warning" style="color:#f59e0b;"></i> Precios de Compra Hubador vs Mercado Central Hoy</h1>
        <p>Comparativa directa entre tus Precios de Compra (sin IVA) y los valores de lista del Mercado Central de Buenos Aires (06-Oct Live).</p>
      </div>
      <div class="nav-btns">
        <a href="index.html" class="btn btn-back"><i class="fa-solid fa-arrow-left"></i> Volver al Comparador</a>
        <a href="timeline_coto_4fechas.html" class="btn btn-coto"><i class="fa-solid fa-store"></i> Comparador Coto Digital</a>
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

    <!-- SECTION 1: FRUTAS -->
    <div class="section-title"><i class="fa-solid fa-apple-whole" style="color:#f87171;"></i> 1) FRUTAS – Quilmes vs Mercado Central</div>
    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Bulto Hubador</th>
            <th>Precio Compra Hubador (sin IVA)</th>
            <th>Precio Mercado Central (Hoy 06-Oct)</th>
            <th>Diferencia / Ahorro Unitario</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody id="tblFrutas"></tbody>
      </table>
    </div>

    <!-- SECTION 2: VERDES -->
    <div class="section-title"><i class="fa-solid fa-leaf" style="color:#4ade80;"></i> 2) VERDES – Quilmes (Acción Fruit) vs Mercado Central</div>
    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Bulto Hubador</th>
            <th>Precio Compra Hubador (sin IVA)</th>
            <th>Precio Mercado Central (Hoy 06-Oct)</th>
            <th>Diferencia / Ahorro Unitario</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody id="tblVerdes"></tbody>
      </table>
    </div>

    <!-- SECTION 3: LISTA ATOMIC -->
    <div class="section-title"><i class="fa-solid fa-atom" style="color:#c084fc;"></i> 3) LISTA ATOMIC – Mercado (Bolivianos / Central) vs Mercado Central</div>
    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Bulto Hubador</th>
            <th>Precio Compra Hubador (sin IVA)</th>
            <th>Precio Mercado Central (Hoy 06-Oct)</th>
            <th>Diferencia / Ahorro Unitario</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody id="tblAtomic"></tbody>
      </table>
    </div>

  </div>

  <script>
    const FRUTAS = {json.dumps(data_frutas, ensure_ascii=False)};
    const VERDES = {json.dumps(data_verdes, ensure_ascii=False)};
    const ATOMIC = {json.dumps(data_atomic, ensure_ascii=False)};

    function renderTable(data, elementId) {{
      const tbody = document.getElementById(elementId);
      tbody.innerHTML = data.map(item => {{
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

        const diffStr = diffUnit <= 0 
          ? `<span style="color:#6ee7b7; font-weight:800;">Ahorras -$${{Math.abs(diffUnit).toLocaleString('es-AR', {{maximumFractionDigits:2}})}} /${{item.unit}} (${{Math.abs(diffPct).toFixed(1)}}%)</span>`
          : `<span style="color:#fde68a; font-weight:800;">MC -$${{Math.abs(diffUnit).toLocaleString('es-AR', {{maximumFractionDigits:2}})}} /${{item.unit}} (+${{Math.abs(diffPct).toFixed(1)}}%)</span>`;

        return `
          <tr>
            <td style="font-weight:800; color:#fff;">${{item.name}}</td>
            <td><span class="bulto-price">${{item.bulto}}</span></td>
            <td>
              <span class="price-hubador">$${{item.compra_bulto.toLocaleString('es-AR')}}</span>
              <span class="unit-price">($${{unitHub.toLocaleString('es-AR', {{maximumFractionDigits:2}})}} / ${{item.unit}})</span>
            </td>
            <td>
              <span class="price-mc">$${{item.mc_bulto.toLocaleString('es-AR')}}</span>
              <span class="unit-price">($${{item.mc_unit.toLocaleString('es-AR', {{maximumFractionDigits:2}})}} / ${{item.unit}})</span>
            </td>
            <td>${{diffStr}}</td>
            <td><span class="badge ${{badgeClass}}">${{badgeText}}</span></td>
          </tr>
        `;
      }}).join('');
    }}

    renderTable(FRUTAS, 'tblFrutas');
    renderTable(VERDES, 'tblVerdes');
    renderTable(ATOMIC, 'tblAtomic');
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

print("hubador_vs_central.html generated and synced successfully!")
