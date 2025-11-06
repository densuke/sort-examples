import type { SortStep } from './types';

type WorkerStepsMessage = { type: 'steps'; steps: SortStep[] };
type WorkerDoneMessage = { type: 'done' };
type WorkerErrorMessage = { type: 'error'; message: string };
type WorkerMessage = WorkerStepsMessage | WorkerDoneMessage | WorkerErrorMessage;

const WORKER_URL = new URL('../workers/quick-sort-worker.ts', import.meta.url);
const CHUNK_SIZE = 96;

export async function* quickSortMultiThread(arr: number[]): AsyncGenerator<SortStep> {
  const worker = new Worker(WORKER_URL, { type: 'module' });
  const queue: SortStep[] = [];
  let done = false;
  let error: Error | null = null;
  let notify: (() => void) | null = null;

  const scheduleNotify = (): void => {
    if (notify) {
      notify();
      notify = null;
    }
  };

  worker.onmessage = (event: MessageEvent<WorkerMessage>): void => {
    const data = event.data;

    if (data.type === 'steps') {
      queue.push(...data.steps);
      scheduleNotify();
      return;
    }

    if (data.type === 'done') {
      done = true;
      scheduleNotify();
      return;
    }

    if (data.type === 'error') {
      error = new Error(data.message || 'Quick sort worker error');
      done = true;
      scheduleNotify();
    }
  };

  worker.onerror = (event): void => {
    error = new Error(event.message || 'Quick sort worker error');
    done = true;
    scheduleNotify();
  };

  worker.postMessage({ type: 'start', array: arr, chunkSize: CHUNK_SIZE });

  const waitForData = async (): Promise<void> => {
    if (queue.length > 0 || done) {
      return;
    }

    await new Promise<void>((resolve) => {
      if (queue.length > 0 || done) {
        resolve();
        return;
      }
      notify = resolve;
    });
  };

  try {
    while (true) {
      if (error) {
        throw error;
      }

      if (queue.length === 0) {
        await waitForData();

        if (queue.length === 0 && done) {
          break;
        }
      }

      const step = queue.shift();
      if (step) {
        yield step;
      }
    }
  } finally {
    worker.terminate();
  }
}
