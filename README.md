# Stop! — Adedanha

> Jogo de Stop/Adedanha offline para grupos de amigos — 100% no navegador, sem login, sem servidor.

[![Jogue Agora](https://img.shields.io/badge/Jogue%20Agora-▶%20Play-FF6B6B?style=for-the-badge&logo=googlechrome&logoColor=white)](https://paulaolileal.github.io/stop-game/)
[![PWA](https://img.shields.io/badge/PWA-instalável-6C63FF?logo=googlechrome&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Offline](https://img.shields.io/badge/offline-100%25-43D9AD)](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
[![Licença](https://img.shields.io/badge/licença-MIT-blue)](LICENSE)

---

## Sobre o projeto

**Stop! Adedanha** é uma Progressive Web App (PWA) que recria o clássico jogo de letras diretamente no navegador. Cada jogador usa seu próprio celular para preencher as respostas. Não há servidor de sincronização: a configuração da partida é compartilhada via código/link, e cada dispositivo gerencia seu próprio estado localmente.

---

## Funcionalidades

- **100% offline** — Service Worker faz cache de todos os assets na primeira visita
- **Instalável** — funciona como app nativo (PWA) em Android, iOS e desktop
- **Sem cadastro** — nenhum dado é enviado para servidor algum
- **143+ categorias** prontas, organizadas em 13 packs temáticos
- **Categorias personalizadas** — crie as suas próprias durante a configuração
- **Compartilhamento de configuração** — gera código/link para outros jogadores entrarem com as mesmas categorias
- **Rodadas configuráveis** — 3, 5, 7, 10 ou modo infinito (∞)
- **Pontuação interativa** — toque para alternar entre 10 pts (único), 5 pts (igual) e 0 pts (inválido)
- **Tema claro/escuro** — alternável a qualquer momento
- **Sorteio de letra** — aleatório (sem repetição) ou manual; também aceita número de grupo para determinar a letra
- **Histórico de rodadas** — resumo completo ao final de cada rodada e placar final

---

## Packs de categorias

| Pack | Descrição |
|------|-----------|
| **Padrão** | O clássico: Nome, Animal, CEP, Cor… |
| **Família** | Para jogar com as crianças |
| **Natureza** | Fauna, flora e o planeta |
| **Cultura Pop** | Filmes, séries, músicas e mais |
| **Esportes** | Para os fãs de esporte |
| **Geografia** | Países, rios, montanhas e mais |
| **Mundo Científico** | Para os amantes da ciência |
| **Modo Extremo** | Só para os corajosos! |
| **Diferentes** | Categorias criativas e inesperadas |
| **Engraçados** | Vai dar risada, pode apostar! |
| **Brasileiro** | Jeitinho brasileiro raiz |
| **Reflexivo** | Revela a sua personalidade |
| **Teen** | O favorito dos jovens |

---

## Fluxo do jogo

```
Home → Configurar categorias → Informar nome → Sortear letra → Preencher respostas
    → STOP! → Pontuar respostas → Resultado da rodada → (próxima rodada ou placar final)
```

1. **Home** — criar novo jogo ou entrar com código de outro jogador
2. **Categorias** — escolher um pack, selecionar categorias individuais ou criar personalizadas; definir número de rodadas
3. **Compartilhar** — gerar código/link para os demais jogadores carregarem a mesma configuração
4. **Jogador** — cada pessoa digita seu nome no próprio celular
5. **Letra** — sorteio aleatório (sem repetir letras já usadas), escolha manual ou conversão de número de grupo em letra
6. **Jogo** — preencher todas as categorias; o primeiro a terminar pressiona **STOP!**
7. **Pontuação** — revisar cada resposta e atribuir pontos tocando no botão da categoria (ciclo: 10 → 5 → 0)
8. **Resultado** — ver pontuação da rodada e total acumulado; avançar para a próxima rodada ou encerrar
9. **Final** — ranking com vencedor destacado; opção de jogar novamente com as mesmas configurações

---

## Sistema de pontuação

| Situação | Pontos |
|----------|--------|
| Resposta **única** (nenhum outro jogador tem a mesma) | **10 pts** |
| Resposta **igual** a de outro jogador | **5 pts** |
| Resposta **inválida** ou em branco | **0 pts** |

A pontuação é gerenciada individualmente por cada jogador no próprio dispositivo.

---

## Estrutura de arquivos

```
stop-game/
├── index.html          # SPA — todas as telas em seções <section>
├── manifest.json       # Manifesto PWA
├── sw.js               # Service Worker (cache-first)
├── icons/
│   └── icon.svg        # Ícone da aplicação
├── css/
│   ├── themes.css      # Variáveis de cor (dark/light)
│   ├── main.css        # Reset, tipografia e utilitários
│   ├── components.css  # Componentes reutilizáveis (botões, inputs, modais…)
│   └── screens.css     # Estilos específicos de cada tela
└── js/
    ├── categories.js   # Banco de categorias (143+) e packs (13 presets)
    ├── share.js        # Encode/decode de configuração em Base64 para URL
    ├── router.js       # Navegação entre telas (show/hide de <section>)
    ├── game.js         # Estado global do jogo + persistência (localStorage)
    ├── scoring.js      # Renderização e lógica da tela de pontuação
    └── app.js          # Ponto de entrada — eventos e orquestração das telas
```

---

## Compartilhamento de configuração

O organizador configura categorias e rodadas e clica em **Compartilhar**. O app serializa a configuração em Base64 URL-safe e gera:

- Um **link** com o hash `#config=<código>` que abre o jogo já configurado
- Um **código** que pode ser colado manualmente na tela inicial

Não há servidor envolvido — toda a lógica de encode/decode está em `js/share.js`.

---

## Tecnologias

| Tecnologia | Uso |
|------------|-----|
| HTML5 / CSS3 / JavaScript (ES2020+) | Interface e lógica |
| Service Worker API | Cache offline |
| Web App Manifest | Instalação como PWA |
| localStorage | Persistência do estado entre recarregamentos |
| Web Share API / Clipboard API | Compartilhamento nativo e fallback |
| Font Awesome 6 | Ícones |

Sem frameworks, sem bundlers, sem dependências de runtime — o projeto roda diretamente de qualquer servidor de arquivos estáticos ou localmente abrindo o `index.html`.

---

## Como executar localmente

Qualquer servidor HTTP estático serve o projeto. Exemplos:

```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code — extensão Live Server
# Clique com botão direito em index.html → "Open with Live Server"
```

Abra `http://localhost:8080` no navegador.

> **Importante:** abrir `index.html` diretamente pelo sistema de arquivos (`file://`) impede o registro do Service Worker. Use sempre um servidor HTTP.

---

## Deploy

O projeto é um conjunto de arquivos estáticos — pode ser hospedado em qualquer serviço:

- **GitHub Pages** — configurar `gh-pages` branch ou pasta `/docs`
- **Vercel / Netlify** — arrastar a pasta ou conectar o repositório
- **Qualquer CDN ou hospedagem compartilhada**

---

## Desenvolvido por

**Paula Leal** — [LinkedIn](https://www.linkedin.com/in/paulaolileal/) · [GitHub](https://github.com/paulaolileal/stop-game)
