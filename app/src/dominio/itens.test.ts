import { describe, expect, it } from 'vitest';
import { novoItem, ordenarItens, validarItem } from './itens';

let seq = 0;
const i = (campos = {}) => novoItem({ id: `i${++seq}`, titulo: 'x', ...campos });

describe('itens', () => {
  it('validação', () => {
    expect(validarItem({ titulo: ' ', data: null, hora: null })).toHaveLength(1);
    expect(validarItem({ titulo: 'a', data: null, hora: '10:00' })).toHaveLength(1);
    expect(validarItem({ titulo: 'a', data: '2026-01-01', hora: '10:00' })).toHaveLength(0);
  });
  it('ordenação: ativos por data, sem data depois, concluídos no fim, excluídos fora', () => {
    const semData = i({ titulo: 'b' });
    const amanha = i({ data: '2026-01-02' });
    const hoje = i({ data: '2026-01-01', hora: '09:00' });
    const feito = i({ data: '2025-12-31', status: 'concluido' });
    const apagado = i({ status: 'excluido' });
    expect(ordenarItens([feito, semData, amanha, apagado, hoje]).map((x) => x.id)).toEqual([hoje.id, amanha.id, semData.id, feito.id]);
  });
});
