import type { SortStep } from './types';

export function* bucketSort(arr: number[]): Generator<SortStep> {
    const array = [...arr];
    const n = array.length;
    if (n === 0) {
        yield {
            array: [],
            comparing: [],
            swapping: [],
            sorted: []
        };
        return;
    }

    const min = Math.min(...array);
    const max = Math.max(...array);
    const range = max - min || 1;
    const bucketCount = Math.max(1, Math.floor(Math.sqrt(n)));
    const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

    for (let i = 0; i < n; i++) {
        const value = array[i];
        const index = Math.min(bucketCount - 1, Math.floor(((value - min) / range) * bucketCount));
        buckets[index].push(value);
        yield {
            array: [...array],
            comparing: [i],
            swapping: [],
            sorted: []
        };
    }

    for (const bucket of buckets) {
        for (let i = 1; i < bucket.length; i++) {
            const key = bucket[i];
            let j = i - 1;
            while (j >= 0 && bucket[j] > key) {
                bucket[j + 1] = bucket[j];
                j--;
            }
            bucket[j + 1] = key;
        }
    }

    let idx = 0;
    for (const bucket of buckets) {
        for (const value of bucket) {
            array[idx] = value;
            yield {
                array: [...array],
                comparing: [],
                swapping: [idx],
                sorted: []
            };
            idx++;
        }
    }

    yield {
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i)
    };
}
