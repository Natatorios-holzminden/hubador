import json, os, re

json_path = r'C:\Users\WORK\Documents\GitHub\hubador\comparador\timeline_summary.json'
evid_dir = r'C:\Users\WORK\Documents\GitHub\hubador\comparador\evidencias'

with open(json_path, encoding='utf-8') as f:
    items = json.load(f)

date_keys = [
    ('16sep', '16-Sep', ''),
    ('17sep', '17-Sep', ''),
    ('21sep', '21-Sep', 'coto_21sep'),
    ('22sep', '22-Sep', 'coto_22sep'),
    ('23sep', '23-Sep', 'coto_23sep'),
    ('28sep', '28-Sep', 'coto_28sep'),
    ('29sep', '29-Sep', 'coto_29sep'),
    ('1oct', '01-Oct', 'coto_1oct'),
    ('4oct', '04-Oct', 'coto_4oct'),
    ('5oct', '05-Oct', 'coto_5oct'),
    ('6oct', '06-Oct', 'coto_6oct')
]

def find_img(pid, sdir):
    folder = os.path.join(evid_dir, sdir) if sdir else evid_dir
    if not os.path.exists(folder):
        return f'evidencias/{sdir}/coto_{pid}.png' if sdir else f'evidencias/recorte_coto_{pid}.png'
    files = os.listdir(folder)
    for f in files:
        if f.endswith(('.png', '.jpg', '.jpeg')):
            if pid in f or pid.replace('_', '') in f.replace('_', ''):
                return f'evidencias/{sdir}/{f}' if sdir else f'evidencias/{f}'
    if sdir:
        return f'evidencias/{sdir}/coto_{pid}.png'
    return f'evidencias/recorte_coto_{pid}.png'

processed = []
v_rank = 1
f_rank = 1
for item in items:
    cat = item['cat']
    if cat == 'verduras':
        rk = v_rank
        v_rank += 1
    else:
        rk = f_rank
        f_rank += 1
        
    p_data = {
        'id': item['id'],
        'name': item['name'],
        'cat': cat,
        'atomic': item.get('atomic', False),
        'rank': rk,
        'history': []
    }
    
    for dk, dlabel, sdir in date_keys:
        raw_price = item['prices'].get(dk, '$0')
        clean_num = re.sub(r'[^\d,]', '', raw_price).replace(',', '.')
        try:
            val = float(clean_num) if clean_num else 0.0
        except:
            val = 0.0
        
        img_path = find_img(item['id'], sdir)
        p_data['history'].append({
            'key': dk,
            'label': dlabel,
            'price_str': raw_price,
            'price_num': val,
            'img': img_path
        })
    processed.append(p_data)

json_data_str = json.dumps(processed, ensure_ascii=False, indent=2)
num_dates = len(date_keys)

