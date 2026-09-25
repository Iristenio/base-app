// Tela inicial de exemplo: cartões lado a lado em telas largas, empilhados no celular.
import { APP } from '../../app.config';
import { ordenarItens } from '../../dominio/itens';
import { useEntidade } from '../../dados/ganchos';
import { useEstado } from '../estado';
import { irPara } from '../rotas';
import { IconeConfig, IconeHoje, IconeLista } from '../icones';

const fmtDataLonga = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

export function TelaInicio() {
  const { abrirPainel } = useEstado();
  const ativos = ordenarItens(useEntidade('itens')).filter((i) => i.status === 'ativo');

  return (
    <>
      <header class="cabecalho">
        <h1>{APP.nome}</h1>
        <span class="sub">{fmtDataLonga.format(new Date())}</span>
      </header>
      <div class="conteudo">
        <div class="colunas">
          <section class="cartao">
            <h2>
              <IconeLista /> Próximos itens
            </h2>
            {ativos.length === 0 ? (
              <p class="dica">Nada por aqui ainda.</p>
            ) : (
              <ul class="lista-itens compacta">
                {ativos.slice(0, 5).map((i) => (
                  <li key={i.id}>
                    <button class="linha-item" onClick={() => abrirPainel({ tipo: 'item', id: i.id })}>
                      <span class="linha-item-texto">
                        <strong>{i.titulo}</strong>
                        {i.data && (
                          <small>
                            {i.data.split('-').reverse().join('/')}
                            {i.hora && ` · ${i.hora}`}
                          </small>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button class="link" onClick={() => irPara('itens')}>
              Ver todos →
            </button>
          </section>
          <section class="cartao">
            <h2>
              <IconeHoje /> Bem-vindo
            </h2>
            <p class="dica">
              Esta é a base de apps. Os dados ficam neste aparelho e funcionam sem internet. Em <strong>Ajustes</strong>,
              conecte à planilha do Google para ter backup e usar em vários aparelhos.
            </p>
          </section>
          <section class="cartao">
            <h2>
              <IconeConfig /> Dispositivos
            </h2>
            <p class="dica">Pensado para: {APP.dispositivos.join(', ')}.</p>
          </section>
        </div>
      </div>
    </>
  );
}
