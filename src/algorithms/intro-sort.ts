import type { SortStep } from './types';

function rangeIndices(start: number, end: number): number[] {
    const indices: number[] = [];
    for (let i = start; i <= end; i++) {
        indices.push(i);
    }
    return indices;
}

export function* introSort(arr: number[]): Generator<SortStep> {
    const array = [...arr];
    const n = array.length;
    const sorted = new Set<number>();
    const maxDepth = n > 0 ? Math.floor(Math.log2(n)) * 2 : 0;

    const getSortedSnapshot = (extraStart?: number, extraEnd?: number): number[] => {
        const snapshot = new Set(sorted);
        if (extraStart !== undefined && extraEnd !== undefined && extraStart <= extraEnd) {
            for (let i = extraStart; i <= extraEnd; i++) {
                snapshot.add(i);
            }
        }
        return Array.from(snapshot).sort((a, b) => a - b);
    };

    function* insertionSortRange(left: number, right: number): Generator<SortStep> {
        for (let i = left + 1; i <= right; i++) {
            const key = array[i];
            let j = i - 1;

            while (j >= left && array[j] > key) {
                yield {
                    array: [...array],
                    comparing: [j, j + 1],
                    swapping: [],
                    sorted: getSortedSnapshot(left, i)
                };

                array[j + 1] = array[j];
                yield {
                    array: [...array],
                    comparing: [],
                    swapping: [j, j + 1],
                    sorted: getSortedSnapshot(left, i)
                };
                j--;
            }

            if (array[j + 1] !== key) {
                array[j + 1] = key;
                yield {
                    array: [...array],
                    comparing: [],
                    swapping: [j + 1],
                    sorted: getSortedSnapshot(left, i)
                };
            }
        }

        for (let idx = left; idx <= right; idx++) {
            sorted.add(idx);
        }
    }

    function* heapifyRange(size: number, root: number, offset: number): Generator<SortStep> {
        let largest = root;
        const leftChild = 2 * root + 1;
        const rightChild = 2 * root + 2;

        if (leftChild < size) {
            yield {
                array: [...array],
                comparing: [offset + largest, offset + leftChild],
                swapping: [],
                sorted: getSortedSnapshot()
            };
            if (array[offset + leftChild] > array[offset + largest]) {
                largest = leftChild;
            }
        }

        if (rightChild < size) {
            yield {
                array: [...array],
                comparing: [offset + largest, offset + rightChild],
                swapping: [],
                sorted: getSortedSnapshot()
            };
            if (array[offset + rightChild] > array[offset + largest]) {
                largest = rightChild;
            }
        }

        if (largest !== root) {
            [array[offset + root], array[offset + largest]] = [array[offset + largest], array[offset + root]];
            yield {
                array: [...array],
                comparing: [],
                swapping: [offset + root, offset + largest],
                sorted: getSortedSnapshot()
            };
            yield* heapifyRange(size, largest, offset);
        }
    }

    function* heapSortRange(left: number, right: number): Generator<SortStep> {
        const size = right - left + 1;

        for (let i = Math.floor(size / 2) - 1; i >= 0; i--) {
            yield* heapifyRange(size, i, left);
        }

        for (let i = size - 1; i > 0; i--) {
            [array[left], array[left + i]] = [array[left + i], array[left]];
            sorted.add(left + i);
            yield {
                array: [...array],
                comparing: [],
                swapping: [left, left + i],
                sorted: getSortedSnapshot()
            };
            yield* heapifyRange(i, 0, left);
        }

        sorted.add(left);
    }

    function* partitionRange(low: number, high: number): Generator<SortStep, number> {
        const pivot = array[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            yield {
                array: [...array],
                comparing: [j, high],
                swapping: [],
                sorted: getSortedSnapshot()
            };

            if (array[j] <= pivot) {
                i++;
                if (i !== j) {
                    [array[i], array[j]] = [array[j], array[i]];
                    yield {
                        array: [...array],
                        comparing: [],
                        swapping: [i, j],
                        sorted: getSortedSnapshot()
                    };
                }
            }
        }

        [array[i + 1], array[high]] = [array[high], array[i + 1]];
        yield {
            array: [...array],
            comparing: [],
            swapping: [i + 1, high],
            sorted: getSortedSnapshot()
        };

        return i + 1;
    }

    function* introSortHelper(low: number, high: number, depthLimit: number): Generator<SortStep> {
        const size = high - low + 1;
        if (size <= 0) {
            return;
        }
        if (size <= 16) {
            yield* insertionSortRange(low, high);
            return;
        }
        if (depthLimit === 0) {
            yield* heapSortRange(low, high);
            return;
        }

        const pivotIndex = yield* partitionRange(low, high);
        sorted.add(pivotIndex);
        yield* introSortHelper(low, pivotIndex - 1, depthLimit - 1);
        yield* introSortHelper(pivotIndex + 1, high, depthLimit - 1);
    }

    if (n > 1) {
        yield* introSortHelper(0, n - 1, maxDepth);
    } else if (n === 1) {
        sorted.add(0);
    }

    if (sorted.size < n) {
        for (let i = 0; i < n; i++) {
            sorted.add(i);
        }
    }

    yield {
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: rangeIndices(0, n - 1)
    };
}
