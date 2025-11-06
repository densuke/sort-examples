/**
 * 基数ソート(MSD: Most Significant Digit)実装
 * 最上位桁から順にソート
 */

import type { SortStep } from './types';

/**
 * 基数ソート(MSD版)のジェネレータ実装
 *
 * @param arr ソート対象の配列
 * @param radix 基数(デフォルト: 10)
 * @returns ソートステップのジェネレータ
 */
export function* radixSortMSD(arr: number[], radix: number = 10): Generator<SortStep> {
  const array = [...arr];
  const n = array.length;

  if (n <= 1) {
    yield {
      array: [...array],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, i) => i)
    };
    return;
  }

  // 最大値を取得して最大桁数を計算
  const max = Math.max(...array);
  let maxExp = 1;
  let temp = max;
  while (temp >= radix) {
    maxExp *= radix;
    temp = Math.floor(temp / radix);
  }

  /**
   * MSDソートのヘルパー関数
   */
  function* msdHelper(low: number, high: number, exp: number): Generator<SortStep> {
    if (low >= high || exp < 1) {
      return;
    }

    // バケット配列を作成
    const buckets: number[][] = Array.from({ length: radix }, () => []);
    const bucketIndices: number[][] = Array.from({ length: radix }, () => []);

    // 各要素をバケットに分配
    for (let i = low; i <= high; i++) {
      const digit = Math.floor(array[i] / exp) % radix;
      buckets[digit].push(array[i]);
      bucketIndices[digit].push(i);

      // 比較中(現在の桁を見ている要素)
      yield {
        array: [...array],
        comparing: [i],
        swapping: [],
        sorted: []
      };
    }

    // バケットから要素を取り出して配列に戻す
    let idx = low;
    const swappingIndices: number[] = [];
    const bucketRanges: { start: number; end: number }[] = [];

    for (let i = 0; i < radix; i++) {
      const start = idx;
      for (let j = 0; j < buckets[i].length; j++) {
        if (array[idx] !== buckets[i][j]) {
          swappingIndices.push(idx);
        }
        array[idx] = buckets[i][j];
        idx++;
      }
      const end = idx - 1;

      if (start <= end) {
        bucketRanges.push({ start, end });
      }
    }

    // 交換を表示
    if (swappingIndices.length > 0) {
      yield {
        array: [...array],
        comparing: [],
        swapping: swappingIndices,
        sorted: []
      };
    }

    // 再帰的に各バケットをソート
    const nextExp = Math.floor(exp / radix);
    for (const range of bucketRanges) {
      if (range.start < range.end) {
        yield* msdHelper(range.start, range.end, nextExp);
      }
    }
  }

  yield* msdHelper(0, n - 1, maxExp);

  // 最終状態
  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i)
  };
}
