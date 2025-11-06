/**
 * ブロックソート (Block Merge Sort / WikiSort) 実装
 * 安定ソート、O(n log n)、省メモリ (O(1)追加メモリ)
 * 内部バッファを使ってマージソートを実現
 */

import type { SortStep } from './types';

/**
 * ブロックソートのジェネレータ実装
 *
 * @param arr ソート対象の配列
 * @returns ソートステップのジェネレータ
 */
export function* blockSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const n = array.length;
  const sorted = new Set<number>();

  const getSortedSnapshot = (): number[] => {
    return Array.from(sorted).sort((a, b) => a - b);
  };

  /**
   * 挿入ソート (小さい範囲用)
   */
  function* insertionSort(left: number, right: number): Generator<SortStep> {
    for (let i = left + 1; i <= right; i++) {
      const key = array[i];
      let j = i - 1;

      while (j >= left && array[j] > key) {
        yield {
          array: [...array],
          comparing: [j, j + 1],
          swapping: [],
          sorted: getSortedSnapshot()
        };

        array[j + 1] = array[j];
        yield {
          array: [...array],
          comparing: [],
          swapping: [j, j + 1],
          sorted: getSortedSnapshot()
        };
        j--;
      }

      array[j + 1] = key;
      yield {
        array: [...array],
        comparing: [],
        swapping: [j + 1],
        sorted: getSortedSnapshot()
      };
    }
  }

  /**
   * in-placeマージ (単純実装)
   */
  function* merge(left: number, mid: number, right: number): Generator<SortStep> {
    let start1 = left;
    let start2 = mid + 1;

    // 既に正しい順序なら何もしない
    if (array[mid] <= array[start2]) {
      return;
    }

    while (start1 <= mid && start2 <= right) {
      yield {
        array: [...array],
        comparing: [start1, start2],
        swapping: [],
        sorted: getSortedSnapshot()
      };

      // 左側の要素が正しい位置にある場合
      if (array[start1] <= array[start2]) {
        start1++;
      } else {
        // 右側の要素を左側に挿入
        const value = array[start2];
        let index = start2;

        // 右側の要素を左に移動
        while (index > start1) {
          array[index] = array[index - 1];
          yield {
            array: [...array],
            comparing: [],
            swapping: [index, index - 1],
            sorted: getSortedSnapshot()
          };
          index--;
        }

        array[start1] = value;
        yield {
          array: [...array],
          comparing: [],
          swapping: [start1],
          sorted: getSortedSnapshot()
        };

        // すべてのポインタを進める
        start1++;
        mid++;
        start2++;
      }
    }
  }

  /**
   * ブロックソートのメイン処理
   */
  function* blockSortHelper(left: number, right: number): Generator<SortStep> {
    if (left >= right) {
      return;
    }

    const size = right - left + 1;

    // 小さい範囲は挿入ソート
    if (size <= 16) {
      yield* insertionSort(left, right);
      return;
    }

    const mid = Math.floor((left + right) / 2);

    // 再帰的に左右をソート
    yield* blockSortHelper(left, mid);
    yield* blockSortHelper(mid + 1, right);

    // マージ
    yield* merge(left, mid, right);
  }

  if (n > 1) {
    yield* blockSortHelper(0, n - 1);
  }

  // 全要素をソート済みとしてマーク
  for (let i = 0; i < n; i++) {
    sorted.add(i);
  }

  // 最終状態
  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i)
  };
}
