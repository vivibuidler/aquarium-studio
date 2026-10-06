"""Check public snapshot integrity and runtime/reference portability without a server."""
import hashlib, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(p):return json.loads(p.read_text())
manifest=read(ROOT/'data/plans.json')
source=ROOT/manifest['source']
assert source.is_file() and source.is_relative_to(ROOT/'references')
assert hashlib.sha256(source.read_bytes()).hexdigest()==manifest['sourceSha256'], 'Regenerate public manifest after source changes'
assert 'public' in manifest['sourceSnapshotNote'].lower()
assert len(manifest['plans'])==10
for plan in manifest['plans']:
    for key in ['planFile','reportFile']:
        target=(ROOT/'references/habitat-options'/plan[key]).resolve()
        assert target.is_relative_to(ROOT/'references') and target.is_file(), (plan['id'],key)
alternates=read(ROOT/'data/alternates.json')
assert len(alternates['plans'])==3
assert not ({p['id'] for p in manifest['plans']} & {p['id'] for p in alternates['plans']})
for plan in alternates['plans']:
    assert plan['category']=='alternate' and plan['unresolved']
    assert sum(g['count'] for g in plan['groups'])==plan['fishCount']
    target=(ROOT/plan['planUrl']).resolve()
    assert target.is_relative_to(ROOT/'docs/alternates') and target.is_file()
for asset in read(ROOT/'data/assets-manifest.json')['assets']:
    target=(ROOT/asset['path']).resolve()
    assert target.is_relative_to(ROOT) and target.is_file()
    assert hashlib.sha256(target.read_bytes()).hexdigest()==asset['sha256'], asset['path']+' hash stale'
    assert (ROOT/asset['licenseFile']).is_file(), 'Missing asset license'
    assert asset['license']==('MIT' if asset['path'].startswith('vendor/') else 'BUSL-1.1')
for base in ['references','data','src']:
    for path in (ROOT/base).rglob('*'):
        if path.suffix in {'.json','.md','.js','.ts'}:
            text=path.read_text()
            assert '/Users/' not in text, 'Private absolute path: '+str(path.relative_to(ROOT))
            assert not re.search(r'(?:assumed|reference-region|ZIP)\d{5}',text,re.I), 'Private delivery ZIP: '+str(path.relative_to(ROOT))
print('Public snapshot SHA, ten plans, twenty main reference targets, three alternate references, asset hashes/licenses and portable paths verified.')
