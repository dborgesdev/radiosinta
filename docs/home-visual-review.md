# Revisão visual, metadados e notícias — 12/11/2026

Trabalho na branch local existente `feature/home-dynamic-radio`, preservando as alterações da primeira entrega. Não houve push, merge ou deploy. Este documento atualiza o relatório anterior, especialmente sua composição editorial e a antiga flag que ocultava imagens.

## Resultado

- Hero com **Baloo 2 ExtraBold 800**, letras robustas e arredondadas. Rádio em branco com acento ciano; Sinta em gradiente ciano/azul/roxo/amarelo/laranja; ponto laranja. Duas linhas, mesma fonte no desktop e mobile.
- Fonte hospedada localmente em WOFF2 latino de **18.632 bytes**, com preload; não depende de Google Fonts para o título. [Licença SIL OFL 1.1 e autores](https://github.com/google/fonts/blob/main/ofl/baloo2/OFL.txt) preservados em `public/licenses/baloo-2-OFL.txt`.
- `CoverArt` usa o asset oficial já existente em capas nulas, vazias e com erro. Logo centralizado, sem recorte, `object-fit: contain`, fundo discreto. Nenhuma busca complementar de capas foi criada.
- Card bíblico contém somente sua hierarquia visual, versículo, referência e compartilhamento. Atribuição de obra, autores, edição e licença passou para o rodapé. Coleção, rotação em São Paulo e conteúdo compartilhado foram preservados.
- Retirado o espaçamento inferior duplicado do rodapé; a reserva da página para a barra fixa continua protegendo os últimos links e créditos.
- Notícias principais: quatro destaques gospel com imagens reais, um grande e três secundários. Notícias regionais abaixo, em duas colunas no desktop, com data, título, resumo e link, sem imagens. Mobile mostra os três secundários compactos e até três regionais.
- Escala revista: títulos de seção 28–40 px, cards 16–26 px, corpo 15–16 px, resumos 15 px, metadados 12–13 px e eyebrows 11 px. Player: título 16/14 px e artista 14/12 px (desktop/mobile). Estilos da Home foram organizados em `src/styles/home.css`, removendo a sobreposição de escalas antigas.

## Verificação das fontes reais

### Folha Gospel

[Feed](https://folhagospel.com/feed/) respondeu 200, oferecendo ETag e Last-Modified. Na amostra de dez itens de 12/11/2026, **somente um tinha imagem no RSS**, dentro de `content:encoded`. A URL incluía `&#038;ssl=1`.

A [API REST de posts](https://folhagospel.com/wp-json/wp/v2/posts?per_page=4&_fields=id,link,featured_media,jetpack_featured_media_url) está disponível e expõe `jetpack_featured_media_url`. Portanto não é necessário `_embed`, scraping de reportagens ou uma consulta individual por mídia.

O servidor encontrou três candidatos sem imagem entre os quatro mais recentes e fez **uma consulta em lote para os IDs 85456, 85450 e 85447**. O resultado completou os quatro destaques, mantendo a primeira imagem vinda do próprio RSS. As quatro URLs carregaram no navegador, confirmadas por `complete` e `naturalWidth > 0`.

Ordem de extração: media content, thumbnail, enclosure de imagem, HTML do conteúdo, HTML da descrição e complemento REST. Entidades de atributos são decodificadas, parâmetros Jetpack preservados. URLs aceitam somente HTTPS, hosts explícitos e, no Jetpack, caminho pertencente a `folhagospel.com`.

O complemento considera **somente os quatro candidatos mais recentes** e no máximo quatro IDs numa única consulta. Imagens válidas mais antigas no RSS ainda podem preencher posições se o complemento falhar. Havendo menos de quatro resultados utilizáveis, o endpoint entrega menos itens e o grid se adapta. Nenhuma fotografia genérica substitui notícias sem imagem.

### DeFato Online

[Feed](https://defatoonline.com.br/feed/) real validado. A extração continua lendo imagens em conteúdo/descrição, além dos campos media, mas a composição regional **não as renderiza**.

Resumos usam o primeiro parágrafo textual relevante de `content:encoded`, com fallback para descrição. Removem scripts, estilos, figuras/embeds, shortcodes, `[links]` e avisos automáticos de republicação. São limitados em fronteira de palavra a até 180 caracteres, sem inventar conteúdo; trechos de origem menores permanecem menores. O CSS limita a exibição adicional a duas linhas.

## Cache e consumo externo

| Recurso | Chave/endpoint | Frescor | Contingência |
| --- | --- | --- | --- |
| Hostplay | `/api/nowplaying`, chave v1 preservada | 15 s | Último válido por até 1 h; retry 15 s |
| RSS regional | `/api/news`, chave v2 | 900 s | Último válido por até 24 h; retry 60 s |
| RSS gospel | `/api/news/gospel`, chave v2 independente | 900 s | Último válido por até 24 h; retry 60 s |
| Lote de imagens WordPress | Chave v2 pelos IDs ordenados | 24 h | Último válido por até 7 dias; retry 60 s |

São mantidos Cache API nativa do Cloudflare, deduplicação por Promise no isolate, backoff compartilhado, validação condicional por ETag/Last-Modified e SWR via `waitUntil`. Os feeds falham independentemente. Um 304 não refaz o parsing XML. Se faltarem imagens no resultado anterior, um 304 gospel pode tentar o complemento através do cache de mídia, respeitando o cooldown.

As chaves de notícias passaram a v2 porque o modelo de normalização/resumos mudou; o cache Hostplay não foi invalidado. Query strings de visitantes não mudam as chaves. Não foram criados KV, Durable Objects ou outros serviços persistentes. O cache continua sendo **por POP, não um lock global entre todos os POPs/isolates**. O preview Node mantém apenas o fallback por processo, identificado por cabeçalho; ele não é tratado como cache distribuído.

### Quantidade esperada

**Carregamento frio por POP:** duas consultas RSS e, se necessário, uma consulta REST em lote para completar gospel: **2–3 consultas externas de notícias**. Acrescentando o primeiro preenchimento Hostplay, **3–4 consultas externas totais**. As imagens são carregadas diretamente pelo navegador; seu tráfego não passa pelo backend.

**Durante o TTL:** chamadas de visitantes aos endpoints locais não repetem essas consultas externas. React Query mantém uma consulta de rádio compartilhada pelo hero/histórico/player, e uma consulta por feed, com polling suspenso quando a aba fica oculta.

**A cada revalidação:** uma consulta por RSS vencido. O complemento acrescenta no máximo uma consulta em lote se houver imagens faltando e o lote não estiver em cache. 304 reutiliza os dados normalizados; lotes já válidos economizam a consulta REST. Sem visitantes não há cron ou trabalho diário.

Em tráfego contínuo e cache estável por POP: aproximadamente **240 consultas Hostplay/h** e **8 consultas RSS/h** (quatro por feed). O complemento varia de zero, para imagens/lotes já conhecidos, a cerca de quatro lotes/h se novos candidatos exigirem imagens em toda atualização. São estimativas, não limites rígidos, devido a múltiplos POPs, evicções e corridas de cache frio entre isolates.

## Testes e QA

- **19 testes automatizados passaram**, incluindo os 15 existentes e os novos cenários de entidades em URLs, limpeza de resumos, seleção/enriquecimento limitado e isolamento dos caches. Cinquenta acessos gospel simultâneos geraram um RSS e um lote REST; revalidação posterior não repetiu o lote. A falha regional preservou seus dados antigos sem afetar gospel.
- Teste nativo `workerd`: 100 consumidores, uma execução do loader; reutilização por outro controlador e segunda consulta somente após o TTL. Necessita executar fora da restrição de sockets do sandbox no ambiente Windows.
- Teste do **Worker de produção local**: 100 acessos a cada um dos três endpoints reutilizaram a mesma versão normalizada. SSR com um único `<audio>` e versículo local. Nenhum deploy foi feito.
- `npm run build`, `npx tsc --noEmit` e `npm run lint`: aprovados. Lint mantém somente os seis avisos de Fast Refresh dos componentes de UI preexistentes.
- Navegador: layouts inspecionados em **320, 390, 768, 1024 e 1440 px**, sem overflow da página. Fonte Baloo 2 confirmada no desktop/mobile. Logos no histórico, card e player; créditos fora do card bíblico; quatro imagens gospel carregadas; seis regionais desktop/três mobile com resumos e sem imagens.
- Página **isolada de QA**, somente em `.scratch` e fora do build, renderizou os componentes reais com capa nula, vazia e URL inexistente. Os três casos mostraram o logo com `object-fit: contain`. Uma notícia com imagem inexistente manteve título e link e removeu a área de imagem, sem ícone gigante.
- Reprodução do MP3 real, controle pelo hero/barra, volume via teclado e continuidade do mesmo áudio durante navegação foram conferidos. A arquitetura de reprodução e os eventos GA4 não foram alterados.
- A rotação de versículos permaneceu coberta pelo teste de 800 dias consecutivos, seleção determinística e virada de data em São Paulo.

## Arquivos desta revisão

**Alterados:**

- `src/components/Hero.tsx`, `CoverArt.tsx`, `DailyVerse.tsx`, `Footer.tsx`, `NewsSection.tsx`.
- `src/lib/news/parser.ts`, `src/lib/services/integrations.server.ts`.
- `src/routes/__root.tsx` (preload da fonte), `src/styles.css` (importação dos estilos separados).
- `tests/verify-built-worker.mjs` (novo endpoint gospel).
- `docs/home-dynamic-radio.md` (referência a este relatório atualizado).

**Adicionados:**

- `src/styles/home.css`, `src/lib/news/sources.ts`, `src/lib/news/gospel.ts`.
- `public/fonts/baloo-2-latin-800.woff2`, `public/licenses/baloo-2-OFL.txt`.
- `tests/news-sources.test.ts`, este relatório.

**Removido:** `src/config/news.ts`, flag obsoleta que impedia a apresentação de imagens.

## Limitações reais

As fontes podem omitir imagens, alterar URLs ou indisponibilizar a API REST. O site usa somente o que consegue validar e nunca inventa notícias/resumos/imagens. Uma URL válida também pode falhar no navegador; nessa situação a reportagem continua acessível. Os títulos/artistas imperfeitos da Hostplay continuam sendo tratados conservadoramente, sem inversões arbitrárias. Falhas temporárias de metadados não afetam o áudio.

Sem mudanças em pagamentos, PIX, contatos, CVV, créditos de desenvolvimento ou links institucionais. Sem push, merge ou deploy.
