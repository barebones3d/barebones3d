import os
import sys
import json
import time
import argparse
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("[ERROR] GEMINI_API_KEY not found in .env", file=sys.stderr)
    sys.exit(1)

try:
    from google import genai
    from google.genai.errors import ServerError
except ImportError:
    print("[ERROR] Run 'python3 -m pip install google-genai' first.", file=sys.stderr)
    sys.exit(1)

try:
    # Try the newer 'ddgs' package, fall back to 'duckduckgo_search'
    try:
        from ddgs import DDGS
    except ImportError:
        from duckduckgo_search import DDGS
except ImportError:
    print("[ERROR] Run 'python3 -m pip install ddgs' first.", file=sys.stderr)
    sys.exit(1)

client = genai.Client(api_key=api_key)

MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash",
    "gemini-3.8-flash"
]

def fetch_live_ddg_context(query: str, include_amazon: bool = True) -> list:
    """Fetches real-time search results and optional Amazon snippets via DuckDuckGo."""
    snippets = []
    
    # 1. Broad technical/market search
    try:
        with DDGS() as ddgs:
            general_results = ddgs.text(query, max_results=5)
            if general_results:
                for r in general_results:
                    snippets.append(f"\n{r.get('title')}: {r.get('body')}")
    except Exception as e:
        snippets.append(f"General search error: {str(e)}")

    # 2. Targeted Amazon search via DDG indexing (avoids Amazon bot-blockers)
    if include_amazon:
        try:
            with DDGS() as ddgs:
                amazon_query = f"site:amazon.com {query}"
                amazon_results = ddgs.text(amazon_query, max_results=3)
                if amazon_results:
                    for r in amazon_results:
                        snippets.append(f"[AMAZON LISTING: {r.get('href')}]\n{r.get('title')}: {r.get('body')}")
        except Exception:
            pass  # Fail gracefully if DDG rate limits

    return snippets

def analyze_with_gemini(query: str, site_context: str, web_snippets: list) -> dict:
    context_text = "\n\n".join(web_snippets) if web_snippets else "No live snippets retrieved."
    
    prompt = f"""
You are an expert technical researcher extracting precise specifications for '{site_context}'.

QUERY: {query}

LIVE SEARCH & AMAZON SNIPPETS:
---
{context_text}
---

Using the live context above and your technical knowledge, extract exact catalog data.
Return strictly valid JSON matching this schema:
{{
  "query": "{query}",
  "site": "{site_context}",
  "title": "Exact product or part name",
  "asin_or_oem": "ASIN or OEM part numbers if identified",
  "specifications": {{
      "wattage_or_power": "",
      "voltage": "",
      "dimensions_or_sizes": "",
      "material_or_type": "",
      "cross_compatibility": []
  }},
  "pricing": {{
      "amazon_or_retail_price": "estimated or found price",
      "status": "Available / Obsolete / OEM-only"
  }},
  "sources": [],
  "summary": "Concise 2-sentence summary."
}}
"""
    for model_name in MODELS:
        for attempt in range(2):
            try:
                res = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config={"response_mime_type": "application/json"}
                )
                return json.loads(res.text)
            except ServerError as e:
                if "503" in str(e) and attempt < 1:
                    time.sleep(1.5)
                    continue
                break
            except Exception:
                break

    raise RuntimeError("All models failed to return structured JSON.")

def main():
    parser = argparse.ArgumentParser(description="Live Web & Amazon Researcher via DuckDuckGo + Gemini.")
    parser.add_argument("--query", required=True, help="Search terms or part number")
    parser.add_argument("--site", default="general", help="Target site key")
    parser.add_argument("--output", default="data/research_catalog.json", help="Output JSON path")
    parser.add_argument("--no-amazon", action="store_true", help="Skip querying Amazon listings")
    args = parser.parse_args()

    # Step 1: Live Web / Amazon Retrieval (Free)
    web_data = fetch_live_ddg_context(args.query, include_amazon=not args.no_amazon)

    # Step 2: Structured Parsing via Free Gemini Flash-Lite
    structured = analyze_with_gemini(args.query, args.site, web_data)
    structured["retrieved_at"] = datetime.utcnow().isoformat()

    # Step 3: Append to destination JSON catalog
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    records = []
    if os.path.exists(args.output):
        try:
            with open(args.output, "r", encoding="utf-8") as f:
                records = json.load(f)
                if not isinstance(records, list):
                    records = [records]
        except Exception:
            records = []

    records.append(structured)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    # Single-line stdout to keep Antigravity context clean
    print(f"[RESEARCH COMPLETE] Appended '{structured.get('title', args.query)}' to {args.output}")

if __name__ == "__main__":
    main()