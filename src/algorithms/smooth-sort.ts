import type { SortStep } from './types';

function leonardoNumbersUpTo(limit: number): number[] {
    const numbers = [1, 1];
    while (numbers[numbers.length - 1] < limit) {
        const next = numbers[numbers.length - 1] + numbers[numbers.length - 2] + 1;
        numbers.push(next);
    }
    return numbers;
}

export function* smoothSort(arr: number[]): Generator<SortStep> {
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

    const leonardo = leonardoNumbersUpTo(n);

    const seen = new Set<number>();

    for (let g = leonardo.length - 1; g >= 0; g--) {
        const gap = leonardo[g];
        if (gap <= 0 || gap >= n || seen.has(gap)) {
            continue;
        }
        seen.add(gap);

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
    }

    yield {
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i)
    };
}
