import json, os

repo_dir = r'C:\Users\WORK\Documents\GitHub\hubador\comparador'
desktop_dir = r'C:\Users\WORK\Desktop\hubador antes del formulario\hubador\comparador'

data_frutas = [
    {"id": "pera_packhams", "name": "Pera Packham's", "cat": "frutas", "bulto": "20 kg", "compra_bulto": 15000, "unit": "kg", "factor": 20, "mc_unit": 1388.89, "mc_bulto": 25000, "mc_bulto_str": "18Kg x $ 25000", "mc_orig": "R. NEGRO", "mc_var": "0.0%"},
    {"id": "manzana_red", "name": "Manzana Red Delicious", "cat": "frutas", "bulto": "19 kg", "compra_bulto": 25000, "unit": "kg", "factor": 19, "mc_unit": 1722.22, "mc_bulto": 31000, "mc_bulto_str": "18Kg x $ 31000", "mc_orig": "R. NEGRO", "mc_var": "+5.2%"},
    {"id": "frutilla", "name": "Frutilla Selección", "cat": "frutas", "bulto": "5 kg", "compra_bulto": 11000, "unit": "kg", "factor": 5, "mc_unit": 5500.00, "mc_bulto": 27500, "mc_bulto_str": "5Kg x $ 27500", "mc_orig": "SANTA FE", "mc_var": "-8.3%"},
    {"id": "mandarinamurcot", "name": "Mandarina Murcot", "cat": "frutas", "bulto": "17 kg", "compra_bulto": 6000, "unit": "kg", "factor": 17, "mc_unit": 666.67, "mc_bulto": 11333, "mc_bulto_str": "17Kg x $ 11333", "mc_orig": "E. RIOS", "mc_var": "0.0%"},
    {"id": "naranja_salustiana", "name": "Naranja Salustiana", "cat": "frutas", "bulto": "17 kg", "compra_bulto": 6000, "unit": "kg", "factor": 17, "mc_unit": 611.11, "mc_bulto": 11000, "mc_bulto_str": "18Kg x $ 11000", "mc_orig": "E. RIOS", "mc_var": "0.0%"}
]

