/**
 * 図書館ソート(Library Sort)の簡易実装
 * 二分探索による挿入を可視化する
 */

import type { SortStep } from './types';

function buildSortedIndices(length: number): number[] {
    return Array.from({ length }, (_, i) => i);
}

export function* librarySort(arr: number[]): Generator<SortStep> {
    const working = [...arr];
    const n = working.length;

    if (n <= 1) {
        yield {
            array: [...working],
            comparing: [],
            swapping: [],
            sorted: buildSortedIndices(n)
        };
        return;
    }

    const sorted: number[] = [];

    for (let i = 0; i < n; i++) {
        const value = working[i];
        let left = 0;
        let right = sorted.length;

        // 二分探索で挿入位置を決定
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            const visualArray = [...sorted, ...working.slice(i)];

            yield {
                array: visualArray,
                comparing: [mid, sorted.length],
                swapping: [],
                sorted: buildSortedIndices(sorted.length)
            };

            if ((sorted[mid] ?? Number.NEGATIVE_INFINITY) <= value) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        sorted.splice(left, 0, value);

        const visualAfterInsert = [...sorted, ...working.slice(i + 1)];

        yield {
            array: visualAfterInsert,
            comparing: [],
            swapping: [left],
            sorted: buildSortedIndices(sorted.length)
        };
    }

    yield {
        array: [...sorted],
        comparing: [],
        swapping: [],
        sorted: buildSortedIndices(n)
    };
}
