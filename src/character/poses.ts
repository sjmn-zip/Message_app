/**
 * Mascot Pose Configuration and Asset Resolver
 * 
 * Complies with SeoulTech Character Guidelines:
 * - Does not alter mascot colors or aspect ratios.
 * - Resolves official images in public/assets/character/
 * - Seamlessly falls back to distinct SVG illustrations when assets are absent.
 */

export type PoseType = 'pose-idle' | 'pose-cheer' | 'pose-letter' | 'pose-confused';

export interface PoseConfig {
  id: PoseType;
  label: string;
  officialFileCandidates: string[];
  svgTemplate: string;
}

const COMMON_DRAGON_DEFS = `
  <defs>
    <radialGradient id="dragonGrad" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#4ade80" />
      <stop offset="60%" stop-color="#22c55e" />
      <stop offset="100%" stop-color="#15803d" />
    </radialGradient>
    <radialGradient id="bellyGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#fde047" />
    </radialGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#15803d" flood-opacity="0.25"/>
    </filter>
  </defs>
  <ellipse cx="120" cy="216" rx="66" ry="12" fill="#0f172a" opacity="0.12"/>
`;

const SVG_POSES: Record<PoseType, string> = {
  'pose-idle': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" class="mascot-svg" role="img" aria-label="편지를 꼭 쥐고 있는 테크뇽">
      ${COMMON_DRAGON_DEFS}
      <!-- Wings -->
      <path d="M 68 135 C 40 115 35 145 58 160 Z" fill="#15803d" opacity="0.9"/>
      <path d="M 172 135 C 200 115 205 145 182 160 Z" fill="#15803d" opacity="0.9"/>
      <!-- Body -->
      <g filter="url(#softGlow)">
        <path d="M 72 120 C 72 65 168 65 168 120 C 172 160 162 195 120 195 C 78 195 68 160 72 120 Z" fill="url(#dragonGrad)"/>
        <!-- Horns -->
        <path d="M 94 70 C 90 48 102 42 106 58 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
        <path d="M 146 70 C 150 48 138 42 134 58 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
        <!-- Belly -->
        <path d="M 95 130 C 95 115 145 115 145 130 C 148 160 142 185 120 185 C 98 185 92 160 95 130 Z" fill="url(#bellyGrad)"/>
        <path d="M 104 145 C 114 149 126 149 136 145" stroke="#eab308" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <!-- Blush -->
        <circle cx="88" cy="118" r="8" fill="#f43f5e" opacity="0.35"/>
        <circle cx="152" cy="118" r="8" fill="#f43f5e" opacity="0.35"/>
        <!-- Eyes -->
        <circle cx="98" cy="108" r="7.5" fill="#1e293b"/>
        <circle cx="96" cy="106" r="2.8" fill="#ffffff"/>
        <circle cx="142" cy="108" r="7.5" fill="#1e293b"/>
        <circle cx="140" cy="106" r="2.8" fill="#ffffff"/>
        <!-- Smile -->
        <path d="M 115 118 Q 120 123 125 118" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <!-- Hands & Letter -->
        <circle cx="92" cy="148" r="8" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
        <circle cx="148" cy="148" r="8" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
        <g transform="translate(104, 142)">
          <rect x="0" y="0" width="32" height="22" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
          <path d="M 2 2 L 16 13 L 30 2" fill="none" stroke="#ef4444" stroke-width="1.5"/>
          <circle cx="16" cy="13" r="3" fill="#ef4444"/>
        </g>
      </g>
    </svg>
  `,

  'pose-cheer': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" class="mascot-svg" role="img" aria-label="신나서 환호하는 테크뇽">
      ${COMMON_DRAGON_DEFS}
      <!-- Raised Wings -->
      <path d="M 60 110 C 30 90 25 130 52 140 Z" fill="#15803d" opacity="0.9"/>
      <path d="M 180 110 C 210 90 215 130 188 140 Z" fill="#15803d" opacity="0.9"/>
      <g filter="url(#softGlow)">
        <path d="M 72 115 C 72 60 168 60 168 115 C 172 155 162 195 120 195 C 78 195 68 155 72 115 Z" fill="url(#dragonGrad)"/>
        <!-- Horns -->
        <path d="M 94 65 C 90 43 102 37 106 53 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
        <path d="M 146 65 C 150 43 138 37 134 53 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
        <!-- Belly -->
        <path d="M 95 125 C 95 110 145 110 145 125 C 148 155 142 185 120 185 C 98 185 92 155 95 125 Z" fill="url(#bellyGrad)"/>
        <!-- Cheerful Happy Curved Eyes -->
        <path d="M 92 108 Q 98 100 104 108" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M 136 108 Q 142 100 148 108" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <!-- Blush -->
        <circle cx="86" cy="116" r="9" fill="#f43f5e" opacity="0.45"/>
        <circle cx="154" cy="116" r="9" fill="#f43f5e" opacity="0.45"/>
        <!-- Open Joyful Mouth -->
        <path d="M 112 116 Q 120 130 128 116 Z" fill="#ef4444" stroke="#0f172a" stroke-width="1.5"/>
        <!-- Hands in the Air (Cheering) -->
        <circle cx="75" cy="98" r="9" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
        <circle cx="165" cy="98" r="9" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
        <!-- Sparkles -->
        <path d="M 50 65 L 53 72 L 60 75 L 53 78 L 50 85 L 47 78 L 40 75 L 47 72 Z" fill="#facc15"/>
        <path d="M 190 65 L 193 72 L 200 75 L 193 78 L 190 85 L 187 78 L 180 75 L 187 72 Z" fill="#facc15"/>
      </g>
    </svg>
  `,

  'pose-letter': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" class="mascot-svg" role="img" aria-label="편지를 전달하는 테크뇽">
      ${COMMON_DRAGON_DEFS}
      <!-- Wings -->
      <path d="M 68 135 C 40 115 35 145 58 160 Z" fill="#15803d" opacity="0.9"/>
      <path d="M 172 135 C 200 115 205 145 182 160 Z" fill="#15803d" opacity="0.9"/>
      <g filter="url(#softGlow)">
        <path d="M 72 120 C 72 65 168 65 168 120 C 172 160 162 195 120 195 C 78 195 68 160 72 120 Z" fill="url(#dragonGrad)"/>
        <!-- Horns -->
        <path d="M 94 70 C 90 48 102 42 106 58 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
        <path d="M 146 70 C 150 48 138 42 134 58 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
        <!-- Belly -->
        <path d="M 95 130 C 95 115 145 115 145 130 C 148 160 142 185 120 185 C 98 185 92 160 95 130 Z" fill="url(#bellyGrad)"/>
        <!-- Winking Eye -->
        <path d="M 92 108 Q 98 102 104 108" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <circle cx="142" cy="108" r="7.5" fill="#1e293b"/>
        <circle cx="140" cy="106" r="2.8" fill="#ffffff"/>
        <!-- Blush -->
        <circle cx="88" cy="118" r="8" fill="#f43f5e" opacity="0.4"/>
        <circle cx="152" cy="118" r="8" fill="#f43f5e" opacity="0.4"/>
        <path d="M 114 118 Q 120 124 126 118" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <!-- Hands Presenting Open Glowing Letter -->
        <g transform="translate(90, 135)">
          <polygon points="10,0 50,0 60,35 0,35" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
          <path d="M 10 0 L 30 18 L 50 0" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
          <!-- Little Heart floating -->
          <path d="M 30 8 C 28 4 23 4 23 8 C 23 12 30 16 30 16 C 30 16 37 12 37 8 C 37 4 32 4 30 8 Z" fill="#ef4444"/>
        </g>
        <circle cx="85" cy="148" r="8" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
        <circle cx="155" cy="148" r="8" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
      </g>
    </svg>
  `,

  'pose-confused': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" class="mascot-svg" role="img" aria-label="고개를 갸우뚱하는 테크뇽">
      ${COMMON_DRAGON_DEFS}
      <!-- Tilted Dragon Head/Body -->
      <g transform="rotate(-6 120 130)">
        <path d="M 68 135 C 40 115 35 145 58 160 Z" fill="#15803d" opacity="0.9"/>
        <path d="M 172 135 C 200 115 205 145 182 160 Z" fill="#15803d" opacity="0.9"/>
        <g filter="url(#softGlow)">
          <path d="M 72 120 C 72 65 168 65 168 120 C 172 160 162 195 120 195 C 78 195 68 160 72 120 Z" fill="url(#dragonGrad)"/>
          <path d="M 94 70 C 90 48 102 42 106 58 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
          <path d="M 146 70 C 150 48 138 42 134 58 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
          <path d="M 95 130 C 95 115 145 115 145 130 C 148 160 142 185 120 185 C 98 185 92 160 95 130 Z" fill="url(#bellyGrad)"/>
          <!-- Confused Eyes (One normal, one squinted) -->
          <circle cx="98" cy="108" r="8" fill="#1e293b"/>
          <circle cx="96" cy="106" r="3" fill="#ffffff"/>
          <circle cx="142" cy="109" r="6" fill="#1e293b"/>
          <circle cx="141" cy="107" r="2" fill="#ffffff"/>
          <!-- Confused Mouth / Snout -->
          <path d="M 115 121 Q 120 118 126 123" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          <!-- Hands scratching head / puzzled -->
          <circle cx="95" cy="150" r="8" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
          <circle cx="152" cy="130" r="8" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
        </g>
      </g>
      <!-- Question Mark -->
      <g transform="translate(175, 45)">
        <circle cx="16" cy="16" r="14" fill="#fbbf24"/>
        <text x="16" y="22" font-size="20" font-weight="900" fill="#78350f" text-anchor="middle" font-family="sans-serif">?</text>
      </g>
    </svg>
  `
};