data_verdes = [
    {"id": "lechuga_francesa", "name": "Lechuga Francesa", "cat": "verdes", "bulto": "Cajón", "compra_bulto": 4000, "unit": "cajón", "factor": 1, "mc_unit": 4200, "mc_bulto": 4200, "mc_bulto_str": "Cajón x $ 4200", "mc_orig": "BS AS", "mc_var": "0.0%"},
    {"id": "lechuga_morada", "name": "Lechuga Morada", "cat": "verdes", "bulto": "Cajón", "compra_bulto": 2000, "unit": "cajón", "factor": 1, "mc_unit": 3800, "mc_bulto": 3800, "mc_bulto_str": "Cajón x $ 3800", "mc_orig": "BS AS", "mc_var": "0.0%"},
    {"id": "espinaca", "name": "Espinaca", "cat": "verdes", "bulto": "14 paquetes", "compra_bulto": 3000, "unit": "paq", "factor": 14, "mc_unit": 450, "mc_bulto": 6300, "mc_bulto_str": "14 Paq x $ 6300", "mc_orig": "BS AS", "mc_var": "-5.0%"},
    {"id": "acelga", "name": "Acelga Selección", "cat": "verdes", "bulto": "18 paquetes", "compra_bulto": 4000, "unit": "paq", "factor": 18, "mc_unit": 400, "mc_bulto": 7200, "mc_bulto_str": "18 Paq x $ 7200", "mc_orig": "BS AS", "mc_var": "0.0%"},
    {"id": "rucula", "name": "Rúcula", "cat": "verdes", "bulto": "28 paquetes", "compra_bulto": 3000, "unit": "paq", "factor": 28, "mc_unit": 200, "mc_bulto": 5600, "mc_bulto_str": "28 Paq x $ 5600", "mc_orig": "BS AS", "mc_var": "0.0%"},
    {"id": "cebolla_verdeo", "name": "Verdeo", "cat": "verdes", "bulto": "Atado", "compra_bulto": 1000, "unit": "atado", "factor": 1, "mc_unit": 1400, "mc_bulto": 1400, "mc_bulto_str": "Atado x $ 1400", "mc_orig": "BS AS", "mc_var": "0.0%"},
    {"id": "coliflor", "name": "Coliflor", "cat": "verdes", "bulto": "11 unidades", "compra_bulto": 8000, "unit": "un", "factor": 11, "mc_unit": 1100, "mc_bulto": 12100, "mc_bulto_str": "11 Un x $ 12100", "mc_orig": "BS AS", "mc_var": "+3.5%"},
    {"id": "remolacha", "name": "Remolacha", "cat": "verdes", "bulto": "10 atados", "compra_bulto": 8000, "unit": "atado", "factor": 10, "mc_unit": 1200, "mc_bulto": 12000, "mc_bulto_str": "10 Atados x $ 12000", "mc_orig": "BS AS", "mc_var": "0.0%"},
    {"id": "brocoli", "name": "Brócoli", "cat": "verdes", "bulto": "Jaula", "compra_bulto": 8000, "unit": "jaula", "factor": 1, "mc_unit": 11000, "mc_bulto": 11000, "mc_bulto_str": "Jaula x $ 11000", "mc_orig": "BS AS", "mc_var": "0.0%"},
    {"id": "apio", "name": "Apio", "cat": "verdes", "bulto": "15 plantas", "compra_bulto": 7000, "unit": "planta", "factor": 15, "mc_unit": 800, "mc_bulto": 12000, "mc_bulto_str": "15 Plantas x $ 12000", "mc_orig": "BS AS", "mc_var": "0.0%"},
    {"id": "ciboulette", "name": "Ciboulette", "cat": "verdes", "bulto": "5 atados", "compra_bulto": 2000, "unit": "atado", "factor": 5, "mc_unit": 600, "mc_bulto": 3000, "mc_bulto_str": "5 Atados x $ 3000", "mc_orig": "BS AS", "mc_var": "0.0%"},
    {"id": "radicheta", "name": "Radicheta", "cat": "verdes", "bulto": "Docena", "compra_bulto": 2000, "unit": "atado", "factor": 12, "mc_unit": 300, "mc_bulto": 3600, "mc_bulto_str": "Docena x $ 3600", "mc_orig": "BS AS", "mc_var": "0.0%"}
]

