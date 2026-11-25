import json

with open('src/data/catalog.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

total_eps = sum(len(d.get('episodes', [])) for d in data)
print(f'Total series: {len(data)}')
print(f'Total episodes: {total_eps}')

# Remove internal fields and limit episodes
for d in data:
    d.pop('_embedUrl', None)
    d.pop('_sourceUrl', None)
    if 'episodes' in d and len(d['episodes']) > 5:
        d['episodes'] = d['episodes'][:5]

with open('src/data/catalog.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

print('Reduced: removed internal fields, limited episodes to 5 per series')

# Check new size
import os
size = os.path.getsize('src/data/catalog.json')
print(f'New size: {size / 1024 / 1024:.2f} MB')