import { ComposeView } from './features/compose/ComposeView';
import { RevealView } from './features/reveal/RevealView';
import './styles/main.css';

class App {
  private appRoot: HTMLElement;
  private currentView: ComposeView | RevealView | null = null;

  constructor() {
    const root = document.getElementById('app');
    if (!root) {
      throw new Error('#app root element not found');
    }
    this.appRoot = root;
    this.initRouter();
  }

  private initRouter(): void {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }

  private handleRoute(): void {
    const hash = window.location.hash;

    // Destroy existing view listeners
    if (this.currentView) {
      this.currentView.destroy();
      this.currentView = null;
    }

    // Check if fragment contains payload identifier #c=
    if (hash.includes('c=')) {
      this.currentView = new RevealView(this.appRoot);
      this.currentView.render();
    } else {
      this.currentView = new ComposeView(this.appRoot);
      this.currentView.render();
    }
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
