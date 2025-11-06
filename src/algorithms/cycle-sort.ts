import type { SortStep } from './types';

export function* cycleSort(arr: number[]): Generator<SortStep> {
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

    for (let cycleStart = 0; cycleStart <= n - 2; cycleStart++) {
        let item = array[cycleStart];
        let pos = cycleStart;

        for (let i = cycleStart + 1; i < n; i++) {
            yield {
                array: [...array],
                comparing: [i, cycleStart],
                swapping: [],
                sorted: Array.from({ length: cycleStart }, (_, k) => k)
            };

            if (array[i] < item) {
                pos++;
            }
        }

        if (pos === cycleStart) {
            continue;
        }

        while (item === array[pos]) {
            pos++;
        }

        if (pos !== cycleStart) {
            const temp = array[pos];
            array[pos] = item;
            item = temp;
            yield {
                array: [...array],
                comparing: [],
                swapping: [cycleStart, pos],
                sorted: Array.from({ length: cycleStart + 1 }, (_, k) => k)
            };
        }

        while (pos !== cycleStart) {
            pos = cycleStart;

            for (let i = cycleStart + 1; i < n; i++) {
                yield {
                    array: [...array],
                    comparing: [i, cycleStart],
                    swapping: [],
                    sorted: Array.from({ length: cycleStart }, (_, k) => k)
                };

                if (array[i] < item) {
                    pos++;
                }
            }

            while (item === array[pos]) {
                pos++;
            }

            if (array[pos] !== item) {
                const temp = array[pos];
                array[pos] = item;
                item = temp;
                yield {
                    array: [...array],
                    comparing: [],
                    swapping: [cycleStart, pos],
                    sorted: Array.from({ length: cycleStart + 1 }, (_, k) => k)
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
