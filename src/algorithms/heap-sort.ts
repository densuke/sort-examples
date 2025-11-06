/**
 * ヒープソート実装
 */

import type { SortStep } from './types';

/**
 * ヒープソートのジェネレータ実装
 *
 * @param arr ソート対象の配列
 * @returns ソートステップのジェネレータ
 */
export function* heapSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const n = array.length;
  const sorted = new Set<number>();

  function* heapify(size: number, i: number): Generator<SortStep> {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < size) {
      yield {
        array: [...array],
        comparing: [largest, left],
        swapping: [],
        sorted: Array.from(sorted)
      };

      if (array[left] > array[largest]) {
        largest = left;
      }
    }

    if (right < size) {
      yield {
        array: [...array],
        comparing: [largest, right],
        swapping: [],
        sorted: Array.from(sorted)
      };

      if (array[right] > array[largest]) {
        largest = right;
      }
    }

    if (largest !== i) {
      [array[i], array[largest]] = [array[largest], array[i]];
      yield {
        array: [...array],
        comparing: [],
        swapping: [i, largest],
        sorted: Array.from(sorted)
      };

      yield* heapify(size, largest);
    }
  }

  // ヒープを構築
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(n, i);
  }

  // ヒープから要素を取り出す
  for (let i = n - 1; i > 0; i--) {
    [array[0], array[i]] = [array[i], array[0]];
    yield {
      array: [...array],
      comparing: [],
      swapping: [0, i],
      sorted: Array.from(sorted)
    };

    sorted.add(i);
    yield* heapify(i, 0);
  }

  sorted.add(0);

  // 最終状態
  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i)
  };
}
