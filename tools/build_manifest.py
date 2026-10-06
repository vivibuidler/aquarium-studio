"""Read authoritative plans; create an app-owned normalized manifest without editing sources."""
import json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'references/habitat-options'
OUT=ROOT/'data'
def read(p):return json.loads(p.read_text())
profiles=read(OUT/'visual-profiles.json')
styles=profiles['species'];plantstyles=profiles['plants']
d=read(SOURCE/'options.json');plans=[];species={}
defaults=read(ROOT/'references/display-defaults.json');owner=defaults['owner']
for n,o in enumerate(d['options']):
 report=read(SOURCE/o['evaluator_reference']['current_report_json'])
 layout=profiles['habitats'][o['id']]
 groups=[]
 for f in o['fish_groups']:
  name=f['scientific_name'];style=styles[name]
  keys=[k for k in f if ('length' in k or 'size' in k) and k.endswith('_cm') and isinstance(f[k],(int,float,list))]
  total=[k for k in keys if 'total' in k or 'allowance' in k or k=='adult_size_allowance_cm']
  key=total[0] if total else keys[0]
  val=f[key];value=max(val) if isinstance(val,list) else val
  conversion=1 if total else 1/(1-style['tail'])
  cm=round(value*conversion,2)
  species[name]=dict(scientificName=name,commonName=f['common_name'],commonNamePlural=f['common_name'] if f['common_name'].lower().endswith(('fish','medaka')) else f['common_name']+'s',totalLengthCm=cm,sourceSizeField=key,sourceSizeValue=val,sizeInterpretation='Source total-length planning allowance' if total else 'Visual total-length conversion; source body/standard length divided by configured body proportion, not a new measured maximum',appearance=f.get('appearance_compromise','Representative ordinary commercial adults; exact sexes and batch colors not guaranteed'),profile=style,careSource=f.get('care_source'),sourcePlan=o['plan_file'])
  groups.append(dict(species=name,count=f['adult_count'],sexRequirement=f.get('sex_requirement','Refer to the numbered plan; displayed sex mix is illustrative')))
  # Honey gourami proposed sex ratio is a care condition, visual representation only.
  if style.get('preferredVisualSexMix'):groups[-1]['visualSexMix']=style['preferredVisualSexMix']
 plants=[]
 for g in o['plant_groups']:
  name=g['scientific_name'];mode=layout['plantMode']
  plants.append(dict(species=name,quantity=g['initial_quantity'],unit=g['quantity_unit'],placement=g.get('placement','Rear/side planting with open front; see numbered plan'),mode=mode,rootedUnits=layout.get('rootedUnits'),patchPattern=layout.get('patchPattern',[0,1,2]),profile=plantstyles[name],biomassNote='Shoot/crown counts, patch area and growth are illustrative, not guaranteed nursery biomass or timed outcomes'))
 costitems=o['existing_model_candidate']['purchase']['cost_items'];sand=next(x for x in costitems if x['id']=='substrate')
 sandlbs=layout['sandMassLb']
 mini=o['environmental_observations'];v=lambda k:mini[k]['value']['value']
 patchDepth=layout['patchDepthCm']
 plans.append(dict(id=o['id'],name=layout['name'],number=n+1,country=o['geography']['country'],habitat=o['geography']['habitat'],displayHabitat=layout['displayHabitat'],groups=groups,plants=plants,fishCount=sum(g['count'] for g in groups),minimumBaseCm=[v('minimum_internal_length'),v('minimum_internal_width')],minimumLaneCm=layout['minimumLaneCm'],substrate=dict(massLb=sandlbs,densityLbPerFt3=95,patchDepthCm=patchDepth,patchAreaFraction=layout['patchAreaFraction'],color='#d0c7af',note='Funded commercial sand, not authenticated wild sediment'),decor=[],startupUsd=report['costs']['startup_known_subtotal']['expected'],regularStandUsd=o['retail_cost_screen'].get('regular_stand_total_usd'),maintenance=report['maintenance']['weekly_minutes'],verdict=report['verdict'],environment=o['environmental_requirements'],unresolved=o['unresolved'],planFile=o['plan_file'],reportFile=o['evaluator_reference']['current_report_markdown'],sources=o['sources'],evidenceLevel=o['evidence_level']))
manifest=dict(schemaVersion=1,sourceAccessedAt=d['accessed_at'],source='references/habitat-options/options.json',sourceSnapshotNote=d['snapshot_note'],sourceSha256=hashlib.sha256((SOURCE/'options.json').read_bytes()).hexdigest(),generatedBy='tools/build_manifest.py',units='cm',ownerProfile=dict(targetVolume=defaults['owner']['target_volume'],upfrontBudgetUsd=owner['upfront_budget'],maintenanceCeilingMinutes=owner['maintenance_budget_minutes_per_week']),visualAssumptions='Numerical motion, shape proportions, colors, illustrative sex/strain mix and plant biomass are artistic interpretations; care evidence is not a measured animation model.',plans=plans,species=species)
OUT.mkdir(exist_ok=True);(OUT/'plans.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Normalized {len(plans)} active plans, {len(species)} fish profiles; source untouched.')
