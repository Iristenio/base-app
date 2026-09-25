// Regras de negócio da entidade de exemplo "Item".
// Padrão: funções PURAS (sem tela, sem banco) — fáceis de testar em itens.test.ts.
import type { Id, Item } from './tipos';

export function novoItem(campos: Partial<Item> & { id: Id }, agora = new Date()): Item {
  const carimbo = agora.toISOString();
  return {
    titulo: '',
    descricao: '',
    data: null,
    hora: null,
    status: 'ativo',
    criado_em: carimbo,
    atualizado_em: carimbo,
    ...campos,
  };
}

/** Lista de erros (vazia = válido). */
export function validarItem(i: Pick<Item, 'titulo' | 'data' | 'hora'>): string[] {
  const erros: string[] = [];
  if (!i.titulo.trim()) erros.push('Informe o título.');
  if (i.hora && !i.data) erros.push('Para definir a hora, informe também a data.');
  return erros;
}

/** Ativos primeiro; entre eles, por data/hora (sem data por último); concluídos no fim. */
export function ordenarItens(lista: Item[]): Item[] {
  const chave = (i: Item) => (i.data ? i.data + (i.hora ?? '99:99') : '9999');
  return lista
    .filter((i) => i.status !== 'excluido')
    .sort((a, b) => {
      const ca = a.status === 'concluido' ? 1 : 0;
      const cb = b.status === 'concluido' ? 1 : 0;
      if (ca !== cb) return ca - cb;
      return chave(a).localeCompare(chave(b)) || a.titulo.localeCompare(b.titulo);
    });
}
