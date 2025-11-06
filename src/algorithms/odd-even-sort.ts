import type { SortStep } from './types';

/**
 * 奇偶転置ソート(Odd-even sort)
 * 偶数番目のペアと奇数番目のペアを交互に比較して整列する
 */
export function* oddEvenSort(arr: number[]): Generator<SortStep> {
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

    let sorted = false;

    while (!sorted) {
        sorted = true;

        for (let i = 0; i <= n - 2; i += 2) {
            yield {
                array: [...array],
                comparing: [i, i + 1],
                swapping: [],
                sorted: []
            };

            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                sorted = false;
                yield {
                    array: [...array],
                    comparing: [],
                    swapping: [i, i + 1],
                    sorted: []
                };
            }
        }

        for (let i = 1; i <= n - 2; i += 2) {
            yield {
                array: [...array],
                comparing: [i, i + 1],
                swapping: [],
                sorted: []
            };

            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                sorted = false;
                yield {
                    array: [...array],
                    comparing: [],
                    swapping: [i, i + 1],
                    sorted: []
                };
            }
        }
    }

    yield {
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i)
    };
}
