import type { SortStep } from './types';

export function* countingSort(arr: number[]): Generator<SortStep> {
    const n = arr.length;
    if (n === 0) {
        yield {
            array: [],
            comparing: [],
            swapping: [],
            sorted: []
        };
        return;
    }

    const array = [...arr];
    const max = Math.max(...array);
    const counts = new Array(max + 1).fill(0);

    for (let i = 0; i < n; i++) {
        counts[array[i]]++;
        yield {
            array: [...array],
            comparing: [i],
            swapping: [],
            sorted: []
        };
    }

    for (let i = 1; i < counts.length; i++) {
        counts[i] += counts[i - 1];
    }

    const original = [...array];

    for (let i = n - 1; i >= 0; i--) {
        const value = original[i];
        const position = counts[value] - 1;
        counts[value]--;
        array[position] = value;

        yield {
            array: [...array],
            comparing: [],
            swapping: [position],
            sorted: []
        };
    }

    yield {
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i)
    };
}