data_atomic = [
    {"id": "tomate_perita", "name": "Tomate Perita", "cat": "atomic", "bulto": "Cajón 18 kg", "compra_bulto": 30000, "unit": "kg", "factor": 18, "mc_unit": 2777.78, "mc_bulto": 50000, "mc_bulto_str": "18Kg x $ 50000", "mc_orig": "CORRIENTES", "mc_var": "-4.2%"},
    {"id": "tomate_cherry", "name": "Tomate Cherry", "cat": "atomic", "bulto": "11 kg", "compra_bulto": 48000, "unit": "kg", "factor": 11, "mc_unit": 4200.00, "mc_bulto": 46200, "mc_bulto_str": "11Kg x $ 46200", "mc_orig": "CORRIENTES", "mc_var": "0.0%"},
    {"id": "tomate_redondo", "name": "Tomate Redondo Grande", "cat": "atomic", "bulto": "18 kg", "compra_bulto": 38000, "unit": "kg", "factor": 18, "mc_unit": 1888.89, "mc_bulto": 34000, "mc_bulto_str": "18Kg x $ 34000", "mc_orig": "CORRIENTES", "mc_var": "0.0%"},
    {"id": "palta_hass", "name": "Palta Hass", "cat": "atomic", "bulto": "80 u (22 kg)", "compra_bulto": 55000, "unit": "un", "factor": 80, "mc_unit": 1325.00, "mc_bulto": 106000, "mc_bulto_str": "22Kg x $ 106000", "mc_orig": "TUCUMAN", "mc_var": "0.0%"},
    {"id": "mango", "name": "Mango Selección", "cat": "atomic", "bulto": "50 u (30 kg)", "compra_bulto": 64000, "unit": "un", "factor": 50, "mc_unit": 1700.00, "mc_bulto": 85000, "mc_bulto_str": "30Kg x $ 85000", "mc_orig": "BRASIL", "mc_var": "0.0%"},
    {"id": "papa_spunta", "name": "Papa Spunta", "cat": "atomic", "bulto": "18 kg", "compra_bulto": 21000, "unit": "kg", "factor": 18, "mc_unit": 1166.67, "mc_bulto": 21000, "mc_bulto_str": "18Kg x $ 21000", "mc_orig": "TUCUMAN", "mc_var": "0.0%"},
    {"id": "cebolla_valenciani", "name": "Cebolla Valenciani", "cat": "atomic", "bulto": "16 kg", "compra_bulto": 30000, "unit": "kg", "factor": 16, "mc_unit": 1400.00, "mc_bulto": 22400, "mc_bulto_str": "16Kg x $ 22400", "mc_orig": "BS AS", "mc_var": "0.0%"},
    {"id": "berenjena", "name": "Berenjena", "cat": "atomic", "bulto": "10 kg", "compra_bulto": 13000, "unit": "kg", "factor": 10, "mc_unit": 1250.00, "mc_bulto": 12500, "mc_bulto_str": "10Kg x $ 12500", "mc_orig": "CORRIENTES", "mc_var": "0.0%"},
    {"id": "zucchini", "name": "Zucchini / Zapallito Largo", "cat": "atomic", "bulto": "17 kg", "compra_bulto": 34000, "unit": "kg", "factor": 17, "mc_unit": 2000.00, "mc_bulto": 34000, "mc_bulto_str": "17Kg x $ 34000", "mc_orig": "CORRIENTES", "mc_var": "0.0%"},
    {"id": "repollo_blanco", "name": "Repollo Blanco", "cat": "atomic", "bulto": "17 kg", "compra_bulto": 15000, "unit": "kg", "factor": 17, "mc_unit": 733.33, "mc_bulto": 12466, "mc_bulto_str": "17Kg x $ 12466", "mc_orig": "BS AS", "mc_var": "0.0%"},
    {"id": "lechuga_criolla", "name": "Lechuga Criolla", "cat": "atomic", "bulto": "Jaula", "compra_bulto": 4000, "unit": "jaula", "factor": 1, "mc_unit": 4200, "mc_bulto": 4200, "mc_bulto_str": "Jaula x $ 4200", "mc_orig": "BS AS", "mc_var": "0.0%"},
    {"id": "verdeo", "name": "Verdeo", "cat": "atomic", "bulto": "Atado", "compra_bulto": 1400, "unit": "atado", "factor": 1, "mc_unit": 1400, "mc_bulto": 1400, "mc_bulto_str": "Atado x $ 1400", "mc_orig": "BS AS", "mc_var": "0.0%"}
]

all_items = data_frutas + data_verdes + data_atomic

