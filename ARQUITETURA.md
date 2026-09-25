# Arquitetura — como o app funciona por dentro

## Visão geral

```
┌──────────────── APARELHO (tablet / celular / PC) ────────────────┐
│  Interface (Preact)                                              │
│     │ grava                                                      │
│     ▼                                                            │
│  IndexedDB  ← FONTE DA VERDADE (funciona sem internet)           │
│     │ cada gravação entra na FILA                                │
│     ▼                                                            │
│  Motor de sincronização (sync/motor.ts)                          │
└─────┬────────────────────────────────────────────────────────────┘
      │ HTTPS + token (quando há internet)
      ▼
┌──────────── GOOGLE APPS SCRIPT (backend/) ────────────┐
│  doPost → grava na planilha → devolve o que mudou      │
│  Planilha: uma aba por entidade + LOG_SYNC             │
└────────────────────────────────────────────────────────┘
```

- **Offline primeiro**: a interface nunca espera a rede.
- **Sincronização**: ao abrir, ~2,5 s após cada gravação, ao voltar a internet, ao voltar ao app e a
  cada 5 min. Envia a fila em lotes de 50 e **recebe** o que outros aparelhos enviaram (cursor).
- **Conflitos**: vence o `atualizado_em` mais recente; alteração local ainda não enviada tem prioridade.
- **Exclusão lógica**: nada é apagado; registros ganham `status` "excluido".
- **Falhas do Google**: até 4 tentativas com espera crescente; depois, nova tentativa automática.

## Pastas

```
app/src/
  app.config.ts        ← nome, cor e DISPOSITIVOS do app
  dominio/             ← REGRAS DE NEGÓCIO puras + testes (*.test.ts)
    tipos.ts           ← entidades, ENTIDADES, Config
  dados/
    db.ts              ← lojas do IndexedDB (versões)
    repositorio.ts     ← gravar/ler/fila/config/dados iniciais
    ganchos.ts         ← useEntidade, useConfig, useAgora (tela atualiza sozinha)
  sync/                ← motor de sincronização + testes com o núcleo do backend
  ui/
    rotas.ts           ← TELAS e MENU
    estado.tsx         ← painel, avisos, diálogos
    App.tsx            ← telas, painéis e botão "+"
    acoes/             ← ações da interface (gravam e devolvem "Desfazer")
    telas/ paineis/ componentes/ layout/
  estilos/             ← CSS por assunto
backend/               ← Apps Script (nucleo.js é testado junto com o app)
.github/workflows/     ← publicação automática
```

## Adicionar uma entidade (ex.: "clientes")

1. **Tipo** — `dominio/tipos.ts`: interface `Cliente extends Registro` e `'clientes'` em `ENTIDADES`.
2. **Regras** — `dominio/clientes.ts` (`novoCliente`, `validarCliente`…) + `clientes.test.ts`.
3. **Banco local** — `dados/db.ts`: loja em `AppDB`, novo bloco `if (versaoAntiga < N)` e `VERSAO = N`.
4. **Repositório** — `dados/repositorio.ts`: `clientes: Cliente` em `MapaEntidades`.
5. **Backend** — `backend/nucleo.js`: entrada em `ESQUEMA` (mesmos campos, **na mesma ordem de sempre;
   campos novos no fim**). Depois `clasp push`, `clasp update-deployment` e rodar `configurar()` (cria a aba).
6. **Interface** — ações em `ui/acoes/`, formulário em `ui/paineis/`, tela em `ui/telas/`, e registrar em
   `rotas.ts` (TELAS/MENU), `estado.tsx` (tipo de painel) e `App.tsx`.
7. **Testar** — `npm test` e ver no navegador nos tamanhos do DESIGN.md.

## Comandos

```bash
cd app
npm run dev       # desenvolvimento (http://localhost:5173/)
npm test          # testes
npm run build     # versão de produção
npm run icones    # regenera os ícones a partir de public/favicon.svg
```

## Cuidados aprendidos (não repetir)

- `ScriptApp.getService().getUrl()` no editor devolve o endereço **/dev** (exige login) — use `URL_PUBLICA`.
- Ao adicionar escopos no Apps Script: `clasp push` → usuário executa `configurar()` e autoriza →
  **só então** `clasp update-deployment` (senão a sincronização para).
- Grade CSS de tela cheia: use `minmax(0, 1fr)` nas linhas/colunas, senão o conteúdo estica a tela e
  some a rolagem.
- `<input type="time">` corta botões no Android em paisagem — use `CampoHora`.
