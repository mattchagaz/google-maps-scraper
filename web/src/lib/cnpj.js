// Enriquecimento por CNPJ via BrasilAPI (pública, gratuita, sem chave,
// CORS liberado — dá pra chamar direto do navegador). Não existe busca
// por nome de empresa: o usuário precisa colar o CNPJ que já tem/achou.

const BRASIL_API_URL = 'https://brasilapi.com.br/api/cnpj/v1/';

export function onlyDigits(raw) {
  return (raw || '').replace(/\D/g, '');
}

export function formatCnpj(raw) {
  const d = onlyDigits(raw);
  if (d.length !== 14) return raw;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

// Validação padrão de CNPJ (dígitos verificadores) — evita chamar a API
// com algo obviamente errado.
export function isValidCnpj(raw) {
  const cnpj = onlyDigits(raw);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false; // todos os dígitos iguais

  const calcDigit = (base) => {
    const weights = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = base.split('').reduce((acc, ch, i) => acc + Number(ch) * weights[i], 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const base = cnpj.slice(0, 12);
  const d1 = calcDigit(base);
  const d2 = calcDigit(base + d1);
  return cnpj === base + String(d1) + String(d2);
}

/** Busca os dados públicos do CNPJ. Lança erro com mensagem amigável. */
export async function fetchCnpjData(rawCnpj) {
  const cnpj = onlyDigits(rawCnpj);
  if (!isValidCnpj(cnpj)) {
    throw new Error('CNPJ inválido — confira os 14 dígitos.');
  }

  const res = await fetch(BRASIL_API_URL + cnpj);
  if (res.status === 404) {
    throw new Error('CNPJ não encontrado na Receita Federal.');
  }
  if (!res.ok) {
    throw new Error(`Falha ao consultar CNPJ (HTTP ${res.status}).`);
  }

  const data = await res.json();
  return {
    cnpj,
    razao_social: data.razao_social || null,
    situacao_cadastral: data.descricao_situacao_cadastral || data.situacao_cadastral || null,
    data_abertura: data.data_inicio_atividade || null,
    porte: data.descricao_porte || data.porte || null,
    cnpj_consultado_em: new Date().toISOString(),
  };
}
