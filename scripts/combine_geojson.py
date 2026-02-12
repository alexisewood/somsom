import json
from pathlib import Path

DATA_DIR = Path("styles/data")
OUTFILE = DATA_DIR / "combined.geojson"

def as_feature_collection(obj, source_name):
    if not isinstance(obj, dict) or "type" not in obj:
        return []

    t = obj["type"]

    if t == "FeatureCollection":
        feats = obj.get("features", [])
    elif t == "Feature":
        feats = [obj]
    elif t in ("Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection"):
        feats = [{"type": "Feature", "properties": {}, "geometry": obj}]
    else:
        return []

    out = []
    for f in feats:
        if not isinstance(f, dict) or f.get("type") != "Feature":
            continue
        props = f.get("properties") or {}
        props["_source_file"] = source_name
        out.append({
            "type": "Feature",
            "properties": props,
            "geometry": f.get("geometry"),
            "id": f.get("id")
        })
    return out

def main():
    if not DATA_DIR.exists():
        raise SystemExit(f"Can't find folder: {DATA_DIR.resolve()}")

    features = []
    files = sorted([*DATA_DIR.glob("*.geojson"), *DATA_DIR.glob("*.json")])

    for fp in files:
        if fp.name == OUTFILE.name:
            continue

        try:
            obj = json.loads(fp.read_text(encoding="utf-8"))
        except Exception:
            continue

        feats = as_feature_collection(obj, fp.name)
        if feats:
            features.extend(feats)

    combined = {"type": "FeatureCollection", "features": features}
    OUTFILE.write_text(json.dumps(combined, ensure_ascii=False), encoding="utf-8")

if __name__ == "__main__":
    main()
