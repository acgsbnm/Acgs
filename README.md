# Bluebridge Doc Fork

This folder is the Bluebridge-facing documentation fork derived from `Project_Documentation/gh-pages`.

Rules for this edition:

- Keep the full external contract for every endpoint that remains visible.
- Hide internal persistence details such as mapping tables, join tables, workflow tables, and service names.
- Hide admin-only approval endpoints unless Bluebridge is explicitly meant to use them.
- Keep approval behavior like `202 PENDING_APPROVAL` where it affects partner integration behavior.
- Do not hand-maintain a separate reduced schema for included endpoints.

Implementation approach:

- `index.html` loads the full `data-integration-spec.js`
- `js/data-bluebridge-filter.js` removes or rewrites internal-only details for the Bluebridge audience
- `js/data-proposed-additions-bluebridge-safe.js` keeps proposal content out of the Bluebridge edition

This keeps the Bluebridge copy aligned with the full spec while avoiding the field drift that happened in the older trimmed document.
