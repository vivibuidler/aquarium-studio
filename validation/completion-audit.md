# Aquarium Studio validation audit

Validated locally on October 5, 2026. This report describes checks performed, not a guarantee of fish health or performance on other computers.

## Public package

The standalone public package passed all seven domain tests (`alternate-release-test-output.txt`). These check the sanitized source snapshot, exact counts and adult size semantics, conditional cost/work data, editable dimensions, nursery quantities, conserved substrate volume, Hainan’s rooted/floating layout, frame-rate reproducibility and forty behavior cases: ten plans × two planting stages × two seeds, each for 125 simulated seconds. No failures were reported. Source snapshot and asset hashes are independently checked by `tools/check_public_package.py`.

Public references are curated snapshots. They preserve scientific identities, quantities, source size fields, conditions and dated cost/work values. Private installation records and planning conversations are excluded; the manifest hash identifies the public snapshot rather than the private original.

## Simulator behavior and rendering

The full browser check exercised all ten plans and both planting stages; exact counts, Hainan golden barbs, pause/reset, labels/scale, fish picking, keyboard views, favorites/notes across reload, matched comparison time/camera, geometry warnings, actual PNG/contact-sheet downloads, tablet layout and source links. Console errors and failed requests were empty. Reports and captures were produced using the original local build; the standalone release uses the same rendering and simulation modules with portable serving and curated references. Its separate public-package smoke check verifies the release itself.

Mesh checks verified all fifteen fish profiles inside their collision radii, all twenty plant layouts’ stem/root geometry inside shared collision envelopes, and the three equipment proxies inside configured bounds. The plant audit sampled 268,024 structural vertex/extrema cases with zero outside bounds. The behavior suite found no escapes, discontinuous jumps, intersecting agent spheres or stuck agents. Three-minute gourami runs showed near-surface access while keeping mouths below the waterline. Movement cadence is illustrative.

All fifteen species portraits, all twenty starter/established layouts, comparison and tablet screenshots were visually inspected. Established growth is an illustration; fish remain at adult scale and purchased plant units remain units rather than invented mature biomass.

## Measured performance

`performance-results.json` records five-second warmed-up counted render windows at 1440×1100, Chrome 154, Intel Iris Plus 645 using ANGLE Metal. The ten single-tank High scenes measured **33.0–48.8 FPS**. Comparing the two slowest measured scenes produced **24.0 FPS High / 25.2 FPS Light**.

The approximately 60-FPS ordinary-view / 30-FPS lower-quality aims were not consistently reached on this machine. Those limits are retained explicitly. Narrow leaf mesh subdivisions, instancing and single-pass transparent surfaces reduce drawing work without removing fish, plants or anatomy. Light mode reduces rendering work while retaining simulation rules. Rolling FPS after image exports is contaminated by initialization/export stalls and is not used as the steady-render benchmark. Performance varies with hardware and competing graphics workloads.

## Limits

Procedural anatomy, commercial colors, movement constants and planting growth are interpretations. Equipment is a placement proxy; water and glass use real-time approximations. Default internal dimensions are assumptions until measured. This app does not predict compatibility, water quality, stress, survival, breeding or plant growth, and does not yet grade Marketplace equipment. Dated prices and care conditions require review before buying or stocking a real tank.

## Alternate-plan release — October 5, 2026

Three independent candidates are now available in an accessible Alternate plans tab: Archer 6 threadfins + 12 blue-eyes; Paraguay 10 black neons + 10 black phantoms + 6 bronze corys; Essequibo 10 glowlights + 10 head-and-tail-lights + 10 dwarf pencilfish. The main catalog remains ten plans. The public release passed all nine domain tests, including twelve additional alternate motion cases (three plans × two stages × two seeds, each 90 simulated seconds).

`alternate-browser-results.json` verifies both tabs, exact cohorts, both planting stages, reference responses, unknown cory cost/work, persistent notes/favorites, comparison with a main plan, alternate-only PNG export, keyboard navigation and tablet layout. Errors were empty. New fish geometry and conservative floor clearance were checked; threadfin rays, bronze-cory anatomy, pencilfish stripes, all six alternate planting scenes and the contact sheet were visually inspected. Historical alternate quotes are labeled; no cory total or workload is fabricated. The archived Essequibo branch/root is included and shares its collision geometry with rendering.

Prior performance measurements describe the ten-main-plan release; no new frame-rate guarantee is made for the alternate communities.
