# FoodPlanner — Project Notes

## Stack
- Flask app, run on port 5050 (`python3 app.py`)
- Jinja2 templates in `templates/plan.html` (single-file app, all CSS inline)
- `curl_cffi` (impersonate='chrome120') for authenticated scraping

## Key files
- `app.py` — main Flask app, all logic
- `templates/plan.html` — single template, all CSS inline
- `saved_recipes.json` — master recipe list (BBC Good Food + PlanToEat + EYB)
- `ingredients_cache.json` — `{recipe_id: [ingredient_strings]}`
- `static/icons/` — local source icons (icon_PlanToEat.png, icon_EatYourBooks.png)

## Recipe sources
- BBC Good Food: `source=None` in JSON (legacy)
- Plan to Eat: `source="plantoeat"` — no `attributes`, name-based diet fallback
- Eat Your Books: `source="eatyourbooks"` — has `attributes`, has `source_book`

## Important patterns
- `source_icon` contains raw HTML `<img>` — always render with `|safe` in template
- `classify_diet()` checks dessert BEFORE vegetarian (dessert recipes are often also tagged vegetarian)
- `maybe_reload_recipes()` hot-reloads both `saved_recipes.json` and `ingredients_cache.json` by mtime
- PlanToEat recipes default to `vegetarian` when no meat/fish found in ingredients

## Diet categories
vegetarian 🥦 · fish 🐟 · white_meat 🍗 · red_meat 🥩 · dessert 🍰

## UI / Styling
- Color palette: Outlook blue (`#0078d4` primary, `#005a9e` dark, `#323130` text, `#605e5c` secondary text)
- All CSS is inline in `templates/plan.html` — no external stylesheet
- Logo: `static/logo.jpg` (original), `static/logo_circle.png` (72×72 circular crop, center cx=481 cy=337 r=286)

## Render Deployment
- Service: `srv-d6nfnkv5gffc739bsr10` — https://coding-dbx0.onrender.com
- Control via REST API: `curl -H "Authorization: Bearer $RENDER_API_KEY" https://api.render.com/v1/...`
- Trigger deploy: `POST /v1/services/{id}/deploys` with `{"clearCache":"do_not_clear"}`
- Poll status: `GET /v1/services/{id}/deploys/{deployId}` — states: queued → build_in_progress → update_in_progress → live/failed
- Python version: pinned to 3.12 via `FoodPlanner/.python-version` (Render defaults to 3.14, breaks greenlet)

## PlanToEat API (authenticated via `plantoeat_cookies.json`)
- Schedule recipe: `POST /planner/create` — body: `rid=<id>&date=YYYY-MM-DD&section=<breakfast|lunch|dinner>`
- Create stub recipe: `GET /recipes/new` → parse `data-recipe-id` → `POST /recipes/update/<id>` with `recipe[title]`, `recipe[source]`
- Use `curl_cffi` Session (`impersonate='chrome120'`) — standard `requests` gets blocked
- Cookie file path: `plantoeat_cookies.json` (gitignored) — must exist for scheduling to work
