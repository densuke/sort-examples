/**
 * ソートアルゴリズムの共通型定義
 */

/**
 * ソート操作の状態を表す型
 */
export interface SortStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
}

/**
 * ソートアルゴリズムのジェネレータ型
 */
export type SortGenerator = Generator<SortStep> | AsyncGenerator<SortStep>;

/**
 * ソートアルゴリズムの関数型
 */
export type SortAlgorithm = (arr: number[]) => SortGenerator;
