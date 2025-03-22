import { wrap, type Remote } from 'comlink';
import type { ZPassWorkerApi } from './zpass.worker';

let zpassWorker: Remote<ZPassWorkerApi> | null = null;

export function getZPassWorker(): Remote<ZPassWorkerApi> {
  if (!zpassWorker) {
    const worker = new Worker(new URL('./zpass.worker.ts', import.meta.url), {
      type: 'module',
    });
    zpassWorker = wrap<ZPassWorkerApi>(worker);
  }

  return zpassWorker;
}
