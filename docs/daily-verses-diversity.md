# Versículos diários — diversidade e verificação

A coleção contém 365 referências e textos únicos: 145 do Antigo Testamento e 220 do Novo Testamento.

| Livro        | Quantidade |
| ------------ | ---------: |
| Salmos       |         30 |
| Provérbios   |         30 |
| Isaías       |         25 |
| Jeremias     |         15 |
| Josué        |         12 |
| Deuteronômio |         18 |
| Eclesiastes  |         15 |
| Mateus       |         25 |
| Lucas        |         20 |
| João         |         30 |
| Romanos      |         25 |
| 1 Coríntios  |         22 |
| 2 Coríntios  |         18 |
| Filipenses   |         18 |
| Efésios      |         18 |
| Hebreus      |         18 |
| Tiago        |         16 |
| Apocalipse   |         10 |
| **Total**    |    **365** |

As passagens foram selecionadas para contemplar fé, esperança, amor, confiança, gratidão, sabedoria e perseverança. Cada livro é distribuído ao longo de todo o ciclo, proporcionalmente à sua quantidade. Não há dias consecutivos do mesmo livro, inclusive na passagem da última para a primeira entrada. Toda janela circular de 30 entradas contém pelo menos 16 livros. Os testes também verificam a diversidade dos meses de 2026, 2027 e 2028.

## Fidelidade à Bíblia Livre

Fonte: [repositório Bíblia Livre, commit a315a15e9f4d01883b62206fe441d57762f126b3](https://github.com/blivre/BibliaLivre/tree/a315a15e9f4d01883b62206fe441d57762f126b3/textos/f4/geral), o mesmo commit já adotado pelo projeto. A atribuição e a licença existentes permanecem em `public/licenses/biblia-livre.md`.

O gerador extrai cada passagem pela identificação de livro, capítulo e versículo nos 18 arquivos originais. Remove somente notas editoriais, referências cruzadas, títulos de Salmos e marcadores de formatação; preserva as palavras delimitadas pelos marcadores de texto acrescentado pelos tradutores. Normaliza espaços, sem reescrever palavras, acentuação ou pontuação. Passagens com variantes de edição não resolvidas ou marcação desconhecida são recusadas e não fazem parte da seleção.

As 365 referências e seus textos completos foram comparados automaticamente com esses arquivos. O manifesto `scripts/daily-verses.selection.json` registra as referências escolhidas e os hashes SHA-256 das fontes; `docs/daily-verses-verification.json` registra os mesmos hashes e o hash da coleção final. Os testes verificam a integridade da coleção, referências, distribuição e comportamento do extrator.

Para repetir a conferência a partir das fontes públicas fixadas:

```sh
node scripts/prepare-verses.mjs --download --verify
```

Com as fontes já disponíveis em `.scratch/blivre`, basta `node scripts/prepare-verses.mjs --verify`, sem acesso à rede. A execução sem `--verify` regenera a coleção e o relatório. Esses comandos são ferramentas de manutenção: não são executados pelo site, build ou seleção diária.

## Comportamento preservado

A interface de `src/data/dailyVerses.ts`, a fórmula determinística existente e a mudança de data em `America/Sao_Paulo` permanecem intactas. A coleção é local e não faz requisições externas. Componentes, estilos e layout não foram alterados. Os textos selecionados têm de 38 a 296 caracteres.