export const POSES: Record<PoseType, PoseConfig> = {
  'pose-idle': {
    id: 'pose-idle',
    label: '편지를 품은 테크뇽',
    officialFileCandidates: [
      '/assets/character/pose-idle.png',
      '/assets/character/tech-nyong-idle.png',
      '/assets/character/idle.png'
    ],
    svgTemplate: SVG_POSES['pose-idle']
  },
  'pose-cheer': {
    id: 'pose-cheer',
    label: '환호하는 테크뇽',
    officialFileCandidates: [
      '/assets/character/pose-cheer.png',
      '/assets/character/tech-nyong-cheer.png',
      '/assets/character/cheer.png'
    ],
    svgTemplate: SVG_POSES['pose-cheer']
  },
  'pose-letter': {
    id: 'pose-letter',
    label: '편지를 전하는 테크뇽',
    officialFileCandidates: [
      '/assets/character/pose-letter.png',
      '/assets/character/tech-nyong-letter.png',
      '/assets/character/letter.png'
    ],
    svgTemplate: SVG_POSES['pose-letter']
  },
  'pose-confused': {
    id: 'pose-confused',
    label: '갸우뚱하는 테크뇽',
    officialFileCandidates: [
      '/assets/character/pose-confused.png',
      '/assets/character/tech-nyong-confused.png',
      '/assets/character/confused.png'
    ],
    svgTemplate: SVG_POSES['pose-confused']
  }
};

