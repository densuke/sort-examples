import type { SortStep } from './types';

export function* insertionSort(arr: number[]): Generator<SortStep> {
    const array = [...arr];
    const n = array.length;

    for (let i = 1; i < n; i++) {
        const key = array[i];
        let j = i - 1;

        while (j >= 0 && array[j] > key) {
            yield {
                array: [...array],
                comparing: [j, j + 1],
                swapping: [],
                sorted: Array.from({ length: i }, (_, k) => k)
            };

            array[j + 1] = array[j];
            yield {
                array: [...array],
                comparing: [],
                swapping: [j, j + 1],
                sorted: Array.from({ length: i }, (_, k) => k)
            };
            j--;
        }

        if (array[j + 1] !== key) {
            array[j + 1] = key;
            yield {
                array: [...array],
                comparing: [],
                swapping: [j + 1],
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
