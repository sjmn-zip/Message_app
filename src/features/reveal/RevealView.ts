import { renderMascotElement } from '../../character/poses';
import { decodePayload, MessagePayload } from '../../codec/payload';
import { HoldGesture } from './holdGesture';
import { triggerBurstParticles } from './particleEffect';
import { RevealStateMachine } from './stateMachine';

export class RevealView {
  private container: HTMLElement;
  private stateMachine: RevealStateMachine;
  private holdGesture: HoldGesture | null = null;
  private payload: MessagePayload | null = null;
  private errorReason: string | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.stateMachine = new RevealStateMachine('idle');
    this.parseUrl();
  }

  private parseUrl(): void {
    try {
      const hash = window.location.hash;
      this.payload = decodePayload(hash);
    } catch (err) {
      this.errorReason = (err as Error).message || '유효하지 않은 링크입니다.';
      this.stateMachine.transition('invalid');
    }
  }

  public render(): void {
    if (this.stateMachine.state === 'invalid') {
      this.renderInvalidView();
      return;
    }

    this.renderActiveView();
  }

  private renderInvalidView(): void {
    this.container.innerHTML = `
      <div class="reveal-wrapper invalid-screen">
        <div class="mascot-stage" id="mascot-stage"></div>
        <div class="card invalid-card">
          <h2 class="title error-title">링크가 올바르지 않아요 😢</h2>
          <p class="description">${this.errorReason ?? '메시지가 손상되었거나 링크가 잘못되었습니다.'}</p>
          <div class="action-group">
            <button class="btn btn-primary" id="btn-goto-compose">
              <span>나도 테크뇽에게 메시지 부탁하기</span>
              <span class="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const stage = this.container.querySelector('#mascot-stage') as HTMLElement;
    if (stage) {
      renderMascotElement('pose-confused', stage);
    }

    const gotoBtn = this.container.querySelector('#btn-goto-compose') as HTMLButtonElement;
    if (gotoBtn) {
      gotoBtn.addEventListener('click', () => {
        window.location.hash = '';
      });
    }
  }

  private renderActiveView(): void {
    this.container.innerHTML = `
      <div class="reveal-wrapper">
        <canvas id="particle-canvas" class="particle-canvas"></canvas>

        <header class="app-header">
          <span class="badge">서울과기대 테크뇽 배달부</span>
          <h1 class="main-title" id="reveal-title">테크뇽이 편지를 품고 왔어요!</h1>
          <p class="subtitle" id="reveal-subtitle">테크뇽을 꾹 눌러 응원해 주면 편지를 열어줘요</p>
        </header>

        <!-- Interactive Mascot Arena -->
        <div class="mascot-interactive-area" id="mascot-interactive-area" tabindex="0" role="button" aria-label="테크뇽 응원하기 (꾹 누르세요)">
          <!-- Circular Progress Ring SVG -->
          <svg class="progress-ring" viewBox="0 0 260 260">
            <circle class="ring-bg" cx="130" cy="130" r="118" />
            <circle class="ring-indicator" id="ring-indicator" cx="130" cy="130" r="118" />
          </svg>

          <!-- Floating Prompt Badge -->
          <div class="hold-prompt" id="hold-prompt">
            <span class="finger-icon">👆</span>
            <span class="prompt-text">꾹 눌러주세요</span>
          </div>

          <!-- Mascot Stage -->
          <div class="mascot-stage" id="mascot-stage"></div>
        </div>

        <!-- Cheer Gauge Text -->
        <div class="gauge-status-bar" id="gauge-bar-wrapper">
          <div class="gauge-label">
            <span>응원 게이지</span>
            <span id="gauge-percentage">0%</span>
          </div>
          <div class="gauge-track">
            <div class="gauge-fill" id="gauge-fill"></div>
          </div>
        </div>

        <!-- Revealed Message Letter Card (initially hidden) -->
        <div class="letter-reveal-container" id="letter-reveal-container" style="display: none;">
          <div class="letter-card">
            <div class="letter-seal">💌</div>
            <div class="letter-header">
              <span class="letter-tag">테크뇽이 품고 온 한마디</span>
            </div>
            <div class="letter-content" id="letter-content-text"></div>
            <div class="letter-footer">
              <span class="letter-stamp">Verified by TechNyong 🐉</span>
            </div>
          </div>

          <div class="reveal-actions">
            <button class="btn btn-secondary" id="btn-copy-msg">
              <span>메시지 복사</span>
            </button>
            <button class="btn btn-primary" id="btn-create-mine">
              <span>나도 테크뇽으로 메시지 쓰기</span>
              <span class="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const mascotStage = this.container.querySelector('#mascot-stage') as HTMLElement;
    const interactiveArea = this.container.querySelector('#mascot-interactive-area') as HTMLElement;
    const ringIndicator = this.container.querySelector('#ring-indicator') as SVGCircleElement;
    const gaugeFill = this.container.querySelector('#gauge-fill') as HTMLElement;
    const gaugePercent = this.container.querySelector('#gauge-percentage') as HTMLElement;
    const holdPrompt = this.container.querySelector('#hold-prompt') as HTMLElement;
    const gaugeBarWrapper = this.container.querySelector('#gauge-bar-wrapper') as HTMLElement;
    const titleEl = this.container.querySelector('#reveal-title') as HTMLElement;
    const subtitleEl = this.container.querySelector('#reveal-subtitle') as HTMLElement;
    const particleCanvas = this.container.querySelector('#particle-canvas') as HTMLCanvasElement;
    const letterContainer = this.container.querySelector('#letter-reveal-container') as HTMLElement;
    const letterText = this.container.querySelector('#letter-content-text') as HTMLElement;

    // SVG Circle Circumference: 2 * PI * 118 = ~741.42
    const circumference = 2 * Math.PI * 118;
    ringIndicator.style.strokeDasharray = `${circumference}`;
    ringIndicator.style.strokeDashoffset = `${circumference}`;

    // Render Initial Idle Pose
    renderMascotElement('pose-idle', mascotStage);

    // Bind Hold Gesture
    this.holdGesture = new HoldGesture({
      targetElement: interactiveArea,
      durationMs: 1600,
      decayDurationMs: 500,
      onStart: () => {
        this.stateMachine.transition('charging');
        interactiveArea.classList.add('is-charging');
        holdPrompt.classList.add('is-active');
        titleEl.textContent = '테크뇽이 힘을 내고 있어요!';
        subtitleEl.textContent = '손을 떼지 말고 100%까지 꾹 눌러주세요!';
      },
      onProgress: (progress: number) => {
        const offset = circumference - progress * circumference;
        ringIndicator.style.strokeDashoffset = `${offset}`;
        gaugeFill.style.width = `${(progress * 100).toFixed(0)}%`;
        gaugePercent.textContent = `${(progress * 100).toFixed(0)}%`;

        // Shake intensity dynamically increases with progress
        const shakeVal = (progress * 6).toFixed(1);
        interactiveArea.style.setProperty('--shake-amt', `${shakeVal}px`);
      },
      onCancel: () => {
        this.stateMachine.transition('idle');
        interactiveArea.classList.remove('is-charging');
        holdPrompt.classList.remove('is-active');
        titleEl.textContent = '테크뇽이 편지를 품고 왔어요!';
        subtitleEl.textContent = '테크뇽을 꾹 눌러 응원해 주면 편지를 열어줘요';
      },
      onComplete: () => {
        this.stateMachine.transition('burst');
        interactiveArea.classList.remove('is-charging');
        interactiveArea.classList.add('is-burst');
        ringIndicator.style.strokeDashoffset = '0';
        gaugeFill.style.width = '100%';
        gaugePercent.textContent = '100%';

        // Switch mascot pose to cheer
        renderMascotElement('pose-cheer', mascotStage);

        titleEl.textContent = '퐁! 응원 성공! 🎉';
        subtitleEl.textContent = '테크뇽이 편지를 건네주었어요!';

        // Trigger particles
        const rect = interactiveArea.getBoundingClientRect();
        triggerBurstParticles(particleCanvas, rect.left + rect.width / 2, rect.top + rect.height / 2);

        // After burst animation, reveal message
        setTimeout(() => {
          this.stateMachine.transition('revealed');
          renderMascotElement('pose-letter', mascotStage);

          // Hide gauge bar, show letter card
          gaugeBarWrapper.style.display = 'none';
          holdPrompt.style.display = 'none';

          if (this.payload) {
            letterText.textContent = this.payload.m;
          }

          letterContainer.style.display = 'flex';
          letterContainer.classList.add('animate-slide-up');

          titleEl.textContent = '도착한 한마디 💌';
          subtitleEl.textContent = '테크뇽이 소중히 전해온 편지예요';
        }, 700);
      }
    });

    // Action button listeners
    const copyBtn = this.container.querySelector('#btn-copy-msg') as HTMLButtonElement;
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        if (!this.payload) return;
        try {
          await navigator.clipboard.writeText(this.payload.m);
          this.showToast('메시지가 복사되었습니다!');
        } catch {
          this.showToast('클립보드 복사에 실패했습니다.');
        }
      });
    }

    const createMineBtn = this.container.querySelector('#btn-create-mine') as HTMLButtonElement;
    if (createMineBtn) {
      createMineBtn.addEventListener('click', () => {
        window.location.hash = '';
      });
    }
  }

  private showToast(message: string): void {
    const existing = document.querySelector('.app-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'app-toast animate-fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  public destroy(): void {
    if (this.holdGesture) {
      this.holdGesture.destroy();
      this.holdGesture = null;
    }
  }
}
