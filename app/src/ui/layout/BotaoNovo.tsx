// Botão "+" flutuante. Com uma opção, cria direto; com várias, abre um menu.
import type { ComponentType, JSX } from 'preact';
import { useState } from 'preact/hooks';
import { IconeMais } from '../icones';

export interface OpcaoNovo {
  rotulo: string;
  Icone: ComponentType<JSX.SVGAttributes<SVGSVGElement>>;
  acao: () => void;
}

export function BotaoNovo({ opcoes }: { opcoes: OpcaoNovo[] }) {
  const [aberto, setAberto] = useState(false);
  if (!opcoes.length) return null;
  const unica = opcoes.length === 1;

  return (
    <>
      {aberto && <div class="novo-veu" onClick={() => setAberto(false)} />}
      <div class="novo">
        {aberto &&
          [...opcoes].reverse().map(({ rotulo, Icone, acao }, i) => (
            <button
              key={rotulo}
              class="novo-opcao"
              style={{ animationDelay: `${(opcoes.length - 1 - i) * 30}ms` }}
              onClick={() => {
                setAberto(false);
                acao();
              }}
            >
              <Icone />
              {rotulo}
            </button>
          ))}
        <button
          class="novo-principal"
          aria-label={unica ? opcoes[0].rotulo : 'Criar novo'}
          aria-expanded={aberto}
          onClick={() => (unica ? opcoes[0].acao() : setAberto(!aberto))}
        >
          <IconeMais />
        </button>
      </div>
    </>
  );
}