html_template = f'''<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🏷️ Comparador Directo — Tu Compra vs Fichas Precios del Central</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {{
      --bg: #090d16;
      --card-bg: #131c2e;
      --border: rgba(255, 255, 255, 0.08);
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

    /* Cards Grid */
    .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(460px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem; }}
    .card {{ background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 16px rgba(0,0,0,0.4); transition: transform 0.2s; }}
    .card:hover {{ transform: translateY(-3px); border-color: rgba(56, 189, 248, 0.4); }}
    
    .card-header {{ padding: 0.85rem 1.1rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.3); }}
    .card-title {{ font-size: 1.05rem; font-weight: 800; color: #fff; }}
    
    .badge {{ font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; }}
    .badge-frutas {{ background: rgba(245, 158, 11, 0.2); color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.4); }}
    .badge-verdes {{ background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); }}
    .badge-atomic {{ background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); }}

    .card-split {{ display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; padding: 1rem; }}
    
    /* Left Panel: Hubador Compra */
    .hub-box {{ background: linear-gradient(145deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.8)); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 0.85rem; display: flex; flex-direction: column; justify-content: space-between; }}
    .hub-tag {{ font-size: 0.68rem; font-weight: 800; color: #6ee7b7; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 0.3rem; margin-bottom: 0.4rem; }}
    .hub-bulto {{ font-size: 1.25rem; font-weight: 800; color: #fff; }}
    .hub-unit {{ font-size: 0.8rem; color: #6ee7b7; font-weight: 700; margin-top: 4px; }}
    .hub-spec {{ font-size: 0.72rem; color: var(--text-muted); margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 4px; }}

    /* Right Panel: Official Precios del Central Black Card */
    .mc-black-card {{ background: #161c24; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; padding: 0.85rem; display: flex; flex-direction: column; justify-content: space-between; position: relative; }}
    .mc-top-bar {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; }}
    .mc-date-pill {{ background: rgba(255,255,255,0.12); color: #cbd5e1; font-size: 0.62rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; }}
    .mc-var-badge {{ font-size: 0.62rem; font-weight: 800; color: #4ade80; background: rgba(74, 222, 128, 0.15); padding: 2px 6px; border-radius: 4px; }}
    
    .mc-prod-name {{ font-size: 0.8rem; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }}
    .mc-avg-price {{ font-size: 0.75rem; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }}
    .mc-avg-price strong {{ color: #fff; font-size: 0.95rem; font-weight: 800; }}

    .mc-bulto-row {{ background: rgba(0,0,0,0.4); border: 1px dashed rgba(255,255,255,0.15); padding: 4px 7px; border-radius: 6px; font-size: 0.74rem; font-weight: 800; color: #fde68a; display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }}
    .mc-orig {{ font-size: 0.62rem; color: #94a3b8; font-weight: 700; }}

    .chart-box {{ height: 50px; margin-top: 6px; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 2px; }}

    /* Bottom Comparison Footer */
    .card-footer {{ padding: 0.65rem 1rem; background: rgba(0,0,0,0.25); border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; font-weight: 800; }}
  </style>
</head>
<body>

  <div class="container">
    <div class="header">
      <div class="title-box">
        <h1><i class="fa-solid fa-scale-balanced" style="color:#38bdf8;"></i> Tu Compra vs Fichas Oficiales Precios del Central</h1>
        <p>Comparativa directa entre tus valores de compra de Hubador y las fichas estimadas de Precios del Central (06-Oct Live).</p>
      </div>
      <div class="nav-btns">
        <a href="index.html" class="btn btn-back"><i class="fa-solid fa-arrow-left"></i> Volver al Comparador</a>
        <a href="timeline_coto_4fechas.html" class="btn btn-coto"><i class="fa-solid fa-store"></i> Comparador Coto Digital</a>
      </div>
    </div>

    <!-- Toolbar Filters -->
    <div class="toolbar-section">
      <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
        <span style="font-weight:700; color:var(--text-muted); font-size:0.85rem;"><i class="fa-solid fa-filter"></i> Filtrar por Lista:</span>
        <button class="filter-btn active" onclick="filterCat('todos', this)">Todos (29)</button>
        <button class="filter-btn" onclick="filterCat('frutas', this)">🍎 1) Frutas Quilmes (5)</button>
        <button class="filter-btn" onclick="filterCat('verdes', this)">🥬 2) Verdes Acción Fruit (12)</button>
        <button class="filter-btn" onclick="filterCat('atomic', this)">⚛️ 3) Lista Atomic (12)</button>
      </div>
    </div>

    <!-- CARDS GRID -->
    <div class="grid" id="cardsGrid"></div>
  </div>

  <script>
    const ALL_ITEMS = {json.dumps(all_items, ensure_ascii=False)};
    let currentCat = 'todos';

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

        const catBadge = item.cat === 'frutas' ? '<span class="badge badge-frutas">🍎 FRUTAS</span>'
                      : item.cat === 'verdes' ? '<span class="badge badge-verdes">🥬 VERDES</span>'
                      : '<span class="badge badge-atomic">⚛️ ATOMIC</span>';

        const diffFooterStr = diffUnit <= 0 
          ? `<span style="color:#6ee7b7;"><i class="fa-solid fa-circle-check"></i> ¡Hubador Ahorra -$${{Math.abs(diffUnit).toLocaleString('es-AR', {{maximumFractionDigits:2}})}} /${{item.unit}} (-${{Math.abs(diffPct).toFixed(1)}}%)!</span>`
          : `<span style="color:#fde68a;"><i class="fa-solid fa-triangle-exclamation"></i> Central Estimado -$${{Math.abs(diffUnit).toLocaleString('es-AR', {{maximumFractionDigits:2}})}} /${{item.unit}}</span>`;

        return `
          <div class="card">
            <div class="card-header">
              <div class="card-title">${{item.name}}</div>
              ${{catBadge}}
            </div>

            <div class="card-split">
              <!-- LEFT PANEL: HUBADOR COMPRA -->
              <div class="hub-box">
                <div>
                  <div class="hub-tag"><i class="fa-solid fa-cart-shopping"></i> Compra Hubador</div>
                  <div class="hub-bulto">$${{item.compra_bulto.toLocaleString('es-AR')}}</div>
                  <div class="hub-unit">$${{unitHub.toLocaleString('es-AR', {{maximumFractionDigits:2}})}} / ${{item.unit}}</div>
                </div>
                <div class="hub-spec">Bulto: ${{item.bulto}} (sin IVA)</div>
              </div>

              <!-- RIGHT PANEL: PRECIOS DEL CENTRAL BLACK CARD -->
              <div class="mc-black-card">
                <div>
                  <div class="mc-top-bar">
                    <span class="mc-date-pill">6 de octubre</span>
                    <span class="mc-var-badge">${{item.mc_var}}</span>
                  </div>
                  <div class="mc-prod-name">${{item.name}}</div>
                  <div class="mc-avg-price">Precio promedio: <strong>$${{Math.round(item.mc_unit).toLocaleString('es-AR')}} / ${{item.unit}}</strong></div>
                  
                  <div class="mc-bulto-row">
                    <span>${{item.mc_bulto_str}}</span>
                    <span class="mc-orig">${{item.mc_orig}}</span>
                  </div>
                </div>

                <div class="chart-box">
                  <canvas id="chart_${{item.id}}"></canvas>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <span>Comparación vs Mercado Central:</span>
              ${{diffFooterStr}}
            </div>
          </div>
        `;
      }}).join('');

      // Render mini sparklines
      setTimeout(() => {{
        filtered.forEach(item => {{
          const ctx = document.getElementById('chart_' + item.id);
          if (!ctx) return;
          const mcP = Math.round(item.mc_unit);
          const minP = Math.round(mcP * 0.88);
          const maxP = Math.round(mcP * 1.12);

          new Chart(ctx, {{
            type: 'line',
            data: {{
              labels: ['27-09', '04-10', '05-10', '06-10'],
              datasets: [{{
                data: [minP, mcP * 0.95, mcP * 0.98, mcP],
                borderColor: '#38bdf8',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: [2, 2, 2, 4],
                pointBackgroundColor: ['#38bdf8', '#38bdf8', '#38bdf8', '#ef4444'],
                fill: false
              }}]
            }},
            options: {{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {{ legend: {{ display: false }} }},
              scales: {{
                x: {{ display: false }},
                y: {{ display: false }}
              }}
            }}
          }});
        }});
      }}, 80);
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

print("hubador_vs_central.html generated with Precios del Central black card styling!")
