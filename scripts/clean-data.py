"""Build data/cases.json from the original site's embedded props (home-props.json).

Usage: python3 scripts/clean-data.py path/to/home-props.json
Fixes known problems in the source data; see README "Data notes".
"""
import json
import re
import sys

src = json.load(open(sys.argv[1], encoding="utf-8"))["entries"]

# Summaries that were copied from another case in the source data.
WRONG_SUMMARY = {
    "Containing the armed conflict in Nagorno-Karabakh",
    "Ending armed conflict in the UK (Northern Ireland)",
}
TITLE_FIXES = {
    "Containing the armed conflict in Georgia-(South Ossetia) for 16 years":
        "Containing the armed conflict in Georgia (South Ossetia) for 16 years",
    "Containing the Armed Conflict in Libya": "Containing the armed conflict in Libya",
}
# Missing or wrong UN regional group in the source data, keyed by country.
REGION_FIXES = {"DRC": "Africa", "Solomon Islands": "Asia-Pacific"}


def year(v):
    v = (v or "").strip()
    if v.lower() == "present":
        return "present"
    return int(v) if v.isdigit() else None


cases = []
for x in src:
    title = re.sub(r"^\([^)]*\)\s*", "", x["title"]).strip()
    title = TITLE_FIXES.get(title, title)
    summary = x["summary"] if title not in WRONG_SUMMARY else None
    cases.append({
        "slug": x["slug"],
        "title": title,
        "country": x["country"],
        "location": x["location"],
        "lat": x["lat"],
        "lng": x["lng"],
        "startYear": year(x["startYear"]),
        "endYear": year(x["endYear"]),
        "impact": x["impact"],
        "region": REGION_FIXES.get(x["country"], x["unRegionalGroup"]),
        "themes": x["themes"],
        "conflictTypes": x["typesOfConflict"],
        "initiatives": [re.sub(r"\s*\(.*\)$", "", i) for i in x["typesOfInitiative"]],
        "summary": summary,
    })

cases.sort(key=lambda c: c["title"].lower())
json.dump(cases, open("data/cases.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(cases), "cases written")
