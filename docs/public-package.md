# Public package and reproducibility

This repository runs without the private planning workspace. Its ten active plans are a curated, sanitized snapshot, with source identities, proposed adult quantities, nursery units, size semantics and dated cost/maintenance values retained. `references/habitat-options/options.json` and its compact assessment JSON files are sufficient to regenerate `data/plans.json`. The manifest SHA-256 identifies this **public snapshot**, not the original private source.

The reference Markdown files summarize the proposed stocking and evidence; they do not reproduce the private installation assessment or supplier cart audit. Personal owner information, precise home/location details, prompts and research archives are excluded. Retail values are historical scenario inputs, not current quotes.

Run `npm run manifest` to regenerate data. Run `npm test` for source/count preservation, length semantics, fixed-step reproducibility, configurable tank warnings, funded substrate conservation, all-plan/all-stage multi-seed movement, and the Hainan planting layout. These pure-model tests need Node; they require no npm dependencies. CI runs them on Node 24 and Python 3.13 and detects stale generated data. It is not a browser or biological compatibility check.

Browser validation is optional: run `npm ci`, `npx playwright install chromium`, start `python3 server.py` in another terminal, then run `node tools/browser_validation.mjs` and `node tools/asset_validation.mjs`. Set `AQUARIUM_URL` for another local port and `AQUARIUM_CHROME` to use an installed Chrome executable. The default is Playwright's Chromium, independent of operating system. Browser timing is device-specific; do not compare software-rendered CI frame rates with a physical GPU.

The maintainer-only refresh command is `python3 tools/refresh_public_package.py --source-root PATH_TO_AUTHORIZED_WORKSPACE`, followed by `npm run manifest`. It refreshes runtime/reference files but preserves the public README, license, GitHub workflow and additional public documentation. It deliberately does not copy private validation output. After a refresh, rerun checks and refresh asset hashes before publication.

Workflow action versions were checked against the official [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node) and [setup-python](https://github.com/actions/setup-python) documentation. Major tags are version-pinned and can receive upstream patch releases; they are not immutable commit pins.
