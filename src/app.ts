import { log } from './scripts/log';
import logoImageSrc from './images/logo.png';

log('hello devkit!');

export default () => {
  // logo image element creation
  const logoImageElement = new Image();
  logoImageElement.id = 'logo';
  logoImageElement.src = logoImageSrc;

  // welcome message
  const welcomeMessageElement = document.createElement('p');
  welcomeMessageElement.id = 'welcome';
  welcomeMessageElement.textContent = 'welcome to your devkit app!!';

  // compose withing the app element
  const appElement = document.querySelector('#app') as HTMLDivElement;
  appElement.appendChild(logoImageElement);
  appElement.appendChild(welcomeMessageElement);
};
