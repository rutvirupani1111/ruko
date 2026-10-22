import { solvePow } from './pow';

/**
 * Proof-of-work runs off the main thread so the page stays responsive on
 * low-end phones. The work proves a human-paced client, not who you are.
 */
interface PowRequest {
  prefix: string;
  difficulty: number;
}

interface WorkerScope {
  onmessage: ((event: MessageEvent<PowRequest>) => void) | null;
  postMessage(message: unknown): void;
}

const scope = self as unknown as WorkerScope;

scope.onmessage = (event) => {
  const { prefix, difficulty } = event.data;
  const started = performance.now();
  const nonce = solvePow(prefix, difficulty, {
    onProgress: (tries) => {
      scope.postMessage({ type: 'progress', tries });
    },
  });
  scope.postMessage({ type: 'done', nonce, ms: Math.round(performance.now() - started) });
};
