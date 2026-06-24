# Prompt para Figma

Copie o texto abaixo e cole na ferramenta de geração de UI do Figma.

---

Projeto: **Pokémon Team Finder** — um site para jogadores de Pokémon Champions (o jogo competitivo VGC) que ainda não têm os 6 Pokémon de um time completo.

Problema que resolve: o jogador já tem alguns Pokémon (ex: Whimsicott, Garchomp, Basculegion) mas não sabe com quais outros Pokémon combinar pra fechar um time competitivo forte. O site cruza os Pokémon que a pessoa já tem com dados reais de uso competitivo (quem joga com quem, em %) e sugere o resto do time.

Público: jogadores de Pokémon competitivo (VGC), público gamer, costuma gostar de UI escura, com toques de cor vibrante, estética "gaming"/app de stats esportivos (tipo um misto de app de e-sports + Pokédex), não infantil.

Estilo visual desejado: dark mode como base, cards com bordas suaves e leve glow, paleta de cor com um verde-esmeralda como cor primária (de destaque/CTA) sobre fundo escuro (zinc/preto), tipografia moderna sans-serif, bastante uso de "badges" arredondados pra mostrar porcentagens e tags de tipo. Pode usar ícones/elementos visuais inspirados no universo Pokémon (esferas, raios, padrões hexagonais) mas sem copiar assets oficiais com copyright — é uma estética "inspirada em", não uma cópia.

Telas que preciso (fluxo principal de um app web responsivo, mobile-first mas funciona bem em desktop também):

1. **Landing page** — hero com título "Pokémon Team Finder", subtítulo explicando a proposta (descobrir o time baseado no que você já tem), botão CTA grande "Encontrar meu time", e um preview visual de cards de Pokémon ao fundo ou ao lado pra dar contexto visual.

2. **Team Finder (tela principal)** — um campo de busca/autocomplete no topo onde a pessoa digita e adiciona os Pokémon que já tem (aparecem como "chips"/tags removíveis com o sprite do Pokémon). Abaixo, uma lista de cards de sugestão, cada card mostrando: sprite do Pokémon sugerido, nome, uma barra ou badge de "% de compatibilidade" com destaque visual forte (esse é o dado principal da tela), texto pequeno dizendo com qual dos Pokémon do usuário ele mais combina e o %, e um texto secundário com o "uso geral no meta atual". Cards ordenados do mais recomendado pro menos.

3. **Team Builder** — uma grade de 6 slots (representando os 6 Pokémon do time), cada slot vazio mostra um "+" convidando a adicionar um Pokémon; slot preenchido mostra sprite grande, nome, e abaixo dele controles compactos para escolher: habilidade, item, tera type, 4 golpes (moves) e EVs/nature (pode ser um painel expansível/modal por slot pra não poluir a tela). Botão de destaque "Salvar time" no topo ou rodapé.

4. **Meus times (dashboard logado)** — grid/lista de cards de times salvos pelo usuário, cada card mostra os 6 sprites em miniatura, nome do time, e ações rápidas (editar, compartilhar — com toggle público/privado, excluir).

5. **Página de time compartilhado (pública, somente leitura)** — visual mais "showcase", mostra os 6 Pokémon do time em destaque com seus detalhes, sem nenhum controle de edição, só um cabeçalho leve indicando "Time criado por [nome]" e um botão de copiar link.

6. **Calculadora de dano** — formulário em duas colunas (atacante vs defensor) lado a lado ou em abas no mobile, cada lado com seleção de Pokémon + nível/EVs/nature/item/habilidade, um seletor de golpe no meio, e abaixo um resultado em destaque mostrando o range de dano (ex: "32% – 38%") com uma barra visual de porcentagem e o texto de "guaranteed 2HKO" etc.

Componentes recorrentes que preciso no design system: header fixo com logo à esquerda e botão "Entrar com Google" à direita (quando logado, mostra avatar/nome + menu), chips removíveis, cards de sugestão com badge de porcentagem, barra de progresso/dano, grid de 6 slots de time, botão primário (verde-esmeralda) e botão secundário (outline/cinza).

Gere as telas principais (Landing, Team Finder e Team Builder são as prioritárias) com esse sistema visual consistente entre elas.
