/**
 * 基数ソート(基数16/16進数版)実装
 * 4ビット(ニブル)単位でソート
 */

import type { SortStep } from './types';

/**
 * 基数ソート(基数16版)のジェネレータ実装
 *
 * @param arr ソート対象の配列
 * @returns ソートステップのジェネレータ
 */
export function* radixSortHex(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const n = array.length;
  const radix = 16;

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

  // 4ビット(ニブル)ずつ処理
  let exp = 1;
  while (Math.floor(max / exp) >= 1) {
    // バケット配列を作成(0x0～0xF)
    const buckets: number[][] = Array.from({ length: radix }, () => []);
    const bucketIndices: number[][] = Array.from({ length: radix }, () => []);

    // 各要素をバケットに分配
    for (let i = 0; i < n; i++) {
      const digit = Math.floor(array[i] / exp) % radix;
      buckets[digit].push(array[i]);
      bucketIndices[digit].push(i);

      // 比較中(現在のニブルを見ている要素)
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
