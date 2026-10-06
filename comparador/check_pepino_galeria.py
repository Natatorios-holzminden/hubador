with open(r'C:\Users\WORK\Documents\GitHub\hubador\comparador\coto_top20_galeria.html', encoding='utf-8') as f:
    html = f.read()

pos = html.find("id:'pepino'")
if pos != -1:
    print("=== PEPINO JS BLOCK IN GALERIA ===")
    print(html[pos:pos+1500])
else:
    print("pepino NOT FOUND in coto_top20_galeria.html")
