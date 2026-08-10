import sys
sys.stdout.reconfigure(encoding='utf-8')

with open("mc_live.html", "r", encoding="utf-8", errors="ignore") as f:
    html = f.read()

idx = html.find('id="ACELGA"')
if idx != -1:
    print(html[idx+2000:idx+4500])
