import { renderMascotElement } from '../../character/poses';
import { createShareUrl, MAX_MESSAGE_LENGTH, validateMessage } from '../../codec/payload';

export class ComposeView {
  private container: HTMLElement;
  private generatedUrl: string | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render(): void {
    this.container.innerHTML = `
      <div class="compose-wrapper">
        <header class="app-header">
          <span class="badge">서울과기대 테크뇽 링크 메시지</span>
          <h1 class="main-title">말하기 어려운 한마디,<br/>테크뇽이 대신 품고 갈게요</h1>
          <p class="subtitle">서버도 DB도 없이, 메시지는 오직 링크 안에만 담겨요</p>
        </header>

        <div class="mascot-stage compose-mascot" id="compose-mascot"></div>

        <!-- Compose Form Section -->
        <div class="card compose-card" id="compose-form-card">
          <div class="field-group">
            <div class="field-header">
              <label for="message-input" class="field-label">전하고 싶은 메시지</label>
              <span class="char-count" id="char-counter">0 / ${MAX_MESSAGE_LENGTH}자</span>
            </div>
            <textarea
              id="message-input"
              class="message-textarea"
              placeholder="평소에 쑥스러워 전하지 못했던 고마움, 미안함, 응원의 말을 적어보세요... (예: 사실 그때 정말 고마웠어)"
              rows="4"
              maxlength="${MAX_MESSAGE_LENGTH + 20}"
            ></textarea>
            <div class="field-error" id="field-error" style="display: none;"></div>
          </div>

          <div class="field-hint">
            <span class="hint-icon">💡</span>
            <span>받는 사람이 화면을 <strong>꾹 눌러 테크뇽을 응원해야</strong> 편지가 열려요!</span>
          </div>

          <button class="btn btn-primary btn-block" id="btn-generate">
            <span>테크뇽에게 편지 맡기기 (링크 생성)</span>
            <span class="btn-icon">💌</span>
          </button>
        </div>

        <!-- Generated Link Card (Initially hidden) -->
        <div class="card result-card" id="result-card" style="display: none;">
          <div class="result-header">
            <span class="result-badge">🎉 링크가 준비되었어요!</span>
            <h3 class="result-title">이 링크를 친구나 지인에게 보내보세요</h3>
            <p class="result-desc">링크를 열고 테크뇽을 꾹 눌러야만 메시지가 열립니다.</p>
          </div>

          <div class="url-box">
            <input type="text" id="generated-url-input" class="url-input" readonly />
            <button class="btn-copy-inline" id="btn-copy-inline" title="링크 복사">복사</button>
          </div>

          <div class="action-grid">
            <button class="btn btn-primary" id="btn-share-main">
              <span class="btn-icon">📤</span>
              <span>친구에게 링크 공유하기</span>
            </button>
            <button class="btn btn-secondary" id="btn-preview-link">
              <span class="btn-icon">👀</span>
              <span>내가 직접 열어보기</span>
            </button>
          </div>

          <div class="result-footer">
            <button class="btn-link" id="btn-reset-compose">새로운 메시지 작성하기</button>
          </div>
        </div>

        <!-- Privacy & Security Notice Footnote -->
        <footer class="app-footer">
          <p class="footer-notice">
            🔒 <strong>개인정보 안심</strong>: 입력한 메시지는 서버나 데이터베이스에 저장되지 않으며, 오직 링크 안에만 인코딩됩니다.
          </p>
          <p class="footer-copyright">
            '테크뇽' 캐릭터 저작권 및 2차 저작물 권리는 서울과학기술대학교에 있습니다.
          </p>
        </footer>
      </div>
    `;

    const mascotContainer = this.container.querySelector('#compose-mascot') as HTMLElement;
    if (mascotContainer) {
      renderMascotElement('pose-idle', mascotContainer);
    }

    this.bindEvents();
  }

