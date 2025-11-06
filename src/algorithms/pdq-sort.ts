/**
 * PDQソート (Pattern-Defeating Quicksort) 実装
 * Rustのstd::sortで採用されているアルゴリズム
 * Introsortの改良版で、最悪ケースのパターンを検出して回避する
 */

import type { SortStep } from './types';

/**
 * PDQソートのジェネレータ実装
 *
 * @param arr ソート対象の配列
 * @returns ソートステップのジェネレータ
 */
export function* pdqSort(arr: number[]): Generator<SortStep> {
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
   * ヒープソート (最悪ケース回避用)
   */
  function* heapSort(left: number, right: number): Generator<SortStep> {
    const size = right - left + 1;

    function* heapify(size: number, root: number): Generator<SortStep> {
      let largest = root;
      const leftChild = 2 * root + 1;
      const rightChild = 2 * root + 2;

      if (leftChild < size && array[left + leftChild] > array[left + largest]) {
        yield {
          array: [...array],
          comparing: [left + leftChild, left + largest],
          swapping: [],
          sorted: getSortedSnapshot()
        };
        largest = leftChild;
      }

      if (rightChild < size && array[left + rightChild] > array[left + largest]) {
        yield {
          array: [...array],
          comparing: [left + rightChild, left + largest],
          swapping: [],
          sorted: getSortedSnapshot()
        };
        largest = rightChild;
      }

      if (largest !== root) {
        [array[left + root], array[left + largest]] = [array[left + largest], array[left + root]];
        yield {
          array: [...array],
          comparing: [],
          swapping: [left + root, left + largest],
          sorted: getSortedSnapshot()
        };
        yield* heapify(size, largest);
      }
    }

    for (let i = Math.floor(size / 2) - 1; i >= 0; i--) {
      yield* heapify(size, i);
    }

    for (let i = size - 1; i > 0; i--) {
      [array[left], array[left + i]] = [array[left + i], array[left]];
      sorted.add(left + i);
      yield {
        array: [...array],
        comparing: [],
        swapping: [left, left + i],
        sorted: getSortedSnapshot()
      };
      yield* heapify(i, 0);
    }

    sorted.add(left);
  }

  /**
   * パターン検出: 既にソート済みかどうか確認
   */
  function isSorted(left: number, right: number): boolean {
    for (let i = left; i < right; i++) {
      if (array[i] > array[i + 1]) {
        return false;
      }
    }
    return true;
  }

  /**
   * パターン検出: 逆順にソートされているかチェック
   */
  function isReverseSorted(left: number, right: number): boolean {
    for (let i = left; i < right; i++) {
      if (array[i] < array[i + 1]) {
        return false;
      }
    }
    return true;
  }

  /**
   * 3つの中央値をピボットとして選択
   */
  function median3(a: number, b: number, c: number): number {
    if (array[a] < array[b]) {
      if (array[b] < array[c]) return b;
      if (array[a] < array[c]) return c;
      return a;
    } else {
      if (array[a] < array[c]) return a;
      if (array[b] < array[c]) return c;
      return b;
    }
  }

  /**
   * パーティション処理 (Hoareのパーティション)
   */
  function* partition(left: number, right: number): Generator<SortStep, number> {
    const mid = Math.floor((left + right) / 2);
    const pivotIndex = median3(left, mid, right);
    const pivot = array[pivotIndex];

    // ピボットを右端に移動
    [array[pivotIndex], array[right]] = [array[right], array[pivotIndex]];
    yield {
      array: [...array],
      comparing: [],
      swapping: [pivotIndex, right],
      sorted: getSortedSnapshot()
    };

    let i = left - 1;
    for (let j = left; j < right; j++) {
      yield {
        array: [...array],
        comparing: [j, right],
        swapping: [],
        sorted: getSortedSnapshot()
      };

      if (array[j] <= pivot) {
        i++;
        if (i !== j) {
          [array[i], array[j]] = [array[j], array[i]];
          yield {
            array: [...array],
            comparing: [],
            swapping: [i, j],
            sorted: getSortedSnapshot()
          };
        }
      }
    }

    [array[i + 1], array[right]] = [array[right], array[i + 1]];
    yield {
      array: [...array],
      comparing: [],
      swapping: [i + 1, right],
      sorted: getSortedSnapshot()
    };

    return i + 1;
  }

  /**
   * PDQソートのメイン処理
   */
  function* pdqSortHelper(left: number, right: number, badAllowed: number): Generator<SortStep> {
    const size = right - left + 1;

    // 小さい範囲は挿入ソート
    if (size <= 16) {
      yield* insertionSort(left, right);
      return;
    }

    // 既にソート済みの検出
    if (isSorted(left, right)) {
      for (let i = left; i <= right; i++) {
        sorted.add(i);
      }
      return;
    }

    // 逆順の検出と反転
    if (isReverseSorted(left, right)) {
      let l = left, r = right;
      while (l < r) {
        [array[l], array[r]] = [array[r], array[l]];
        yield {
          array: [...array],
          comparing: [],
          swapping: [l, r],
          sorted: getSortedSnapshot()
        };
        l++;
        r--;
      }
      for (let i = left; i <= right; i++) {
        sorted.add(i);
      }
      return;
    }

    // パターン検出の悪化カウンタが0の場合はヒープソートに切り替え
    if (badAllowed === 0) {
      yield* heapSort(left, right);
      return;
    }

    const pivotIndex = yield* partition(left, right);
    sorted.add(pivotIndex);

    // 左右のサイズをチェックして不均衡を検出
    const leftSize = pivotIndex - left;
    const rightSize = right - pivotIndex;
    const imbalanced = leftSize < size / 8 || rightSize < size / 8;

    yield* pdqSortHelper(left, pivotIndex - 1, imbalanced ? badAllowed - 1 : badAllowed);
    yield* pdqSortHelper(pivotIndex + 1, right, imbalanced ? badAllowed - 1 : badAllowed);
  }

  if (n > 1) {
    // 最悪ケース検出のための初期値 (log2(n))
    const badAllowed = Math.floor(Math.log2(n));
    yield* pdqSortHelper(0, n - 1, badAllowed);
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
