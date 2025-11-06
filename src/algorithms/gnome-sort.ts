import type { SortStep } from './types';

export function* gnomeSort(arr: number[]): Generator<SortStep> {
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

    let index = 1;

    while (index < n) {
        yield {
            array: [...array],
            comparing: [index - 1, index],
            swapping: [],
            sorted: []
        };

        if (array[index - 1] <= array[index]) {
            index++;
        } else {
            [array[index], array[index - 1]] = [array[index - 1], array[index]];
            yield {
                array: [...array],
                comparing: [],
                swapping: [index - 1, index],
                sorted: []
            };

            if (index > 1) {
                index--;
            } else {
                index = 1;
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
