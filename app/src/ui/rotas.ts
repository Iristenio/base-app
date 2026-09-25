// Navegação por "#/tela" — funciona offline e no GitHub Pages sem configuração extra.
//
// ► Nova tela: acrescente em TELAS e em MENU (e o componente em App.tsx).
import type { ComponentType, JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { IconeConfig, IconeHoje, IconeLista } from './icones';

export const TELAS = ['inicio', 'itens', 'config'] as const;
export type Tela = (typeof TELAS)[number];

/** Itens do menu (lateral em telas largas, rodapé no celular). "config" fica sempre por último. */
export const MENU: { tela: Tela; rotulo: string; Icone: ComponentType<JSX.SVGAttributes<SVGSVGElement>> }[] = [
  { tela: 'inicio', rotulo: 'Início', Icone: IconeHoje },
  { tela: 'itens', rotulo: 'Itens', Icone: IconeLista },
  { tela: 'config', rotulo: 'Ajustes', Icone: IconeConfig },
];

function lerTela(): Tela {
  const nome = location.hash.replace(/^#\/?/, '') as Tela;
  return TELAS.includes(nome) ? nome : TELAS[0];
}

export function irPara(tela: Tela) {
  location.hash = `/${tela}`;
}

export function useTela(): Tela {
  const [tela, setTela] = useState<Tela>(lerTela);
  useEffect(() => {
    const aoMudar = () => setTela(lerTela());
    window.addEventListener('hashchange', aoMudar);
    return () => window.removeEventListener('hashchange', aoMudar);
  }, []);
  return tela;
}
