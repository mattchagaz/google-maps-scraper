// Lead follow-up status — separate from anything the scraper collects,
// this is manual tracking done in the dashboard.

export const STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo', color: '#9a9aac' },
  { value: 'contatado', label: 'Contatado', color: '#f5b942' },
  { value: 'respondeu', label: 'Respondeu', color: '#7c6cf6' },
  { value: 'fechado', label: 'Fechado', color: '#34d399' },
  { value: 'sem_interesse', label: 'Sem interesse', color: '#f87171' },
];

export const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s]));

export function statusInfo(value) {
  return STATUS_MAP[value] || STATUS_OPTIONS[0];
}
