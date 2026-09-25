import { render } from 'preact';
import { App } from './ui/App';
import { APP, somenteCelular, somentePc, usaDispositivo } from './app.config';
import { garantirDadosIniciais, pedirArmazenamentoPersistente } from './dados/repositorio';
import { iniciarSincronizacao } from './sync/motor';
import './estilos/global.css';
import './estilos/formularios.css';
import './estilos/itens.css';
import './estilos/ajustes.css';

// Perfil de dispositivos (app.config.ts) → classes que ajustam o layout (ver global.css)
const html = document.documentElement;
html.classList.toggle('so-celular', somenteCelular);
html.classList.toggle('so-pc', somentePc);
html.classList.toggle('com-pc', usaDispositivo('pc'));
html.style.setProperty('--primaria-app', APP.corPrimaria);
document.title = APP.nome;

garantirDadosIniciais().then(() => iniciarSincronizacao());
pedirArmazenamentoPersistente();

render(<App />, document.getElementById('app')!);
