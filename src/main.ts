/**
 * メインロジックとUI連携
 */

import {
  bubbleSort,
  selectionSort,
  insertionSort,
  quickSort,
  mergeSort,
  heapSort,
  bitonicSort,
  bitonicSortMultiThread,
  shellSort,
  combSort,
  cocktailShakerSort,
  gnomeSort,
  librarySort,
  introSort,
  oddEvenSort,
  cycleSort,
  pancakeSort,
  patienceSort,
  tournamentSort,
  smoothSort,
  timSort,
  sleepSort,
  radixSortLSD,
  radixSortMSD,
  radixSortBinary,
  radixSortHex,
  countingSort,
  bucketSort,
  type SortStep
} from './algorithms';
import { Visualizer, type SoundSettings } from './visualizer';

const ALGORITHM_INFO: Record<string, string[]> = {
  bubble: ['バブルソート', '安定な交換型。実装容易', '隣接要素を逐次比較', '平均/最悪 O(n^2)', '既に整列済みなら早期終了'],
  selection: ['選択ソート', '不安定・選択型', '最小値を選んで前方へ配置', '計算量 O(n^2)', '書き込み回数が少ない'],
  insertion: ['挿入ソート', '安定・挿入型', '部分配列に挿入しながら整列', '平均/最悪 O(n^2)', 'ほぼ整列済みで高速'],
  quick: ['クイックソート', '分割統治・不安定', 'ピボットで左右に分割', '平均 O(n log n)', '最悪 O(n^2) 対策に軸選択が鍵'],
  merge: ['マージソート', '安定・分割統治', '再帰分割して併合', '計算量 O(n log n)', '追加メモリ O(n) が必要'],
  heap: ['ヒープソート', '選択型・不安定', '最大ヒープを構築して抽出', '計算量 O(n log n)', '追加メモリ不要'],
  shell: ['シェルソート', '改良挿入ソート', 'ギャップを縮め段階的に整列', '平均 O(n^(3/2)) 付近', 'ギャップ選択で性能が変動'],
  comb: ['コムソート', '改良バブルソート', 'ギャップを縮めて比較', '平均 O(n log n) 程度', '終盤でバブルソートに収束'],
  cocktail: ['カクテルソート', '双方向バブル', '往復で隣接交換を実施', '計算量 O(n^2)', '双方向で早期収束期待'],
  gnome: ['ノームソート', '挿入ソート類似', '条件満たすまで後退して交換', '計算量 O(n^2)', '実装は極めて単純'],
  library: ['図書館ソート', '遅延挿入型', '空きスロットを用意して挿入', '平均 O(n log n)', '空隙管理が性能を左右'],
  intro: ['イントロソート', 'ハイブリッド', 'クイック+ヒープ+挿入の切替', '平均 O(n log n)', 'STL sort で採用'],
  'odd-even': ['奇偶転置ソート', '並列向き比較交換網', '偶数→奇数番目で交互比較', '計算量 O(n^2)', 'シンクロナス処理に適合'],
  cycle: ['サイクルソート', '書き込み回数最小', '位置を決めて巡回交換', '計算量 O(n^2)', '書き込み回数 O(n)'],
  pancake: ['パンケーキソート', 'prefix 反転のみ使用', '最大値を裏返しで移動', '計算量 O(n^2)', '教育・アニメ用途向き'],
  patience: ['ペイシェンスソート', 'トランプ分配モデル', '山札を作りマージで復元', '計算量 O(n log n)', 'LIS 計算にも応用'],
  tournament: ['トーナメントソート', '勝者木で最大抽出', '比較結果を再利用', '計算量 O(n log n)', 'ヒープの代替実装'],
  smooth: ['スムースソート', 'レオナルドヒープ利用', 'ほぼ整列で O(n)', '最悪 O(n log n)', '実装難度は高め'],
  tim: ['Tim ソート', '実用ハイブリッド', '既存 run を検出し併合', '計算量 O(n log n)', 'Python/JavaScript 標準に採用'],
  sleep: ['スリープソート', '並列遅延ジョーク', '値を遅延実行で整列', '計算量: 実質 O(n)', 'デモ専用・非現実的'],
  bitonic: ['バイトニックソート', '比較交換ネットワーク', '分割してビトニック列を生成', '計算量 O(n log^2 n)', 'GPU/並列処理で強い'],
  'bitonic-mt': ['バイトニック(MT)', 'Web Worker 並列版', '複数スレッドでサブ列処理', '計算量 O(n log^2 n)', 'CPU コアを活用'],
  'radix-lsd': ['基数ソート LSD', '桁を下位から処理', '安定なバケット集計', '計算量 O(d*(n+k))', '整数・固定長キー向け'],
  'radix-msd': ['基数ソート MSD', '桁を上位から処理', '再帰的にバケット分割', '計算量 O(d*(n+k))', 'プレフィックス共通なデータに強い'],
  'radix-binary': ['基数ソート 基数2', 'ビット単位の安定分配', '全ビットを順に処理', '計算量 O(w*n)', 'w=ビット長。密度高い整数向け'],
  'radix-hex': ['基数ソート 基数16', '4bit 単位の LSD 処理', '16 バケットで分配', '計算量 O((w/4)*n)', 'バイト列操作に適合'],
  counting: ['カウントソート', '整数限定の線形ソート', '出現頻度をカウント', '計算量 O(n+k)', '値域が小さいほど有効'],
  bucket: ['バケットソート', '分布利用の分割法', '値を区間ごとに格納', '平均 O(n+k)', 'バケット内は挿入ソート'],
  default: ['ソートビジュアル', '左のリストからアルゴリズム選択', '各行120文字以内で要点表示', '比較/交換音も設定可能', '円形レイアウトも試せます']
};

