// Testa o ciclo completo app ↔ backend usando o MESMO núcleo do Apps Script (backend/nucleo.js),
// com a planilha simulada em memória.
import 'fake-indexeddb/auto';
import { createRequire } from 'node:module';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { abrirBanco, fecharBanco, NOME_BANCO } from '../dados/db';
import { buscar, listarFila, salvar, salvarInterno } from '../dados/repositorio';
import { novoItem } from '../dominio/itens';
import { baixarTudo, decodificarCodigo, lerEstadoSync, sincronizar } from './motor';

const require = createRequire(import.meta.url);
const nucleo = require('../../../backend/nucleo.js');

const TOKEN = 'segredo';
let tabelas: Record<string, ReturnType<typeof nucleo.tabelaEmMemoria>>;
let relogio = 0;
const agoraServidor = () => new Date(Date.UTC(2026, 0, 1, 12, 0, relogio++)).toISOString();

function instalarServidor() {
  tabelas = Object.fromEntries(Object.keys(nucleo.ESQUEMA).map((e) => [e, nucleo.tabelaEmMemoria()]));
  vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
    const req = JSON.parse(String(init.body));
    const corpo = req.token !== TOKEN ? { ok: false, erro: 'Token inválido', codigo: 401 } : nucleo.processar(tabelas, req, agoraServidor());
    return { ok: true, status: 200, json: async () => corpo } as Response;
  });
}

/** Simula outro aparelho enviando uma alteração direto ao servidor. */
function outroAparelhoEnvia(entidade: string, payload: { id: string }) {
  nucleo.processar(tabelas, { acao: 'sincronizar', operacoes: [{ id: 'x' + payload.id, entidade, registro_id: payload.id, operacao: 'alterar', payload }] }, agoraServidor());
}

beforeEach(async () => {
  await fecharBanco();
  await new Promise<void>((ok) => {
    const req = indexedDB.deleteDatabase(NOME_BANCO);
    req.onsuccess = req.onerror = req.onblocked = () => ok();
  });
  instalarServidor();
  await salvarInterno('_conexao', { url: 'https://exemplo/exec', token: TOKEN });
});

const item = (id: string, titulo: string, atualizado = '2026-01-01T10:00:00.000Z') =>
  ({ ...novoItem({ id, titulo }), atualizado_em: atualizado, criado_em: atualizado });

describe('código de conexão', () => {
  it('decodifica o formato APP1', () => {
    const b64 = btoa(JSON.stringify({ u: 'https://script.google.com/macros/s/x/exec', t: 'abc' })).replace(/\+/g, '-').replace(/\//g, '_');
    expect(decodificarCodigo(`  APP1:${b64} `)).toEqual({ url: 'https://script.google.com/macros/s/x/exec', token: 'abc' });
    expect(decodificarCodigo('qualquer coisa')).toBeNull();
  });
});

describe('núcleo do backend', () => {
  it('linha ↔ registro preserva tipos', () => {
    const reg = { ...item('a', 'x'), data: null, hora: '10:00' };
    expect(nucleo.linhaParaRegistro('itens', nucleo.registroParaLinha('itens', reg, 'T'))).toEqual(reg);
  });
  it('versão antiga não sobrescreve a mais nova', () => {
    outroAparelhoEnvia('itens', item('a', 'nova', '2026-01-01T12:00:00.000Z'));
    outroAparelhoEnvia('itens', item('a', 'velha', '2026-01-01T09:00:00.000Z'));
    expect(tabelas.itens.linhas()[0][1]).toBe('nova');
  });
});

describe('sincronização', () => {
  it('envia a fila local e a esvazia', async () => {
    await salvar('itens', item('i1', 'Primeiro'));
    await sincronizar();
    expect(await listarFila()).toHaveLength(0);
    expect(tabelas.itens.linhas().map((l: string[]) => l[1])).toEqual(['Primeiro']);
    expect(lerEstadoSync().status).toBe('sincronizado');
  });

  it('recebe o que outro aparelho enviou, sem devolver à fila', async () => {
    outroAparelhoEnvia('itens', item('i9', 'Do celular'));
    await sincronizar();
    expect((await buscar('itens', 'i9'))?.titulo).toBe('Do celular');
    expect(await listarFila()).toHaveLength(0);
  });

  it('token inválido vira erro e mantém a fila', async () => {
    await salvarInterno('_conexao', { url: 'https://exemplo/exec', token: 'errado' });
    await salvar('itens', item('i1', 'x'));
    await sincronizar();
    expect(lerEstadoSync().status).toBe('erro');
    expect(await listarFila()).toHaveLength(1);
  });

  it('envia em lotes', async () => {
    for (let n = 0; n < 120; n++) await salvar('itens', item(`i${n}`, `item ${n}`));
    await sincronizar();
    expect(await listarFila()).toHaveLength(0);
    expect(tabelas.itens.linhas()).toHaveLength(120);
  });

  it('"baixar tudo" restaura um aparelho vazio', async () => {
    outroAparelhoEnvia('itens', item('i1', 'a'));
    await sincronizar();
    await (await abrirBanco()).clear('itens');
    await baixarTudo();
    expect((await buscar('itens', 'i1'))?.titulo).toBe('a');
  });
});
