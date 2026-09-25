// Entidades do app.
// Datas: "AAAA-MM-DD" (data), "HH:mm" (hora) e ISO completo (carimbos de data-hora).
//
// ► Para criar uma entidade nova, siga o roteiro em ARQUITETURA.md ("Adicionar uma entidade").

export type Id = string;

/** Campos que TODA entidade sincronizada precisa ter. */
export interface Registro {
  id: Id;
  criado_em: string;
  atualizado_em: string;
}

/* ---------------- Entidade de exemplo: Item ----------------
   Serve de modelo. Renomeie/adapte ou apague quando criar as entidades do seu projeto. */

export type StatusItem = 'ativo' | 'concluido' | 'excluido';

export interface Item extends Registro {
  titulo: string;
  descricao: string;
  data: string | null; // AAAA-MM-DD
  hora: string | null; // HH:mm
  status: StatusItem;
}

/** Nomes das entidades sincronizadas (cada uma vira uma loja local e uma aba na planilha). */
export const ENTIDADES = ['itens'] as const;
export type Entidade = (typeof ENTIDADES)[number];

/* ---------------- Infraestrutura ---------------- */

export interface ItemFila {
  id: Id;
  entidade: Entidade;
  registro_id: Id;
  operacao: 'criar' | 'alterar' | 'excluir';
  payload: Registro;
  tentativas: number;
  ultimo_erro: string | null;
  criado_em: string;
}

/** Preferências do usuário (valem por aparelho). */
export interface Config {
  primeiro_dia_semana: 0 | 1; // 0 = domingo, 1 = segunda
}

export const CONFIG_PADRAO: Config = {
  primeiro_dia_semana: 0,
};
