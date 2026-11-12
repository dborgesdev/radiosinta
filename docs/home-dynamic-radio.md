# Home dinâmica da Rádio Sinta

> Registro da primeira entrega. A revisão posterior de tipografia, fallback, créditos e dois feeds está documentada em [home-visual-review.md](home-visual-review.md) e substitui as descrições antigas de layout e da flag de imagens abaixo.

Implementação local na branch `feature/home-dynamic-radio`. Sem push, merge ou deploy.

## Auditoria do runtime

- Stack instalada: TanStack Start/Router, React Query 5, Vite 8, Nitro `3.0.260603-beta`, Wrangler `4.106.0`, React 19. O preset Cloudflare é fixado em `vite.config.ts`, sem duplicar plugins do pacote Lovable.
- `wrangler.jsonc`: `nodejs_compat`, compatibility date `2026-07-01`, sem KV, Durable Objects, D1 ou R2. Nenhum binding persistente foi acrescentado.
- O build real produz `dist/server/index.mjs`, `dist/client` e a configuração efetiva `dist/server/wrangler.json`. O caminho antigo `dist/server/server.js` foi corrigido. Os avisos do Nitro de sobrescrita de `main`/`assets` são do gerador de configuração, não de um deploy executado.
- `caches.default` está disponível no Worker e foi testado com **workerd/Miniflare**, além do Worker de produção iniciado localmente por Wrangler. Não é uma propriedade presumida a partir do preview Node.
- O adaptador Nitro anexa `waitUntil` ao próprio `Request`. `src/server.ts` encaminha esse hook ao cache; aceita também o contexto de execução quando fornecido diretamente.
- `redirect: "error"` não existe no fetch do Workers. Usa-se `manual`, rejeitando respostas 3xx, exceto a revalidação 304. A diferença foi detectada e corrigida no teste do Worker real.
- No desenvolvimento Node sem Cache API existe somente um fallback por processo. O cabeçalho `X-Integration-Cache: development-process` identifica essa condição; **não equivale ao cache compartilhado do Cloudflare**. No Worker, o valor é `cloudflare-pop`.

