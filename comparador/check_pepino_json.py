with open(r'C:\Users\WORK\Documents\GitHub\hubador\comparador\coto_top20_galeria.html', encoding='utf-8') as f:
    html = f.read()

pos = html.find('"id": "pepino"')
if pos != -1:
    print("=== PEPINO IN REBUILT GALERIA ===")
    print(html[pos:pos+1500])
else:
    print("NOT FOUND")
