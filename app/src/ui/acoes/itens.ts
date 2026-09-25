// Ações da interface sobre itens: gravam localmente e devolvem a função "Desfazer".
import type { Item } from '../../dominio/tipos';
import { novoItem } from '../../dominio/itens';
import { gravar, novoId, salvar } from '../../dados/repositorio';

type Desfazer = () => Promise<void>;

function desfazerCom(anterior: Item | undefined, atual: Item): Desfazer {
  return async () => {
    await salvar('itens', anterior ?? { ...atual, status: 'excluido' });
  };
}

export async function criarItemRapido(titulo: string): Promise<Desfazer> {
  const item = novoItem({ id: novoId(), titulo: titulo.trim() });
  const anterior = await salvar('itens', item);
  return desfazerCom(anterior, item);
}

export async function salvarItem(item: Item): Promise<Desfazer> {
  const anterior = await salvar('itens', item);
  return desfazerCom(anterior, item);
}

export async function alternarConcluido(item: Item): Promise<Desfazer> {
  const atual: Item = { ...item, status: item.status === 'concluido' ? 'ativo' : 'concluido' };
  const anterior = await salvar('itens', atual);
  return desfazerCom(anterior, atual);
}

/** Exclusão lógica (o registro continua salvo com status "excluido"). */
export async function excluirItem(item: Item): Promise<Desfazer> {
  const atual: Item = { ...item, status: 'excluido' };
  const [anterior] = await gravar([{ entidade: 'itens', registro: atual, operacao: 'excluir' }]);
  return desfazerCom(anterior as Item | undefined, atual);
}
