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
