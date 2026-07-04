# Axios Calc

Aplicação interna para calcular custos e preços de venda de impressões 3D em resina. O Axios Calc substitui a planilha operacional por um fluxo com cadastros reais, cálculo em tempo real, histórico, ficha técnica e snapshots financeiros.

## Stack

- Next.js 15 com App Router e Server Actions
- React 19 e TypeScript estrito
- Tailwind CSS e componentes no padrão shadcn/ui
- Prisma ORM com SQLite
- Zod para validação
- Docker e Docker Compose

## Funcionalidades

- Dashboard com volumes, médias financeiras e últimos orçamentos
- Novo orçamento com cálculo ao vivo de resina, energia, acabamento, frete, lucro e preço unitário
- Precificação por percentual de lucro ou preço final manual
- Histórico com busca por modelo/cliente e filtros por status/data
- Visualização, edição, duplicação, exclusão e alteração de status
- Ficha técnica completa e link externo do Google Drive
- Configurações globais editáveis
- CRUD de resinas, impressoras e presets de acabamento
- Snapshots de nomes, custos e potência em cada orçamento
- Tema dark responsivo inspirado em uma oficina técnica

## Rodando localmente

Requisitos: Node.js 20+ e npm.

```bash
cp .env.example .env
npm install
npm run db:deploy
npm run db:seed
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

No PowerShell, se preferir:

```powershell
Copy-Item .env.example .env
npm install
npm run db:deploy
npm run db:seed
npm run dev
```

O `.env.example` usa `DATABASE_URL="file:../data/dev.db"`. Caminhos SQLite são resolvidos a partir de `prisma/schema.prisma`, por isso o banco local fica em `data/dev.db`.

## Migrations e seed

Criar uma migration durante o desenvolvimento:

```bash
npm run db:migrate -- --name nome_da_migration
```

Aplicar migrations existentes sem gerar novas:

```bash
npm run db:deploy
```

Popular ou recompor os cadastros iniciais:

```bash
npm run db:seed
```

O seed é idempotente e cria as configurações gerais, uma resina padrão, uma impressora e cinco presets de acabamento.

## Docker

```bash
docker compose up --build -d
```

Acesse [http://localhost:3000](http://localhost:3000). Na inicialização, o container aplica as migrations e executa o seed idempotente antes de iniciar o Next.js.

O volume abaixo preserva o SQLite fora do container:

```yaml
volumes:
  - ./data:/app/data
```

Em produção, a conexão usada é `DATABASE_URL="file:/app/data/prod.db"`.

### HTTPS com Traefik

O `docker-compose.yml` publica o Axios Calc no router `axios-calc`, usando o domínio `axioscalc.sgdev.cloud`, a rede externa `public` e o certificate resolver `meuresolver`.

O Traefik precisa ter um resolver com esse mesmo nome em sua configuração estática. Exemplo com desafio HTTP:

```yaml
certificatesResolvers:
  meuresolver:
    acme:
      email: seu-email@dominio.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
```

Para a emissão funcionar:

- o DNS `A` do domínio deve apontar para a VPS;
- as portas TCP 80 e 443 devem estar liberadas no firewall e publicadas pelo container do Traefik;
- o entrypoint `web` deve escutar em `:80` e `websecure` em `:443`;
- o arquivo `acme.json` deve persistir e ter permissão `600`;
- o Traefik e o Axios Calc devem compartilhar a rede Docker `public`.

Depois de corrigir a infraestrutura, recrie o serviço e confira os logs do Traefik:

```bash
docker compose up -d --force-recreate
docker logs traefik --tail 200
```

Procure nos logs por `acme`, `axioscalc.sgdev.cloud`, `meuresolver` ou `certificate`. Enquanto o ACME não emitir um certificado válido, o Traefik continuará entregando seu certificado autoassinado `TRAEFIK DEFAULT CERT`.

## Comandos úteis

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # Prisma Client + build de produção
npm run start        # servidor de produção
npm run lint         # ESLint
npm run typecheck    # TypeScript sem emissão
npm run db:generate  # gera Prisma Client
npm run db:deploy    # aplica migrations
npm run db:seed      # executa seed
```

## Estrutura principal

```text
app/
  actions.ts                 Server Actions e regras de persistência
  configuracoes/             configurações e CRUDs
  orcamentos/                novo, histórico, detalhe e edição
components/
  ui/                        componentes base no padrão shadcn/ui
  quote-form.tsx             formulário e cálculo em tempo real
lib/
  calculations.ts            funções puras de cálculo e formatação
  validation.ts              schemas Zod
  prisma.ts                  singleton do Prisma Client
prisma/
  migrations/                versionamento do SQLite
  schema.prisma              modelo relacional
  seed.ts                    dados iniciais idempotentes
data/                        bancos SQLite persistentes
```

## Decisões técnicas

- Os cálculos ficam centralizados em `lib/calculations.ts` e são reutilizados no cliente e no servidor. O servidor sempre recalcula antes de salvar.
- Valores exibidos são arredondados para duas casas, enquanto custos intermediários preservam até seis casas quando necessário.
- Cada orçamento armazena snapshots da resina, impressora, potência e acabamento. Alterações nos cadastros não reescrevem o histórico.
- Cadastros vinculados a orçamentos não podem ser excluídos; podem ser inativados sem quebrar as fichas antigas.
- Não há autenticação, upload, cálculo de filamento nem mão de obra nesta primeira versão, conforme o escopo.

## SQLite em VPS

SQLite atende bem ao uso interno e de baixa concorrência. Em uma VPS, mantenha `/app/data` em volume persistente, faça backups regulares do arquivo `prod.db` e execute apenas uma instância da aplicação gravando nesse arquivo. Para múltiplas réplicas ou alto volume concorrente, a evolução natural é migrar o datasource Prisma para PostgreSQL.
