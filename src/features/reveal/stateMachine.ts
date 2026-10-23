import { PoseType } from '../../character/poses';

export type RevealState = 'idle' | 'charging' | 'burst' | 'revealed' | 'invalid';

export interface StateDefinition {
  state: RevealState;
  pose: PoseType;
  title: string;
  description: string;
}

export const STATE_CONFIGS: Record<RevealState, StateDefinition> = {
  idle: {
    state: 'idle',
    pose: 'pose-idle',
    title: '테크뇽이 편지를 품고 왔어요',
    description: '테크뇽을 꾹 눌러 응원해 주면 편지를 열어줘요!'
  },
  charging: {
    state: 'charging',
    pose: 'pose-idle',
    title: '테크뇽이 힘을 내고 있어요!',
    description: '손을 떼지 말고 게이지가 찰 때까지 꾹 눌러주세요!'
  },
  burst: {
    state: 'burst',
    pose: 'pose-cheer',
    title: '퐁! 응원 성공!',
    description: '편지가 열렸어요!'
  },
  revealed: {
    state: 'revealed',
    pose: 'pose-letter',
    title: '도착한 한마디',
    description: '테크뇽이 소중히 품고 온 편지예요.'
  },
  invalid: {
    state: 'invalid',
    pose: 'pose-confused',
    title: '링크가 올바르지 않아요',
    description: '메시지가 손상되었거나 유효하지 않은 주소입니다.'
  }
};

export class RevealStateMachine {
  private _state: RevealState = 'idle';
  private _listeners: Array<(state: RevealState, prevState: RevealState) => void> = [];

  constructor(initialState: RevealState = 'idle') {
    this._state = initialState;
  }

  get state(): RevealState {
    return this._state;
  }

  get config(): StateDefinition {
    return STATE_CONFIGS[this._state];
  }

  public subscribe(listener: (state: RevealState, prevState: RevealState) => void): () => void {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  public transition(nextState: RevealState): boolean {
    const prev = this._state;
    if (prev === nextState) return false;

    // Transition rules
    if (prev === 'invalid' && nextState !== 'idle') {
      return false;
    }
    if (prev === 'revealed') {
      return false; // Terminal state until page reload / reset
    }

    if (prev === 'idle' && nextState !== 'charging' && nextState !== 'invalid') {
      return false;
    }

    if (prev === 'charging' && nextState !== 'idle' && nextState !== 'burst') {
      return false;
    }

    if (prev === 'burst' && nextState !== 'revealed') {
      return false;
    }

    this._state = nextState;
    for (const listener of this._listeners) {
      listener(nextState, prev);
    }
    return true;
  }
}
