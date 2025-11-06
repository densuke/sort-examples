/**
 * Web Workerでバイトニックソートの部分処理を実行
 */

interface WorkerMessage {
  type: 'sort' | 'merge';
  array: number[];
  low: number;
  count: number;
  dir: boolean;
  workerId: number;
}

interface WorkerResponse {
  type: 'result';
  array: number[];
  workerId: number;
  comparisons: number;
  swaps: number;
}

/**
 * バイトニックマージを実行
 */
function bitonicMerge(array: number[], low: number, count: number, dir: boolean): { comparisons: number; swaps: number } {
  let comparisons = 0;
  let swaps = 0;

  if (count > 1) {
    const k = Math.floor(count / 2);
    for (let i = low; i < low + k; i++) {
      if (i + k < array.length) {
        comparisons++;
        const shouldSwap = dir ? array[i] > array[i + k] : array[i] < array[i + k];
        if (shouldSwap) {
          [array[i], array[i + k]] = [array[i + k], array[i]];
          swaps++;
        }
      }
    }

    const result1 = bitonicMerge(array, low, k, dir);
    const result2 = bitonicMerge(array, low + k, k, dir);

    comparisons += result1.comparisons + result2.comparisons;
    swaps += result1.swaps + result2.swaps;
  }

  return { comparisons, swaps };
}

/**
 * バイトニックソートを実行
 */
function bitonicSortHelper(array: number[], low: number, count: number, dir: boolean): { comparisons: number; swaps: number } {
  let comparisons = 0;
  let swaps = 0;

  if (count > 1) {
    const k = Math.floor(count / 2);

    const result1 = bitonicSortHelper(array, low, k, true);
    const result2 = bitonicSortHelper(array, low + k, k, false);
    const result3 = bitonicMerge(array, low, count, dir);

    comparisons += result1.comparisons + result2.comparisons + result3.comparisons;
    swaps += result1.swaps + result2.swaps + result3.swaps;
  }

  return { comparisons, swaps };
}

// Workerメッセージハンドラ
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, array, low, count, dir, workerId } = e.data;

  let comparisons = 0;
  let swaps = 0;

  if (type === 'sort') {
    const result = bitonicSortHelper(array, low, count, dir);
    comparisons = result.comparisons;
    swaps = result.swaps;
  } else if (type === 'merge') {
    const result = bitonicMerge(array, low, count, dir);
    comparisons = result.comparisons;
    swaps = result.swaps;
  }

  const response: WorkerResponse = {
    type: 'result',
    array,
    workerId,
    comparisons,
    swaps
  };

  self.postMessage(response);
};
