# Notícias REST e auditoria dos versículos — 12/11/2026

## Notícias: arquitetura e consumo

Antes: navegador → `/api/news` e `/api/news/gospel` → Worker → caches por POP → RSS
dos portais, com consulta complementar opcional de imagens gospel.

Agora: navegador → APIs REST públicas dos portais. Os endpoints completos estão
em `src/lib/news/rest.ts`, com `per_page=10`, `featured_media` e os campos de imagem
específicos exigidos. Não se usa `_embed`, API de mídias, scraping ou proxy.

| Recurso                                       | Antes                               | Agora                                     |
| --------------------------------------------- | ----------------------------------- | ----------------------------------------- |
| Consultas de notícias por ciclo e aba visível | 2 ao Worker                         | 2 diretas, uma por portal                 |
| Worker para notícias no fluxo normal          | 2 invocações/ciclo                  | 0                                         |
| Chamadas complementares para imagens          | Podiam ocorrer no cache MISS gospel | 0                                         |
| Cache React Query                             | 15 minutos                          | 15 minutos                                |
| Compartilhamento entre cards e ticker         | Uma chave por fonte                 | Uma chave REST por fonte                  |
| Abas ocultas                                  | Sem polling                         | Sem polling; cancela tentativas pendentes |

Em operação saudável, são aproximadamente oito consultas diretas/hora por aba
continuamente visível, somando as duas fontes. Não são oito por componente.
Inicialização, retorno com dados vencidos e retry podem alterar a contagem.
Cada aba/visitante tem cache próprio; o cache do navegador não é cache entre visitantes.

Timeout de oito segundos cobre resposta e JSON. Uma nova tentativa após 30 segundos;
depois, permanece o ciclo de 15 minutos ou revalidação ao retornar. Falhas HTTP,
JSON inválido e respostas sem notícias válidas não substituem o último resultado.
O cache permanece em memória durante a sessão. Não há fallback automático ao Worker.

## Contrato, seleção editorial e SEO

O modelo `NewsItem` foi preservado: título, resumo, URL, publicação, imagem e fonte.
Entidades HTML são decodificadas com biblioteca já instalada, agora declarada como
dependência direta. HTML remoto não é inserido na página. As URLs têm validação HTTPS
e lista de hosts; imagens Jetpack precisam pertencer ao caminho da Folha Gospel.

As datas WordPress sem offset são convertidas de UTC−03 para ISO UTC. O índice REST
público confirmou `gmt_offset=-3` no DeFato e `America/Sao_Paulo`/`-3` na Folha Gospel.
Mantêm-se até quatro destaques gospel com imagem, seis matérias regionais na seção
e dez manchetes combinadas no ticker. Ausência de imagem não gera outra consulta.

Os componentes e o CSS não foram redesenhados. Antes e depois, notícias carregam no
cliente após a montagem; a migração não remove HTML de notícias anteriormente SSR.
As alterações locais da Hostplay, do player e de sua documentação foram preservadas.

## Código antigo e compartilhado

Os helpers puros de texto, resumo, imagem e seleção gospel foram extraídos para
`src/lib/news/normalize.ts`; o frontend REST não importa o parser XML nem serviços
de servidor. Os caminhos de importação antigos reexportam os helpers para manter
compatibilidade e os testes existentes.

As rotas públicas legadas `/api/news` e `/api/news/gospel` foram identificadas, mas
mantidas por compatibilidade nesta mudança. Elas não são chamadas por componentes
nem usadas como fallback. Uma chamada explícita externa a essas rotas ainda executa
o Worker. O cache compartilhado continua necessário ao endpoint de reversão dos
metadados e não foi removido. O helper `readService` deixou de ser usado pelas notícias,
mas permanece no arquivo de metadados que esta tarefa exige preservar integralmente.

## Evidências e validação das notícias

- Ambas as APIs retornaram HTTP 200, sem redirecionamento, com dez notícias, títulos,
  resumos e campos de imagem. Respostas observadas de aproximadamente 6,6 e 8,7 KB.
