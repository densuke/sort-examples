import type { SortStep } from './types';

interface PileNode {
    value: number;
    index: number;
}

interface HeapNode extends PileNode {
    pileIndex: number;
}

export function* patienceSort(arr: number[]): Generator<SortStep> {
    const original = [...arr];
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

    const piles: PileNode[][] = [];

    const sortedIndices = (sorted: Set<number>): number[] => Array.from(sorted).sort((a, b) => a - b);

    const heap: HeapNode[] = [];

    const siftUp = (idx: number): void => {
        while (idx > 0) {
            const parent = Math.floor((idx - 1) / 2);
            const current = heap[idx];
            const parentNode = heap[parent];
            if (parentNode.value < current.value || (parentNode.value === current.value && parentNode.index <= current.index)) {
                break;
            }
            heap[idx] = parentNode;
            heap[parent] = current;
            idx = parent;
        }
    };

    const siftDown = (idx: number): void => {
        const length = heap.length;
        while (true) {
            let smallest = idx;
            const left = idx * 2 + 1;
            const right = idx * 2 + 2;

            const compare = (a: number, b: number): boolean => {
                if (heap[a].value === heap[b].value) {
                    return heap[a].index < heap[b].index;
                }
                return heap[a].value < heap[b].value;
            };

            if (left < length && compare(left, smallest)) {
                smallest = left;
            }

            if (right < length && compare(right, smallest)) {
                smallest = right;
            }

            if (smallest === idx) {
                return;
            }

            [heap[idx], heap[smallest]] = [heap[smallest], heap[idx]];
            idx = smallest;
        }
    };

    const heapPush = (node: HeapNode): void => {
        heap.push(node);
        siftUp(heap.length - 1);
    };

    const heapPop = (): HeapNode | undefined => {
        if (heap.length === 0) {
            return undefined;
        }

        const top = heap[0];
        const last = heap.pop()!;
        if (heap.length > 0) {
            heap[0] = last;
            siftDown(0);
        }
        return top;
    };

    const heapPeek = (): HeapNode | undefined => heap[0];

    for (let i = 0; i < n; i++) {
        const value = original[i];
        let left = 0;
        let right = piles.length;

        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            const top = piles[mid][piles[mid].length - 1];
            yield {
                array: [...array],
                comparing: [i, top.index],
                swapping: [],
                sorted: []
            };

            if (value <= top.value) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }

        if (left === piles.length) {
            piles.push([{ value, index: i }]);
        } else {
            piles[left].push({ value, index: i });
        }

        yield {
            array: [...array],
            comparing: [],
            swapping: [i],
            sorted: []
        };
    }

    for (let pileIndex = 0; pileIndex < piles.length; pileIndex++) {
        const pile = piles[pileIndex];
        if (pile.length === 0) {
            continue;
        }
        const top = pile[pile.length - 1];
        heapPush({ value: top.value, index: top.index, pileIndex });
    }

    const sorted = new Set<number>();

    for (let write = 0; write < n; write++) {
        const candidate = heapPeek();
        if (!candidate) {
            break;
        }

        yield {
            array: [...array],
            comparing: [write, candidate.index],
            swapping: [],
            sorted: sortedIndices(sorted)
        };

        const next = heapPop();
        if (!next) {
            break;
        }

        const pile = piles[next.pileIndex];
        pile.pop();
        array[write] = next.value;
        sorted.add(write);

        yield {
            array: [...array],
            comparing: [],
            swapping: [write],
            sorted: sortedIndices(sorted)
        };

        const newTop = pile[pile.length - 1];
        if (newTop) {
            heapPush({ value: newTop.value, index: newTop.index, pileIndex: next.pileIndex });
        }
    }

    yield {
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i)
    };
}
