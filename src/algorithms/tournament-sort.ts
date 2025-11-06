import type { SortStep } from './types';

export function* tournamentSort(arr: number[]): Generator<SortStep> {
    const array = [...arr];
    const n = array.length;
    const sorted = new Set<number>();

    if (n <= 1) {
        yield {
            array: [...array],
            comparing: [],
            swapping: [],
            sorted: Array.from({ length: n }, (_, i) => i)
        };
        return;
    }

    const sortedSnapshot = (): number[] => Array.from(sorted).sort((a, b) => a - b);

    for (let end = n - 1; end > 0; end--) {
        const contenders = Array.from({ length: end + 1 }, (_, i) => ({ index: i }));
        let round = contenders;

        while (round.length > 1) {
            const nextRound: { index: number }[] = [];

            for (let i = 0; i < round.length; i += 2) {
                if (i + 1 >= round.length) {
                    nextRound.push(round[i]);
                    continue;
                }

                const left = round[i];
                const right = round[i + 1];
                yield {
                    array: [...array],
                    comparing: [left.index, right.index],
                    swapping: [],
                    sorted: sortedSnapshot()
                };

                if (array[left.index] >= array[right.index]) {
                    nextRound.push(left);
                } else {
                    nextRound.push(right);
                }
            }

            round = nextRound;
        }

        const winner = round[0].index;

        if (winner !== end) {
            [array[winner], array[end]] = [array[end], array[winner]];
            yield {
                array: [...array],
                comparing: [],
                swapping: [winner, end],
                sorted: sortedSnapshot()
            };
        }

        sorted.add(end);
    }

    sorted.add(0);

    yield {
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i)
    };
}