const DEMO_SIZE_LIMITS: Record<string, number> = {
  bubble: 64,
  selection: 64,
  insertion: 64,
  comb: 72,
  cocktail: 72,
  gnome: 60,
  'odd-even': 56,
  cycle: 56,
  pancake: 48,
  patience: 48,
  library: 80,
  smooth: 80,
  tournament: 64,
  sleep: 24,
  'bitonic': 1024,
  'bitonic-mt': 1024
};

type Preset = 'random' | 'nearly' | 'reversed';

interface DemoItem {
  algorithm: string;
  preset: Preset;
}

/**
 * アプリケーションの状態管理
 */
class App {
  private visualizer: Visualizer;
  private currentArray: number[] = [];
  private currentGenerator: Generator<SortStep> | AsyncGenerator<SortStep> | null = null;
  private isRunning = false;
  private isDemoMode = false;
  private demoQueue: DemoItem[] = [];
  private demoBaseArray: number[] = [];
  private demoOriginalSize = 0;
  private demoOriginalSizeLabel = '';
  private demoOriginalPreset = '';
  private readonly demoDelay = 800;
  private readonly demoStartDelay = 150;

  // DOM要素
  private algorithmSelect: HTMLSelectElement;
  private sizeInput: HTMLInputElement;
  private sizeValue: HTMLSpanElement;
  private speedInput: HTMLInputElement;
  private speedValue: HTMLSpanElement;
  private startButton: HTMLButtonElement;
  private pauseButton: HTMLButtonElement;
  private resetButton: HTMLButtonElement;
  private demoButton: HTMLButtonElement;
  private layoutSelect: HTMLSelectElement;
  private presetSelect: HTMLSelectElement;
  private soundToggle: HTMLInputElement;
  private soundCompareToggle: HTMLInputElement;
  private soundSwapToggle: HTMLInputElement;
  private soundAccessToggle: HTMLInputElement;
  private comparisonsDisplay: HTMLElement;
  private swapsDisplay: HTMLElement;
  private timeDisplay: HTMLElement;
  private algorithmInfoPanel: HTMLElement | null;

