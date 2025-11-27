/**
 * Mini challenge definitions: short dev-themed snippets with time limits.
 */
export interface MiniChallengeDef {
  id: string;
  snippet: string; // characters player must type exactly
  timeLimitSeconds: number; // time to complete challenge
  description: string;
}

export const MINI_CHALLENGES: MiniChallengeDef[] = [
  { id: 'git-init', snippet: 'git init', timeLimitSeconds: 6, description: 'Initialize a new repository' },
  { id: 'npm-install', snippet: 'npm install', timeLimitSeconds: 8, description: 'Install dependencies fast' },
  { id: 'build-script', snippet: 'npm run build', timeLimitSeconds: 9, description: 'Trigger a production build' },
  { id: 'test-run', snippet: 'npm test', timeLimitSeconds: 7, description: 'Execute the test suite' },
  { id: 'eslint-fix', snippet: 'npx eslint . --fix', timeLimitSeconds: 12, description: 'Fix lint issues automatically' },
  { id: 'docker-build', snippet: 'docker build .', timeLimitSeconds: 10, description: 'Build a container image' },
  { id: 'deploy', snippet: 'git push origin main', timeLimitSeconds: 13, description: 'Deploy latest changes' },
];

/** Pick a random challenge definition */
export function pickRandomChallenge(): MiniChallengeDef {
  return MINI_CHALLENGES[Math.floor(Math.random() * MINI_CHALLENGES.length)];
}