  private bindEvents(): void {
    const textarea = this.container.querySelector('#message-input') as HTMLTextAreaElement;
    const charCounter = this.container.querySelector('#char-counter') as HTMLElement;
    const fieldError = this.container.querySelector('#field-error') as HTMLElement;
    const generateBtn = this.container.querySelector('#btn-generate') as HTMLButtonElement;
    const formCard = this.container.querySelector('#compose-form-card') as HTMLElement;
    const resultCard = this.container.querySelector('#result-card') as HTMLElement;
    const urlInput = this.container.querySelector('#generated-url-input') as HTMLInputElement;
    const copyInlineBtn = this.container.querySelector('#btn-copy-inline') as HTMLButtonElement;
    const shareBtn = this.container.querySelector('#btn-share-main') as HTMLButtonElement;
    const previewBtn = this.container.querySelector('#btn-preview-link') as HTMLButtonElement;
    const resetBtn = this.container.querySelector('#btn-reset-compose') as HTMLButtonElement;

    const updateCount = () => {
      const chars = Array.from(textarea.value).length;
      charCounter.textContent = `${chars} / ${MAX_MESSAGE_LENGTH}자`;

      if (chars > MAX_MESSAGE_LENGTH) {
        charCounter.classList.add('is-over');
        fieldError.textContent = `최대 ${MAX_MESSAGE_LENGTH}자까지 입력할 수 있습니다. (${chars - MAX_MESSAGE_LENGTH}자 초과)`;
        fieldError.style.display = 'block';
        generateBtn.disabled = true;
      } else {
        charCounter.classList.remove('is-over');
        fieldError.style.display = 'none';
        generateBtn.disabled = chars === 0;
      }
    };

    textarea.addEventListener('input', updateCount);

    generateBtn.addEventListener('click', () => {
      const text = textarea.value.trim();
      const validation = validateMessage(text);
      if (!validation.valid) {
        fieldError.textContent = validation.error ?? '메시지를 확인해 주세요.';
        fieldError.style.display = 'block';
        return;
      }

      try {
        const shareUrl = createShareUrl(text);
        this.generatedUrl = shareUrl;
        urlInput.value = shareUrl;

        // Transition form card to result card
        formCard.style.display = 'none';
        resultCard.style.display = 'block';
        resultCard.classList.add('animate-slide-up');

        // Scroll into view smoothly
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (err) {
        fieldError.textContent = (err as Error).message || '링크 생성 중 오류가 발생했습니다.';
        fieldError.style.display = 'block';
      }
    });

    const copyToClipboard = async () => {
      if (!this.generatedUrl) return;
      try {
        await navigator.clipboard.writeText(this.generatedUrl);
        this.showToast('링크가 클립보드에 복사되었습니다! 💌');
      } catch {
        // Fallback for older browsers
        urlInput.select();
        document.execCommand('copy');
        this.showToast('링크가 복사되었습니다!');
      }
    };

    copyInlineBtn.addEventListener('click', copyToClipboard);

    shareBtn.addEventListener('click', async () => {
      if (!this.generatedUrl) return;

      if (navigator.share) {
        try {
          await navigator.share({
            title: '테크뇽이 품고 온 메시지가 도착했어요 🐉💌',
            text: '테크뇽을 꾹 눌러 응원해 주면 편지가 열립니다!',
            url: this.generatedUrl
          });
          return;
        } catch {
          // User cancelled or share failed, fallback to copy
        }
      }

      await copyToClipboard();
    });

    previewBtn.addEventListener('click', () => {
      if (!this.generatedUrl) return;
      const hashPart = this.generatedUrl.slice(this.generatedUrl.indexOf('#'));
      window.location.hash = hashPart;
    });

    resetBtn.addEventListener('click', () => {
      textarea.value = '';
      this.generatedUrl = null;
      updateCount();
      resultCard.style.display = 'none';
      formCard.style.display = 'block';
    });

    updateCount();
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
    // cleanup if needed
  }
}