  /**
   * コンストラクタ
   */
  constructor() {
    // DOM要素を取得
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.algorithmSelect = document.getElementById('algorithm') as HTMLSelectElement;
    this.sizeInput = document.getElementById('size') as HTMLInputElement;
    this.sizeValue = document.getElementById('sizeValue') as HTMLSpanElement;
    this.speedInput = document.getElementById('speed') as HTMLInputElement;
    this.speedValue = document.getElementById('speedValue') as HTMLSpanElement;
    this.startButton = document.getElementById('start') as HTMLButtonElement;
    this.pauseButton = document.getElementById('pause') as HTMLButtonElement;
    this.resetButton = document.getElementById('reset') as HTMLButtonElement;
    this.demoButton = document.getElementById('demo') as HTMLButtonElement;
    this.layoutSelect = document.getElementById('layout') as HTMLSelectElement;
    this.presetSelect = document.getElementById('preset') as HTMLSelectElement;
    this.soundToggle = document.getElementById('soundToggle') as HTMLInputElement;
    this.soundCompareToggle = document.getElementById('soundCompare') as HTMLInputElement;
    this.soundSwapToggle = document.getElementById('soundSwap') as HTMLInputElement;
    this.soundAccessToggle = document.getElementById('soundAccess') as HTMLInputElement;
    this.comparisonsDisplay = document.getElementById('comparisons') as HTMLElement;
    this.swapsDisplay = document.getElementById('swaps') as HTMLElement;
    this.timeDisplay = document.getElementById('time') as HTMLElement;
    this.algorithmInfoPanel = document.getElementById('algorithmInfo');

    // Visualizerを初期化
    this.visualizer = new Visualizer({
      canvas,
      arraySize: parseInt(this.sizeInput.value),
      speed: parseInt(this.speedInput.value),
      layout: this.layoutSelect.value === 'radial' ? 'radial' : 'linear',
      soundSettings: this.getSoundSettings()
    });

    // イベントリスナーを設定
    this.setupEventListeners();

    // 初期配列を生成して描画
    this.resetArray();
    this.updateAlgorithmInfo(this.algorithmSelect.value);
  }

  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    // サイズスライダー
    this.sizeInput.addEventListener('input', () => {
      this.sizeValue.textContent = this.sizeInput.value;
      if (!this.isRunning) {
        this.visualizer.setArraySize(parseInt(this.sizeInput.value));
        this.resetArray();
      }
    });

    // 速度スライダー
    this.speedInput.addEventListener('input', () => {
      this.speedValue.textContent = this.speedInput.value;
      this.visualizer.setSpeed(parseInt(this.speedInput.value));
    });

    this.layoutSelect.addEventListener('change', () => {
      const layout = this.layoutSelect.value === 'radial' ? 'radial' : 'linear';
      this.visualizer.setLayout(layout);
      if (!this.isRunning) {
        this.visualizer.drawArray(this.currentArray);
      }
    });

    this.presetSelect.addEventListener('change', () => {
      if (!this.isRunning) {
        this.resetArray();
      }
    });

    this.algorithmSelect.addEventListener('change', () => {
      this.updateAlgorithmInfo(this.algorithmSelect.value);
    });

    // 開始ボタン
    this.startButton.addEventListener('click', () => {
      this.start();
    });

    // 一時停止ボタン
    this.pauseButton.addEventListener('click', () => {
      this.pause();
    });

    // リセットボタン
    this.resetButton.addEventListener('click', () => {
      this.reset();
    });

    // デモボタン
    this.demoButton.addEventListener('click', () => {
      this.startDemo();
    });

    // 音響トグル
    this.soundToggle.addEventListener('change', () => {
      if (this.soundToggle.checked) {
        this.visualizer.getAudioEngine().enable();
      } else {
        this.visualizer.getAudioEngine().disable();
      }
      this.applySoundSettings();
    });

    const soundSettingsHandler = (): void => {
      this.applySoundSettings();
    };

