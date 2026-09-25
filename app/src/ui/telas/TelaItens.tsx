// Tela de exemplo: lista com adição rápida, conclusão com um toque e edição no painel lateral.
import { useState } from 'preact/hooks';
import { ordenarItens } from '../../dominio/itens';
import { useEntidade } from '../../dados/ganchos';
import { alternarConcluido, criarItemRapido } from '../acoes/itens';
import { useEstado } from '../estado';
import { IconeLista, IconeMais } from '../icones';

const fmtData = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });

export function TelaItens() {
  const { abrirPainel, avisar } = useEstado();
  const itens = ordenarItens(useEntidade('itens'));
  const [titulo, setTitulo] = useState('');

  async function adicionar(e: Event) {
    e.preventDefault();
    if (!titulo.trim()) return;
    const desfazer = await criarItemRapido(titulo);
    setTitulo('');
    avisar({ texto: 'Item criado', desfazer });
  }

  return (
    <>
      <header class="cabecalho">
        <h1>Itens</h1>
      </header>
      <div class="conteudo">
        <form class="adicionar-rapido" onSubmit={adicionar}>
          <IconeMais />
          <input class="campo" placeholder="Adicionar item" value={titulo} onInput={(e) => setTitulo(e.currentTarget.value)} enterKeyHint="done" />
        </form>

        {itens.length === 0 ? (
          <div class="vazio">
            <IconeLista />
            <strong>Nenhum item ainda</strong>
            Digite acima ou toque no + para criar.
          </div>
        ) : (
          <ul class="lista-itens">
            {itens.map((i) => (
              <li key={i.id}>
                <div class={`linha-item${i.status === 'concluido' ? ' concluido' : ''}`} onClick={() => abrirPainel({ tipo: 'item', id: i.id })}>
                  <button
                    class="check"
                    aria-label={i.status === 'concluido' ? 'Reabrir' : 'Concluir'}
                    aria-pressed={i.status === 'concluido'}
                    onClick={async (e) => {
                      e.stopPropagation();
                      const desfazer = await alternarConcluido(i);
                      avisar({ texto: i.status === 'concluido' ? 'Item reaberto' : 'Item concluído', desfazer });
                    }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6.5 12.5l3.5 3.5 7.5-8" />
                    </svg>
                  </button>
                  <span class="linha-item-texto">
                    <strong>{i.titulo}</strong>
                    {(i.data || i.descricao) && (
                      <small>
                        {i.data && fmtData.format(new Date(i.data + 'T12:00')).replace('.', '')}
                        {i.hora && ` · ${i.hora}`}
                        {i.data && i.descricao && ' · '}
                        {i.descricao}
                      </small>
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
