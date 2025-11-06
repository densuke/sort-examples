/**
 * スプレッドソート (Spread Sort) 実装
 * 整数特化の高速ソート、基数ソートの改良版
 * Boost C++ライブラリで採用されているアルゴリズム
 */

import type { SortStep } from './types';

/**
 * スプレッドソートのジェネレータ実装
 *
 * @param arr ソート対象の配列
 * @returns ソートステップのジェネレータ
 */
export function* spreadSort(arr: number[]): Generator<SortStep> {
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

    for (let idx = left; idx <= right; idx++) {
      sorted.add(idx);
    }
  }

  /**
   * 最大値と最小値を見つける
   */
  function findMinMax(left: number, right: number): { min: number; max: number } {
    let min = array[left];
    let max = array[left];

    for (let i = left + 1; i <= right; i++) {
      if (array[i] < min) min = array[i];
      if (array[i] > max) max = array[i];
    }

    return { min, max };
  }

  /**
   * 有効ビット数を計算
   */
  function getSignificantBits(value: number): number {
    if (value === 0) return 1;
    return Math.floor(Math.log2(Math.abs(value))) + 1;
  }

  /**
   * スプレッドソートのメイン処理
   */
  function* spreadSortHelper(left: number, right: number, shift: number): Generator<SortStep> {
    const size = right - left + 1;

    // 小さい範囲は挿入ソート
    if (size <= 16) {
      yield* insertionSort(left, right);
      return;
    }

    const { min, max } = findMinMax(left, right);
    const range = max - min;

    // 範囲が小さい場合は挿入ソート
    if (range < size) {
      yield* insertionSort(left, right);
      return;
    }

    // バケット数を決定 (範囲に基づいて適応的に)
    const bucketCount = Math.min(256, Math.max(2, Math.floor(Math.sqrt(size))));
    const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

    // シフト量を計算
    const bucketShift = Math.max(0, getSignificantBits(range) - Math.floor(Math.log2(bucketCount)));

    // 要素をバケットに分配
    for (let i = left; i <= right; i++) {
      const bucketIndex = Math.min(
        bucketCount - 1,
        Math.floor((array[i] - min) >> bucketShift)
      );
      buckets[bucketIndex].push(i);

      yield {
        array: [...array],
        comparing: [i],
        swapping: [],
        sorted: getSortedSnapshot()
      };
    }

    // バケット内をソートして書き戻し
    let writePos = left;
    for (let bucketIdx = 0; bucketIdx < bucketCount; bucketIdx++) {
      const bucket = buckets[bucketIdx];
      if (bucket.length === 0) continue;

      // バケット内の値を一時配列に格納
      const bucketValues = bucket.map(idx => array[idx]);

      // バケット内が小さい場合は挿入ソート
      if (bucket.length <= 16) {
        bucketValues.sort((a, b) => a - b);
      } else {
        // 再帰的にスプレッドソート
        const tempArray = [...array];
        let tempLeft = writePos;
        for (let i = 0; i < bucket.length; i++) {
          array[tempLeft + i] = bucketValues[i];
        }

        yield* spreadSortHelper(tempLeft, tempLeft + bucket.length - 1, bucketShift);

        bucketValues.length = 0;
        for (let i = 0; i < bucket.length; i++) {
          bucketValues.push(array[tempLeft + i]);
        }
      }

      // ソート済みの値を書き戻し
      for (let i = 0; i < bucketValues.length; i++) {
        if (array[writePos] !== bucketValues[i]) {
          array[writePos] = bucketValues[i];
          yield {
            array: [...array],
            comparing: [],
            swapping: [writePos],
            sorted: getSortedSnapshot()
          };
        }
        writePos++;
      }
    }

    // この範囲をソート済みとしてマーク
    for (let i = left; i <= right; i++) {
      sorted.add(i);
    }
  }

  /**
   * 負の数を含む場合の処理
   */
  function* handleNegatives(): Generator<SortStep> {
    // 負の数と正の数を分離
    const negatives: number[] = [];
    const positives: number[] = [];
    const negativeIndices: number[] = [];
    const positiveIndices: number[] = [];

    for (let i = 0; i < n; i++) {
      if (array[i] < 0) {
        negatives.push(array[i]);
        negativeIndices.push(i);
      } else {
        positives.push(array[i]);
        positiveIndices.push(i);
      }
    }

    // 負の数をソート (絶対値でソートして逆順)
    if (negatives.length > 0) {
      const negStart = 0;
      const negEnd = negatives.length - 1;

      // 一時的に配列を更新
      for (let i = 0; i < negatives.length; i++) {
        array[i] = -negatives[i]; // 正の数として扱う
      }

      yield* spreadSortHelper(negStart, negEnd, 0);

      // 符号を戻して逆順に
      const sortedNeg: number[] = [];
      for (let i = negEnd; i >= negStart; i--) {
        sortedNeg.push(-array[i]);
      }

      for (let i = 0; i < sortedNeg.length; i++) {
        array[i] = sortedNeg[i];
        yield {
          array: [...array],
          comparing: [],
          swapping: [i],
          sorted: getSortedSnapshot()
        };
      }
    }

    // 正の数をソート
    if (positives.length > 0) {
      const posStart = negatives.length;
      const posEnd = n - 1;

      for (let i = 0; i < positives.length; i++) {
        array[posStart + i] = positives[i];
      }

      yield* spreadSortHelper(posStart, posEnd, 0);
    }
  }

  if (n > 1) {
    // 負の数があるかチェック
    const hasNegative = array.some(x => x < 0);

    if (hasNegative) {
      yield* handleNegatives();
    } else {
      yield* spreadSortHelper(0, n - 1, 0);
    }
  } else if (n === 1) {
    sorted.add(0);
  }

  // 最終状態
  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i)
  };
}