html_content = f'''<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>📸 Línea de Tiempo Coto Digital — 26 Productos ({num_dates} Fechas Auditadas)</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {{
      --bg: #0b1120;
      --card-bg: #1e293b;
      --border: rgba(255, 255, 255, 0.1);
      --primary: #38bdf8;
      --accent-coto: #ef4444;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }}
    * {{ margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',system-ui,sans-serif; }}
    body {{ background: var(--bg); color: var(--text); padding: 1.5rem; }}
    .header {{ max-width: 1450px; margin: 0 auto 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }}
    .title-box h1 {{ font-size: 1.6rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 0.5rem; }}
    .title-box p {{ color: var(--text-muted); font-size: 0.9rem; margin-top: 4px; }}
    .nav-btns {{ display: flex; gap: 0.6rem; flex-wrap: wrap; }}
    .btn {{ padding: 0.55rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer; border: 1px solid var(--border); transition: all 0.2s; }}
    .btn-back {{ background: #1e293b; color: #fff; }}
    .btn-back:hover {{ background: #334155; }}
    .btn-pdf {{ background: #2563eb; color: #fff; border-color: #3b82f6; }}
    .btn-quilmes {{ background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border-color: rgba(16, 185, 129, 0.4); }}
    
    .toolbar-section {{ max-width: 1450px; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: space-between; background: #151f32; padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid var(--border); flex-wrap: wrap; gap: 1rem; }}
    .filter-btn {{ background: #1e293b; color: #94a3b8; border: 1px solid var(--border); padding: 0.5rem 1.1rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }}
    .filter-btn.active {{ background: #e11d48; color: #fff; border-color: #f43f5e; box-shadow: 0 0 12px rgba(225, 29, 72, 0.4); }}

    .grid {{ max-width: 1450px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(460px, 1fr)); gap: 1.25rem; }}
    .card {{ background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.2s; }}
    .card:hover {{ transform: translateY(-3px); border-color: rgba(239, 68, 68, 0.4); }}
    .card-header {{ padding: 0.85rem 1.1rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.2); }}
    .card-title {{ font-size: 1.05rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 0.5rem; }}
    .rank-badge {{ font-size: 0.72rem; padding: 2px 7px; border-radius: 5px; font-weight: 800; text-transform: uppercase; }}
    .badge-verdura {{ background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); }}
    .badge-fruta {{ background: rgba(245, 158, 11, 0.2); color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.3); }}
    .badge-atomic {{ background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); margin-left: 6px; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px; }}

    .dates-container {{ overflow-x: auto; background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--border); }}
    .dates-row {{ display: grid; grid-template-columns: repeat({num_dates}, minmax(40px, 1fr)); gap: 2px; padding: 0.5rem; text-align: center; min-width: 460px; }}
    .date-box {{ background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 4px 1px; border-radius: 6px; font-size: 0.68rem; }}
    .date-box.latest {{ background: rgba(56, 189, 248, 0.12); border-color: rgba(56, 189, 248, 0.4); }}
    .date-title {{ font-weight: 700; color: #94a3b8; font-size: 0.58rem; margin-bottom: 2px; }}
    .date-price {{ font-weight: 800; color: #f87171; font-size: 0.72rem; white-space: nowrap; }}
    .date-price-latest {{ font-weight: 800; color: #38bdf8; font-size: 0.72rem; white-space: nowrap; }}

    .thumbs-container {{ overflow-x: auto; background: #0f172a; border-bottom: 1px solid var(--border); }}
    .thumb-grid {{ display: grid; grid-template-columns: repeat({num_dates}, minmax(40px, 1fr)); gap: 2px; padding: 0.5rem; min-width: 460px; }}
    .thumb-item {{ text-align: center; cursor: zoom-in; position: relative; }}
    .thumb-item img {{ width: 100%; height: 52px; object-fit: cover; border-radius: 5px; border: 1px solid rgba(255,255,255,0.1); transition: transform 0.2s; }}
    .thumb-item img:hover {{ transform: scale(1.08); border-color: #38bdf8; z-index: 2; }}
    .thumb-lbl {{ font-size: 0.55rem; color: #94a3b8; margin-top: 2px; font-weight: 600; }}

    .chart-container {{ padding: 0.75rem; height: 140px; background: rgba(15,23,42,0.6); }}

    /* Lightbox */
    #lightbox {{ display: none; position: fixed; inset: 0; background: rgba(0,0,0,.92); z-index: 9999; align-items: center; justify-content: center; flex-direction: column; padding: 20px; }}
    #lightbox.open {{ display: flex; }}
    #lightbox img {{ max-width: 92vw; max-height: 80vh; border-radius: 10px; border: 2px solid rgba(239,68,68,.4); box-shadow: 0 0 40px rgba(0,0,0,.8); }}
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

  <div class="header">
    <div class="title-box">
      <h1><i class="fa-solid fa-chart-line text-danger"></i> Línea de Tiempo Coto Digital — {num_dates} Fechas Auditadas</h1>
      <p>Evolución visual de precios y capturas directas para los 26 productos principales (16-Sep al 06-Oct Hoy Live).</p>
    </div>
    <div class="nav-btns">
      <a href="index.html" class="btn btn-back"><i class="fa-solid fa-arrow-left"></i> Volver al Comparador</a>
      <a href="coto_top20_galeria.html" class="btn btn-pdf"><i class="fa-solid fa-camera"></i> Galería de Evidencias</a>
      <a href="timeline_coto_barras.html" class="btn btn-pdf"><i class="fa-solid fa-chart-column"></i> Gráfico de Barras</a>
      <a href="fresco_vs_quilmes.html" class="btn btn-quilmes"><i class="fa-solid fa-store"></i> Acción Fruit (Quilmes)</a>
    </div>
  </div>

  <div class="toolbar-section">
    <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
      <span style="font-weight:700; color:var(--text-muted); font-size:0.9rem;"><i class="fa-solid fa-filter"></i> Filtrar por Categoría:</span>
      <button class="filter-btn active" onclick="filterCat('todos', this)">Todos (26)</button>
      <button class="filter-btn" onclick="filterCat('verduras', this)">🥬 Top 14 Verduras</button>
      <button class="filter-btn" onclick="filterCat('frutas', this)">🍎 Top 12 Frutas</button>
      <button class="filter-btn" onclick="filterCat('atomic', this)">⚛️ Atomic (10)</button>
    </div>
  </div>

  <div class="grid" id="cotoGrid"></div>

  <script>
    const DATASET = {json_data_str};
    let currentCat = 'todos';
    const chartInstances = {{}};

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
      const grid = document.getElementById('cotoGrid');
      
      // Destroy existing charts
      Object.keys(chartInstances).forEach(k => {{
        if (chartInstances[k]) chartInstances[k].destroy();
      }});

      const filtered = DATASET.filter(item => {{
        if (currentCat === 'todos') return true;
        if (currentCat === 'verduras') return item.cat === 'verduras';
        if (currentCat === 'frutas') return item.cat === 'frutas';
        if (currentCat === 'atomic') return item.atomic === true;
        return true;
      }});
      
      grid.innerHTML = filtered.map(item => {{
        const lastIdx = item.history.length - 1;
        const datesHtml = item.history.map((h, i) => `
          <div class="date-box ${{i === lastIdx ? 'latest' : ''}}">
            <div class="date-title" ${{i === lastIdx ? 'style="color:#38bdf8;"' : ''}}>${{h.label}}</div>
            <div class="${{i === lastIdx ? 'date-price-latest' : 'date-price'}}">${{h.price_str}}</div>
          </div>
        `).join('');

        const thumbsHtml = item.history.map((h, i) => `
          <div class="thumb-item" onclick="openLB('${{item.name}} (${{h.label}})', '${{h.img}}')">
            <img src="${{h.img}}" alt="${{h.label}}" onerror="this.src='evidencias/recorte_mc_papa_spunta.png'">
            <div class="thumb-lbl" ${{i === lastIdx ? 'style="color:#38bdf8; font-weight:800;"' : ''}}>${{h.label}}</div>
          </div>
        `).join('');

        return `
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                ${{item.name}}
                ${{item.atomic ? '<span class="badge-atomic">⚛️ ATOMIC</span>' : ''}}
              </div>
              <span class="rank-badge ${{item.cat === 'verduras' ? 'badge-verdura' : 'badge-fruta'}}">
                ${{item.cat === 'verduras' ? '🥬' : '🍎'}} #${{item.rank}}
              </span>
            </div>

            <div class="dates-container">
              <div class="dates-row">
                ${{datesHtml}}
              </div>
            </div>

            <div class="thumbs-container">
              <div class="thumb-grid">
                ${{thumbsHtml}}
              </div>
            </div>

            <div class="chart-container">
              <canvas id="chart_${{item.id}}"></canvas>
            </div>
          </div>
        `;
      }}).join('');

      // Render Charts
      setTimeout(() => {{
        filtered.forEach(item => {{
          const ctx = document.getElementById('chart_' + item.id);
          if (!ctx) return;
          const labels = item.history.map(h => h.label);
          const prices = item.history.map(h => h.price_num);
          const lastIdx = item.history.length - 1;
          const pointColors = item.history.map((h, i) => i === lastIdx ? '#38bdf8' : '#ef4444');
          const pointRadii = item.history.map((h, i) => i === lastIdx ? 6 : 4);

          chartInstances[item.id] = new Chart(ctx, {{
            type: 'line',
            data: {{
              labels: labels,
              datasets: [{{
                label: 'Precio Coto ($)',
                data: prices,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.3,
                pointRadius: pointRadii,
                pointBackgroundColor: pointColors,
                pointHoverRadius: 7
              }}]
            }},
            options: {{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {{ legend: {{ display: false }} }},
              scales: {{
                x: {{ ticks: {{ color: '#94a3b8', font: {{ size: 8 }} }}, grid: {{ display: false }} }},
                y: {{ ticks: {{ color: '#94a3b8', font: {{ size: 8 }} }}, grid: {{ color: 'rgba(255,255,255,0.05)' }} }}
              }}
            }}
          }});
        }});
      }}, 80);
    }}

    function filterCat(cat, btn) {{
      currentCat = cat;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    }}

    render();
  </script>
</body>
</html>
'''

path1 = r'C:\Users\WORK\Documents\GitHub\hubador\comparador\timeline_coto_4fechas.html'
path2 = r'C:\Users\WORK\Documents\GitHub\hubador\comparador\timeline_coto_todasfechas.html'

with open(path1, 'w', encoding='utf-8') as f:
    f.write(html_content)

with open(path2, 'w', encoding='utf-8') as f:
    f.write(html_content)

print('Generated dynamic timeline card HTML files successfully!')
