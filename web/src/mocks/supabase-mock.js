// Stand-in for @supabase/supabase-js used ONLY to render a visual preview
// of the dashboard with fake data — never bundled in a real build (the
// real build imports the actual package). Implements just the chainable
// surface the app actually calls.

const now = Date.now();
const hoursAgo = (h) => new Date(now - h * 3600 * 1000).toISOString();

const seedCollections = [
  { id: 'c1', label: 'Coleta de 06/08 14:32', total: 4, created_at: hoursAgo(1) },
  { id: 'c2', label: 'Coleta de 05/08 09:10', total: 3, created_at: hoursAgo(30) },
];

const seedLeads = [
  { id: 'l1', collection_id: 'c1', nome: 'Pizzaria do João', website: 'https://pizzariadojoao.com.br', agendamento: 'Sem info', cardapio: 'https://ifood.com.br/pizzariadojoao', redes: 'https://instagram.com/pizzariadojoao', telefone: '(11) 99999-0000', email: 'Sem info', endereco: 'Rua das Flores, 123 - São Paulo, SP', created_at: hoursAgo(1) },
  { id: 'l2', collection_id: 'c1', nome: 'Studio Beleza Ana Clara', website: 'Sem info', agendamento: 'https://calendly.com/anaclara', cardapio: 'Sem info', redes: 'https://instagram.com/anaclarastudio', telefone: '(11) 98888-1111', email: 'Sem info', endereco: 'Av. Paulista, 900 - São Paulo, SP', created_at: hoursAgo(1) },
  { id: 'l3', collection_id: 'c1', nome: 'Oficina Mecânica Silva', website: 'Sem info', agendamento: 'Sem info', cardapio: 'Sem info', redes: 'Sem info', telefone: 'Sem info', email: 'contato@oficinasilva.com', endereco: 'Rua Industrial, 45 - Guarulhos, SP', created_at: hoursAgo(1) },
  { id: 'l4', collection_id: 'c1', nome: 'Café Central', website: 'https://cafecentral.com.br', agendamento: 'Sem info', cardapio: 'https://cafecentral.com.br/cardapio', redes: 'https://instagram.com/cafecentral', telefone: '(11) 97777-2222', email: 'Sem info', endereco: 'Rua Augusta, 500 - São Paulo, SP', created_at: hoursAgo(1) },
  { id: 'l5', collection_id: 'c2', nome: 'Barbearia Vintage', website: 'Sem info', agendamento: 'https://booksy.com/barbeariavintage', cardapio: 'Sem info', redes: 'https://instagram.com/barbeariavintage', telefone: '(11) 96666-3333', email: 'Sem info', endereco: 'Rua Oscar Freire, 210 - São Paulo, SP', created_at: hoursAgo(30) },
  { id: 'l6', collection_id: 'c2', nome: 'Academia Fit Power', website: 'https://fitpower.com.br', agendamento: 'Sem info', cardapio: 'Sem info', redes: 'Sem info', telefone: 'Sem info', email: 'Sem info', endereco: 'Av. Rebouças, 1200 - São Paulo, SP', created_at: hoursAgo(30) },
  { id: 'l7', collection_id: 'c2', nome: 'Clínica Odontológica Sorriso', website: 'Sem info', agendamento: 'Sem info', cardapio: 'Sem info', redes: 'https://instagram.com/clinicasorriso', telefone: '(11) 95555-4444', email: 'contato@clinicasorriso.com', endereco: 'Rua Haddock Lobo, 300 - São Paulo, SP', created_at: hoursAgo(30) },
];

const fakeUser = { id: 'u1', email: 'matheus@digilivro.com.br' };

function tableData(table) {
  return table === 'collections' ? seedCollections : seedLeads;
}

class MockQuery {
  constructor(table, mode) {
    this.table = table;
    this.mode = mode; // 'select' | 'delete' | 'insert'
    this.filters = [];
  }
  select() { return this; }
  order() { return this; }
  eq(col, val) { this.filters.push([col, val]); return this; }
  insert() { return this; }
  single() { return this; }
  _rows() {
    let rows = tableData(this.table);
    for (const [col, val] of this.filters) rows = rows.filter((r) => r[col] === val);
    return rows;
  }
  then(resolve) {
    if (this.mode === 'delete') return Promise.resolve({ error: null }).then(resolve);
    return Promise.resolve({ data: this._rows(), error: null }).then(resolve);
  }
}

export function createClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: { user: fakeUser } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: async () => ({ error: null }),
      signUp: async () => ({ error: null }),
      signOut: async () => ({ error: null }),
    },
    from(table) {
      return {
        select: () => new MockQuery(table, 'select'),
        delete: () => new MockQuery(table, 'delete'),
        insert: () => new MockQuery(table, 'insert'),
      };
    },
  };
}
