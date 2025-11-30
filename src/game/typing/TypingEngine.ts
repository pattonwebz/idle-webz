import { TYPING_CONFIG, WORD_BOUNDARIES } from '../../constants/gameConstants';
import { pickRandomChallenge } from '../../constants/challenges';

export interface ActiveChallenge {
  id: string;
  snippet: string;
  description: string;
  timeLimitMs: number;
  startTime: number;
  progress: number;
  startedOnNewLine: boolean;
}

export interface TypingStats {
  wordsTyped: number;
  streakWords: number;
  currentWordLength: number;
}

export class TypingEngine {
  private lastTypedChar: string | null = null;
  private consecutiveSameCharCount = 0;
  private stats: TypingStats = { wordsTyped: 0, streakWords: 0, currentWordLength: 0 };
  private challenge: ActiveChallenge | null = null;
  private lastChallengeWords = 0;
  private completedChallenges = 0;
  private failedChallenges = 0;
  private challengesEnabled = true;

  handleChar(char: string, addResources: (value: number) => void): void {
    // Handle active challenge
    if (this.challenge) {
      const c = this.challenge;
      if (Date.now() - c.startTime > c.timeLimitMs) {
        this.failChallenge();
      } else {
        if (!c.startedOnNewLine) {
          if (char === '\n') { c.startedOnNewLine = true; return; }
        } else {
          const expectedChar = c.snippet[c.progress];
          if (char === '\n') {
            this.failChallenge();
          } else if (char === expectedChar) {
            c.progress++;
            if (c.progress >= c.snippet.length) this.completeChallenge(addResources);
          } else {
            this.failChallenge();
          }
        }
      }
    }

    // Streak prevention
    if (this.lastTypedChar === char) this.consecutiveSameCharCount++; else { this.lastTypedChar = char; this.consecutiveSameCharCount = 1; }

    if (this.consecutiveSameCharCount >= 3) {
      if (!WORD_BOUNDARIES.has(char)) this.stats.currentWordLength++; else this.handleWordBoundary(addResources);
      return;
    }

    // Reward
    if (!WORD_BOUNDARIES.has(char)) {
      addResources(TYPING_CONFIG.baseCharValue * this.getCurrentStreakMultiplier());
      this.stats.currentWordLength++;
    } else {
      this.handleWordBoundary(addResources);
    }
  }

  private handleWordBoundary(addResources: (value: number) => void): void {
    if (this.stats.currentWordLength > 0) this.completeWord(addResources);
    this.stats.currentWordLength = 0;

    if (this.challengesEnabled && !this.challenge && this.stats.wordsTyped > 0) {
      const wordsSinceLast = this.stats.wordsTyped - this.lastChallengeWords;
      if (wordsSinceLast >= TYPING_CONFIG.wordsPerChallenge) this.startChallenge();
    }
  }

  private completeWord(addResources: (value: number) => void): void {
    this.stats.wordsTyped++;
    this.stats.streakWords++;
    const streakMultiplier = this.getCurrentStreakMultiplier();
    const baseWordValue = this.stats.currentWordLength * TYPING_CONFIG.baseCharValue;
    const reward = baseWordValue * TYPING_CONFIG.wordBonusMultiplier * streakMultiplier;
    addResources(reward);
  }

  private startChallenge(): void {
    const def = pickRandomChallenge();
    this.challenge = {
      id: def.id,
      snippet: def.snippet,
      description: def.description,
      timeLimitMs: def.timeLimitSeconds * 1000,
      startTime: Date.now(),
      progress: 0,
      startedOnNewLine: false,
    };
    this.lastChallengeWords = this.stats.wordsTyped;
  }

  public triggerChallenge(): boolean {
    if (this.challenge) return false;
    this.startChallenge();
    return true;
  }

  private completeChallenge(addResources: (value: number) => void): void {
    if (!this.challenge) return;
    const length = this.challenge.snippet.length;
    const streakMultiplier = this.getCurrentStreakMultiplier();
    const reward = length * TYPING_CONFIG.baseCharValue * TYPING_CONFIG.challengeRewardMultiplier * streakMultiplier;
    addResources(reward);
    this.completedChallenges++;
    this.stats.streakWords += 1; // small streak boost
    this.challenge = null;
  }

  private failChallenge(): void {
    if (!this.challenge) return;
    this.failedChallenges++;
    this.stats.streakWords = 0;
    this.challenge = null;
  }

  getCurrentStreakMultiplier(): number {
    const multiplier = 1 + this.stats.streakWords * TYPING_CONFIG.streakStep;
    return Math.min(TYPING_CONFIG.maxStreakMultiplier, multiplier);
  }

  getUIState() {
    return {
      wordsTyped: this.stats.wordsTyped,
      streakWords: this.stats.streakWords,
      currentStreakMultiplier: this.getCurrentStreakMultiplier(),
      challenge: this.challenge ? {
        id: this.challenge.id,
        snippet: this.challenge.snippet,
        description: this.challenge.description,
        progress: this.challenge.progress,
        total: this.challenge.snippet.length,
        timeRemaining: Math.max(0, Math.ceil((this.challenge.timeLimitMs - (Date.now() - this.challenge.startTime)) / 1000)),
        startedOnNewLine: this.challenge.startedOnNewLine,
      } : null,
      nextChallengeInWords: this.challenge ? 0 : Math.max(0, TYPING_CONFIG.wordsPerChallenge - (this.stats.wordsTyped - this.lastChallengeWords)),
      completedChallenges: this.completedChallenges,
      failedChallenges: this.failedChallenges,
      challengesEnabled: this.challengesEnabled,
    };
  }

  setChallengesEnabled(enabled: boolean) { this.challengesEnabled = enabled; }
}

