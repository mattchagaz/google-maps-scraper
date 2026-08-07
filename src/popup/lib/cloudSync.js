import { supabase } from './supabase.js';

function formatLabel(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `Coleta de ${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// avaliacao/num_avaliacoes são colunas numéricas no banco — o resto dos
// campos usa 'Sem info' como sentinela de "faltando", mas aqui precisa
// virar null (ou o Postgres rejeita o insert).
function numericOrNull(value) {
  if (!value || value === 'Sem info') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

/**
 * Pushes one finished scrape run to Supabase as a `collections` row +
 * its `leads` rows. Throws on failure — caller decides how to surface it
 * (cloud sync is a bonus, never blocks the local flow).
 */
export async function syncCollection(data) {
  if (!supabase || !data.length) return null;

  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .insert({ label: formatLabel(), total: data.length })
    .select()
    .single();

  if (collectionError) throw collectionError;

  const rows = data.map((d) => ({
    collection_id: collection.id,
    nome: d.nome,
    website: d.website,
    agendamento: d.agendamento,
    cardapio: d.cardapio,
    redes: d.redes,
    whatsapp: d.whatsapp,
    telefone: d.telefone,
    email: d.email,
    endereco: d.endereco,
    categoria: d.categoria,
    avaliacao: numericOrNull(d.avaliacao),
    num_avaliacoes: numericOrNull(d.num_avaliacoes),
  }));

  // Upsert (não insert) porque `leads_user_dedup_key_idx` já garante,
  // no banco, que a mesma empresa (telefone, ou nome+endereço quando
  // não tem telefone) nunca duplica pro mesmo usuário — rodar a mesma
  // busca de novo simplesmente ignora quem já foi sincronizado antes.
  // `collections.total` é mantido certo sozinho por um trigger no banco.
  const { data: inserted, error: leadsError } = await supabase
    .from('leads')
    .upsert(rows, { onConflict: 'user_id,dedup_key', ignoreDuplicates: true })
    .select('id');

  if (leadsError) {
    await supabase.from('collections').delete().eq('id', collection.id);
    throw leadsError;
  }

  if (inserted.length === 0) {
    // Toda empresa dessa coleta já tinha sido sincronizada antes —
    // não sobra nada novo, não deixa uma coleta vazia no dashboard.
    await supabase.from('collections').delete().eq('id', collection.id);
    return null;
  }

  return collection;
}
