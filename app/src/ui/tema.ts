// Tema claro/escuro escolhido em Ajustes (vale por aparelho).
// O valor oficial fica nas preferências (IndexedDB); uma cópia vai para o localStorage para o
// index.html aplicar o tema antes de desenhar a tela (sem "piscar" no tema errado ao abrir).
import type { Tema } from '../dominio/tipos';

/**
 * Chave própria de cada app: no GitHub Pages todos os apps ficam em iristenio.github.io e dividem
 * o mesmo localStorage — a 1ª pasta do endereço (o nome do repositório) separa um app do outro.
 * O script do index.html calcula a MESMA chave.
 */
export const chaveTema = () => 'tema:' + location.pathname.split('/')[1];

export function aplicarTema(tema: Tema) {
  const html = document.documentElement;
  if (tema === 'sistema') delete html.dataset.tema;
  else html.dataset.tema = tema;
  try {
    localStorage.setItem(chaveTema(), tema);
  } catch {
    // navegação privada ou armazenamento bloqueado: o tema vale só até fechar
  }
}
