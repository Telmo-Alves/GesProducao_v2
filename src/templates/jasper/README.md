JasperReports templates

Structure
- Place editable `.jrxml` under `src/templates/jasper/`.
- Place compiled `.jasper` files under `src/templates/jasper/compiled/`.
- The backend looks in `compiled/` first, then falls back to `.jrxml`.

Design with Jaspersoft Studio
- Launch Studio with repo workspace: `npm run studio` (Linux).
- Create a report using JSON data adapter.
- Use JSONQL query with root `data` (the API sends `{ data: [...] }`).
- Export/compile to `.jasper` and save into `compiled/` with a simple name, e.g. `recepcoes.jasper`.

Runtime
- Backend calls `jasperstarter` to render. Configure one of:
  - Install JasperStarter and ensure it is in PATH as `jasperstarter`.
  - Or set `JASPER_STARTER_BIN` in `.env` to the executable path.
- Optional: set `JASPER_TEMPLATES_DIR` (defaults to `src/templates/jasper`).

Endpoint
- `GET /reports/jasper/recepcoes/pdf?template=recepcoes` -> generates PDF using `compiled/recepcoes.jasper`.

Notes
- Keep field names in the report matching the JSON structure (e.g., `nome`, `descricao`, `rolos`, `rolos_entregues`, etc.).
- For totals/calculated fields, prefer JRXML expressions or parameters.

