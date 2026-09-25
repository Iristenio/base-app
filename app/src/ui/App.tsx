import type { JSX } from 'preact';
import { useTela, type Tela } from './rotas';
import { MenuLateral } from './layout/MenuLateral';
import { PainelLateral } from './layout/PainelLateral';
import { BotaoNovo, type OpcaoNovo } from './layout/BotaoNovo';
import { AvisoAtualizacao } from './layout/AvisoAtualizacao';
import { AvisoDesfazer } from './componentes/AvisoDesfazer';
import { Dialogo } from './componentes/Dialogo';
import { ProvedorEstado, useEstado, type Painel } from './estado';
import { TelaInicio } from './telas/TelaInicio';
import { TelaItens } from './telas/TelaItens';
import { TelaAjustes } from './telas/TelaAjustes';
import { FormItem } from './paineis/FormItem';
import { IconeLista } from './icones';

/** ► Nova tela: acrescente aqui (e em TELAS/MENU, em rotas.ts). */
const TELA: Record<Tela, () => JSX.Element> = {
  inicio: TelaInicio,
  itens: TelaItens,
  config: TelaAjustes,
};

/** ► Novo painel: título e conteúdo de cada tipo declarado em estado.tsx. */
function tituloPainel(p: Painel): string {
  switch (p.tipo) {
    case 'item':
      return p.id ? 'Item' : 'Novo item';
  }
}

function ConteudoPainel({ painel }: { painel: Painel }) {
  switch (painel.tipo) {
    case 'item':
      return <FormItem id={painel.id} />;
  }
}

function Estrutura() {
  const tela = useTela();
  const { painel, abrirPainel, fecharPainel } = useEstado();
  const Conteudo = TELA[tela];

  /** ► Opções do botão "+" (com uma só, ele cria direto). */
  const opcoesNovo: OpcaoNovo[] = [{ rotulo: 'Item', Icone: IconeLista, acao: () => abrirPainel({ tipo: 'item' }) }];

  return (
    <div class="estrutura">
      <MenuLateral atual={tela} />
      <main class="principal">
        <Conteudo />
        {tela !== 'config' && <BotaoNovo opcoes={opcoesNovo} />}
      </main>
      {painel && (
        <PainelLateral titulo={tituloPainel(painel)} aoFechar={fecharPainel}>
          <ConteudoPainel painel={painel} />
        </PainelLateral>
      )}
      <AvisoDesfazer />
      <AvisoAtualizacao />
      <Dialogo />
    </div>
  );
}

export function App() {
  return (
    <ProvedorEstado>
      <Estrutura />
    </ProvedorEstado>
  );
}
