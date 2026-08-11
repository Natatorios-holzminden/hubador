import urllib.request
import json
import ssl

context = ssl._create_unverified_context()

urls = [
    "https://ac.cnstrc.com/browse/group_id/catv00003285?key=key_Kf4oTm&num_results_per_page=40",
    "https://ac.cnstrc.com/search/papa?key=key_Kf4oTm&num_results_per_page=10"
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

for url in urls:
    print("Testing:", url)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=context) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            results = data.get("response", {}).get("results", [])
            print(f"SUCCESS! Results count: {len(results)}")
            for item in results[:10]:
                val = item.get("value")
                item_data = item.get("data", {})
                price = item_data.get("price")
                unit_price = item_data.get("unit_price") or item_data.get("price_per_unit") or item_data.get("sale_price")
                print(f"  -> {val} | Price: ${price} | Data: {item_data}")
    except Exception as e:
        print("FAILED:", e)
