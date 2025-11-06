/**
 * バブルソート実装
 */

import type { SortStep } from './types';

/**
 * バブルソートのジェネレータ実装
 *
 * @param arr ソート対象の配列
 * @returns ソートステップのジェネレータ
 */
export function* bubbleSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // 比較中
      yield {
        array: [...array],
        comparing: [j, j + 1],
        swapping: [],
        sorted: Array.from({ length: n - i }, (_, k) => n - 1 - k)
      };

      if (array[j] > array[j + 1]) {
        // 交換
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        yield {
          array: [...array],
          comparing: [],
          swapping: [j, j + 1],
          sorted: Array.from({ length: n - i }, (_, k) => n - 1 - k)
        };
      }
    }
  }

  // 最終状態
  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i)
  };
}
