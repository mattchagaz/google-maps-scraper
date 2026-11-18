// Filter chip definitions + matching logic for the results list.

export const FIELD_FILTERS = [
  { key: 'website', label: 'Sem website', icon: '🌐' },
  { key: 'telefone', label: 'Sem telefone', icon: '📞' },
  { key: 'whatsapp', label: 'Sem WhatsApp', icon: '💬' },
  { key: 'email', label: 'Sem email', icon: '✉️' },
  { key: 'has_email', field: 'email', mode: 'present', label: 'Com email', icon: '📧' },
  { key: 'redes', label: 'Sem redes sociais', icon: '📱' },
];

export function isMissing(value) {
  return !value || value === 'Sem info';
}

// "Com email" and "Sem email" describe opposite subsets, so never leave
// both active at once — clicking one simply replaces the other.
export function toggleFieldFilter(activeKeys, key) {
  const opposite = key === 'email' ? 'has_email' : key === 'has_email' ? 'email' : null;
  if (activeKeys.includes(key)) return activeKeys.filter((activeKey) => activeKey !== key);
  return [...activeKeys.filter((activeKey) => activeKey !== opposite), key];
}

export function matchesFilters(item, activeKeys, search) {
  for (const key of activeKeys) {
    const filter = FIELD_FILTERS.find((itemFilter) => itemFilter.key === key);
    const value = item[filter?.field ?? key];
    if (filter?.mode === 'present' ? isMissing(value) : !isMissing(value)) return false;
  }
  if (search) {
    const q = search.trim().toLowerCase();
    const hit = item.nome?.toLowerCase().includes(q) || item.categoria?.toLowerCase().includes(q);
    if (q && !hit) return false;
  }
  return true;
}

export function applyFilters(data, activeKeys, search) {
  if (activeKeys.length === 0 && !search) return data;
  return data.filter((item) => matchesFilters(item, activeKeys, search));
}
