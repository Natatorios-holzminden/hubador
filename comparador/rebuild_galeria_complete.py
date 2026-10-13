import json, os, re, sys
if sys.stdout:
    sys.stdout.reconfigure(encoding='utf-8')

repo_dir = r'C:\Users\WORK\Documents\GitHub\hubador\comparador'
desktop_dir = r'C:\Users\WORK\Desktop\hubador antes del formulario\hubador\comparador'
brain_dir = r'C:\Users\WORK\.gemini\antigravity\brain\1b9a1801-5beb-4cae-9286-ca90a8c09f19'

# Load timeline_summary.json
with open(os.path.join(repo_dir, 'timeline_summary.json'), encoding='utf-8') as f:
    summary_items = json.load(f)

# Dynamically discover all date keys from the first item
all_date_keys = list(summary_items[0]['prices'].keys())

def format_date_label(dkey, is_latest=False):
    m = re.match(r'(\d+)([a-zA-Z]+)', dkey)
    if m:
        day_num = int(m.group(1))
        mon_str = m.group(2).capitalize()
        label = f"{day_num:02d}-{mon_str}"
    else:
        label = dkey.upper()
    if dkey == '17sep':
        label += " (PDF)"
    elif is_latest:
        label += " (Hoy Live)"
    return label

def get_img_path(dkey, pid):
    if dkey in ['16sep', '17sep']:
        return f'evidencias/recorte_coto_{pid}.png'
    return f'evidencias/coto_{dkey}/coto_{pid}.png'

latest_date_key = all_date_keys[-1]

date_configs = []
for i, dkey in enumerate(all_date_keys):
    is_last = (i == len(all_date_keys) - 1)
    label = format_date_label(dkey, is_latest=is_last)
    date_configs.append((dkey, label, lambda pid, dk=dkey: get_img_path(dk, pid)))

js_items = []
v_rank = 1
f_rank = 1

for item in summary_items:
    pid = item['id']
    cat = item['cat']
    atomic = item.get('atomic', False)
    name = item['name']
    
    if cat == 'verduras':
        rk = v_rank
        v_rank += 1
    else:
        rk = f_rank
        f_rank += 1
        
    dates_obj = {}
    for dkey, dlabel, img_fn in date_configs:
        price_str = item['prices'].get(dkey, "$---")
        if "OFERTA" in price_str and "(OFERTA)" not in price_str:
            price_str = price_str.replace("OFERTA", "(OFERTA)")
            
        img_path = img_fn(pid)
        dates_obj[dkey] = {
            'dateLabel': dlabel,
            'coto': price_str,
            'mc': '$1.125',
            'img': f'{img_path}?v={dkey}'
        }
        
    js_items.append({
        'id': pid,
        'cat': cat,
        'rank': rk,
        'atomic': atomic,
        'name': name,
        'url': f'https://www.coto.com.ar/productos/{pid.replace("_", "%20")}',
        'dates': dates_obj
    })

js_items_str = json.dumps(js_items, ensure_ascii=False, indent=2)

date_buttons_html = ""
for i, (dkey, dlabel, _) in enumerate(reversed(date_configs)):
    is_active = (i == 0)
    act_cls = "active" if is_active else ""
    cam_icon = '<i class="fa-solid fa-camera" style="color:#38bdf8;"></i> ' if is_active else ''
    date_buttons_html += f'      <button class="date-btn {act_cls}" onclick="selectDate(\'{dkey}\', this)">{cam_icon}{dlabel}</button>\n'

