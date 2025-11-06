/**
 * 基数ソート(基数2/バイナリ版)実装
 * ビット単位でソート
 */

import type { SortStep } from './types';

/**
 * 基数ソート(基数2版)のジェネレータ実装
 *
 * @param arr ソート対象の配列
 * @returns ソートステップのジェネレータ
 */
export function* radixSortBinary(arr: number[]): Generator<SortStep> {
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

  // 最大値を取得してビット数を計算
  const max = Math.max(...array);
  const maxBits = max > 0 ? Math.floor(Math.log2(max)) + 1 : 1;

  console.log('[Radix Binary] Initial array (first 10):', array.slice(0, 10));
  console.log('[Radix Binary] Max value:', max, 'Max in binary:', max.toString(2), 'Bits needed:', maxBits);
  console.log('[Radix Binary] Will process bits from 0 to', maxBits - 1);

  // 各ビット位置でソート
  for (let bit = 0; bit < maxBits; bit++) {
    console.log(`[Radix Binary] Processing bit ${bit}...`);
    const mask = 1 << bit;

    // 0と1のバケット
    const bucket0: number[] = [];
    const bucket1: number[] = [];
    const indices0: number[] = [];
    const indices1: number[] = [];

    // 各要素をビット値に応じて分配
    for (let i = 0; i < n; i++) {
      const bitValue = (array[i] & mask) !== 0 ? 1 : 0;

      // 比較中(現在のビットを見ている要素)
      yield {
        array: [...array],
        comparing: [i],
        swapping: [],
        sorted: []
      };

      if (bitValue === 0) {
        bucket0.push(array[i]);
        indices0.push(i);
      } else {
        bucket1.push(array[i]);
        indices1.push(i);
      }
    }

    // バケットから要素を取り出して配列に戻す
    let idx = 0;
    const swappingIndices: number[] = [];

    // 0のバケット
    for (let i = 0; i < bucket0.length; i++) {
      if (array[idx] !== bucket0[i]) {
        swappingIndices.push(idx);
      }
      array[idx] = bucket0[i];
      idx++;
    }

    // 1のバケット
    for (let i = 0; i < bucket1.length; i++) {
      if (array[idx] !== bucket1[i]) {
        swappingIndices.push(idx);
      }
      array[idx] = bucket1[i];
      idx++;
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

    console.log(`[Radix Binary] After bit ${bit}: (first 10)`, array.slice(0, 10));
  }

  // 最終結果の検証
  const isSorted = array.every((val, i) => i === 0 || array[i - 1] <= val);
  console.log('[Radix Binary] Final array (first 10):', array.slice(0, 10));
  console.log('[Radix Binary] Final array (last 10):', array.slice(-10));
  console.log('[Radix Binary] Array length:', array.length, 'Expected:', n);
  console.log('[Radix Binary] Is sorted:', isSorted);
  if (!isSorted) {
    console.error('[Radix Binary] SORT FAILED! Array is not sorted');
    // 最初の不整合を見つける
    for (let i = 1; i < n; i++) {
      if (array[i - 1] > array[i]) {
        console.error(`[Radix Binary] First mismatch at index ${i}: ${array[i - 1]} > ${array[i]}`);
        break;
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
