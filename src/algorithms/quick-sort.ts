/**
 * クイックソート実装
 */

import type { SortStep } from './types';

/**
 * クイックソートのジェネレータ実装
 *
 * @param arr ソート対象の配列
 * @returns ソートステップのジェネレータ
 */
export function* quickSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const sorted = new Set<number>();

  function* quickSortHelper(low: number, high: number): Generator<SortStep> {
    if (low < high) {
      const pivotIndex = yield* partition(low, high);
      sorted.add(pivotIndex);
      yield* quickSortHelper(low, pivotIndex - 1);
      yield* quickSortHelper(pivotIndex + 1, high);
    } else if (low === high) {
      sorted.add(low);
    }
  }

  function getMedianPivotIndex(low: number, high: number): number {
    const mid = Math.floor((low + high) / 2);
    const lowValue = array[low];
    const midValue = array[mid];
    const highValue = array[high];

    if ((lowValue <= midValue && midValue <= highValue) || (highValue <= midValue && midValue <= lowValue)) {
      return mid;
    }

    if ((midValue <= lowValue && lowValue <= highValue) || (highValue <= lowValue && lowValue <= midValue)) {
      return low;
    }

    return high;
  }

  function* partition(low: number, high: number): Generator<SortStep, number> {
    const pivotIndex = getMedianPivotIndex(low, high);

    if (pivotIndex !== high) {
      [array[pivotIndex], array[high]] = [array[high], array[pivotIndex]];
      yield {
        array: [...array],
        comparing: [],
        swapping: [pivotIndex, high],
        sorted: Array.from(sorted)
      };
    }

    const pivot = array[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      // 比較中
      yield {
        array: [...array],
        comparing: [j, high],
        swapping: [],
        sorted: Array.from(sorted)
      };

      if (array[j] < pivot) {
        i++;
        if (i !== j) {
          [array[i], array[j]] = [array[j], array[i]];
          // 交換
          yield {
            array: [...array],
            comparing: [],
            swapping: [i, j],
            sorted: Array.from(sorted)
          };
        }
      }
    }

    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    yield {
      array: [...array],
      comparing: [],
      swapping: [i + 1, high],
      sorted: Array.from(sorted)
    };

    return i + 1;
  }

  yield* quickSortHelper(0, array.length - 1);

  // 最終状態
  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: array.length }, (_, i) => i)
  };
}
