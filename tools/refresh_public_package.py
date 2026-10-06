"""Maintainer packaging tool: refresh a public snapshot from an authorized local workspace.

Usage: python3 tools/refresh_public_package.py --source-root PATH
Never copies personal owner profiles, chat prompts, supplier cart logs or archives.
README, LICENSE and public-only documents are intentionally left untouched.
"""
import argparse, hashlib, json, re, shutil
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1]

def clean(value):
    if isinstance(value, dict): return {k: clean(v) for k,v in value.items()}
    if isinstance(value, list): return [clean(v) for v in value]
    if isinstance(value, str):
        value = re.sub(r'Cary', 'reference-region', value, flags=re.I)
        value = re.sub(r'(assumed|reference-region|ZIP)(\d{5})', r'\1[reference delivery area]', value, flags=re.I)
        value = re.sub(r'/Users/[^\s"<>]+', '[private workspace]', value)
    return value

def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2)+'\n')

def refresh(source_root):
    app=source_root/'aquarium-simulator'; original=source_root/'biotope-plan/habitat-options'
    for folder in ['src','data','vendor','tests','tools']:
        target=PUBLIC/folder;target.mkdir(exist_ok=True)
        for src in (app/folder).rglob('*'):
            if src.is_file() and '__pycache__' not in src.parts and src.name!='render_ab.mjs':
                dest=target/src.relative_to(app/folder);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dest)
    for name in ['index.html','style.css','server.py','package.json','package-lock.json','Launch Aquarium Studio.command','.gitignore']:
        shutil.copy2(app/name,PUBLIC/name)
    for extra in [PUBLIC/'tools/render_ab.mjs']:
        if extra.exists():extra.unlink()
    pkg=json.loads((PUBLIC/'package.json').read_text());pkg['license']='BUSL-1.1';pkg['description']='Compare ten freshwater habitat plans in an interactive, configurable 3D aquarium.';pkg['engines']={'node':'>=20'};write_json(PUBLIC/'package.json',pkg)
    lock=json.loads((PUBLIC/'package-lock.json').read_text());lock['packages']['']['license']='BUSL-1.1';lock['packages']['']['engines']=pkg['engines'];write_json(PUBLIC/'package-lock.json',lock)
    (PUBLIC/'docs').mkdir(exist_ok=True)
    shutil.copy2(app/'docs/provenance.md',PUBLIC/'docs/provenance.md')
    shutil.copytree(app/'docs/alternates',PUBLIC/'docs/alternates',dirs_exist_ok=True)
    alternate=clean(json.loads((app/'data/alternates.json').read_text()))
    for plan in alternate['plans']:
        plan.pop('originalReferences',None)
        plan['planFile']=plan['planUrl'];plan['reportFile']=None
    write_json(PUBLIC/'data/alternates.json',alternate)
    d=json.loads((original/'options.json').read_text()); entries=[]
    normalized=json.loads((app/'data/plans.json').read_text())
    for o in d['options']:
        p=next(x for x in normalized['plans'] if x['id']==o['id'])
        fields=['id','status','plan_file','geography','evidence_level','strict_locality_cooccurrence_proven','fish_groups','plant_groups','environmental_requirements','retail_cost_screen','unresolved','sources','environmental_observations']
        entry=clean({k:o[k] for k in fields if k in o})
        entry['environmental_observations']={k:v for k,v in entry['environmental_observations'].items() if k in {'minimum_internal_length','minimum_internal_width'}}
        # Keep useful scientific/stocking fields; remove private audit/procurement trails.
        for g in entry['fish_groups']+entry['plant_groups']:
            for k in list(g):
                if k in {'observations','selected_supplier_variant_id','supply_audit_file','design_source'}:g.pop(k)
        raw_sources=o['sources']; public_sources=list(raw_sources.values()) if isinstance(raw_sources,dict) else raw_sources
        entry['sources']=[clean(s if isinstance(s,dict) else {'url':s,'role':'Evidence or procurement source; see organism fields for exact claim'}) for s in public_sources if (s.get('url','') if isinstance(s,dict) else s).startswith(('https://','http://'))]
        entry['existing_model_candidate']={'purchase':{'cost_items':[x for x in o['existing_model_candidate']['purchase']['cost_items'] if x['id']=='substrate']}}
        jsonpath=f'assessment-results/{o["id"]}.json'; mdpath=f'assessment-results/{o["id"]}.md'
        entry['evaluator_reference']={'current_report_json':jsonpath,'current_report_markdown':mdpath,'meaning':'Public cost/work snapshot; full private installation model is not distributed. Not compatibility proof.'}
        report=json.loads((original/o['evaluator_reference']['current_report_json']).read_text())
        snapshot={'snapshotNote':'Sanitized public summary of the saved 2026-10-04 assessment, not a fresh retail quote or installation approval.','verdict':report['verdict'],'costs':{'startup_known_subtotal':report['costs']['startup_known_subtotal']},'maintenance':{'weekly_minutes':report['maintenance']['weekly_minutes']}}
        write_json(PUBLIC/'references/habitat-options'/jsonpath,snapshot)
        regular_text=f'${p["regularStandUsd"]:.2f}' if p['regularStandUsd'] is not None else 'See original scenario; no separate regular-stand total recorded'
        md=f'# {p["name"]}: cost and maintenance snapshot\n\n{snapshot["snapshotNote"]}\n\n- Conditional startup: ${p["startupUsd"]:.2f}\n- Regular stand scenario: {regular_text}\n- Ordinary weekly work: {p["maintenance"]["low"]:.1f}–{p["maintenance"]["high"]:.1f} minutes (expected {p["maintenance"]["expected"]:.1f})\n- Verdict: {p["verdict"]}\n\nThese totals retain the original scenario assumptions. Freight, stock, fitted equipment, tap chemistry, receiving arrangements and actual space need rechecking. No Marketplace discounts are credited.\n'
        (PUBLIC/'references/habitat-options'/mdpath).write_text(md)
        lines=[f'# {p["number"]:02d} — {p["name"]}', '', '**Public sanitized stocking snapshot, assessed 2026-10-04.** This is a conditional regional biotope design, not a verified recreation of a jointly sampled wild population or a purchase recommendation.', '', f'{o["geography"].get("locality",p["displayHabitat"])}, {o["geography"]["country"]}: {o["geography"]["habitat"]}.', '', f'Evidence level: `{o["evidence_level"]}`. Exact microhabitat co-occurrence proven: {o["strict_locality_cooccurrence_proven"]}.', '', '## Exact proposed adults', '']
        for g in p['groups']:
            s=normalized['species'][g['species']]
            lines += [f'- **{g["count"]} {s["commonName"]}** (*{g["species"]}*): display allowance {s["totalLengthCm"]} cm total length; source `{s["sourceSizeField"]}` = {s["sourceSizeValue"]} cm. {s["sizeInterpretation"]}. {s["appearance"]}. {g["sexRequirement"]}.']
        lines+=['','## Plants and funded layout','']
        for g in p['plants']:lines += [f'- {g["quantity"]} {g["unit"]} of *{g["species"]}*: {g["placement"]}. {g["biomassNote"]}.']
        lines += ['',f'{p["substrate"]["massLb"]} lb of commercial sand. Deeper planted patches: {p["substrate"]["patchDepthCm"]} cm. No budgeted wood, rocks or additional filler species. Keep front/central swimming lanes and surface access open.', '',f'Minimum source base: {p["minimumBaseCm"][0]} × {p["minimumBaseCm"][1]} cm. Illustrative clear lane: {p["minimumLaneCm"]} cm. Nominal gallons do not prove a fit.', '', '## Conditional water and care checks','',json.dumps(clean(p['environment']),ensure_ascii=False),'']
        lines += ['- '+clean(x) for x in p['unresolved']]
        lines += ['',f'[Cost/work assessment]({mdpath})', '', '## Evidence links','']
        lines += [f'- [{s.get("role",s.get("purpose","Evidence source"))}]({s["url"]}) (accessed {s.get("accessed_at",d["accessed_at"])})' for s in entry['sources']]
        (PUBLIC/'references/habitat-options'/entry['plan_file']).write_text('\n'.join(lines)+'\n')
        entries.append(entry)
    write_json(PUBLIC/'references/habitat-options/options.json',{'schema_version':d['schema_version'],'status':'public_sanitized_snapshot','accessed_at':d['accessed_at'],'snapshot_note':'Curated public data derived from the active ten-plan collection. Personal installation/owner details and private procurement audit paths omitted. SHA-256 applies to this public snapshot, not the private source. Scientific identities, quantities, source size fields, cost/work values and constraints are retained.','options':entries})
    comparison=['# Ten habitat plans: public comparison','','Conditional regional biotope planning snapshots, assessed 2026-10-04. Visual preference is a shortlist, not stocking approval. Costs are historical scenario totals; nursery units do not promise mature plant biomass. All plans need real geometry, water, receiving arrangements, supplier stock and delivered costs checked.','','| Habitat | Adults | Starter plants | Conditional startup | Ordinary weekly work |','| --- | --- | --- | ---: | --- |']
    for p in normalized['plans']:
        fish=' + '.join(str(g['count'])+' '+normalized['species'][g['species']]['commonName'] for g in p['groups'])
        plants=' + '.join(str(g['quantity'])+' '+g['unit']+' '+g['species'] for g in p['plants'])
        comparison.append(f'| [{p["name"]}]({p["planFile"]}) | {fish} | {plants} | ${p["startupUsd"]:.2f} | {p["maintenance"]["low"]:.0f}–{p["maintenance"]["high"]:.0f} min |')
    comparison+=['','Groups are conservative design proposals rather than measured wild population ratios. Fish appearances may be commercial aquarium strains; source summaries disclose locality evidence limits and selected appearances. No extra underwater rocks, wood or filler plants are funded. See each plan for adult-size semantics, source base dimensions, clear lanes, planting and unresolved care conditions.']
    (PUBLIC/'references/habitat-options/comparison.md').write_text('\n'.join(comparison)+'\n')
    write_json(PUBLIC/'references/display-defaults.json',{'owner':{'target_volume':{'value':50,'unit':'US_gal','status':'configurable_display_default'},'upfront_budget':1000,'maintenance_budget_minutes_per_week':65},'note':'Public reusable scenario defaults, not a personal installation profile.'})
    server=(PUBLIC/'server.py').read_text().replace("ROOT.parent/'biotope-plan'","ROOT/'references'");(PUBLIC/'server.py').write_text(server)
    tests=(PUBLIC/'tests/core.test.js').read_text().replace('../../biotope-plan/','../references/');(PUBLIC/'tests/core.test.js').write_text(tests)
    builder=(PUBLIC/'tools/build_manifest.py').read_text().replace('parents[2]','parents[1]').replace("ROOT/'biotope-plan/habitat-options'","ROOT/'references/habitat-options'").replace("ROOT/'aquarium-simulator/data'","ROOT/'data'").replace("source='biotope-plan/habitat-options/options.json'","source='references/habitat-options/options.json',sourceSnapshotNote=d['snapshot_note']")
    builder=re.sub(r'^owner=.*;defaults=.*$', "defaults=read(ROOT/'references/display-defaults.json');owner=defaults['owner']", builder, flags=re.M)
    (PUBLIC/'tools/build_manifest.py').write_text(builder)
    for path in (PUBLIC/'tools').glob('*.mjs'):
        s=path.read_text().replace("executablePath:process.env.AQUARIUM_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',", "...(process.env.AQUARIUM_CHROME?{executablePath:process.env.AQUARIUM_CHROME}:{}),")
        s=s.replace("executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',","...(process.env.AQUARIUM_CHROME?{executablePath:process.env.AQUARIUM_CHROME}:{}),")
        s=re.sub(r"(?<!\|\|)'http://127\.0\.0\.1:8765'", "(process.env.AQUARIUM_URL||'http://127.0.0.1:8765')", s)
        path.write_text(s)
    appjs=(PUBLIC/'src/app.js').read_text().replace('Complete stocking plan ↗','Public stocking snapshot ↗').replace('Current equipment assessment ↗','Saved cost/work snapshot ↗');(PUBLIC/'src/app.js').write_text(appjs)
    provenance=(PUBLIC/'docs/provenance.md').read_text().replace('`biotope-plan/habitat-options/options.json`','`references/habitat-options/options.json`').replace('a SHA-256 of the authoritative index','a SHA-256 of the sanitized public snapshot').replace('served read-only from the original project','served read-only from curated public reference snapshots').replace('under the local MIT license','under the root project license (third-party licenses remain separate)')
    (PUBLIC/'docs/provenance.md').write_text(provenance+'\n## Public snapshot boundary\n\nPublic reference summaries preserve scientific identity, adult counts, nursery units, source size semantics, dated cost/work values and caveats. Personal owner/installation details, prompts, private procurement logs and archives are excluded. Reference summaries are curated derivatives rather than the complete private planning workspace. The manifest hash identifies the public JSON snapshot.\n')
    (PUBLIC/'validation').mkdir(exist_ok=True);(PUBLIC/'validation/.gitkeep').touch()
    # Package verification assets only when the parent explicitly selects their final passing evidence.
    assets=json.loads((PUBLIC/'data/assets-manifest.json').read_text())
    for asset in assets['assets']:
        asset['sha256']=hashlib.sha256((PUBLIC/asset['path']).read_bytes()).hexdigest()
        if not asset['path'].startswith('vendor/'):
            asset['license']='BUSL-1.1';asset['licenseFile']='LICENSE'
    write_json(PUBLIC/'data/assets-manifest.json',assets)
    print('Portable runtime refreshed; README/LICENSE untouched. Run npm run manifest and npm test.')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--source-root',type=Path,required=True);args=parser.parse_args();refresh(args.source_root.resolve())
