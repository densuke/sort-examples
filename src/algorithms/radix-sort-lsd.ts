/**
 * 基数ソート(LSD: Least Significant Digit)実装
 * 最下位桁から順にソート
 */

import type { SortStep } from './types';

/**
 * 基数ソート(LSD版)のジェネレータ実装
 *
 * @param arr ソート対象の配列
 * @param radix 基数(デフォルト: 10)
 * @returns ソートステップのジェネレータ
 */
export function* radixSortLSD(arr: number[], radix: number = 10): Generator<SortStep> {
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

  // 最大値を取得
  const max = Math.max(...array);

  // 桁数を計算
  let exp = 1;
  while (Math.floor(max / exp) >= 1) {
    // バケット配列を作成
    const buckets: number[][] = Array.from({ length: radix }, () => []);
    const bucketIndices: number[][] = Array.from({ length: radix }, () => []);

    // 各要素をバケットに分配
    for (let i = 0; i < n; i++) {
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
    let idx = 0;
    const swappingIndices: number[] = [];

    for (let i = 0; i < radix; i++) {
      for (let j = 0; j < buckets[i].length; j++) {
        if (array[idx] !== buckets[i][j]) {
          swappingIndices.push(idx);
        }
        array[idx] = buckets[i][j];
        idx++;
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

    exp *= radix;
  }

  // 最終状態
  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i)
  };
}
