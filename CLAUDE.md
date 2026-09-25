# Instruções para o Claude

Este projeto foi criado a partir da base de apps do Iristenio (`D:\03-PESSOAL\_BASE-APP`).
Comunique-se sempre em **português do Brasil**, em linguagem simples (o usuário não é programador).

## Antes de começar um projeto novo

Se `app/src/app.config.ts` ainda estiver com os valores da base (`nome: 'Meu App'`), **pergunte ao usuário**
(use perguntas de múltipla escolha quando possível) antes de programar:

1. **Em quais dispositivos o app será usado?** Tablet, celular, PC — qualquer combinação
   (ex.: só celular; celular e PC). Isso muda o layout (ver DESIGN.md e app.config.ts).
2. Nome do app, nome curto (até 12 letras) e cor principal.
3. Se precisa de **sincronização/backup com a planilha do Google** ou se funciona só no aparelho.
4. Qual **conta Google** usar (pessoal ou institucional), se houver sincronização.

Depois, preencha `app.config.ts` e siga para a especificação do app.

## Como trabalhar

- Siga **DESIGN.md** (visual e interação) e **ARQUITETURA.md** (dados, sincronização, roteiro para
  adicionar entidades). Reaproveite os componentes existentes antes de criar novos.
- Primeiro combine **estrutura e regras de negócio** com o usuário (um `ESPECIFICACAO.md`), depois um
  **plano em etapas** (`PLANO.md`), e só então programe — cada etapa termina com algo usável.
- Regras de negócio em `dominio/` como funções puras **com testes**.
- Teste no navegador nos tamanhos dos dispositivos escolhidos, **medindo a rolagem** de painéis e listas.
- Publique a cada etapa (commit + push → GitHub Pages) e **sempre explique ao usuário como usar** o que
  foi entregue.
- Ao criar algo útil para todos os projetos, sugira levá-lo para a `_BASE-APP`.