- HTTP separado com `Origin: https://radiosinta.com.br`: ambas devolveram
  `Access-Control-Allow-Origin: https://radiosinta.com.br`; sem credenciais privadas.
- Navegador interno, origem local `http://127.0.0.1:5176`: uma consulta à Folha Gospel
  e uma ao DeFato, ambas iniciadas perto de 0,9 segundo. Resource Timing e conteúdo
  renderizado confirmaram leitura CORS, quatro cards gospel, seis regionais e dez
  manchetes; zero chamadas a `/api/*` e nenhuma consulta à API de mídias/RSS.
- Metadados continuaram diretamente na Hostplay; um único áudio MP3 reproduziu
  por mais de 100 segundos enquanto a navegação foi para notícias. As quatro imagens
  gospel carregaram após a rolagem, respeitando o lazy loading. O versículo permaneceu
  renderizado. Em mobile e desktop, a largura do documento coincidiu com a viewport
  da aplicação, sem overflow horizontal.
- O navegador interno não expõe Network completo nem execução livre de fetch na
  página publicada. A validação automática do navegador foi local, sem alegar teste
  novo na origem HTTPS de produção. O usuário também forneceu validações anteriores
  de CORS a partir do domínio da rádio. Nenhum deploy foi realizado.
- Não foi aguardado um período real de 15 minutos: cache, deduplicação, retorno,
  timeout e conservação dos dados foram verificados em testes com React Query.
- APIs públicas podem alterar disponibilidade/CORS ou impor limites. Não se presume
  franquia ilimitada nem SLA; o desenho mantém duas chamadas por ciclo e retry moderado.

## Versículos: auditoria específica

**API/endpoint:** nenhum. Os 365 textos já estão em `src/data/dailyVerses.ts`.
São Salmos da **Bíblia Livre (BLIVRE)**, com fonte fixada no commit
`a315a15e9f4d01883b62206fe441d57762f126b3`, arquivo `textos/f4/geral/sal.txt`.
A atribuição local identifica Diego Santos, Mario Sérgio e Marco Teles e CC BY 3.0 BR;
há licença em `public/licenses/biblia-livre.md` e atribuição no conteúdo compartilhado.

**Arquitetura anterior e mantida:** dados locais → `verseForDay` → `DailyVerse`.
O loader da home fornece a data inicial para SSR/hidratação. Isso faz parte do HTML
normal da página, não de uma API dedicada de versículos. O índice é o ordinal da
data civil em `America/Sao_Paulo`, módulo 365. A verificação a cada segundo é local;
retornar à aba verifica a data novamente. Não há cron, token ou serviço remoto.

**CORS, acesso público, limites e tamanho de resposta de API:** não aplicáveis, pois
nenhuma API é utilizada. A coleção integra os assets do projeto; não há download
diário de Bíblia nem recuperação de versículos externos durante a sessão.

**Viabilidade da consulta direta:** não existe intermediação a substituir. Introduzir
uma API aumentaria requisições e adicionaria dependência externa, sem benefício.
Por isso foram preservados dados, tradução, referência, rotação, UI e compartilhamento.
Não foi criada ou escolhida uma nova API de versículos.

**Requisições antes/depois:** zero externas e zero chamadas dedicadas ao Worker em
ambos os casos. O Worker continua podendo servir a página SSR; isso não é uma consulta
periódica de versículos. No Vite, arquivos `/src/data/dailyVerses.ts` e módulos relacionados
podem aparecer na rede como código local; em produção integram o bundle de assets.

**Validação:** `Salmos 139:16` e seu texto apareceram no navegador. Testes confirmam
fonte local, zero `fetch`, seleção determinística, mudança à meia-noite de São Paulo,
365 referências únicas e rotação sem repetição consecutiva em 800 dias. Nenhuma
alteração nos arquivos de versículos foi necessária.
