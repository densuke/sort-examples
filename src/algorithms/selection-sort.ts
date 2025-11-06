import type { SortStep } from './types';

export function* selectionSort(arr: number[]): Generator<SortStep> {
    const array = [...arr];
    const n = array.length;

    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;

        for (let j = i + 1; j < n; j++) {
            yield {
                array: [...array],
                comparing: [minIndex, j],
                swapping: [],
                sorted: Array.from({ length: i }, (_, k) => k)
            };

            if (array[j] < array[minIndex]) {
                minIndex = j;
            }
        }

        if (minIndex !== i) {
            [array[i], array[minIndex]] = [array[minIndex], array[i]];
            yield {
                array: [...array],
                comparing: [],
                swapping: [i, minIndex],
                sorted: Array.from({ length: i + 1 }, (_, k) => k)
            };
        } else {
            yield {
                array: [...array],
                comparing: [],
                swapping: [],
                sorted: Array.from({ length: i + 1 }, (_, k) => k)
            };
        }
    }

    yield {
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i)
    };
}
