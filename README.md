# Sense · Terruá

Dashboard dos resultados das pesquisas de satisfação dos eventos da Terruá.

Duas visões:

- **Admin** — todas as matrizes, com comparativo entre elas.
- **Matriz** — apenas os resultados da própria matriz.

A separação é **de dados, não visual**: a filtragem por matriz acontece no
servidor, em [`aplicarEscopo`](src/lib/api.ts). O navegador de uma sessão de
matriz nunca recebe as linhas de outra.

---

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em http://localhost:3000.

### Credenciais de desenvolvimento

Já estão em `.env.local` (fora do controle de versão):

| Usuário       | Senha            | Enxerga        |
| ------------- | ---------------- | -------------- |
| `admin`       | `66XrssWpng0YG4` | Tudo           |
| `sede-parque` | `eLaJAZlq60XR`   | Sede Parque    |
| `lego`        | `tmEEAcZmvJ6b`   | Lego           |

**Troque todas antes de publicar.**

---

## Publicando na Vercel

Recrie estas variáveis em _Settings → Environment Variables_ (elas são
obrigatórias em produção — a aplicação recusa subir sem elas):

| Variável             | Para quê                                                      |
| -------------------- | ------------------------------------------------------------- |
| `AUTH_SECRET`        | Assina o cookie de sessão. Mínimo 16 caracteres.              |
| `DASHBOARD_USUARIOS` | Contas do dashboard, em JSON. Formato abaixo.                 |
| `API_PESQUISAS_URL`  | Opcional. Origem dos dados; o padrão já aponta para a API atual. |

Gere um segredo com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### Formato de `DASHBOARD_USUARIOS`

Um array JSON em uma única linha:

```json
[
  { "usuario": "admin", "senha": "…", "escopo": "admin", "nome": "Administração Terruá" },
  { "usuario": "sede-parque", "senha": "…", "escopo": "matriz", "matriz": "Sede Parque" }
]
```

- `escopo: "admin"` → enxerga todas as matrizes.
- `escopo: "matriz"` → o campo `matriz` precisa bater **exatamente** com o valor
  que vem da API (hoje: `Sede Parque`, `Lego`).

**Para dar acesso a uma matriz nova**, acrescente um objeto à lista e faça o
redeploy. Nada mais precisa mudar — as seções, eventos e clientes são
descobertos a partir dos próprios dados.

---

## Como os números são calculados

Regras em [`src/lib/metrics.ts`](src/lib/metrics.ts):

- Cada linha da API é a nota de **uma pergunta**. Notas vão de 1 a 5.
- `nota: null` significa seção marcada como **“não se aplica”** (ou jurídico que
  não participou). Essas linhas **nunca entram em médias** — aparecem como
  `N/A` no heatmap e são contadas à parte no painel-resumo.
- **Respondente** = `resposta_id` distinto. **Pesquisa** = `pesquisa_id` distinto.
- **Satisfação** = parcela de notas 4 e 5. **Notas críticas** = parcela de 1 e 2.
- Faixas de desempenho: ≥ 4,5 Excelente · ≥ 3,5 Satisfatório · ≥ 2,5 Atenção ·
  abaixo disso Crítico. Cada faixa viaja sempre com ícone **e** rótulo.
- **Gerente e assessor**: a nota é do *projeto*, não da pessoa. Os cartões
  respondem “como foram avaliados os eventos que passaram por este
  profissional”, e por isso sempre mostram junto quantas pesquisas e quantas
  notas formam a base — uma média de 5,00 sobre 4 notas não diz o mesmo que
  4,80 sobre 40. Registros sem responsável aparecem como “Não informado”.

Os dados são revalidados a cada 5 minutos; o botão **Atualizar** no cabeçalho
força uma releitura.

---

## Decisões de visualização

A paleta sai da identidade Terruá e foi **validada por script**, não no olho:

| Uso                                   | Cores                                   | Resultado                              |
| ------------------------------------- | --------------------------------------- | -------------------------------------- |
| Séries categóricas (identidade)       | laranja Terruá → azul → aqua → magenta  | passa em todos os pares (4 slots)      |
| Notas 1–5 (escala ordenada)           | vermelho ↔ azul, cinza neutro no meio   | ΔE 15,0 sob deuteranopia               |
| Heatmap (magnitude)                   | rampa laranja 100→700                   | luminosidade monotônica, matiz único   |

Vermelho ↔ verde foi **testado e descartado**: ΔE 2,6 sob deuteranopia — os dois
polos colapsam para quem tem daltonismo. Os polos quente/frio resolvem isso sem
perder a leitura de “ruim ↔ bom”.

Outras regras seguidas:

- Uma série → uma cor, sem caixa de legenda; duas ou mais → legenda sempre presente.
- Cor de status (verde/amarelo/vermelho) nunca representa “série 4” — e nunca
  aparece sozinha: sempre com ícone e rótulo.
- Todo gráfico tem um **gêmeo em tabela** (botão _Gráfico / Tabela_), então
  nenhum valor depende de cor ou de passar o mouse.
- Uma única fileira de filtros, acima de tudo que ela recorta.
- A visão se compromete com o modo claro, como o site da Terruá.

---

## Estrutura

```
src/
  app/
    actions.ts          entrar / sair (server actions)
    login/              tela de acesso
    dashboard/          página protegida; busca e recorta no servidor
  lib/
    api.ts              fetch da API + aplicarEscopo (o recorte por matriz)
    auth.ts             contas, cookie de sessão assinado (HMAC-SHA256, 8 h)
    metrics.ts          todas as agregações
    format.ts           formatação pt-BR, faixas e passos da rampa
  components/
    DashboardClient.tsx orquestra filtros e cartões
    charts/             barras, Likert divergente, heatmap
    ui/                 cartão com visão de tabela, indicadores, dica, tabela
```
