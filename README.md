# 📍 Google Maps Business Scraper

Extensão para Chrome que coleta dados de empresas listadas no Google Maps e exporta em `.xls`.
Tem também um **dashboard web opcional** — a extensão coleta (só ela tem a permissão
necessária pra ler o Google Maps), e o site guarda o histórico de todas as coletas,
com status de acompanhamento, notas e os mesmos filtros, acessível de qualquer
navegador/dispositivo depois de logar.

A UI do popup é feita em **React + CSS Modules** (build via Vite), assim como o dashboard
web (`web/`). O scraping em si (`content.js`, injetado no Google Maps, e `background.js`,
o service worker que abre cada empresa numa aba oculta) continua em JavaScript puro —
são scripts injetados pelo Chrome, não faz sentido usar React neles.

---

## 📦 Estrutura de Arquivos

```
google-maps-scraper/
├── manifest.json           # Configuração da extensão (Manifest V3)
├── content.js               # Script de scraping (roda dentro do Maps)
├── background.js            # Service Worker (MV3) — extrai dados de cada empresa
├── src/popup/                # Código-fonte do popup (React)
│   ├── popup.html
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/           # Header, filtros, lista de resultados, AuthBar...
│   ├── hooks/                 # useScraper (coleta), useAuth + useCloudSync (Supabase)
│   ├── lib/                   # chromeApi, filtros, whatsapp, exportação .xls, cloudSync
│   └── styles/global.css     # Design tokens (cores, radius, fontes)
├── dist/                     # Build gerado pelo Vite (dist/popup.html é o popup real)
├── web/                      # Dashboard web (React + Vite, deploy separado — ver DEPLOY.md)
│   ├── src/
│   │   ├── pages/              # Login, Dashboard
│   │   ├── components/         # CollectionList, LeadsTable, LeadModal, Toolbar,
│   │   │                       # BulkActionBar, StatusPill, TopBar
│   │   └── lib/                # filtros, whatsapp, status, xlsExport, supabase
│   │       └── cnpj.js          # busca CNPJ na BrasilAPI — pronto no código, sem UI hoje
├── supabase/
│   ├── schema.sql            # Schema completo (tabelas + RLS) — projetos novos
│   └── migrations/           # Migrações incrementais — projetos já existentes
├── DEPLOY.md                 # Passo a passo pra ligar extensão + dashboard + Supabase
├── legacy/                   # Versão antiga (popup.html/js/css em HTML puro), referência
├── icons/
└── README.md
```

---

## 🛠️ Build do popup (necessário antes de carregar a extensão)

```bash
npm install       # instala React + Vite (uma vez)
npm run build     # gera dist/popup.html — rode de novo após qualquer alteração em src/popup
npm run dev       # opcional: preview do popup isolado no navegador, fora da extensão
```

O `manifest.json` aponta `default_popup` para `dist/popup.html`, então o build
precisa existir na pasta antes de carregar a extensão no Chrome.

---

## 🚀 Instalação no Chrome (Modo Desenvolvedor)

1. Rode `npm install && npm run build` (veja acima)
2. Abra o Chrome e acesse: `chrome://extensions/`
3. Ative o **"Modo do desenvolvedor"** (canto superior direito)
4. Clique em **"Carregar sem compactação"**
5. Selecione a pasta `google-maps-scraper`
6. A extensão aparecerá na barra de ferramentas do Chrome ✅

---

## 🎯 Como Usar

