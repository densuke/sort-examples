import type { SortStep } from '../algorithms/types';
import { quickSort } from '../algorithms/quick-sort';

interface QuickSortWorkerRequest {
  type: 'start';
  array: number[];
  chunkSize?: number;
}

type QuickSortWorkerResponse =
  | { type: 'steps'; steps: SortStep[] }
  | { type: 'done' }
  | { type: 'error'; message: string };

const DEFAULT_CHUNK_SIZE = 96;

const postResponse = (response: QuickSortWorkerResponse): void => {
  self.postMessage(response);
};

const runQuickSort = (array: number[], chunkSize: number): void => {
  const generator = quickSort(array);
  let batch: SortStep[] = [];

  const flush = (): void => {
    if (batch.length > 0) {
      postResponse({ type: 'steps', steps: batch });
      batch = [];
    }
  };

  try {
    for (const step of generator) {
      batch.push(step);
      if (batch.length >= chunkSize) {
        flush();
      }
    }
    flush();
    postResponse({ type: 'done' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown worker error';
    postResponse({ type: 'error', message });
  }
};

self.onmessage = (event: MessageEvent<QuickSortWorkerRequest>): void => {
  const data = event.data;
  if (data?.type !== 'start') {
    return;
  }

  const chunkSize = data.chunkSize && data.chunkSize > 0 ? data.chunkSize : DEFAULT_CHUNK_SIZE;
  const arrayCopy = [...data.array];
  runQuickSort(arrayCopy, chunkSize);
};
