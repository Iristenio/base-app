# Backend (Google Apps Script) — sincronização com a planilha

Opcional: sem ele, o app funciona só no aparelho.

- `nucleo.js` — regras do servidor (sem APIs do Google); também usado nos testes do app.
- `api.js` — `doPost` (sincronização por token) e acesso às abas.
- `configurar.js` — `configurar()`: cria a planilha, as abas e mostra o **código de conexão**.

## Primeira configuração (uma vez por projeto)

1. **Ativar a API do Apps Script** na conta Google: https://script.google.com/home/usersettings
2. **Entrar no clasp** (abre o navegador para autorizar; só na primeira vez no computador):
   ```bash
   npx @google/clasp login
   ```
3. **Criar o projeto e enviar o código** (dentro de `backend/`):
   ```bash
   npx @google/clasp create --type standalone --title "Nome do App API" --rootDir .
   # (o clasp pode sobrescrever appsscript.json — restaure a versão do repositório)
   npx @google/clasp push --force
   npx @google/clasp create-deployment --description "v1"
   ```
4. Copie o id da implantação (`AKfy…`) e preencha em `configurar.js`:
   `var URL_PUBLICA = 'https://script.google.com/macros/s/<ID>/exec';` → `clasp push --force` de novo.
5. No editor do Apps Script: escolha **configurar** → **Executar** → autorize
   (Avançado → Acessar… → Permitir).
6. Copie a linha `APP1:…` do registro de execução e cole no app em **Ajustes → Sincronização**.

## Atualizar o código depois

```bash
npx @google/clasp push --force
npx @google/clasp update-deployment <ID_DA_IMPLANTACAO> --description "..."
```

`update-deployment` mantém o mesmo endereço (os aparelhos não precisam reconectar).
Se acrescentar escopos em `appsscript.json`: push → executar `configurar()` e autorizar → só então update-deployment.

Se desconfiar que o código vazou, execute `trocarToken()` e reconecte os aparelhos.
