import type { SortStep } from './types';

export function* cocktailShakerSort(arr: number[]): Generator<SortStep> {
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

    let start = 0;
    let end = n - 1;
    let swapped = true;

    while (swapped) {
        swapped = false;

        for (let i = start; i < end; i++) {
            yield {
                array: [...array],
                comparing: [i, i + 1],
                swapping: [],
                sorted: []
            };

            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                swapped = true;
                yield {
                    array: [...array],
                    comparing: [],
                    swapping: [i, i + 1],
                    sorted: []
                };
            }
        }

        if (!swapped) {
            break;
        }

        swapped = false;
        end--;

        for (let i = end - 1; i >= start; i--) {
            yield {
                array: [...array],
                comparing: [i, i + 1],
                swapping: [],
                sorted: []
            };

            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                swapped = true;
                yield {
                    array: [...array],
                    comparing: [],
                    swapping: [i, i + 1],
                    sorted: []
                };
            }
        }

        start++;
    }

    yield {
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i)
    };
}