html_content = f'''<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>📸 Galería de Evidencias Coto — Auditorías Diarias</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
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
    
    .toolbar-section {{ max-width: 1450px; margin: 0 auto 1.5rem; display: flex; flex-direction: column; gap: 1rem; background: #151f32; padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border); }}
    .filter-group {{ display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }}
    .filter-lbl {{ font-weight: 700; color: var(--text-muted); font-size: 0.85rem; min-width: 120px; }}
    .filter-btn, .date-btn {{ background: #1e293b; color: #94a3b8; border: 1px solid var(--border); padding: 0.45rem 0.9rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.82rem; transition: all 0.2s; }}
    .filter-btn.active {{ background: #e11d48; color: #fff; border-color: #f43f5e; box-shadow: 0 0 10px rgba(225, 29, 72, 0.4); }}
    .date-btn.active {{ background: #0284c7; color: #fff; border-color: #38bdf8; box-shadow: 0 0 10px rgba(56, 189, 248, 0.4); }}

    .grid {{ max-width: 1450px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 1.25rem; }}
    .card {{ background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.2s; }}
    .card:hover {{ transform: translateY(-3px); border-color: rgba(239, 68, 68, 0.4); }}
    .card-header {{ padding: 0.85rem 1.1rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.2); }}
    .card-title {{ font-size: 1.05rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 0.5rem; }}
    .rank-badge {{ font-size: 0.72rem; padding: 2px 7px; border-radius: 5px; font-weight: 800; text-transform: uppercase; }}
    .badge-verdura {{ background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); }}
    .badge-fruta {{ background: rgba(245, 158, 11, 0.2); color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.3); }}
    .badge-atomic {{ background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); margin-left: 6px; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px; }}

    .card-body {{ padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }}
    .price-strip {{ display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.25); padding: 0.6rem 0.85rem; border-radius: 8px; border: 1px solid var(--border); }}
    .price-coto {{ font-size: 1.15rem; font-weight: 800; color: #f87171; display: flex; align-items: center; gap: 0.4rem; }}
    .price-date {{ font-size: 0.72rem; color: #38bdf8; font-weight: 700; background: rgba(56, 189, 248, 0.1); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.3); }}

    .img-box {{ width: 100%; height: 260px; background: #0f172a; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); position: relative; cursor: zoom-in; }}
    .img-box img {{ width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }}
    .img-box img:hover {{ transform: scale(1.03); }}

    .card-footer {{ padding: 0.75rem 1.1rem; background: rgba(0,0,0,0.2); border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; }}
    .link-coto {{ color: var(--primary); font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 0.3rem; }}
    .link-coto:hover {{ text-decoration: underline; }}

    /* Lightbox */
    #lightbox {{ display: none; position: fixed; inset: 0; background: rgba(0,0,0,.92); z-index: 9999; align-items: center; justify-content: center; flex-direction: column; padding: 20px; }}
    #lightbox.open {{ display: flex; }}
    #lightbox img {{ max-width: 92vw; max-height: 82vh; border-radius: 10px; border: 2px solid rgba(239,68,68,.4); box-shadow: 0 0 40px rgba(0,0,0,.8); }}
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
      <h1><i class="fa-solid fa-camera text-danger"></i> Galería de Evidencias Coto — Auditorías Diarias</h1>
      <p>Capturas directas de pantalla y comprobantes de precios de Coto Digital en tiempo real.</p>
    </div>
    <div class="nav-btns">
      <a href="index.html" class="btn btn-back"><i class="fa-solid fa-arrow-left"></i> Volver al Comparador</a>
      <a href="timeline_coto_4fechas.html" class="btn btn-pdf"><i class="fa-solid fa-timeline"></i> Línea de Tiempo Tarjetas</a>
      <a href="timeline_coto_barras.html" class="btn btn-pdf"><i class="fa-solid fa-chart-column"></i> Gráfico de Barras</a>
    </div>
  </div>

  <div class="toolbar-section">
    <div class="filter-group">
      <span class="filter-lbl"><i class="fa-solid fa-calendar-days"></i> Seleccionar Fecha:</span>
{date_buttons_html}    </div>

    <div class="filter-group">
      <span class="filter-lbl"><i class="fa-solid fa-filter"></i> Categoría:</span>
      <button class="filter-btn active" onclick="filterCat('todos', this)">Todos ({len(summary_items)})</button>
      <button class="filter-btn" onclick="filterCat('verduras', this)">🥬 Verduras</button>
      <button class="filter-btn" onclick="filterCat('frutas', this)">🍎 Frutas</button>
      <button class="filter-btn" onclick="filterCat('atomic', this)">⚛️ Atomic (10)</button>
    </div>
  </div>

  <div class="grid" id="galeriaGrid"></div>

  <script>
    const ITEMS = {js_items_str};
    let currentDate = '{latest_date_key}';
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
      const grid = document.getElementById('galeriaGrid');
      const filtered = ITEMS.filter(item => {{
        if (currentCat === 'todos') return true;
        if (currentCat === 'verduras') return item.cat === 'verduras';
        if (currentCat === 'frutas') return item.cat === 'frutas';
        if (currentCat === 'atomic') return item.atomic === true;
        return true;
      }});

      grid.innerHTML = filtered.map(item => {{
        const dData = item.dates[currentDate] || item.dates['{latest_date_key}'] || Object.values(item.dates)[0];
        
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

            <div class="card-body">
              <div class="price-strip">
                <div class="price-coto">
                  <i class="fa-solid fa-cart-shopping"></i> Coto: ${{dData.coto}}
                </div>
                <span class="price-date">📅 ${{dData.dateLabel}}</span>
              </div>

              <div class="img-box" onclick="openLB('${{item.name}} (${{dData.dateLabel}})', '${{dData.img}}')">
                <img src="${{dData.img}}" alt="${{item.name}}" onerror="this.src='evidencias/recorte_coto_papa.png'">
              </div>
            </div>

            <div class="card-footer">
              <span>📷 Captura ${{dData.dateLabel}}</span>
              <a href="${{item.url}}" target="_blank" class="link-coto">Ver en Coto Digital <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
            </div>
          </div>
        `;
      }}).join('');
    }}

    function selectDate(dateKey, btn) {{
      currentDate = dateKey;
      document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      render();
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

with open(os.path.join(repo_dir, 'coto_top20_galeria.html'), 'w', encoding='utf-8') as f:
    f.write(html_content)

with open(os.path.join(desktop_dir, 'coto_top20_galeria.html'), 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"[+] Rebuilt coto_top20_galeria.html dynamically for all {len(all_date_keys)} dates!")
