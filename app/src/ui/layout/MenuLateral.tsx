import { useEffect, useState } from 'preact/hooks';
import { irPara, MENU, type Tela } from '../rotas';
import { ROTULO_STATUS, useSync } from '../../sync/ganchos';

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const atualizar = () => setOnline(navigator.onLine);
    window.addEventListener('online', atualizar);
    window.addEventListener('offline', atualizar);
    return () => {
      window.removeEventListener('online', atualizar);
      window.removeEventListener('offline', atualizar);
    };
  }, []);
  return online;
}

/** Menu: lateral em telas largas, rodapé no celular. Embaixo, o estado da sincronização. */
export function MenuLateral({ atual }: { atual: Tela }) {
  const online = useOnline();
  const sync = useSync();
  const status = !online && sync.status !== 'desconectado' ? 'offline' : sync.status;
  return (
    <nav class="menu" aria-label="Navegação principal">
      {MENU.map(({ tela, rotulo, Icone }) => (
        <button key={tela} class="menu-item" aria-current={tela === atual ? 'page' : undefined} onClick={() => irPara(tela)}>
          <Icone />
          {rotulo}
        </button>
      ))}
      <div class="menu-espaco" />
      <button class="status-sync" onClick={() => irPara('config')} title={sync.erro ?? ROTULO_STATUS[status]}>
        <span class={`status-ponto ${status}`} />
        {ROTULO_STATUS[status]}
        {status === 'pendente' && <small>{sync.pendentes}</small>}
      </button>
    </nav>
  );
}
