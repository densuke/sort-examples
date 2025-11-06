import type { SortStep } from './types';

export function* shellSort(arr: number[]): Generator<SortStep> {
    const array = [...arr];
    const n = array.length;

    let gap = Math.floor(n / 2);
    while (gap > 0) {
        for (let i = gap; i < n; i++) {
            const temp = array[i];
            let j = i;

            while (j >= gap && array[j - gap] > temp) {
                yield {
                    array: [...array],
                    comparing: [j - gap, j],
                    swapping: [],
                    sorted: []
                };

                array[j] = array[j - gap];
                yield {
                    array: [...array],
                    comparing: [],
                    swapping: [j - gap, j],
                    sorted: []
                };

                j -= gap;
            }

            if (array[j] !== temp) {
                array[j] = temp;
                yield {
                    array: [...array],
                    comparing: [],
                    swapping: [j],
                    sorted: []
                };
            }
        }

        gap = Math.floor(gap / 2);
    }

    yield {
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i)
    };
}
