// Configuração inicial — execute a função configurar() no editor do Apps Script
// (na primeira vez e sempre que acrescentar uma entidade nova no ESQUEMA).
// Cria (ou reaproveita) a planilha, prepara as abas e mostra o código de conexão do app.

/**
 * ► PREENCHA com o endereço público da implantação (termina em /exec).
 *   Obtenha com: npx @google/clasp list-deployments  → https://script.google.com/macros/s/<ID>/exec
 *   (ScriptApp.getService().getUrl() no editor devolve o endereço de TESTE /dev, que exige login.)
 */
var URL_PUBLICA = '';
var NOME_PLANILHA = 'App – dados';

function configurar() {
  var props = PropertiesService.getScriptProperties();

  // 1. Planilha
  var planilha;
  var id = props.getProperty(PROP_PLANILHA);
  if (id) {
    planilha = SpreadsheetApp.openById(id);
  } else {
    planilha = SpreadsheetApp.create(NOME_PLANILHA);
    props.setProperty(PROP_PLANILHA, planilha.getId());
  }

  // 2. Abas das entidades + registro
  Object.keys(ESQUEMA).forEach(function (entidade) {
    prepararAba(planilha, ESQUEMA[entidade].aba, cabecalho(entidade));
  });
  prepararAba(planilha, ABA_LOG, ['data_hora', 'entidade', 'registro_id', 'operacao', 'resultado', 'mensagem']);
  var padrao = planilha.getSheetByName('Página1') || planilha.getSheetByName('Sheet1');
  if (padrao && planilha.getSheets().length > 1) planilha.deleteSheet(padrao);

  // 3. Token secreto
  var token = props.getProperty(PROP_TOKEN);
  if (!token) {
    token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 8);
    props.setProperty(PROP_TOKEN, token);
  }

  // 4. Código de conexão
  Logger.log('Planilha: ' + planilha.getUrl());
  if (!URL_PUBLICA) {
    Logger.log('⚠️ Preencha URL_PUBLICA em configurar.js (endereço /exec da implantação) e execute de novo.');
    return;
  }
  var codigo = 'APP1:' + Utilities.base64EncodeWebSafe(JSON.stringify({ u: URL_PUBLICA, t: token }));
  Logger.log('================ CÓDIGO DE CONEXÃO ================');
  Logger.log(codigo);
  Logger.log('Copie a linha acima e cole em Ajustes → Sincronização, no app.');
}

/** Gera um novo token (use se desconfiar que o antigo vazou). Os aparelhos precisarão do novo código. */
function trocarToken() {
  PropertiesService.getScriptProperties().deleteProperty(PROP_TOKEN);
  configurar();
}

function prepararAba(planilha, nome, colunas) {
  var aba = planilha.getSheetByName(nome) || planilha.insertSheet(nome);
  if (aba.getMaxColumns() < colunas.length) aba.insertColumnsAfter(aba.getMaxColumns(), colunas.length - aba.getMaxColumns());
  aba.getRange(1, 1, 1, colunas.length).setValues([colunas]).setFontWeight('bold').setBackground('#e3ecfd');
  aba.setFrozenRows(1);
  // Tudo como texto: impede a planilha de transformar "2026-09-24" em data ou "10:00" em hora
  aba.getRange(1, 1, aba.getMaxRows(), colunas.length).setNumberFormat('@');
}
