/**
 * バイトニックソート実装
 */

import type { SortStep } from './types';

/**
 * バイトニックソートのジェネレータ実装
 *
 * @param arr ソート対象の配列
 * @returns ソートステップのジェネレータ
 */
export function* bitonicSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const n = array.length;

  // 2のべき乗に調整(不足分は最大値で埋める)
  let size = 1;
  while (size < n) {
    size *= 2;
  }

  const maxVal = Math.max(...array) + 1;
  while (array.length < size) {
    array.push(maxVal);
  }

  function* bitonicMerge(low: number, count: number, dir: boolean): Generator<SortStep> {
    if (count > 1) {
      const k = Math.floor(count / 2);
      for (let i = low; i < low + k; i++) {
        if (i + k < array.length) {
          // 比較
          yield {
            array: [...array],
            comparing: [i, i + k],
            swapping: [],
            sorted: []
          };

          const shouldSwap = dir ? array[i] > array[i + k] : array[i] < array[i + k];
          if (shouldSwap) {
            [array[i], array[i + k]] = [array[i + k], array[i]];
            // 交換
            yield {
              array: [...array],
              comparing: [],
              swapping: [i, i + k],
              sorted: []
            };
          }
        }
      }

      yield* bitonicMerge(low, k, dir);
      yield* bitonicMerge(low + k, k, dir);
    }
  }

  function* bitonicSortHelper(low: number, count: number, dir: boolean): Generator<SortStep> {
    if (count > 1) {
      const k = Math.floor(count / 2);
      yield* bitonicSortHelper(low, k, true);
      yield* bitonicSortHelper(low + k, k, false);
      yield* bitonicMerge(low, count, dir);
    }
  }

  yield* bitonicSortHelper(0, size, true);

  // 追加した要素を除去
  while (array.length > n) {
    array.pop();
  }

  // 最終状態
  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: array.length }, (_, i) => i)
  };
}