/**
 * Creates or updates the mascot HTML element.
 * It attempts to load the official asset first. If unavailable, seamlessly
 * falls back to the clean, compliant SVG illustration.
 */
export function renderMascotElement(pose: PoseType, container: HTMLElement): void {
  const config = POSES[pose];
  container.innerHTML = '';
  container.className = `mascot-container ${pose}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'mascot-frame';

  // Create official image attempt
  const img = document.createElement('img');
  img.alt = config.label;
  img.className = 'mascot-official-img';
  img.style.display = 'none';

  // Create SVG fallback container
  const svgWrapper = document.createElement('div');
  svgWrapper.className = 'mascot-svg-wrapper';
  svgWrapper.innerHTML = config.svgTemplate;

  // Try candidate URLs
  let candidateIndex = 0;
  const tryNextCandidate = () => {
    if (candidateIndex < config.officialFileCandidates.length) {
      const url = config.officialFileCandidates[candidateIndex++];
      img.src = url;
    } else {
      // Fallback to SVG
      img.style.display = 'none';
      svgWrapper.style.display = 'block';
    }
  };

  img.onload = () => {
    img.style.display = 'block';
    svgWrapper.style.display = 'none';
  };

  img.onerror = () => {
    tryNextCandidate();
  };

  wrapper.appendChild(img);
  wrapper.appendChild(svgWrapper);
  container.appendChild(wrapper);

  tryNextCandidate();
}
