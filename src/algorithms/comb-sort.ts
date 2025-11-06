import type { SortStep } from './types';

export function* combSort(arr: number[]): Generator<SortStep> {
    const array = [...arr];
    const n = array.length;
    const shrink = 1.3;
    let gap = n;
    let swapped = true;

    while (gap > 1 || swapped) {
        gap = Math.floor(gap / shrink);
        if (gap < 1) {
            gap = 1;
        }

        swapped = false;

        for (let i = 0; i + gap < n; i++) {
            const j = i + gap;

            yield {
                array: [...array],
                comparing: [i, j],
                swapping: [],
                sorted: []
            };

            if (array[i] > array[j]) {
                [array[i], array[j]] = [array[j], array[i]];
                swapped = true;
                yield {
                    array: [...array],
                    comparing: [],
                    swapping: [i, j],
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