    this.soundCompareToggle.addEventListener('change', soundSettingsHandler);
    this.soundSwapToggle.addEventListener('change', soundSettingsHandler);
    this.soundAccessToggle.addEventListener('change', soundSettingsHandler);
  }

  /**
   * ランダムな配列を生成
   */
  private generateArray(size: number): number[] {
    return Array.from({ length: size }, () => Math.floor(Math.random() * size) + 1);
  }

  private generateArrayByPreset(size: number, preset: Preset): number[] {
    switch (preset) {
      case 'random':
        return this.generateArray(size);
      case 'nearly': {
        // 左側80%は完全に昇順、右側20%のみを未ソート(シャッフル)にする
        const arr = Array.from({ length: size }, (_, i) => i + 1);
        const start = Math.floor(size * 0.8);
        // フィッシャー–イェーツで右端区間のみシャッフル
        for (let i = size - 1; i > start; i--) {
          const j = start + Math.floor(Math.random() * (i - start + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      }
      case 'reversed':
        return Array.from({ length: size }, (_, i) => size - i);
      default:
        return this.generateArray(size);
    }
  }

  /**
   * 配列をリセット
   */
  private resetArray(): void {
    const size = parseInt(this.sizeInput.value);
    this.visualizer.setArraySize(size);
    const preset = (this.presetSelect?.value as Preset) || 'random';
    this.currentArray = this.generateArrayByPreset(size, preset);
    this.visualizer.drawArray(this.currentArray);
    this.updateStats({ comparisons: 0, swaps: 0, time: 0 });
    this.applySoundSettings();
    this.updateAlgorithmInfo(this.algorithmSelect.value);
  }

  /**
   * デモモードを開始
   */
  private startDemo(): void {
    if (this.isRunning || this.isDemoMode) {
      return;
    }

    const algorithms = Array.from(this.algorithmSelect.options).map(option => option.value);
    if (algorithms.length === 0) {
      return;
    }

    this.isDemoMode = true;
    this.demoQueue = [];
    for (const alg of algorithms) {
      this.demoQueue.push(
        { algorithm: alg, preset: 'random' },
        { algorithm: alg, preset: 'nearly' },
        { algorithm: alg, preset: 'reversed' }
      );
    }
    this.demoOriginalSize = parseInt(this.sizeInput.value);
    this.demoOriginalSizeLabel = this.sizeValue.textContent ?? String(this.demoOriginalSize);
    this.demoOriginalPreset = this.presetSelect.value;

    if (!this.soundToggle.checked) {
      this.soundToggle.checked = true;
    }
    this.visualizer.getAudioEngine().enable();
    this.soundToggle.disabled = true;

    this.demoButton.disabled = true;
    this.startButton.disabled = true;
    this.pauseButton.disabled = true;
    this.algorithmSelect.disabled = true;
    this.sizeInput.disabled = true;
    this.layoutSelect.disabled = true;
    this.presetSelect.disabled = true;
    this.soundCompareToggle.disabled = true;
    this.soundSwapToggle.disabled = true;
    this.soundAccessToggle.disabled = true;

    this.runNextDemo();
  }

  /**
   * デモ用の次のアルゴリズムを実行
   */
  private runNextDemo(): void {
    if (!this.isDemoMode) {
      return;
    }

    if (this.demoQueue.length === 0) {
      this.isDemoMode = false;
      this.demoBaseArray = [];
      this.demoButton.disabled = false;
      this.startButton.disabled = false;
      this.pauseButton.disabled = true;
      this.algorithmSelect.disabled = false;
      this.sizeInput.disabled = false;
      this.layoutSelect.disabled = false;
      this.presetSelect.disabled = false;
      this.soundToggle.disabled = false;
      this.soundCompareToggle.disabled = false;
      this.soundSwapToggle.disabled = false;
      this.soundAccessToggle.disabled = false;
      if (this.demoOriginalSize > 0) {
        this.sizeInput.value = String(this.demoOriginalSize);
        this.sizeValue.textContent = this.demoOriginalSizeLabel || String(this.demoOriginalSize);
        this.visualizer.setArraySize(this.demoOriginalSize);
      }
      this.demoOriginalSize = 0;
      this.demoOriginalSizeLabel = '';
      if (this.demoOriginalPreset) {
        this.presetSelect.value = this.demoOriginalPreset;
        this.demoOriginalPreset = '';
      }
      this.resetArray();
      return;
    }

    const nextItem = this.demoQueue.shift();
    if (!nextItem) {
      this.runNextDemo();
      return;
    }

    const size = this.getDemoArraySize(nextItem.algorithm);
    this.sizeInput.value = String(size);
    this.sizeValue.textContent = String(size);
    this.visualizer.setArraySize(size);
    // Reflect current preset to UI as well
    this.presetSelect.value = nextItem.preset;
    this.algorithmSelect.value = nextItem.algorithm;
    this.updateAlgorithmInfo(nextItem.algorithm);
    this.demoBaseArray = this.generateArrayByPreset(size, nextItem.preset);
    this.currentArray = [...this.demoBaseArray];
    this.visualizer.drawArray(this.currentArray);
    this.updateStats({ comparisons: 0, swaps: 0, time: 0 });

    setTimeout(() => {
      if (!this.isDemoMode) {
        return;
      }
      this.start();
      this.pauseButton.disabled = true;
    }, this.demoStartDelay);
  }

  /**
   * ソートジェネレータを取得
   */
  private getSortGenerator(algorithm: string, array: number[]): Generator<SortStep> | AsyncGenerator<SortStep> {
    switch (algorithm) {
      case 'bubble':
        return bubbleSort(array);
      case 'selection':
        return selectionSort(array);
      case 'insertion':
        return insertionSort(array);
      case 'quick':
        return quickSort(array);
      case 'merge':
        return mergeSort(array);
      case 'heap':
        return heapSort(array);
      case 'shell':
        return shellSort(array);
      case 'comb':
        return combSort(array);
      case 'cocktail':
        return cocktailShakerSort(array);
      case 'gnome':
        return gnomeSort(array);
      case 'library':
        return librarySort(array);
      case 'intro':
        return introSort(array);
      case 'odd-even':
        return oddEvenSort(array);
      case 'cycle':
        return cycleSort(array);
      case 'pancake':
        return pancakeSort(array);
      case 'patience':
        return patienceSort(array);
      case 'tournament':
        return tournamentSort(array);
      case 'smooth':
        return smoothSort(array);
      case 'tim':
        return timSort(array);
      case 'sleep':
        return sleepSort(array);
      case 'bitonic':
        return bitonicSort(array);
      case 'bitonic-mt':
        return bitonicSortMultiThread(array);
      case 'radix-lsd':
        return radixSortLSD(array);
      case 'radix-msd':
        return radixSortMSD(array);
      case 'radix-binary':
        return radixSortBinary(array);
      case 'radix-hex':
        return radixSortHex(array);
      case 'counting':
        return countingSort(array);
      case 'bucket':
        return bucketSort(array);
      default:
        return bubbleSort(array);
    }
  }

  /**
   * ソートを開始
   */
  private start(): void {
    if (this.isRunning) {
      // 一時停止中の再開
      if (this.visualizer.isPausedState() && this.currentGenerator) {
        this.visualizer.resume(
          this.currentGenerator,
          (stats) => this.updateStats(stats),
          () => this.onComplete()
        );
        this.startButton.disabled = true;
        this.pauseButton.disabled = false;
      }
      return;
    }

    // 新規開始
    this.isRunning = true;
    const algorithm = this.algorithmSelect.value;
    console.log('[Main] Starting algorithm:', algorithm);
    const generator = this.getSortGenerator(algorithm, this.currentArray);
    this.currentGenerator = generator;
    console.log('[Main] Generator type:', generator.constructor.name);

    this.visualizer.start(
      generator,
      (stats) => this.updateStats(stats),
      () => this.onComplete()
    );

    // ボタンの状態を更新
    this.startButton.disabled = true;
    this.pauseButton.disabled = false;
    this.algorithmSelect.disabled = true;
    this.sizeInput.disabled = true;

    if (this.isDemoMode) {
      this.pauseButton.disabled = true;
    }
  }

  /**
   * ソートを一時停止
   */
  private pause(): void {
    if (this.isRunning) {
      this.visualizer.pause();
      this.startButton.disabled = false;
      this.pauseButton.disabled = true;
    }
  }

  /**
   * ソートをリセット
   */
  private reset(): void {
    this.visualizer.stop();
    this.isRunning = false;
    this.currentGenerator = null;
    this.isDemoMode = false;
    this.demoQueue = [];
    this.demoBaseArray = [];
    if (this.demoOriginalSize > 0) {
      this.sizeInput.value = String(this.demoOriginalSize);
      this.sizeValue.textContent = this.demoOriginalSizeLabel || String(this.demoOriginalSize);
      this.visualizer.setArraySize(this.demoOriginalSize);
    }
    if (this.demoOriginalPreset) {
      this.presetSelect.value = this.demoOriginalPreset;
      this.demoOriginalPreset = '';
    }
    this.demoOriginalSize = 0;
    this.demoOriginalSizeLabel = '';

    this.resetArray();

    // ボタンの状態を更新
    this.startButton.disabled = false;
    this.pauseButton.disabled = true;
    this.algorithmSelect.disabled = false;
    this.sizeInput.disabled = false;
    this.demoButton.disabled = false;
    this.layoutSelect.disabled = false;
    this.presetSelect.disabled = false;
    this.soundToggle.disabled = false;
    this.soundCompareToggle.disabled = false;
    this.soundSwapToggle.disabled = false;
    this.soundAccessToggle.disabled = false;
    this.applySoundSettings();
  }

  /**
   * ソート完了時の処理
   */
  private onComplete(): void {
    this.isRunning = false;
    this.currentGenerator = null;

    if (this.isDemoMode) {
      this.pauseButton.disabled = true;
      setTimeout(() => this.runNextDemo(), this.demoDelay);
      return;
    }

    // ボタンの状態を更新
    this.startButton.disabled = false;
    this.pauseButton.disabled = true;
    this.algorithmSelect.disabled = false;
    this.sizeInput.disabled = false;
    this.demoButton.disabled = false;
    this.layoutSelect.disabled = false;
    this.presetSelect.disabled = false;
    this.soundToggle.disabled = false;
    this.soundCompareToggle.disabled = false;
    this.soundSwapToggle.disabled = false;
    this.soundAccessToggle.disabled = false;
  }

  /**
   * 統計情報を更新
   */
  private updateStats(stats: { comparisons: number; swaps: number; time: number }): void {
    this.comparisonsDisplay.textContent = stats.comparisons.toLocaleString();
    this.swapsDisplay.textContent = stats.swaps.toLocaleString();
    this.timeDisplay.textContent = stats.time.toFixed(2) + 's';
  }

  private updateAlgorithmInfo(algorithm: string): void {
    if (!this.algorithmInfoPanel) {
      return;
    }

    const infoLines = ALGORITHM_INFO[algorithm] ?? ALGORITHM_INFO.default;
    const fragment = document.createDocumentFragment();

    infoLines.forEach(line => {
      const paragraph = document.createElement('p');
      paragraph.textContent = line;
      fragment.appendChild(paragraph);
    });

    this.algorithmInfoPanel.replaceChildren(fragment);
  }

  private getSoundSettings(): SoundSettings {
    return {
      compare: this.soundCompareToggle.checked,
      swap: this.soundSwapToggle.checked,
      access: this.soundAccessToggle.checked
    };
  }

  private applySoundSettings(): void {
    this.visualizer.setSoundSettings(this.getSoundSettings());
  }

  private getDemoArraySize(algorithm: string): number {
    const baseSize = Math.min(1024, this.demoOriginalSize || parseInt(this.sizeInput.value));
    const limit = DEMO_SIZE_LIMITS[algorithm];
    let target = limit ? Math.min(baseSize, limit) : baseSize;

    // バイトニック系は配列長が2の乗数の方が自然なので、直近の2の乗数以下に調整
    if (algorithm === 'bitonic' || algorithm === 'bitonic-mt') {
      const pow2 = (n: number): number => {
        if (n < 1) return 1;
        const p = 1 << Math.floor(Math.log2(n));
        return p;
      };
      target = pow2(target);
    }

    return Math.max(4, target);
  }
}

// アプリケーションを初期化
new App();
