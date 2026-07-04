Você é o Codex atuando como desenvolvedor full-stack sênior. Construa um app completo e funcional para substituir uma planilha de custos operacionais de uma empresa de impressão 3D em resina.

O objetivo é entregar uma primeira versão utilizável, com banco local, telas funcionais, cálculo de orçamento, histórico e configurações editáveis. Evite deixar partes “mockadas” quando elas forem essenciais para uso real.

# 1. Contexto do app

O sistema será usado internamente por uma empresa de impressão 3D em resina para calcular custos e preços de venda de peças/modelos impressos.

Atualmente a empresa usa uma planilha. O app deve substituir essa planilha.

O app deve considerar:

* consumo de resina informado pelo software slicer;
* tempo de impressão informado pelo slicer;
* impressora utilizada;
* potência da impressora;
* custo do kWh;
* custo da resina;
* pintura/acabamento por presets;
* frete manual;
* margem de lucro;
* preço final manual;
* histórico de orçamentos/impressões;
* ficha técnica completa da impressão;
* link externo do Google Drive para fotos ou arquivos relacionados.

Não precisa ter login/autenticação nesta primeira versão. O uso será interno e exclusivo. Mesmo se o projeto for publicado em portfólio, ele não armazenará dados sensíveis.

# 2. Stack obrigatória

Use:

* Next.js com App Router;
* TypeScript;
* Tailwind CSS;
* shadcn/ui;
* Prisma ORM;
* SQLite;
* Docker;
* docker-compose.yml;
* tema dark por padrão.

O projeto deve estar pronto para rodar localmente e também em uma VPS via Docker.

# 3. Design e identidade visual

O visual deve ser:

* minimalista;
* dark theme;
* elegante;
* com uma pegada medieval/fantasy discreta;
* sem exageros visuais;
* interface profissional e usável.

Sugestão de identidade visual:

* fundos escuros;
* cards com bordas sutis;
* tons de pedra, bronze, dourado envelhecido ou âmbar;
* nomes e pequenos detalhes inspirados em forja, oficina, runas, pergaminho, alquimia e guilda;
* evitar visual infantil ou caricato.

O app pode ter um nome provisório como:

**ForgeCost 3D**

Mas deixe fácil alterar depois.

# 4. Estrutura geral de telas

Crie as seguintes páginas:

## 4.1 Dashboard

Página inicial com resumo geral:

* total de orçamentos cadastrados;
* total de orçamentos aprovados;
* total de orçamentos produzidos;
* custo médio dos orçamentos;
* preço médio final;
* lucro médio projetado;
* últimos orçamentos cadastrados;
* atalhos para novo orçamento e configurações.

## 4.2 Novo orçamento

Tela principal do sistema.

Deve permitir cadastrar um orçamento/impressão com os seguintes campos:

### Dados gerais

* nome do modelo;
* cliente opcional;
* descrição opcional;
* quantidade de peças;
* status inicial: orçamento;
* link do Google Drive para fotos/arquivos;
* observações.

### Dados técnicos vindos do slicer

O software da impressora já informa os dados abaixo. Então o sistema deve permitir inserção manual direta:

* altura em mm;
* largura em mm;
* profundidade em mm;
* consumo previsto de resina em ml;
* tempo previsto de impressão em horas e minutos.

Esses dados devem ser salvos no histórico.

### Material

* tipo de impressão: por enquanto apenas resina;
* deixar campo/estrutura para futura seleção de filamento, mas não dedicar funcionalidades de filamento agora;
* resina utilizada, selecionada a partir de cadastro de resinas;
* custo da resina calculado com base em:

  * consumo previsto em ml;
  * custo por ml da resina cadastrada.

O cadastro de resina deve permitir informar:

* nome;
* preço pago;
* unidade de compra, por exemplo kg, g, litro, ml;
* quantidade comprada;
* densidade em g/ml;
* custo calculado por ml;
* observações.

Exemplo de cálculo para resina vendida por peso:

* 1 kg de resina por R$ 150,00;
* densidade média 1,1 g/ml;
* 1000g / 1,1 = aproximadamente 909,09 ml;
* R$ 150,00 / 909,09 ml = custo aproximado de R$ 0,165 por ml.

