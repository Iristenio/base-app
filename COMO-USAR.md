# Como usar a base de apps

Esta pasta (`D:\03-PESSOAL\_BASE-APP`) é o **ponto de partida** de todos os seus apps.
Ela já traz pronto:

- **Visual**: tema claro/escuro, menu, painel lateral de formulários, botão "+", avisos com "Desfazer",
  diálogos, seletor de horário próprio, layout que se adapta a tablet, celular e PC.
- **Funciona sem internet**: o app é instalável e grava tudo no aparelho primeiro.
- **Backup e vários aparelhos**: sincronização com uma planilha do Google (Apps Script).
- **Publicação automática** no GitHub Pages a cada envio de código.
- **Uma entidade de exemplo** ("Itens") mostrando onde cada coisa se encaixa.

---

## 1. Criar um projeto novo

### Jeito 1 — pelo script (recomendado)
No PowerShell (ou no terminal do Claude Code), rode:

```powershell
powershell -ExecutionPolicy Bypass -File D:\03-PESSOAL\_BASE-APP\criar-projeto.ps1
```

O script pergunta:

| Pergunta | Exemplo |
|---|---|
| Nome do app | `Controle de Estoque` |
| Nome da pasta | `CONTROLE-DE-ESTOQUE` (sugerido) |
| Nome curto (embaixo do ícone) | `Estoque` |
| **Dispositivos** | `2` = só celular · `2,3` = celular e PC · `1,2,3` = todos |
| Cor principal | `#2f6fed` (azul) |
| **Criar dentro de qual pasta** | `D:\03-PESSOAL` (sugerido) |

E cria a pasta do projeto já configurada, com dependências instaladas e Git iniciado.

Também aceita as respostas direto (sem perguntas):

```powershell
powershell -ExecutionPolicy Bypass -File D:\03-PESSOAL\_BASE-APP\criar-projeto.ps1 -Nome "Controle de Estoque" -NomeCurto "Estoque" -Pasta "CONTROLE-ESTOQUE" -Destino "D:\03-PESSOAL" -Dispositivos "celular,pc" -Cor "#2f6fed"
```

### Jeito 2 — pedindo ao Claude (skill `/novo-app`)
Em qualquer pasta, no Claude Code, digite **`/novo-app`** — ou apenas diga *"quero criar um app para…"*.
O Claude pergunta dispositivos, nome, cor, pasta e se precisa da planilha do Google, cria o projeto
e conduz o resto (especificação → plano → etapas → publicação).

---

## 2. O que os dispositivos mudam

| Escolha | Efeito |
|---|---|
| Só **celular** | Menu no rodapé e formulários em tela cheia em qualquer tela; app abre em retrato |
| Inclui **tablet** | Menu lateral e formulário à direita em paisagem; botões grandes (48 px) |
| Inclui **PC** | Efeitos ao passar o mouse; tecla Esc fecha painéis |
| Só **PC** | Botões um pouco menores (40 px) |

Dá para mudar depois em `app/src/app.config.ts` (campo `dispositivos`).

---

## 3. Desenvolver o app

Abra a pasta do projeto no Claude Code e descreva o que você quer. O Claude segue automaticamente
o `CLAUDE.md`, o `DESIGN.md` e o `ARQUITETURA.md` do projeto — mesmo visual, mesmas regras.

Para ver no PC enquanto desenvolve:

```powershell
cd app
npm run dev
```

---

## 4. Publicar (GitHub Pages)

1. Crie um repositório **público** vazio em https://github.com/new (sem README).
2. Em **Settings → Pages → Source**, escolha **GitHub Actions**.
3. Conecte e envie (o Claude pode fazer isso por você):
   ```powershell
   git remote add origin https://github.com/Iristenio/<repositorio>.git
   git push -u origin main
   ```
4. Em ~1 minuto o app estará em `https://iristenio.github.io/<repositorio>/`.
   No aparelho: abra o endereço → menu ⋮ → **Instalar app**.

---

## 5. Ligar à planilha do Google (opcional)

Veja `backend/README.md`. Resumo: `clasp create` → `clasp push` → `clasp create-deployment` →
preencher `URL_PUBLICA` em `backend/configurar.js` → executar `configurar()` no editor → colar o
código `APP1:…` em **Ajustes** no app.

---

## 6. Melhorar a base

Se uma melhoria de um projeto servir para todos (um componente novo, uma correção), peça ao Claude
para trazê-la para a `_BASE-APP` e enviar ao GitHub. Os **próximos** projetos já nascem com ela.
(Projetos já criados não mudam sozinhos — é uma cópia.)