Referências: [Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/), [Request no Workers](https://developers.cloudflare.com/workers/runtime-apis/request/). Foram inspecionados os arquivos locais de notícias, CSS e layout do Alvorada TVD, seu cache, e o cache WordPress do Kompetens. A composição editorial foi adaptada; o Durable Object usado pelo Alvorada não foi transportado para este projeto.

## Arquitetura e políticas

| Integração | Endpoint local | Frescor | Retenção para contingência | Nova tentativa em falha |
| --- | --- | --- | --- | --- |
| Hostplay | `/api/nowplaying` | 15 s | 1 h desde a última validação válida | 15 s |
| RSS | `/api/news` | 900 s | 24 h desde a última validação válida | 60 s |
| Versículo | Coleção local, sem endpoint externo | Data civil de São Paulo | Incluída no código | Não se aplica |

O servidor consulta somente duas URLs fixas. Query strings dos visitantes não mudam origem nem chave. Métodos diferentes de GET recebem 405. O MP3 **não passa pelo servidor**, permanece em `https://stmplay.com/listen/radiosinta300014/radio.mp3`.

Cada entrada da Cache API contém JSON **já normalizado**, timestamps, validadores e prazo de nova tentativa. Sua validade HTTP física é maior que o TTL de frescor para permitir servir o último resultado válido. A decisão de atualizar usa os timestamps internos. O `Cache-Control: no-store` da resposta ao visitante evita que um cache intermediário oculte o estado de contingência; não impede o armazenamento explícito interno na Cache API.

Uma Promise compartilhada por chave deduplica requisições simultâneas dentro do mesmo isolate. Uma segunda leitura antes de buscar a origem aproveita entradas preenchidas por outro controlador. A Cache API compartilha os resultados entre visitantes e isolates atendidos no mesmo ponto de presença (POP).

**Limite importante:** a Cache API é local ao POP e não oferece um lock distribuído ou persistência garantida. Misses frios simultâneos em isolates distintos podem produzir mais de uma consulta. Outros POPs têm seus próprios preenchimentos; cache pode ser removido antecipadamente. Não há garantia de uma única consulta global a cada 15 segundos/15 minutos. Isso exigiria coordenação persistente e não foi adicionada sem necessidade demonstrada.

### Hostplay

- Timeout de 8 s, incluindo leitura do corpo; limite de 128.000 bytes; validação e normalização antes de armazenar.
- Normaliza espaços, campos nulos, bitrate e capa relativa à aplicação Hostplay. URLs de capas usam HTTPS e allowlist. Não troca título/artista indiscriminadamente. Histórico limitado a seis itens.
- A API real respondeu com CORS `*` e `Cache-Control: no-store`. Mesmo com CORS disponível, os visitantes consomem exclusivamente o endpoint local para aproveitar o cache compartilhado.
- Cache expirado: atualização síncrona. Falha temporária: mantém os dados válidos por até 1 h, sinalizando `stale`; cache frio sem dados retorna 503 e estado neutro no frontend.
- Hero, barra e histórico usam o mesmo objeto de contexto, originado por **uma** consulta React Query no provider global. `staleTime` e polling de 15 s; `gcTime` de 1 h; retries imediatos desabilitados.
- A consulta é desabilitada no SSR e na primeira renderização de hidratação; habilita após montagem somente se a página estiver visível. Portanto não existe consulta SSR seguida de consulta duplicada de hidratação. Os metadados aparecem após o carregamento do cliente, com fallback renderizado no servidor.
- Aba oculta: sem polling. Ao retornar, dados vencidos são atualizados. React Query mantém o último sucesso durante erros da consulta.
- Um único `<audio>` no provider da rota raiz, com estado atualizado por eventos reais. Nem título, histórico, capa ou resposta de API são dependências do áudio. Pause libera o fluxo; Play reconecta ao MP3 real. Sem autoplay por clique genérico, iframe de contingência ou segundo áudio.
- Eventos GA4 `player_interaction`, tipo `premium_native`, ações `play`/`pause` foram preservados. Inicialização GA4 restrita ao cliente.

### RSS

- Somente servidor; timeout de 8 s e limite de 2 MB, inclusive para corpos chunked.
- Validação XML com `fast-xml-parser`, rejeição de DOCTYPE/ENTITY, limpeza de texto e allowlists HTTPS para reportagens e imagens. Nenhum HTML remoto é injetado no DOM.
- Ordem de busca de imagens: `media:content`, `media:thumbnail`, enclosure de imagem, `<img>` no conteúdo/descrição. Sem consultas individuais a reportagens.
- Ordenação por data, deduplicação por URL e GUID, limite de dez notícias. Títulos preservados integralmente; truncamento é apenas CSS. Descrições são reduzidas a um trecho curto.
- O feed real ofereceu **ETag e Last-Modified**; os dois são enviados na revalidação. Um 304 renova o frescor reutilizando o JSON anterior, sem refazer parsing. Um 200 é normalizado uma vez por preenchimento e substitui os validadores.
- Stale-while-revalidate implementado pela aplicação usando `waitUntil` do Worker. A Cache API não implementa automaticamente a diretiva HTTP SWR. Sem lifetime hook, a atualização é síncrona para não abandonar trabalho ao encerrar a requisição.
- Falhas preservam o conteúdo por até 24 h, com cooldown compartilhado; em cache frio, 503 e link discreto para o portal. Essa retenção é best effort, não banco de dados.
- React Query com `staleTime`/polling de 900 s, sem polling oculto, sem consulta SSR. No mobile: um destaque, duas secundárias e três manchetes. Desktop: destaque, três secundárias e até seis manchetes.

### Estimativa de requisições

Em tráfego contínuo e cache estável, **por POP ativo**:

| Serviço | Consultas esperadas à origem por hora | Por dia |
| --- | ---: | ---: |
| Hostplay | aproximadamente 240 | aproximadamente 5.760 |
| RSS | aproximadamente 4 | aproximadamente 96 |
| Versículo | 0 | 0 |

Esses valores não multiplicam linearmente pelo número de ouvintes. São estimativas de regime estável, não limites rígidos: há misses, evicções, múltiplos POPs e possíveis corridas entre isolates. Sem visitantes não há atualizações agendadas. Respostas 304 ainda contam como consultas, mas economizam transferência e parsing.

Exemplo: 100 abas visíveis podem fazer aproximadamente 24.000 chamadas/h ao **endpoint local** da rádio, mas compartilhar cerca de 240 consultas/h à **Hostplay** em um POP estável. React Query deduplica consumidores da mesma aba, não visitantes diferentes ou abas distintas. Para RSS, 400 chamadas/h locais dessas 100 abas podem compartilhar cerca de quatro revalidações/h à origem. Acessos iniciais e retorno à aba podem acrescentar chamadas locais.

### Invalidação

- Automática por TTL; leitura demanda a atualização. Sem cron.
- Mudanças incompatíveis de schema devem incrementar `/__integration-cache/v1` no servidor.
- Query string do visitante não invalida nem cria variações do cache.
- Invalidação operacional pode usar purge do cache Cloudflare quando necessário; nenhum endpoint público de purge foi criado.
- Durante indisponibilidade, o cooldown evita uma tentativa externa por visitante. Uma falha de armazenamento não descarta a resposta válida da origem, mas reduz a garantia de reutilização.

## Versículos e licenciamento

365 referências únicas dos Salmos, extraídas literalmente da **Bíblia Livre (BLIVRE)**. Fonte fixada no commit `a315a15e9f4d01883b62206fe441d57762f126b3`, arquivo `textos/f4/geral/sal.txt`. Créditos do projeto: © Diego Santos, Mario Sérgio e Marco Teles, edição indicada pelo README de fevereiro de 2018, **CC BY 3.0 Brasil**. Espaçamento normalizado e notas editoriais removidas; não foram inventados ou reescritos textos.

- [Fonte e atribuição exigida](https://github.com/blivre/BibliaLivre/blob/a315a15e9f4d01883b62206fe441d57762f126b3/README.md)
- [Licença original](https://github.com/blivre/BibliaLivre/blob/a315a15e9f4d01883b62206fe441d57762f126b3/LICENCA.md)
- Cópia local da licença em `public/licenses/biblia-livre.md`; créditos também aparecem na seção e no texto compartilhado.
- O índice usa o número ordinal da **data civil em America/Sao_Paulo**, módulo 365. Não reinicia no ano-novo e não repete em dias consecutivos, inclusive em anos bissextos.
- Loader serializa a data inicial para evitar divergência SSR/hidratação. Checagem local a cada segundo troca a mensagem na virada do dia e ao retornar à aba; não há rede, cron ou processamento remoto diário.
- `scripts/prepare-verses.mjs` reproduz a extração após baixar a fonte fixada para `.scratch/salmos.txt`. Não é executado no navegador nem no Worker.

### Fotografias das notícias

O feed real contém imagens válidas (dez de dez itens na consulta inicial), mas a publicação em RSS não comprovou autorização geral para reutilizar fotografias. A [página de identidade visual](https://defatoonline.com.br/identidade-visual/) exige autorização para as imagens daquela página; ela não foi tratada como autorização para imagens de reportagens. **Não foi confirmada licença de reutilização das fotos das notícias.**

Assim, `src/config/news.ts` mantém `newsImagesAuthorized = false`: a composição editorial está pronta e usa arte gráfica abstrata própria no lugar das fotografias, sem imagens aleatórias. Quando houver autorização aplicável, a flag habilita somente as imagens extraídas e validadas do feed. URLs, autoria e fonte ficam no modelo interno; a marca da fonte não aparece como selo nos cards. Não se copiam reportagens integrais. A autorização de fotografias é uma pendência real para cumprir a direção fotográfica integral do briefing.

## Validação

- `npm test`: 15 testes passaram. Concorrência de 100 consumidores; reutilização em outro controlador com storage compartilhado; TTL; cache negativo; cooldown; último resultado válido; retenção; SWR; 304; falha de armazenamento; canonicalização de query strings; ausência de proxy MP3; parsing/segurança/imagens RSS; rotação por 800 dias e meia-noite de São Paulo; normalização Hostplay; gerenciamento de reprodução; compartilhamento; limite de bytes.
- `npm run test:cloudflare`: teste **workerd com Cache API real**, 100 chamadas simultâneas → uma execução de loader, segundo controlador reutiliza, TTL expirado → segunda execução. O teste usa Miniflare e TypeScript já presentes no projeto via ferramentas existentes.
- `npm run test:worker`: teste opcional contra o build iniciado por Wrangler local. Faz 100 GETs por endpoint e verifica a mesma versão normalizada, `cloudflare-pop`, limite de notícias e um áudio no HTML SSR. Aceita contingência com dados válidos quando a origem falha, sem confundir disponibilidade externa com reutilização do cache. Usa as origens reais somente em misses. Um ensaio encontrou timeout real da Hostplay: as 100 respostas preservaram o mesmo último resultado válido, com uma única tentativa registrada no Worker.
- `npm run build`: passou com preset `cloudflare-module`. Um ensaio de rebuild enquanto Wrangler mantinha os assets abertos foi bloqueado por EBUSY no Windows; encerrar o preview liberou os arquivos e o build passou.
- `npm run lint`: sem erros, seis avisos preexistentes de Fast Refresh em componentes `src/components/ui`. Corrigida a referência preexistente a `eslintConfigPrettier` não importado.
- `npx tsc --noEmit`: passou.
- Consultas reais via curl, preview Node e Worker local: Hostplay e RSS 200; CORS/cabeçalhos inspecionados; dez notícias e imagens extraídas. Sem alterações nas origens.
- QA visual no navegador: 1440, 1024, 768, 390 e 320 px. Largura do documento dentro da viewport, um H1, âncoras existentes; rolagem horizontal restrita ao histórico. Hero compacto mobile, barra fixa, volume expansível, editorial adaptado. Revisados versículo e notícias. O MP3 real reproduziu; hero/barra sincronizados; volume via teclado; pausa e retomada; navegação entre seções preservou áudio. Houve troca real de título/capa enquanto o mesmo áudio continuou reproduzindo.
- Falhas de API, ausência de capa, retenção e falha de streaming foram cobertas por testes e fallbacks. Não se provocou uma interrupção da transmissão externa para testar indisponibilidade real. O compartilhamento nativo depende do suporte/permissões do sistema; caminhos de cópia, cancelamento e erro têm testes automatizados.

## Inventário de arquivos

**Criados:**

- `src/components/{RadioProvider,NowPlayingCard,CoverArt,RadioHistory,DailyVerse,NewsSection}.tsx`
- `src/hooks/{useNowPlaying,useRadio}.ts`
- `src/lib/radio/{types,normalize,playback}.ts`
- `src/lib/news/{types,parser}.ts`
- `src/lib/services/{cache.ts,integrations.server.ts}`
- `src/lib/{dailyVerse,share}.ts`, `src/data/dailyVerses.ts`, `src/config/news.ts`
- `tests/{cache,content,endpoints}.test.ts`, `tests/{verify-cloudflare,verify-built-worker}.mjs`
- `scripts/prepare-verses.mjs`, `public/licenses/biblia-livre.md`, este relatório.

**Modificados:** `src/components/{Hero,StickyPlayer}.tsx`, `src/routes/{index,__root}.tsx`, `src/config/radioData.ts` (âncora de notícias), `src/server.ts`, `src/styles.css`, `vite.config.ts`, `wrangler.jsonc`, `eslint.config.js`, `package.json`, `package-lock.json`, `.gitignore`.

**Removidos:** fundos exclusivos do slideshow `public/hero-peace.webp` e `public/hero-worship.webp`. `Artistas` saiu da Home; suas imagens e arquivo foram preservados. Nenhuma alteração em PIX, contatos, créditos, CVV, doações ou links institucionais.

## Reprodução local

```powershell
npm test
npm run test:cloudflare
npm run build
npm run lint
npx tsc --noEmit
node node_modules/wrangler/bin/wrangler.js dev --local --config dist/server/wrangler.json --port 8787
# Em outro terminal, mantendo o Worker acima aberto:
npm run test:worker
```

Encerre o Wrangler antes de reconstruir `dist` no Windows. Não houve push, merge, deploy ou modificação de sistemas externos.