O sistema deve calcular automaticamente o custo por ml quando possível, mas permitir ajuste manual.

### Impressora e energia

Deve existir cadastro de impressoras.

No orçamento, o usuário seleciona a impressora usada.

Cada impressora deve ter:

* nome;
* modelo opcional;
* potência média em watts;
* observações;
* ativa/inativa.

O sistema deve calcular energia assim:

```txt
potencia_kw = potencia_watts / 1000
custo_energia = potencia_kw * horas_impressao * custo_kwh
```

O custo do kWh deve vir das configurações globais.

Exemplo:

```txt
potência: 120 W
tempo: 8h
kWh: R$ 1,14

0,12 * 8 * 1,14 = R$ 1,0944
```

Arredonde valores monetários para 2 casas decimais na exibição, mas preserve cálculo com precisão adequada internamente.

### Pintura/acabamento

Por enquanto, usar presets editáveis.

Cada preset de acabamento deve ter:

* nome;
* descrição;
* custo fixo;
* ativo/inativo.

Exemplos iniciais:

* Sem pintura — R$ 0,00;
* Pintura simples — R$ 10,00;
* Pintura média — R$ 25,00;
* Pintura detalhada — R$ 50,00;
* Pintura premium — R$ 100,00.

No orçamento, o usuário seleciona um preset de acabamento. O custo entra no cálculo.

Não implementar cálculo detalhado de tinta nem mão de obra nesta versão.

### Frete

O frete deve ser um campo manual por orçamento.

Campos:

* custo de frete/transporte;
* observação de frete opcional.

### Lucro e preço final

O sistema deve permitir duas formas de trabalhar:

1. Usuário informa percentual de lucro/margem desejada;
2. Usuário informa preço final manualmente.

Quando o usuário informar o percentual de lucro, o sistema calcula o preço final.

Quando o usuário informar o preço final, o sistema calcula o percentual de lucro equivalente.

Use como base:

```txt
custo_total = custo_material + custo_energia + custo_acabamento + custo_frete

preco_final = custo_total * (1 + percentual_lucro / 100)

lucro_valor = preco_final - custo_total

percentual_lucro = ((preco_final - custo_total) / custo_total) * 100
```

Caso custo_total seja zero, evite divisão por zero e trate com mensagem adequada.

### Resultado do cálculo

A tela de novo orçamento deve exibir em tempo real:

* custo da resina;
* custo de energia;
* custo de pintura/acabamento;
* custo de frete;
* custo total;
* percentual de lucro;
* valor de lucro;
* preço final sugerido/manual;
* custo unitário;
* preço unitário;
* resumo técnico da impressão.

O cálculo deve atualizar conforme o usuário altera os campos.

## 4.3 Histórico de orçamentos

Criar uma página de histórico com tabela/lista.

Deve permitir:

* listar todos os orçamentos;
* buscar por nome do modelo;
* buscar por cliente;
* filtrar por status;
* filtrar por data;
* visualizar detalhes;
* editar orçamento;
* duplicar orçamento;
* excluir orçamento, com confirmação.

Status possíveis:

* orçamento;
* aprovado;
* produzido;
* cancelado;
* arquivado.

A ação de duplicar deve criar um novo orçamento com os mesmos dados, mas com nova data e status “orçamento”.

## 4.4 Detalhe do orçamento

Tela para visualizar a ficha técnica completa de um orçamento.

Deve exibir:

* dados gerais;
* dados técnicos do slicer;
* resina utilizada;
* impressora utilizada;
* preset de acabamento;
* frete;
* composição de custos;
* preço final;
* lucro;
* link do Google Drive, se preenchido;
* observações;
* data de criação;
* data de atualização;
* status.

A tela deve permitir:

* editar;
* duplicar;
* alterar status;
* voltar para histórico.

## 4.5 Configurações

Criar página de configurações com abas ou seções.

Deve permitir editar todos os parâmetros do sistema.

### Configurações gerais

* custo do kWh;
* percentual de lucro padrão;
* moeda padrão BRL;
* nome da empresa opcional;
* observações.

### Resinas

CRUD completo:

* criar;
* listar;
* editar;
* inativar/ativar;
* excluir, se não estiver em uso.

Campos de resina:

