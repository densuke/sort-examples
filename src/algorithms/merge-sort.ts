/**
 * マージソート実装
 */

import type { SortStep } from './types';

/**
 * マージソートのジェネレータ実装
 *
 * @param arr ソート対象の配列
 * @returns ソートステップのジェネレータ
 */
export function* mergeSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const sorted = new Set<number>();

  function* mergeSortHelper(left: number, right: number): Generator<SortStep> {
    if (left >= right) {
      return;
    }

    const mid = Math.floor((left + right) / 2);
    yield* mergeSortHelper(left, mid);
    yield* mergeSortHelper(mid + 1, right);
    yield* merge(left, mid, right);
  }

  function* merge(left: number, mid: number, right: number): Generator<SortStep> {
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);

    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      yield {
        array: [...array],
        comparing: [left + i, mid + 1 + j],
        swapping: [],
        sorted: Array.from(sorted)
      };

      if (leftArr[i] <= rightArr[j]) {
        array[k] = leftArr[i];
        i++;
      } else {
        array[k] = rightArr[j];
        j++;
      }

      yield {
        array: [...array],
        comparing: [],
        swapping: [k],
        sorted: Array.from(sorted)
      };

      k++;
    }

    while (i < leftArr.length) {
      array[k] = leftArr[i];
      yield {
        array: [...array],
        comparing: [],
        swapping: [k],
        sorted: Array.from(sorted)
      };
      i++;
      k++;
    }

    while (j < rightArr.length) {
      array[k] = rightArr[j];
      yield {
        array: [...array],
        comparing: [],
        swapping: [k],
        sorted: Array.from(sorted)
      };
      j++;
      k++;
    }

    // マージ完了後、この範囲をソート済みとしてマーク
    if (right - left + 1 === array.length) {
      for (let idx = left; idx <= right; idx++) {
        sorted.add(idx);
      }
    }
  }

  yield* mergeSortHelper(0, array.length - 1);

  // 最終状態
  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: array.length }, (_, i) => i)
  };
}