### Coleta no Google Maps
1. Abra o [Google Maps](https://www.google.com/maps)
2. Faça uma busca (ex: *"pizzarias em Curitiba"*)
3. Aguarde os resultados aparecerem na barra lateral
4. Clique no ícone 📍 da extensão na barra do Chrome
5. Configure o **limite de empresas** no slider
6. Clique em **"Iniciar Coleta"**
7. Aguarde a barra de progresso completar
8. (Opcional) Use os filtros pra restringir a lista, ou **🗑 Limpar** pra zerar e
   fazer outra busca sem fechar o popup
9. Clique em **"Baixar Excel"**

Se você conectou uma conta (ver seção do Dashboard abaixo), a coleta também é
sincronizada automaticamente pro banco assim que termina.

---

## 📊 Dados Coletados

| Campo         | Descrição                                            |
|---------------|-------------------------------------------------------|
| Nome          | Nome da empresa                                       |
| Website       | URL do site oficial                                   |
| WhatsApp      | Link de WhatsApp (`wa.me`/`api.whatsapp.com`), separado do resto das redes |
| Redes Sociais | Instagram, Facebook, etc. (WhatsApp não entra aqui)   |
| Agendamento   | Link de agendamento/bio (Calendly, Linktree, etc.)    |
| Cardápio      | Link de cardápio/delivery (iFood, menu do site...)    |
| Telefone      | Número de telefone                                    |
| Email         | E-mail (se disponível no Maps)                        |
| Endereço      | Endereço completo                                     |
| Categoria     | Categoria do negócio no Maps (ex: "Estúdio de tatuagem") |
| Avaliação     | Nota do Google (0.0–5.0)                              |
| Nº de avaliações | Quantidade de avaliações no Google                 |

> **Nota:** Campos não disponíveis são preenchidos com `"Sem info"`.

---

## 🔎 Filtros no popup

Depois que a coleta termina, o painel de resultados tem uma barra de filtros:

- **Busca por nome ou categoria**.
- **Chips de filtro** — "Sem website", "Sem telefone", "Sem WhatsApp", "Sem email",
  "Sem redes sociais". Ative um ou mais pra ver só as empresas que **não têm** aquele
  dado (útil pra prospecção: ex. leads sem site pra oferecer criação de site).

Os filtros ativos também definem o que é exportado: o botão **"Baixar Excel"** mostra
a contagem do que será baixado e respeita os filtros aplicados — dá pra exportar só
o subconjunto filtrado sem precisar limpar a planilha depois.

---

## ☁️ Dashboard web (opcional)

A extensão sozinha continua funcionando 100% local, sem depender de nada disso.
Mas se você configurar um projeto Supabase (veja **[DEPLOY.md](DEPLOY.md)**), o popup
ganha uma conta (email/senha) e cada coleta finalizada é enviada automaticamente pro
banco — o botão **"📊 Dashboard ↗"** no topo do popup abre o site direto.

O dashboard web (`web/`, publicável na Vercel) traz:

- **Histórico de todas as coletas** já feitas, não só a última — organizadas na
  barra lateral, com renomear e excluir.
- **Deduplicação automática** — rodar a mesma busca de novo não duplica os leads já
  sincronizados (identificados por telefone, ou nome+endereço quando não tem telefone).
- **Status por lead** (Novo / Contatado / Respondeu / Fechado / Sem interesse), editável
  direto na tabela, com filtro dedicado — funciona como um mini-CRM.
- **Modal de detalhes** — clique no nome de qualquer lead pra ver todos os campos,
  trocar status, copiar telefone, chamar no WhatsApp, excluir e escrever notas.
- **Notas por lead** — texto livre salvo por lead, com indicador (📝) na tabela.
- **WhatsApp com mensagem pronta** — botão "Chamar" já abre a conversa com um texto
  padrão configurável (editável em "💬 Mensagem" no topo da tabela).
- **Seleção em massa** — marca várias linhas e aplica status, excluir ou exportar de
  uma vez, com barra de ações dedicada.
- **Exportação `.xls` própria**, com todos os campos coletados (inclusive
  Agendamento/Cardápio/Email, que não vão na planilha rápida do popup).

Acesso de qualquer navegador/dispositivo, protegido por Row Level Security no banco
(cada conta só vê os próprios dados). Passo a passo completo de configuração em
[DEPLOY.md](DEPLOY.md).

---

## ⚙️ Configurações

| Configuração        | Padrão | Descrição                                                      |
|----------------------|--------|-----------------------------------------------------------------|
| Limite de empresas   | 20     | Máximo de 100 empresas por sessão (slider)                     |
| Delay entre coletas  | 2000ms | Fixo no código (`config.delay` em `useScraper.js`), evita bater forte no Google |

> ⚠️ Delays menores = coleta mais rápida, mas maior risco de detecção pelo Google.

---

## 📁 Formato do arquivo exportado (.xls)

Planilha HTML compatível com Excel.

- **Popup**: colunas Nome, Website, WhatsApp, Redes Sociais, Telefone e Endereço
  (versão enxuta, pra exportação rápida).
- **Dashboard**: colunas Nome, Website, WhatsApp, Agendamento, Cardápio, Redes
  Sociais, Telefone, Email e Endereço (versão completa).
- **Codificação:** UTF-8 com BOM
- Células sem dado aparecem como `Sem info`
- Links viram hyperlinks clicáveis na planilha

---

## 🔧 Solução de Problemas

### "Não foi possível conectar ao Google Maps"
- Recarregue a página do Maps (F5) e tente novamente.

### "Nenhuma lista de resultados encontrada"
- Certifique-se de que há resultados visíveis na barra lateral do Maps antes de iniciar.

### A coleta para sozinha
- O Google pode ter detectado atividade automatizada. Aumente o delay para 2000ms+.

### Dados faltando (muitos "Sem info")
- O Google atualiza frequentemente o DOM do Maps. Os seletores CSS no `content.js`/`background.js`
  (incluindo os de categoria e avaliação) podem precisar de atualização.

### Uma ação no dashboard falhou (excluir, renomear, mudar status...)
- Aparece um toast vermelho no canto da tela com o motivo — geralmente é sessão
  expirada (faça login de novo) ou a migração do banco não foi aplicada (ver
  [DEPLOY.md](DEPLOY.md) e a pasta `supabase/migrations/`).

---

## ⚖️ Aviso Legal

> Esta extensão acessa dados do Google Maps via DOM scraping. O uso pode violar os  
> [Termos de Uso do Google Maps](https://maps.google.com/help/terms_maps/).  
>
> **Use apenas para fins legítimos e pessoais.**  
> Não use para coleta em massa, revenda de dados ou atividades comerciais sem autorização.  
> O autor não se responsabiliza pelo uso indevido desta ferramenta.

---

## 🛠️ Tecnologias

- React 18 + CSS Modules (popup e dashboard web), build com Vite
- JavaScript ES6+ puro (`content.js` / `background.js`)
- Chrome Extensions Manifest V3
- Chrome APIs: `tabs`, `scripting`, `storage`, `downloads`
- Supabase (Postgres + Auth + RLS) como backend do dashboard, hospedagem na Vercel
- [sonner](https://sonner.emilkowal.ski/) pras notificações (toasts) do dashboard
- Exportação `.xls` (tabela HTML) com BOM UTF-8