* nome;
* fabricante opcional;
* cor opcional;
* preço pago;
* unidade de compra: kg, g, litro, ml;
* quantidade comprada;
* densidade g/ml;
* custo por ml calculado;
* custo por ml manual opcional;
* observações;
* ativa/inativa.

Regra:

* se houver custo por ml manual, usar ele;
* senão, calcular automaticamente.

Cálculos:

Se unidade for kg:

```txt
gramas = quantidade * 1000
ml_estimado = gramas / densidade
custo_por_ml = preco_pago / ml_estimado
```

Se unidade for g:

```txt
ml_estimado = quantidade / densidade
custo_por_ml = preco_pago / ml_estimado
```

Se unidade for litro:

```txt
ml = quantidade * 1000
custo_por_ml = preco_pago / ml
```

Se unidade for ml:

```txt
custo_por_ml = preco_pago / quantidade
```

Validar para não dividir por zero.

### Impressoras

CRUD completo:

* criar;
* listar;
* editar;
* inativar/ativar;
* excluir, se não estiver em uso.

Campos:

* nome;
* modelo;
* potência média em watts;
* observações;
* ativa/inativa.

### Presets de acabamento

CRUD completo:

* criar;
* listar;
* editar;
* inativar/ativar;
* excluir, se não estiver em uso.

Campos:

* nome;
* descrição;
* custo fixo;
* ativa/inativa.

# 5. Banco de dados

Use Prisma com SQLite.

Crie o schema de forma clara e robusta.

Sugestão de modelos:

## AppSettings

* id;
* companyName;
* kwhCost;
* defaultProfitPercent;
* currency;
* createdAt;
* updatedAt.

## Resin

* id;
* name;
* manufacturer;
* color;
* purchasePrice;
* purchaseUnit;
* purchaseQuantity;
* density;
* calculatedCostPerMl;
* manualCostPerMl;
* notes;
* isActive;
* createdAt;
* updatedAt.

## Printer

* id;
* name;
* model;
* powerWatts;
* notes;
* isActive;
* createdAt;
* updatedAt.

## FinishPreset

* id;
* name;
* description;
* fixedCost;
* isActive;
* createdAt;
* updatedAt.

## Quote

* id;
* modelName;
* customerName;
* description;
* quantity;
* status;
* driveLink;
* notes;

Dados técnicos:

* heightMm;
* widthMm;
* depthMm;
* resinMl;
* printTimeMinutes;

Relacionamentos e snapshots:

* resinId;

* resinNameSnapshot;

* resinCostPerMlSnapshot;

* printerId;

* printerNameSnapshot;

* printerPowerWattsSnapshot;

* finishPresetId;

* finishNameSnapshot;

* finishCostSnapshot;

Custos:

* materialCost;
* energyCost;
* finishCost;
* freightCost;
* totalCost;

Lucro/preço:

* profitPercent;
* profitValue;
* finalPrice;
* unitCost;
* unitPrice;

Datas:

* createdAt;
* updatedAt.

Importante: salve snapshots dos nomes e custos principais dentro do Quote para preservar o histórico mesmo que os cadastros sejam alterados depois.

# 6. Regras de cálculo

Centralize os cálculos em funções utilitárias bem testáveis.

Criar funções para:

* calcular custo por ml da resina;
* converter tempo em horas/minutos para minutos;
* converter minutos para horas decimais;
* calcular custo de energia;
* calcular custo total;
* calcular preço final pelo percentual;
* calcular percentual pelo preço final;
* calcular custo unitário e preço unitário.

Todas as entradas monetárias devem aceitar padrão brasileiro visualmente, mas internamente podem ser tratadas como number decimal.

Exibição:

* valores monetários em BRL;
* percentuais com 2 casas;
* tempo em horas e minutos;
* volumes em ml;
* dimensões em mm.

# 7. Seeds iniciais

Crie um seed inicial com:

## Configuração geral

* companyName: “Oficina 3D”;
* kwhCost: 1.14;
* defaultProfitPercent: 100;
* currency: “BRL”.

## Resina exemplo

* nome: “Resina padrão”;
* preço: 150;
* unidade: kg;
* quantidade: 1;
* densidade: 1.1;
* ativa: true.

## Impressora exemplo

