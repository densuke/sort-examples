import type { SortStep } from './types';

export function* pancakeSort(arr: number[]): Generator<SortStep> {
    const array = [...arr];
    const n = array.length;
    const sorted = new Set<number>();

    if (n <= 1) {
        yield {
            array: [...array],
            comparing: [],
            swapping: [],
            sorted: Array.from({ length: n }, (_, i) => i)
        };
        return;
    }

    const sortedSnapshot = (): number[] => Array.from(sorted).sort((a, b) => a - b);

    const flip = function* (end: number): Generator<SortStep> {
        for (let i = 0; i < Math.floor((end + 1) / 2); i++) {
            const j = end - i;
            [array[i], array[j]] = [array[j], array[i]];
            yield {
                array: [...array],
                comparing: [],
                swapping: [i, j],
                sorted: sortedSnapshot()
            };
        }
    };

    for (let currSize = n; currSize > 1; currSize--) {
        let maxIndex = 0;
        for (let i = 1; i < currSize; i++) {
            yield {
                array: [...array],
                comparing: [i, maxIndex],
                swapping: [],
                sorted: sortedSnapshot()
            };
            if (array[i] > array[maxIndex]) {
                maxIndex = i;
            }
        }

        if (maxIndex !== currSize - 1) {
            if (maxIndex > 0) {
                yield* flip(maxIndex);
            }
            yield* flip(currSize - 1);
        }

        sorted.add(currSize - 1);
    }

    sorted.add(0);

    yield {
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i)
    };
}
