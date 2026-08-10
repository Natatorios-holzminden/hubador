import re

with open("mc_live.html", "r", encoding="utf-8", errors="ignore") as f:
    mc_content = f.read()

print("MC content length:", len(mc_content))
titles = re.findall(r'card-title[^">]*">([^<]+)', mc_content)
print("MC titles found:", titles[:15])

prices = re.findall(r'data-ars="([\d\.]+)"', mc_content)
print("MC prices found:", prices[:15])

with open("coto_live.html", "r", encoding="utf-8", errors="ignore") as f:
    coto_content = f.read()

print("Coto content length:", len(coto_content))
coto_prices = re.findall(r'\$\s*[\d\.]+(?:,\d+)?', coto_content)
print("Coto price matches sample:", coto_prices[:20])
