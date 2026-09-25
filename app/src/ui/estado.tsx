// Estado global da interface: painel lateral aberto, aviso "Desfazer" e diálogos de escolha.
import { createContext, type ComponentChildren } from 'preact';
import { useCallback, useContext, useMemo, useRef, useState } from 'preact/hooks';

/** ► Novo formulário/painel: acrescente um tipo aqui e trate em App.tsx (título e conteúdo). */
export type Painel = { tipo: 'item'; id?: string };

export interface Aviso {
  texto: string;
  desfazer?: () => void | Promise<void>;
}

export interface OpcaoDialogo<T extends string> {
  valor: T;
  rotulo: string;
  estilo?: 'primario' | 'perigo';
}

interface Dialogo {
  titulo: string;
  mensagem?: string;
  opcoes: OpcaoDialogo<string>[];
  responder: (valor: string | null) => void;
}

interface EstadoUI {
  painel: Painel | null;
  abrirPainel: (p: Painel) => void;
  fecharPainel: () => void;
  aviso: Aviso | null;
  avisar: (a: Aviso) => void;
  fecharAviso: () => void;
  dialogo: Dialogo | null;
  /** Pergunta com botões; devolve a opção escolhida ou null (cancelou). */
  perguntar: <T extends string>(titulo: string, opcoes: OpcaoDialogo<T>[], mensagem?: string) => Promise<T | null>;
}

const Contexto = createContext<EstadoUI | null>(null);

export function ProvedorEstado({ children }: { children: ComponentChildren }) {
  const [painel, setPainel] = useState<Painel | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);
  const timer = useRef<number>();

  const fecharPainel = useCallback(() => setPainel(null), []);
  const fecharAviso = useCallback(() => setAviso(null), []);
  const avisar = useCallback((a: Aviso) => {
    clearTimeout(timer.current);
    setAviso(a);
    timer.current = window.setTimeout(() => setAviso(null), a.desfazer ? 6000 : 3500);
  }, []);

  const perguntar = useCallback(
    <T extends string>(titulo: string, opcoes: OpcaoDialogo<T>[], mensagem?: string) =>
      new Promise<T | null>((ok) => {
        setDialogo({
          titulo,
          mensagem,
          opcoes,
          responder: (v) => {
            setDialogo(null);
            ok(v as T | null);
          },
        });
      }),
    [],
  );

  const valor = useMemo(
    () => ({ painel, abrirPainel: setPainel, fecharPainel, aviso, avisar, fecharAviso, dialogo, perguntar }),
    [painel, aviso, dialogo],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEstado(): EstadoUI {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useEstado fora do ProvedorEstado');
  return ctx;
}