* nome: “Impressora de resina padrão”;
* modelo: “LCD/MSLA”;
* potência: 120 W;
* ativa: true.

## Acabamentos exemplo

* Sem pintura — 0;
* Pintura simples — 10;
* Pintura média — 25;
* Pintura detalhada — 50;
* Pintura premium — 100.

# 8. Rotas/API

Pode usar Server Actions ou Route Handlers. Escolha a abordagem mais limpa para Next.js App Router.

O app deve permitir:

* criar orçamento;
* atualizar orçamento;
* duplicar orçamento;
* deletar orçamento;
* alterar status;
* listar histórico com filtros;
* gerenciar configurações;
* gerenciar resinas;
* gerenciar impressoras;
* gerenciar acabamentos.

# 9. Validações

Implemente validações com Zod ou abordagem equivalente.

Validações principais:

* quantidade deve ser maior que zero;
* consumo de resina em ml não pode ser negativo;
* tempo de impressão não pode ser negativo;
* potência da impressora não pode ser negativa;
* custo do kWh não pode ser negativo;
* frete não pode ser negativo;
* preço final não pode ser negativo;
* percentual de lucro pode ser zero ou positivo;
* densidade deve ser maior que zero quando usada para cálculo;
* link do Drive deve aceitar URL válida, mas não precisa ser obrigatório.

# 10. UX esperada

A tela de novo orçamento deve ser o ponto mais polido do sistema.

Ela deve ter:

* formulário organizado por seções;
* cálculo em tempo real;
* card lateral ou inferior com resumo dos custos;
* destaque para preço final;
* botão salvar orçamento;
* botão limpar formulário;
* mensagens de erro amigáveis.

O histórico deve ter:

* tabela responsiva;
* busca;
* filtros;
* ações rápidas;
* botão duplicar bem visível.

As configurações devem ser simples e objetivas.

# 11. Docker e deploy

Crie:

* Dockerfile;
* docker-compose.yml;
* .dockerignore;
* README.md com instruções.

O app deve persistir o SQLite em volume Docker.

Exemplo esperado:

```yml
volumes:
  - ./data:/app/data
```

O banco SQLite deve ficar em uma pasta persistente como:

```txt
/app/data/prod.db
```

Configure a variável:

```env
DATABASE_URL="file:/app/data/prod.db"
```

O container deve:

* instalar dependências;
* gerar Prisma Client;
* rodar migrations/deploy;
* rodar seed se necessário ou documentar como rodar;
* iniciar o Next.js em produção.

Expor porta 3000.

# 12. README

O README deve conter:

* descrição do projeto;
* stack;
* como rodar localmente;
* como rodar com Docker;
* como aplicar migrations;
* como rodar seed;
* como acessar o app;
* estrutura de pastas;
* principais decisões técnicas;
* observações sobre SQLite e persistência em VPS.

# 13. Critérios de aceite

Considere o projeto concluído quando:

* o app roda localmente;
* o app roda via Docker Compose;
* o banco SQLite persiste em volume;
* a tela de novo orçamento calcula corretamente;
* é possível cadastrar resina, impressora e acabamento;
* é possível editar configurações globais;
* é possível salvar orçamento;
* é possível ver orçamento no histórico;
* é possível abrir detalhe do orçamento;
* é possível duplicar orçamento;
* é possível editar orçamento;
* é possível alterar status;
* os cálculos são preservados por snapshot;
* o layout está em dark theme;
* não há erros TypeScript;
* não há erros de lint relevantes;
* o README está claro.

# 14. Cuidados importantes

Não implemente autenticação agora.

Não use Supabase.

Não use banco externo.

Não implemente upload de imagens.

Não implemente cálculo de filamento agora, apenas deixe a estrutura visual/técnica preparada para futura expansão.

Não implemente cálculo detalhado de mão de obra agora.

Não deixe dados essenciais apenas em memória.

Não use mocks para cadastros principais.

Não complique demais a arquitetura.

Priorize entregar uma versão funcional, limpa e fácil de manter.

# 15. Entrega esperada

Ao finalizar, apresente:

* resumo do que foi implementado;
* comandos para rodar;
* arquivos principais criados;
* observações sobre próximos ajustes;
* qualquer limitação conhecida.
