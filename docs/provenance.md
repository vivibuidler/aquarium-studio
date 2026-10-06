# Visual provenance and assumptions

## Authoritative planning data

The adapter reads `references/habitat-options/options.json`, the current assessments indexed there, and the numbered-plan decisions. Generated `data/plans.json` preserves scientific identity, exact proposed adult counts, nursery units, assessed costs/work ranges, source fields and a SHA-256 of the sanitized public snapshot. The Hainan replacement is ten golden *Barbodes semifasciolatus*, not a paradise fish. Archives and the unresolved Archer pairing are excluded.

The saved numbered plans, source matrix and supplier audits distinguish native occurrence, aquarium culture, and commercial appearances. No model here authenticates a Hainan, Kasumigaura or other wild lineage. The app's complete-plan and assessment links are served read-only from curated public reference snapshots.

## Original procedural assets

All fish meshes, fins, eye/gill/mouth details, scale textures, stripes, spots, botanical meshes, leaf veins, sand texture, glass/water scene and illustrative equipment geometry were authored for this project. No retailer photographs, image-search pictures, downloaded stock models, paid assets or AI-generated raster images are embedded. Procedural assets and app source are provided under the root project license (third-party licenses remain separate); attribution is recorded in `data/assets-manifest.json`.

Fish profiles use distinct body/fin proportions and species-identifying markings. These are artistic interpretations informed by the named plans and their linked care/supply references, not measured 3D scans. Selected commercial appearances are followed: golden Hainan barbs, ordinary striped short-finned danios, representative ornamental medaka, and ordinary x-ray tetras. Honey gourami appearance illustrates the preferred one-male/three-female proposal; receiving that ratio remains unverified. Other unsexed groups use an illustrative alternating appearance, without a claim that those sexes or colors will be supplied. Representative medaka colors and blue-eye spotting are not authenticated local forms.

Species anatomy/appearance guidance includes the plans' linked sources and the consulted [spotted blue-eye account](https://www.seriouslyfish.com/species/pseudomugil-gertrudae/) and [x-ray tetra account](https://www.seriouslyfish.com/species/pristella-maxillaris/). No prose, photograph or mesh from those pages is reproduced as an asset. Exact body-depth ratios, fin lengths, material colors and animation constants remain visual assumptions.

## Scale, behavior and plant culture

All world geometry is in centimeters. Source standard/body length is preserved separately from total length. Where a source supplies only standard/body length, a configured tail/body fraction provides a labeled visual total-length allowance. Existing source total-length allowances are used directly; tails are not added again. Upper endpoints of planning ranges supply conservative adult visual scale.

The default internal 90×44×44 cm scene with a 41 cm waterline is a display assumption inspired by the nominal 36×18-inch external footprint, not a measured tank or guaranteed 50-gallon usable-water capacity. Editing it keeps counts unchanged. The display volume calculation is not a stocking rule. All space constraints and site/equipment checks remain conditional.

Numerical speed, hover, steering, neighbor spacing, grouping, vertical tendency and display choices are artistic tuning; qualitative husbandry descriptions do not supply validated movement constants. Individual motion uses seeded randomness and fixed timesteps, full-length conservative lateral/pair clearance with anatomical vertical clearance for brief gourami surface visits, shared stem/root capsules and equipment avoidance and continuous turns. Leaf blades are traversable foliage. Rendered stems and hanging roots share the same segments as collision capsules, including a sway allowance; small rosette crowns have solid core bounds. This simplifies body shape and foliage contact and is not a fluid-dynamics or stress model. The model does not guarantee an observed live tank will reproduce its behavior.

Starter biomass is an explicit visual interpretation of pots, bunches or cups. Established shoots are illustrative, not promised maturity or a guaranteed crown count. Plant forms follow rooted, loose or floating culture in the current aquarium plans, including culture compromises documented there. Sand mass is conserved when distributing deeper rooted patches and a shallower front. No unbudgeted underwater wood, rocks, leaf litter or filler species are added. The outside display plinth and neutral viewing surround are presentation choices, not aquarium decor.

## Third-party runtime

Three.js 0.180.0 (r180), copyright the Three.js authors, is pinned locally under the MIT license in `vendor/THREE-LICENSE.txt`. Only its module/core runtime and OrbitControls are included. Installation/material/instancing/control guidance was checked in the official [Three.js documentation](https://threejs.org/docs/), including [MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html), [InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html) and [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html). The exact pinned source rather than latest-version assumptions governs the implementation.

Playwright is an optional development-only browser verification dependency; its package distribution contains its Apache license. Runtime rendering requires no npm package installation, external CDN or account.

## Fidelity limits

The goal is a believable, species-recognizable real-time comparison, not a photogrammetric replica. Actual batch colors, sizes, sex mix, plant biomass, tank materials and installed equipment position are unmeasured. Equipment geometry is a plausible placement proxy, not a manufacturer CAD model. A procedural neutral studio environment supplies reflections; glass uses a configurable physical transmission/IOR material and lower-resolution refraction buffer. These are restrained optical approximations, not a validated optical replica or measured water flow. Lighting is matched neutral viewing, not measured aquarium PAR. Rendering performance reports identify the tested browser/device and do not guarantee another machine's frame rate.

The editable `clearanceRadiusFraction` reserves a sphere around each fish, including fin edges. The anatomy audit samples both sex proportions, animation phases, maximum configured swimming effort and the body shader deformation; surface poses are checked separately against configured waterline clearance. This collision envelope is an implementation bound, not a biological spacing rule.

Equipment collision cylinders include configured padding for the filter intake rings and thermometer bulb; housing and heater-cap boxes use the rendered dimensions. These bounds describe the procedural placement proxies rather than manufacturer dimensions. Batching keys retain each configured ornamental color, including when the palette length changes.

Thin transparent fin, ray and glass/water/lid surfaces use the pinned runtime's single-pass double-sided rendering option. This reduces redundant draw submission while keeping both faces and all geometry. Instanced fish/plant buffers are explicitly disposed on plan changes, alongside their geometry and materials.

## Exploratory alternate catalog

`data/alternates.json` holds three separate candidates, leaving the ten source plans unchanged. Threadfin rainbowfish use the cultivation account’s 6 cm male / 4 cm female total lengths and illustrative 2 male / 4 female appearance; supplied sex ratios and ordinary tiny-food acceptance remain unresolved. Bronze corys use a 7.5 cm standard-length source and conservative 8.82 cm visual conversion; stock identity is not authenticated to Upper Paraguay records. Their barbels, body plates and small adipose fin are procedural interpretations. Bottom agents use a mesh-checked floor clearance and bounded shallow pitch, retaining conservative full-body clearances around fish and solid obstacles. Dwarf pencilfish use the archived 3.5 cm total-length allowance and slower upper/plant-edge movement.

The Essequibo candidate includes its historically budgeted $20 branch/root, drawn from the same capsule segments used for avoidance, plus three fresh-cut Mayaca packs with approximately 18 starter stems. It keeps its archived 10+10+10 groups and size allowances. Original main-plan layouts retain their existing decor. Alternate historical totals are labeled; the new cory community has no verified total or workload estimate. These scenarios do not imply compatibility, current stock availability or biological approval.

## Public snapshot boundary

Public reference summaries preserve scientific identity, adult counts, nursery units, source size semantics, dated cost/work values and caveats. Personal owner/installation details, prompts, private procurement logs and archives are excluded. Reference summaries are curated derivatives rather than the complete private planning workspace. The manifest hash identifies the public JSON snapshot.
