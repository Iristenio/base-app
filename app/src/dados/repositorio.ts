// Leitura e gravação local + registro na fila de sincronização.
// Regras: nada é apagado de verdade (exclusão lógica via status); toda gravação carimba
// atualizado_em e entra na fila, que o motor de sincronização envia quando houver internet.
import { abrirBanco } from './db';
import type { Config, Entidade, Item, ItemFila, Registro } from '../dominio/tipos';
import { CONFIG_PADRAO, ENTIDADES } from '../dominio/tipos';

/** ► Nova entidade: acrescente aqui o tipo correspondente. */
export type MapaEntidades = {
  itens: Item;
};

export const novoId = (): string => crypto.randomUUID();

/* ---------------- Avisos de mudança (para a interface se atualizar) ---------------- */

const ouvintes = new Set<() => void>();

export function aoMudarDados(fn: () => void): () => void {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

function avisarMudanca() {
  ouvintes.forEach((fn) => fn());
}

/** Avisos só de gravações feitas NESTE aparelho (disparam o envio ao servidor). */
const ouvintesGravacao = new Set<() => void>();

export function aoGravarLocal(fn: () => void): () => void {
  ouvintesGravacao.add(fn);
  return () => ouvintesGravacao.delete(fn);
}

/* ---------------- Leitura ---------------- */

export async function listarTodos<E extends Entidade>(entidade: E): Promise<MapaEntidades[E][]> {
  const db = await abrirBanco();
  return (await db.getAll(entidade)) as MapaEntidades[E][];
}

export async function buscar<E extends Entidade>(entidade: E, id: string): Promise<MapaEntidades[E] | undefined> {
  const db = await abrirBanco();
  return (await db.get(entidade, id)) as MapaEntidades[E] | undefined;
}

/* ---------------- Gravação ---------------- */

export type Alteracao = {
  [E in Entidade]: {
    entidade: E;
    registro: MapaEntidades[E];
    /** Exclusão lógica: o registro continua salvo, com status "excluido"/"excluida". */
    operacao?: 'excluir';
  };
}[Entidade];

/**
 * Grava um ou mais registros numa única transação e coloca cada um na fila de sincronização.
 * Alterações seguidas no mesmo registro são compactadas: a fila guarda só a versão mais recente.
 * Retorna as versões anteriores (para "Desfazer").
 */
export async function gravar(alteracoes: Alteracao[], agora = new Date()): Promise<(Registro | undefined)[]> {
  const db = await abrirBanco();
  const nomes = [...new Set<Entidade | 'fila_sync'>([...alteracoes.map((a) => a.entidade), 'fila_sync'])];
  const tx = db.transaction(nomes, 'readwrite');
  const fila = tx.objectStore('fila_sync');
  const carimbo = agora.toISOString();
  const anteriores: (Registro | undefined)[] = [];

  for (const { entidade, registro, operacao } of alteracoes) {
    const loja = tx.objectStore(entidade);
    const anterior = (await loja.get(registro.id)) as Registro | undefined;
    anteriores.push(anterior);

    const salvo = {
      ...registro,
      criado_em: anterior?.criado_em ?? registro.criado_em ?? carimbo,
      atualizado_em: carimbo,
    };
    await loja.put(salvo as never);

    const existente = (await fila.index('registro_id').getAll(registro.id)).find((i) => i.entidade === entidade);
    const op: ItemFila['operacao'] = operacao ?? (anterior ? 'alterar' : 'criar');
    await fila.put({
      id: existente?.id ?? novoId(),
      entidade,
      registro_id: registro.id,
      // Se ainda não foi enviado ao servidor, continua sendo uma criação
      operacao: existente?.operacao === 'criar' ? 'criar' : op,
      payload: salvo,
      tentativas: 0,
      ultimo_erro: null,
      criado_em: existente?.criado_em ?? carimbo,
    });
  }

  await tx.done;
  avisarMudanca();
  ouvintesGravacao.forEach((fn) => fn());
  return anteriores;
}

export async function salvar<E extends Entidade>(entidade: E, registro: MapaEntidades[E]) {
  const [anterior] = await gravar([{ entidade, registro } as Alteracao]);
  return anterior as MapaEntidades[E] | undefined;
}

export async function contarPendentes(): Promise<number> {
  const db = await abrirBanco();
  return db.count('fila_sync');
}

/* ---------------- Configurações ---------------- */

export async function lerConfig(): Promise<Config> {
  const db = await abrirBanco();
  const itens = await db.getAll('config');
  // Chaves começando com "_" são internas (conexão, cursor de sincronização)
  const salvo = Object.fromEntries(itens.filter((i) => !i.chave.startsWith('_')).map((i) => [i.chave, i.valor]));
  return { ...CONFIG_PADRAO, ...salvo } as Config;
}

/** Valores internos guardados na loja "config" (não aparecem em lerConfig). */
export async function lerInterno<T>(chave: `_${string}`): Promise<T | undefined> {
  const db = await abrirBanco();
  return (await db.get('config', chave))?.valor as T | undefined;
}

export async function salvarInterno(chave: `_${string}`, valor: unknown) {
  const db = await abrirBanco();
  if (valor === undefined) await db.delete('config', chave);
  else await db.put('config', { chave, valor });
}

/* ---------------- Fila de sincronização ---------------- */

export async function listarFila(): Promise<ItemFila[]> {
  const db = await abrirBanco();
  return (await db.getAll('fila_sync')).sort((a, b) => a.criado_em.localeCompare(b.criado_em));
}

/**
 * Tira da fila os itens enviados com sucesso — mas só se não mudaram enquanto eram enviados
 * (se o registro foi editado nesse meio-tempo, a versão nova continua na fila).
 */
export async function confirmarEnvio(enviados: ItemFila[]) {
  const db = await abrirBanco();
  const tx = db.transaction('fila_sync', 'readwrite');
  for (const item of enviados) {
    const atual = await tx.store.get(item.id);
    if (atual && atual.payload.atualizado_em === item.payload.atualizado_em) await tx.store.delete(item.id);
  }
  await tx.done;
  avisarMudanca();
}

export async function registrarFalhas(falhas: { item: ItemFila; erro: string }[]) {
  const db = await abrirBanco();
  const tx = db.transaction('fila_sync', 'readwrite');
  for (const { item, erro } of falhas) {
    const atual = await tx.store.get(item.id);
    if (atual) await tx.store.put({ ...atual, tentativas: atual.tentativas + 1, ultimo_erro: erro });
  }
  await tx.done;
  avisarMudanca();
}

/**
 * Aplica registros vindos do servidor (outros aparelhos), SEM colocá-los na fila.
 * Regras: alteração local ainda não enviada tem prioridade; senão vence o atualizado_em mais novo.
 * Retorna quantos registros mudaram.
 */
export async function aplicarRemotos(dados: Partial<Record<Entidade, Registro[]>>): Promise<number> {
  const db = await abrirBanco();
  const entidades = ENTIDADES.filter((e) => (dados[e] ?? []).length);
  if (!entidades.length) return 0;
  const lojas: (Entidade | 'fila_sync')[] = [...entidades, 'fila_sync'];
  const tx = db.transaction(lojas, 'readwrite');
  const pendentes = new Set((await tx.objectStore('fila_sync').getAll()).map((i) => `${i.entidade}:${i.registro_id}`));
  let mudancas = 0;

  for (const entidade of entidades) {
    const loja = tx.objectStore(entidade);
    for (const remoto of dados[entidade]!) {
      if (pendentes.has(`${entidade}:${remoto.id}`)) continue;
      const local = (await loja.get(remoto.id)) as Registro | undefined;
      if (local && local.atualizado_em >= remoto.atualizado_em) continue;
      await loja.put(remoto as never);
      mudancas++;
    }
  }
  await tx.done;
  if (mudancas) avisarMudanca();
  return mudancas;
}

export async function salvarConfig(parcial: Partial<Config>) {
  const db = await abrirBanco();
  const tx = db.transaction('config', 'readwrite');
  for (const [chave, valor] of Object.entries(parcial)) await tx.store.put({ chave, valor });
  await tx.done;
  avisarMudanca();
}

/* ---------------- Dados iniciais ---------------- */

/**
 * Executado ao abrir o app. Use para criar registros padrão (com ids FIXOS, para não duplicar
 * ao restaurar da planilha) ou migrar dados antigos uma única vez (guardando uma marca com salvarInterno).
 */
export async function garantirDadosIniciais(_agora = new Date()) {
  // Exemplo:
  // if (!(await buscar('itens', 'boas-vindas'))) await salvar('itens', { id: 'boas-vindas', ... });
}

/** RS09 — pede ao navegador para não apagar os dados locais. */
export async function pedirArmazenamentoPersistente(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    return (await navigator.storage.persisted()) || (await navigator.storage.persist());
  } catch {
    return false;
  }
}
