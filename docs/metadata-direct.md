# Metadados diretamente da Hostplay

O transporte padrão é navegador → `https://play.radiosinta.com.br/api/nowplaying?sid=1`.
Não há consulta SSR nem fallback automático para o Worker. O `RadioProvider` mantém
uma única query para Hero, Header, player e histórico; o áudio continua independente.
Notícias e seus caches não foram alterados.

## Configuração e reversão

- Padrão: variável ausente ou `VITE_RADIO_METADATA_SOURCE=hostplay`.
- Reversão explícita: `VITE_RADIO_METADATA_SOURCE=worker`, seguida de novo build/deploy.
- O endpoint `/api/nowplaying` e o cache anterior permanecem disponíveis.
- Esta variável é pública, incorporada no build; não contém segredo.

## Atualização e falhas

- Polling nominal de 15 segundos em abas visíveis; uma query deduplica consultas.
- `cache: no-store`, sem credenciais e sem seguir redirecionamentos.
- Timeout de oito segundos por tentativa, incluindo leitura do JSON.
- Duas novas tentativas, após 15 e 30 segundos, controladas pelo React Query.
- Após esgotar as tentativas, polling de 120 segundos durante indisponibilidade.
- Ocultar a aba cancela consultas/tentativas pendentes; retornar permite atualização
  caso os dados estejam vencidos. Nenhuma consulta nova é iniciada em segundo plano.
- Falhas HTTP, JSON inválido e metadados sem título geram erro sem substituir o último
  snapshot válido. React Query conserva o resultado em memória durante a sessão.
- Recarregar a página inicia outra sessão, sem persistência em armazenamento local.

## Consumo

Em operação saudável: aproximadamente 240 requisições à Hostplay por hora por aba
visível e **zero requisições ao Worker para metadados**. Abas e visitantes diferentes
consultam a origem independentemente; não existe cache compartilhado entre eles.
SSR, notícias, assets e navegação são recursos distintos e continuam existindo.
Os 240/h são a referência nominal sem latência. O React Query agenda o próximo
ciclo após a conclusão da consulta: respostas de cinco segundos resultam em cerca
de um início de consulta a cada vinte segundos. Retomadas e retries têm outra contagem.

## Validação antes de publicar

Confirmar no navegador HTTPS a partir de `https://radiosinta.com.br` que a origem
permite CORS e que as requisições não são redirecionadas. Na prévia da implementação,
filtrar `nowplaying` no Network: deve existir somente o destino Hostplay, uma consulta
por ciclo e nenhuma chamada local, inclusive durante erros. Verificar ocultação,
retomada, reprodução, capas e atualização de histórico. Testes com respostas simuladas
validam falhas e trocas determinísticas; não comprovam uma troca musical real.

## Evidências desta implementação — 12/11/2026

- HTTP público com `Origin: https://radiosinta.com.br`: status 200,
  `Access-Control-Allow-Origin: *`, JSON e nenhum redirecionamento.
- Aplicação real no navegador interno, origem `http://127.0.0.1:5175`:
  onze consultas diretas observadas pelo Resource Timing do navegador, com inícios
  em 1,3; 21,4; 41,0; 61,5; 81,1; 99,9; 119,9; 138,8; 157,8; 176,4 e 195,1 segundos. Nenhuma consulta local
  a `/api/nowplaying` nessa observação. O diagnóstico temporário foi removido.
- Título `bloco 01`, artista `Ondas De Paz`, histórico preenchido e capa do Deezer
  carregada. Hero e player exibiram a mesma resposta. Não foi observada troca real
  de música nesse período; as trocas e a recuperação foram verificadas em testes.
- Um único elemento de áudio, MP3 direto, avançando por mais de 90 segundos durante
  as atualizações. Conferência da interface em viewports mobile e desktop.
- Limitações: o navegador interno disponibiliza DOM e console, mas não Network
  completo nem execução livre de fetch no contexto de produção. Assim, a leitura
  CORS foi comprovada no navegador local, enquanto o cabeçalho para a origem HTTPS
  foi conferido por HTTP separado. A leitura direta a partir da página publicada
  ainda deve ser confirmada antes de considerar a validação de produção concluída.
- Ocultar a interface do navegador interno não mudou `document.visibilityState`:
  não foi usado como prova de suspensão real. Ativação/cancelamento e preservação
  do snapshot foram testados com React Query; o ciclo real hidden/visible ainda
  requer um navegador que exponha essa transição.
