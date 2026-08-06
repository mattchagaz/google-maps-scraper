// Filter chip definitions + matching logic for the results list.
// Each filter checks a field is missing ("Sem info") on the collected record.

export const FIELD_FILTERS = [
  { key: 'website', label: 'Sem website', icon: '🌐' },
  { key: 'telefone', label: 'Sem telefone', icon: '📞' },
  { key: 'email', label: 'Sem email', icon: '✉️' },
  { key: 'redes', label: 'Sem redes sociais', icon: '📱' },
];

export function isMissing(value) {
  return !value || value === 'Sem info';
}

export function matchesFilters(item, activeKeys, search) {
  for (const key of activeKeys) {
    if (!isMissing(item[key])) return false;
  }
  if (search) {
    const q = search.trim().toLowerCase();
    if (q && !item.nome?.toLowerCase().includes(q)) return false;
  }
  return true;
}

export function applyFilters(data, activeKeys, search) {
  if (activeKeys.length === 0 && !search) return data;
  return data.filter((item) => matchesFilters(item, activeKeys, search));
}
