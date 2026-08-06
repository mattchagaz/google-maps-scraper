import { supabase } from './supabase.js';

function formatLabel(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `Coleta de ${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
    telefone: d.telefone,
    email: d.email,
    endereco: d.endereco,
  }));

  const { error: leadsError } = await supabase.from('leads').insert(rows);
  if (leadsError) throw leadsError;

  return collection;
}
