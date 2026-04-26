import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = `
    <main class="app">
      <h1>cluster-engine</h1>
      <p>Vite + TypeScript starter with hot reload.</p>
      <p>Edit <code>src/main.ts</code> and save to see changes.</p>
    </main>
  `;
}
