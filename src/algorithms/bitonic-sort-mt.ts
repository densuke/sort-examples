/**
 * バイトニックソート(マルチスレッド版)実装
 */

import type { SortStep } from './types';

/**
 * バイトニックソート(マルチスレッド版)のジェネレータ実装
 * 通常版と同じだが並列処理のシミュレーション(比較を複数同時表示)
 *
 * @param arr ソート対象の配列
 * @returns ソートステップの非同期ジェネレータ
 */
export async function* bitonicSortMultiThread(arr: number[]): AsyncGenerator<SortStep> {
  const array = [...arr];
  const n = array.length;

  // 2のべき乗に調整
  let size = 1;
  while (size < n) {
    size *= 2;
  }

  const maxVal = Math.max(...array) + 1;
  while (array.length < size) {
    array.push(maxVal);
  }

  /**
   * バイトニックマージ(並列版)
   */
  async function* bitonicMerge(low: number, count: number, dir: boolean): AsyncGenerator<SortStep> {
    if (count > 1) {
      const k = Math.floor(count / 2);

      // 並列比較をシミュレート: 複数ペアを同時に比較
      const comparingPairs: number[] = [];
      const swappingPairs: number[] = [];

      for (let i = low; i < low + k; i++) {
        if (i + k < array.length) {
          comparingPairs.push(i, i + k);
        }
      }

      // 比較フェーズ
      if (comparingPairs.length > 0) {
        yield {
          array: [...array],
          comparing: comparingPairs,
          swapping: [],
          sorted: []
        };
      }

      // 交換フェーズ
      for (let i = low; i < low + k; i++) {
        if (i + k < array.length) {
          const shouldSwap = dir ? array[i] > array[i + k] : array[i] < array[i + k];
          if (shouldSwap) {
            [array[i], array[i + k]] = [array[i + k], array[i]];
            swappingPairs.push(i, i + k);
          }
        }
      }

      if (swappingPairs.length > 0) {
        yield {
          array: [...array],
          comparing: [],
          swapping: swappingPairs,
          sorted: []
        };
      }

      // 再帰的にマージ
      yield* bitonicMerge(low, k, dir);
      yield* bitonicMerge(low + k, k, dir);
    }
  }

  /**
   * バイトニックソートヘルパー
   */
  async function* bitonicSortHelper(low: number, count: number, dir: boolean): AsyncGenerator<SortStep> {
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
