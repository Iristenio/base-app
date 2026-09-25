# Design — padrão visual dos apps

Objetivo: apps **agradáveis ao toque**, legíveis, com o mesmo "jeito" em todos os projetos.

## Tokens (em `app/src/estilos/global.css`, `:root`)

| Token | Uso |
|---|---|
| `--fundo`, `--superficie`, `--superficie-2`, `--borda` | Camadas de fundo (tela → cartão → campo) |
| `--texto`, `--texto-2` | Texto principal e secundário |
| `--primaria` (+ `-texto`, `-suave`) | Ações principais e seleção — vem de `APP.corPrimaria` |
| `--perigo`, `--aviso`, `--sucesso` | Excluir/erros, alertas, concluído |
| `--raio` (14 px) | Cantos arredondados |
| `--toque` (48 px; 40 px só-PC) | Altura mínima de qualquer alvo de toque |

Tema escuro automático (segue o sistema). **Nunca** use cores fixas em componentes — use os tokens.

## Estrutura da tela

```
┌────┬──────────────────────────────┬──────────────┐
│menu│ cabeçalho (h1 + subtítulo)    │ painel       │
│    │ conteúdo (rola)               │ lateral      │
│    │                         [ + ] │ (formulários)│
└────┴──────────────────────────────┴──────────────┘
```

- **Menu**: lateral em telas ≥ 900 px; rodapé no celular (ou sempre, no perfil "só celular").
  Embaixo, o indicador de sincronização (toque → Ajustes).
- **Painel lateral**: TODO formulário abre nele (`abrirPainel`), nunca em página separada — a tela de
  fundo continua visível. No celular vira tela cheia. Botões do formulário ficam **fixos no rodapé**
  do painel (`.acoes-form`).
- **Botão "+"**: canto inferior direito; com várias opções abre um menu.

## Componentes prontos

| Componente | Onde | Quando usar |
|---|---|---|
| `.cartao` + `.colunas` | global.css | Blocos na tela inicial (3 colunas → 1 no celular) |
| `.formulario`, `.campo`, `fieldset/legend` | formularios.css | Todo formulário |
| `.segmentado` (role="radio") | formularios.css | Escolha entre 2–5 opções curtas |
| `.chips` / `.chip` (aria-pressed) | formularios.css | Escolha entre várias opções com rótulo |
| `.interruptor` | formularios.css | Sim/não |
| `CampoHora` | componentes/CampoHora.tsx | **Qualquer horário** (não use `<input type="time">`) |
| `.alerta` | formularios.css | Aviso amarelo dentro do formulário |
| `.erros` | formularios.css | Erros de validação |
| `avisar({ texto, desfazer })` | estado.tsx | Confirmação rápida com **Desfazer** (toda ação destrutiva) |
| `perguntar(titulo, opcoes)` | estado.tsx | Escolha obrigatória (ex.: "Excluir?") |
| `.vazio` | global.css | Estado vazio de listas/telas |
| `.adicionar-rapido`, `.lista-itens`, `.linha-item`, `.check` | itens.css | Listas com criação rápida e "concluir com um toque" |

## Regras de interação

1. **Tudo com um toque**, alvos ≥ `--toque`.
2. **Nada é apagado sem volta**: exclusão lógica + "Desfazer" (ou confirmação).
3. **Nunca esperar a internet**: gravar localmente e mostrar o resultado na hora.
4. **Seletores do sistema**: `type="time"` é proibido (o Android corta os botões no tablet em paisagem);
   `type="date"` funciona bem.
5. **Textos em português do Brasil**, datas no formato brasileiro (`Intl.DateTimeFormat('pt-BR')`).
6. **Testar** em 1333×800 (tablet paisagem), 800×1333 (retrato) e 375×812 (celular), conferindo que
   painéis e listas longas **rolam** e que nada passa da largura da tela.
