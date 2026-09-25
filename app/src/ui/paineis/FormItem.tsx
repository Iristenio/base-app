// Formulário de exemplo (painel lateral): mostra os componentes da base em uso.
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Item } from '../../dominio/tipos';
import { novoItem, validarItem } from '../../dominio/itens';
import { buscar, novoId } from '../../dados/repositorio';
import { alternarConcluido, excluirItem, salvarItem } from '../acoes/itens';
import { useEstado } from '../estado';
import { CampoHora } from '../componentes/CampoHora';

export function FormItem({ id }: { id?: string }) {
  const { fecharPainel, avisar, perguntar } = useEstado();
  const [item, setItem] = useState<Item | null>(null);
  const [erros, setErros] = useState<string[]>([]);
  const titulo = useRef<HTMLInputElement>(null);
  const novo = !id;

  useEffect(() => {
    (async () => {
      const existente = id ? await buscar('itens', id) : undefined;
      setItem(existente ?? novoItem({ id: novoId() }));
      setErros([]);
      if (!existente) setTimeout(() => titulo.current?.focus(), 50);
    })();
  }, [id]);

  if (!item) return null;
  const mudar = (parcial: Partial<Item>) => setItem({ ...item, ...parcial });

  async function salvar(e: Event) {
    e.preventDefault();
    const final = { ...item!, titulo: item!.titulo.trim() };
    const problemas = validarItem(final);
    setErros(problemas);
    if (problemas.length) return;
    const desfazer = await salvarItem(final);
    fecharPainel();
    avisar({ texto: novo ? 'Item criado' : 'Item salvo', desfazer });
  }

  async function excluir() {
    const r = await perguntar('Excluir este item?', [{ valor: 'sim', rotulo: 'Excluir', estilo: 'perigo' }]);
    if (!r) return;
    const desfazer = await excluirItem(item!);
    fecharPainel();
    avisar({ texto: 'Item excluído', desfazer });
  }

  async function concluir() {
    const desfazer = await alternarConcluido(item!);
    fecharPainel();
    avisar({ texto: item!.status === 'concluido' ? 'Item reaberto' : 'Item concluído', desfazer });
  }

  return (
    <form class="formulario" onSubmit={salvar}>
      <input
        ref={titulo}
        class="campo campo-titulo"
        placeholder="Título"
        value={item.titulo}
        onInput={(e) => mudar({ titulo: e.currentTarget.value })}
        enterKeyHint="done"
      />
      <textarea class="campo" rows={3} placeholder="Detalhes (opcional)" value={item.descricao} onInput={(e) => mudar({ descricao: e.currentTarget.value })} />

      <fieldset>
        <legend>Quando (opcional)</legend>
        <div class="linha">
          <input type="date" class="campo" value={item.data ?? ''} onInput={(e) => mudar({ data: e.currentTarget.value || null, hora: e.currentTarget.value ? item.hora : null })} />
          {item.data && <CampoHora valor={item.hora} aoMudar={(h) => mudar({ hora: h })} rotulo="Hora" opcional placeholder="Sem hora" />}
        </div>
      </fieldset>

      {erros.length > 0 && (
        <ul class="erros" role="alert">
          {erros.map((x) => <li key={x}>{x}</li>)}
        </ul>
      )}

      <div class="acoes-form">
        <button type="submit" class="botao primario">{novo ? 'Criar' : 'Salvar'}</button>
        {!novo && (
          <button type="button" class="botao" onClick={concluir}>
            {item.status === 'concluido' ? 'Reabrir' : 'Concluir'}
          </button>
        )}
        {!novo && (
          <button type="button" class="botao perigo" onClick={excluir}>Excluir</button>
        )}
      </div>
    </form>
  );
}
