# Deploy do FootStats

O front (React) vai para a **Vercel** e a API (Fastify) para o **Render**. A ordem importa:

1. **API no Render**, para obter a URL da API.
2. **Front na Vercel**, usando essa URL em `VITE_API_URL`.
3. **Voltar ao Render** e liberar o domínio da Vercel no CORS.

> **Por que a API fica no Render e não na Vercel?** Os palpites ficam guardados na memória
> do servidor. Na Vercel, a API rodaria como funções serverless que sobem e morrem a cada
> requisição, e um palpite criado poderia "sumir" na requisição seguinte. No Render, o
> Fastify roda como um servidor contínuo.

---

## 0. Antes de começar

- [ ] Todo o código commitado e enviado (`git push`) para o GitHub.
- [ ] Repositório **público**: GitHub → *Settings* → *General* → *Danger Zone* →
      *Change repository visibility* → *Public*. (É requisito da disciplina.)
- [ ] Uma conta na [Vercel](https://vercel.com) e outra no [Render](https://render.com),
      as duas criadas com o login do GitHub.

---

## 1. API no Render

O repositório tem um [`render.yaml`](../render.yaml) com toda a configuração, então o
Render cria o serviço sozinho.

1. No [painel do Render](https://dashboard.render.com), clique em **New +** → **Blueprint**.
2. Conecte o GitHub, se ele pedir, e escolha o repositório **footstats**.
3. O Render lê o `render.yaml` e mostra o serviço **footstats-api**. Ele vai pedir três
   valores:
   - **`CORS_ORIGIN`**: por enquanto, `http://localhost:5173` (o valor certo entra no
     passo 3).
   - **`FOOTBALL_DATA_TOKEN`**: a sua chave da [football-data.org](https://www.football-data.org/client/register).
     Com ela, a API serve os **dados reais do Brasileirão**. Sem ela, serve os dados mock.
   - **`API_FOOTBALL_KEY`**: a sua chave da [API-Football](https://dashboard.api-football.com).
     Ela traz as fotos dos jogadores e dos técnicos e o número da camisa. É opcional: sem ela,
     a página do time continua funcionando, só que sem fotos.
4. Clique em **Apply** / **Deploy Blueprint** e espere o build terminar (3 a 5 minutos).
   O status precisa ficar **Live**.
5. Copie a URL do serviço, que aparece no topo da página. Algo como
   `https://footstats-api.onrender.com` (o Render pode acrescentar um sufixo se o nome já
   existir).
6. Teste no navegador:
   - `https://SUA-API.onrender.com/health` → `{"status":"ok", ..., "dataSource": {"name": "football-data", "fallback": false}}`.
     Se aparecer `"name": "mock"`, o token não foi lido. Confira a variável em **Environment**.
   - `https://SUA-API.onrender.com/api/standings` → JSON com a classificação

<details>
<summary>Sem Blueprint: criar o serviço manualmente</summary>

**New +** → **Web Service** → escolha o repositório e preencha:

| Campo | Valor |
|---|---|
| Root Directory | *(deixe vazio: a raiz do repositório)* |
| Runtime | Node |
| Build Command | `npx -y pnpm@10 install --frozen-lockfile --prod=false && npx -y pnpm@10 --filter @footstats/api build` |
| Start Command | `node apps/api/dist/server.js` |
| Instance Type | Free |
| Health Check Path *(em Advanced)* | `/health` |

Variáveis de ambiente: `NODE_VERSION` = `22`, `CORS_ORIGIN` = `http://localhost:5173`
(o valor certo entra no passo 3), `FOOTBALL_DATA_TOKEN` e `API_FOOTBALL_KEY` = as suas chaves.
</details>

---

## 2. Front na Vercel

1. No [painel da Vercel](https://vercel.com/new), clique em **Add New…** → **Project** e
   importe o repositório **footstats**.
2. Em **Root Directory**, clique em **Edit** e escolha **`apps/web`**. Esse é o passo mais
   importante.
3. Confira os campos, que a Vercel costuma preencher sozinha:

   | Campo | Valor |
   |---|---|
   | Framework Preset | Vite |
   | Build Command | `pnpm build` |
   | Output Directory | `dist` |
   | Install Command | *(padrão: `pnpm install`)* |

4. Abra **Environment Variables** e adicione:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | a URL do Render do passo 1, **sem barra no final**. Ex.: `https://footstats-api.onrender.com` |

5. Clique em **Deploy**. Ao terminar, copie a URL de produção, por exemplo
   `https://footstats.vercel.app`. Ela aparece em *Settings* → *Domains*.

> As variáveis `VITE_*` são gravadas no código **durante o build**. Se você alterar a
> `VITE_API_URL` depois, faça um novo deploy: *Deployments* → **⋯** → **Redeploy**.

---

## 3. Liberar o domínio da Vercel no CORS

1. No Render, abra o serviço **footstats-api** → **Environment**.
2. Edite **`CORS_ORIGIN`**, trocando `footstats` pelo nome real do seu projeto na Vercel:

   ```
   https://footstats.vercel.app,https://footstats-*.vercel.app
   ```

   - O primeiro valor é o domínio de produção.
   - O segundo (com `*`) libera os **previews** que a Vercel cria a cada push em uma
     branch, como `footstats-git-feat-api-nando.vercel.app`.
   - Use `https://` e **não** coloque barra no final.

3. Clique em **Save, rebuild and deploy**.

---

## 4. Conferência final (em produção)

- [ ] **Partidas**: os cards carregam, e a busca e o filtro funcionam.
- [ ] **Classificação**: a tabela aparece e a ordenação funciona. Recarregue a página
      (F5): ela **não** pode dar 404, e quem garante isso é o `apps/web/vercel.json`.
- [ ] **Time**: clique em um time na tabela.
- [ ] **Palpites**: criar, editar e excluir funcionam, e os toasts aparecem.
- [ ] **Modo demonstração** (rodapé): "Simular erro 500" mostra a tela de erro, e
      "Desativar" volta ao normal.
- [ ] **Lighthouse** em uma aba anônima (F12 → *Lighthouse* → *Analyze page load*):
      Acessibilidade ≥ 90.
- [ ] O link de produção está no [README](../README.md).

---

## Dia da apresentação

- **Acorde a API uns 5 minutos antes.** No plano gratuito, o Render coloca o serviço em
  repouso depois de 15 minutos sem acessos, e o primeiro acesso seguinte leva até cerca de
  1 minuto. Abrir `https://SUA-API.onrender.com/health` já basta. Se o front abrir com a
  API dormindo, ele mostra a mensagem de servidor em repouso com o botão "Tentar novamente".
- **Os palpites voltam ao estado inicial** sempre que a API reinicia ou entra em repouso,
  porque ficam só na memória. Vale explicar isso ao professor, se surgir a pergunta.
- **Troque de liga com calma na apresentação:** o limite gratuito é de 10 consultas por
  minuto, somando todas as ligas, e abrir uma liga pela primeira vez custa de 2 a 4. Para
  mostrar várias ligas, abra cada uma uns minutos antes; depois disso, o cache segura. Se o
  limite estourar, a tela mostra "Limite de consultas atingido" com o botão "Tentar novamente".
- **Os dados são reais e mudam:** placares, classificação e jogos vêm da football-data.org.
  No plano gratuito, os placares chegam com alguns minutos de atraso. Se a football-data.org
  cair ou o limite estourar, a API passa a servir os dados mock sozinha, e o rodapé do site
  avisa.
- **Opcional:** para a API não dormir, cadastre um monitor gratuito (por exemplo, o
  [UptimeRobot](https://uptimerobot.com)) que acesse `/health` a cada 10 minutos. Um
  serviço ligado o mês todo cabe nas 750 horas gratuitas do Render.

---

## Problemas comuns

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| Console do navegador: *blocked by CORS policy* | O `CORS_ORIGIN` no Render não bate com o domínio da Vercel | Confira o `https://`, a ausência de barra final e o nome exato do domínio (passo 3) |
| O front tenta acessar `localhost:3000` | `VITE_API_URL` ausente, ou foi criada depois do build | Adicione a variável e faça **Redeploy** na Vercel |
| 404 ao recarregar `/classificacao` | O `vercel.json` não foi lido | Confirme que o **Root Directory** é `apps/web` |
| Build da Vercel falha com *pnpm* ou *lockfile* | Root Directory errado, ou lockfile desatualizado | Root Directory = `apps/web`. Rode `pnpm install` localmente e commite o `pnpm-lock.yaml` |
| O primeiro acesso dá "servidor demorou para responder" | A API estava em repouso no Render | Espere cerca de 1 minuto e clique em "Tentar novamente" |
| Build do Render falha | Veja o log em *Events* / *Logs* | Confira os comandos de Build e Start (seção 1) |
| Página do time sem fotos | `API_FOOTBALL_KEY` ausente, ou o limite da API-Football estourou (100 por dia, cerca de 10 por minuto). Cada time aberto pela primeira vez no dia gasta 2 | Confira a variável no Render. Os elencos ficam em cache por 24 h. No dia da apresentação, evite abrir dezenas de times diferentes antes da hora; a cota zera às 21h de Brasília |
| Rodapé: "football-data.org está indisponível" | Token inválido, limite de 10 req/min excedido ou a football-data.org fora do ar | Veja o log no Render (mensagem "Fonte principal falhou…"). O site continua funcionando com o mock. |
