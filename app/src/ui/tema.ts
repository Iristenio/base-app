// Tema claro/escuro escolhido em Ajustes (vale por aparelho).
// O valor oficial fica nas preferências (IndexedDB); uma cópia vai para o localStorage para o
// index.html aplicar o tema antes de desenhar a tela (sem "piscar" no tema errado ao abrir).
import type { Tema } from '../dominio/tipos';

export function aplicarTema(tema: Tema) {
  const html = document.documentElement;
  if (tema === 'sistema') delete html.dataset.tema;
  else html.dataset.tema = tema;
  try {
    localStorage.setItem('tema', tema);
  } catch {
    // navegação privada ou armazenamento bloqueado: o tema vale só até fechar
  }
}
