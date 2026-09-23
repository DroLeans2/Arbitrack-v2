# ArbiTrack v2 — Guia de Deploy

## Pré-requisitos
- Node.js 18+ instalado
- Conta gratuita no [Supabase](https://supabase.com)
- Conta gratuita na [Vercel](https://vercel.com)

---

## Passo 1 — Configurar o Supabase

1. Acesse https://supabase.com e crie um projeto (pode usar login com Google)
2. Escolha um nome (ex: "arbitrack") e uma senha para o banco
3. Aguarde o projeto criar (~1 min)
4. No menu lateral, clique em **SQL Editor**
5. Cole todo o conteúdo do arquivo `supabase-schema.sql` e clique em **Run**
6. Vá em **Settings → API** e copie:
   - `Project URL` → será seu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → será seu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Passo 2 — Testar localmente (opcional)

```bash
# Edite o .env.local com suas credenciais do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Instale e rode
npm install
npm run dev
# Acesse http://localhost:3000
```

---

## Passo 3 — Deploy na Vercel

### Opção A — Via GitHub (recomendado)
1. Suba o projeto para um repositório no GitHub
2. Acesse https://vercel.com e faça login com GitHub
3. Clique em **New Project** e importe o repositório
4. Na tela de configuração, adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clique em **Deploy**
6. Em ~2 minutos seu app estará online em um endereço `.vercel.app`

### Opção B — Via CLI
```bash
npm install -g vercel
vercel login
vercel
# Siga as instruções e adicione as env vars quando solicitado
```

---

## Estrutura do Projeto

```
arbitrack/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── apostas/
│   │   ├── page.tsx          # Lista de apostas
│   │   └── nova/page.tsx     # Criar nova aposta
│   ├── casas/page.tsx        # Gerenciar casas
│   ├── historico/page.tsx    # Histórico com filtros
│   ├── saldos/page.tsx       # Saldos e movimentações
│   ├── calculadora/page.tsx  # Calculadora de arbitragem
│   └── api/                  # API Routes
│       ├── apostas/
│       ├── casas/
│       └── movimentacoes/
├── components/
│   ├── layout/Navbar.tsx
│   ├── ApostaCard.tsx
│   └── ExportButton.tsx
├── lib/
│   ├── supabase.ts
│   └── utils.ts
├── types/index.ts
└── supabase-schema.sql       # Execute no Supabase
```

---

## Funcionalidades

- ✅ Dashboard com KPIs e gráfico de lucro por mês
- ✅ Registro de apostas com odds e stakes
- ✅ Calculadora de arbitragem com distribuição automática de stakes
- ✅ Agrupamento de apostas por evento
- ✅ Resolução de apostas (Green / Red / Void)
- ✅ Histórico com filtros por casa, status e período
- ✅ Export CSV e PDF
- ✅ Gestão de casas de apostas
- ✅ Controle de saldos e movimentações
- ✅ Tabela de sensibilidade de stakes na calculadora

---

## Atualizações futuras

Para fazer alterações, basta conversar com o Claude e descrever o que quer mudar.
O Claude pode editar os arquivos diretamente e gerar uma nova versão do projeto.
