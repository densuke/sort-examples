import type { SortStep } from './types';

export function* sleepSort(arr: number[]): Generator<SortStep> {
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

    const schedule = new Map<number, number[]>();

    for (let i = 0; i < n; i++) {
        const value = array[i];
        const bucket = schedule.get(value) ?? [];
        bucket.push(value);
        schedule.set(value, bucket);

        yield {
            array: [...array],
            comparing: [i],
            swapping: [],
            sorted: []
        };
    }

    const sortedIndices = new Set<number>();
    const orderedKeys = Array.from(schedule.keys()).sort((a, b) => a - b);
    let write = 0;

    for (const key of orderedKeys) {
        const bucket = schedule.get(key);
        if (!bucket) continue;

        for (const value of bucket) {
            array[write] = value;
            sortedIndices.add(write);

            yield {
                array: [...array],
                comparing: [],
                swapping: [write],
                sorted: Array.from(sortedIndices).sort((a, b) => a - b)
            };

            write++;
        }
    }

    yield {
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i)
    };
}
