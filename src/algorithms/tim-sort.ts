import type { SortStep } from './types';

const MIN_RUN = 32;

function calcMinRun(n: number): number {
    let r = 0;
    while (n >= MIN_RUN) {
        r |= n & 1;
        n >>= 1;
    }
    return n + r;
}

export function* timSort(arr: number[]): Generator<SortStep> {
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

    const runs: { start: number; length: number }[] = [];
    const minRun = calcMinRun(n);

    let i = 0;
    while (i < n) {
        let runStart = i;
        let runEnd = i + 1;

        if (runEnd < n && array[runEnd] < array[runEnd - 1]) {
            while (runEnd < n && array[runEnd] < array[runEnd - 1]) {
                runEnd++;
            }

            for (let left = runStart, right = runEnd - 1; left < right; left++, right--) {
                [array[left], array[right]] = [array[right], array[left]];
                yield {
                    array: [...array],
                    comparing: [],
                    swapping: [left, right],
                    sorted: []
                };
            }
        } else {
            while (runEnd < n && array[runEnd] >= array[runEnd - 1]) {
                runEnd++;
            }
        }

        let runLength = runEnd - runStart;

        const targetEnd = Math.min(n, runStart + Math.max(runLength, minRun));
        for (let j = runStart + 1; j < targetEnd; j++) {
            const key = array[j];
            let k = j - 1;

            while (k >= runStart && array[k] > key) {
                yield {
                    array: [...array],
                    comparing: [k, j],
                    swapping: [],
                    sorted: []
                };
                array[k + 1] = array[k];
                yield {
                    array: [...array],
                    comparing: [],
                    swapping: [k, k + 1],
                    sorted: []
                };
                k--;
            }

            if (array[k + 1] !== key) {
                array[k + 1] = key;
                yield {
                    array: [...array],
                    comparing: [],
                    swapping: [k + 1],
                    sorted: []
                };
            }
        }

        runLength = targetEnd - runStart;
        runs.push({ start: runStart, length: runLength });
        i = targetEnd;
    }

    const merge = function* (start: number, mid: number, end: number): Generator<SortStep> {
        const left = array.slice(start, mid);
        const right = array.slice(mid, end);

        let i = 0;
        let j = 0;
        let k = start;

        const placed = new Set<number>();

        while (i < left.length && j < right.length) {
            yield {
                array: [...array],
                comparing: [start + i, mid + j],
                swapping: [],
                sorted: Array.from(placed).sort((a, b) => a - b)
            };

            if (left[i] <= right[j]) {
                array[k] = left[i];
                placed.add(k);
                i++;
            } else {
                array[k] = right[j];
                placed.add(k);
                j++;
            }

            yield {
                array: [...array],
                comparing: [],
                swapping: [k],
                sorted: Array.from(placed).sort((a, b) => a - b)
            };
            k++;
        }

        while (i < left.length) {
            array[k] = left[i];
            placed.add(k);
            yield {
                array: [...array],
                comparing: [],
                swapping: [k],
                sorted: Array.from(placed).sort((a, b) => a - b)
            };
            i++;
            k++;
        }

        while (j < right.length) {
            array[k] = right[j];
            placed.add(k);
            yield {
                array: [...array],
                comparing: [],
                swapping: [k],
                sorted: Array.from(placed).sort((a, b) => a - b)
            };
            j++;
            k++;
        }
    };

    while (runs.length > 1) {
        const first = runs.shift();
        const second = runs.shift();
        if (!first || !second) {
            break;
        }

        const start = first.start;
        const mid = second.start;
        const end = second.start + second.length;

        yield* merge(start, mid, end);

        runs.unshift({ start, length: end - start });
    }

    yield {
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, idx) => idx)
    };
}
