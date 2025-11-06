/**
 * ビジュアライゼーションコア
 * Canvas描画とアニメーション管理
 */

import type { SortStep } from './algorithms';
import { SortAudioEngine } from './audio';

/**
 * ビジュアライザーの設定
 */
export interface VisualizerConfig {
  canvas: HTMLCanvasElement;
  arraySize: number;
  speed: number;
  layout: VisualizerLayout;
  soundSettings: SoundSettings;
}

export type VisualizerLayout = 'linear' | 'radial';
export interface SoundSettings {
  compare: boolean;
  swap: boolean;
  access: boolean;
}

/**
 * ビジュアライザークラス
 */
export class Visualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private arraySize: number;
  private speed: number;
  private layout: VisualizerLayout;
  private animationId: number | null = null;
  private isPaused = false;
  private comparisons = 0;
  private swaps = 0;
  private startTime = 0;
  private audioEngine: SortAudioEngine;
  private lastArray: number[] = [];
  private soundSettings: SoundSettings;

  /**
   * コンストラクタ
   */
  constructor(config: VisualizerConfig) {
    this.audioEngine = new SortAudioEngine();
    this.canvas = config.canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not available');
    }
    this.ctx = ctx;
    this.arraySize = config.arraySize;
    this.speed = config.speed;
  this.layout = config.layout;
  this.soundSettings = config.soundSettings;

    this.setupCanvas();
  }

  /**
   * Canvasの初期設定
   */
  private setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  /**
   * 配列サイズを更新
   */
  setArraySize(size: number): void {
    this.arraySize = size;
  }

  /**
   * 速度を更新
   */
  setSpeed(speed: number): void {
    this.speed = speed;
  }

  /**
   * レイアウトを更新
   */
  setLayout(layout: VisualizerLayout): void {
    this.layout = layout;
    if (this.lastArray.length > 0) {
      this.drawArray(this.lastArray);
    }
  }

  setSoundSettings(settings: SoundSettings): void {
    this.soundSettings = settings;
  }

  /**
   * 統計情報をリセット
   */
  resetStats(): void {
    this.comparisons = 0;
    this.swaps = 0;
    this.startTime = 0;
  }

  /**
   * 統計情報を取得
   */
  getStats(): { comparisons: number; swaps: number; time: number } {
    const time = this.startTime > 0 ? (Date.now() - this.startTime) / 1000 : 0;
    return {
      comparisons: this.comparisons,
      swaps: this.swaps,
      time
    };
  }

  /**
   * ソートステップを描画
   */
  private drawStep(step: SortStep): void {
    const { array, comparing, swapping, sorted } = step;
    this.lastArray = [...array];
    const width = this.canvas.width;
    const height = this.canvas.height;
    const maxValue = Math.max(...array, 1);

    // 背景をクリア
    this.ctx.fillStyle = '#0f3460';
    this.ctx.fillRect(0, 0, width, height);

    if (this.layout === 'radial') {
      this.drawRadialLayout(array, comparing, swapping, sorted, maxValue, width, height);
    } else {
      this.drawLinearLayout(array, comparing, swapping, sorted, maxValue, width, height);
    }

    // 統計情報を更新
    if (comparing.length > 0) {
      this.comparisons++;
      if (this.soundSettings.compare) {
        this.audioEngine.playCompare(comparing, array);
      } else if (this.soundSettings.access) {
        this.audioEngine.playAccess(comparing, array);
      }
    }

    if (swapping.length > 0) {
      this.swaps++;
      if (this.soundSettings.swap) {
        this.audioEngine.playSwap(swapping, array);
      } else if (this.soundSettings.access && !this.soundSettings.compare) {
        this.audioEngine.playAccess(swapping, array);
      }
    }
  }

  private getStateColor(index: number, comparing: number[], swapping: number[], sorted: number[]): string | null {
    if (swapping.includes(index)) {
      return '#ff3366';
    }
    if (comparing.includes(index)) {
      return '#ffaa00';
    }
    if (sorted.includes(index)) {
      return '#00ff88';
    }
    return null;
  }

  private drawLinearLayout(
    array: number[],
    comparing: number[],
    swapping: number[],
    sorted: number[],
    maxValue: number,
    width: number,
    height: number
  ): void {
    const barWidth = width / array.length;
    for (let i = 0; i < array.length; i++) {
      const normalized = maxValue > 0 ? array[i] / maxValue : 0;
      const barHeight = normalized * height * 0.95;
      const x = i * barWidth;
      const y = height - barHeight;
      const stateColor = this.getStateColor(i, comparing, swapping, sorted);
      this.ctx.fillStyle = stateColor ?? this.valueToColor(normalized);
      this.ctx.fillRect(x, y, Math.max(barWidth - 1, 1), barHeight);
    }
  }

  private drawRadialLayout(
    array: number[],
    comparing: number[],
    swapping: number[],
    sorted: number[],
    maxValue: number,
    width: number,
    height: number
  ): void {
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) * 0.45;
    const innerRadius = maxRadius * 0.25;
    const angleStep = (Math.PI * 2) / array.length;
    const baseLineWidth = Math.max(1.5, (2 * Math.PI * maxRadius) / (array.length * 8));

    this.ctx.save();
    this.ctx.lineCap = 'round';

    // 目安となる外周円
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    this.ctx.stroke();

    for (let i = 0; i < array.length; i++) {
      const value = array[i];
      const normalized = maxValue > 0 ? value / maxValue : 0;
      const angle = i * angleStep - Math.PI / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const xStart = cx + innerRadius * cos;
      const yStart = cy + innerRadius * sin;
      const xEnd = cx + maxRadius * cos;
      const yEnd = cy + maxRadius * sin;
      const valueRadius = innerRadius + (maxRadius - innerRadius) * normalized;
      const xValue = cx + valueRadius * cos;
      const yValue = cy + valueRadius * sin;

      const stateColor = this.getStateColor(i, comparing, swapping, sorted);
      const remainderColor = stateColor ?? this.remainderColor(1 - normalized);

      // 全長を薄いラインで描画（残り量）
      this.ctx.strokeStyle = remainderColor;
      this.ctx.lineWidth = baseLineWidth;
      this.ctx.globalAlpha = stateColor ? 0.3 : 0.4;
      this.ctx.beginPath();
      this.ctx.moveTo(xStart, yStart);
      this.ctx.lineTo(xEnd, yEnd);
      this.ctx.stroke();

      this.ctx.globalAlpha = 1;

      // 実際の値を強調（太さ調整）
      const highlightLineWidth = baseLineWidth * 1.8;
      const highlightColor = stateColor ?? this.valueToColor(normalized);
      this.ctx.strokeStyle = highlightColor;
      this.ctx.lineWidth = highlightLineWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(xStart, yStart);
      this.ctx.lineTo(xValue, yValue);
      this.ctx.stroke();

      if (!stateColor) {
        const tipRadius = Math.max(3, highlightLineWidth);
        this.ctx.fillStyle = highlightColor;
        this.ctx.beginPath();
        this.ctx.arc(xValue, yValue, tipRadius / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.ctx.restore();
  }

  private valueToColor(normalized: number): string {
    const hue = 200 - normalized * 100;
    const lightness = 35 + normalized * 45;
    return `hsl(${hue}, 85%, ${lightness}%)`;
  }

  private remainderColor(normalized: number): string {
    const hue = 200 - normalized * 80;
    const lightness = 15 + normalized * 35;
    return `hsl(${hue}, 60%, ${lightness}%)`;
  }

  /**
   * 音響エンジンを取得
   */
  getAudioEngine(): SortAudioEngine {
    return this.audioEngine;
  }

  /**
   * ソートアニメーションを開始
   */
  async start(
    sortGenerator: Generator<SortStep> | AsyncGenerator<SortStep>,
    onUpdate?: (stats: { comparisons: number; swaps: number; time: number }) => void,
    onComplete?: () => void
  ): Promise<void> {
    this.resetStats();
    this.startTime = Date.now();
    this.isPaused = false;

    const animate = async (): Promise<void> => {
      if (this.isPaused) {
        return;
      }

      const result = await sortGenerator.next();
      console.log('[Visualizer] Step result:', result.done ? 'DONE' : 'processing');

      if (!result.done) {
        this.drawStep(result.value);

        if (onUpdate) {
          onUpdate(this.getStats());
        }

        // 速度に応じて待機時間を調整
        // 速度1-20: 遅い(10-50ms)
        // 速度21-50: 中速(1-10ms)
        // 速度51-100: 高速(待機なし、複数ステップを一度に処理)
        if (this.speed <= 20) {
          const delay = 50 - (this.speed - 1) * 2;
          await new Promise(resolve => setTimeout(resolve, delay));
          this.animationId = requestAnimationFrame(() => animate());
        } else if (this.speed <= 50) {
          const delay = 10 - Math.floor((this.speed - 21) / 3);
          await new Promise(resolve => setTimeout(resolve, Math.max(0, delay)));
          this.animationId = requestAnimationFrame(() => animate());
        } else {
          // 速度51以上: 複数ステップを一度に処理
          const stepsPerFrame = Math.floor((this.speed - 50) / 2) + 1;
          for (let i = 0; i < stepsPerFrame - 1; i++) {
            const nextResult = await sortGenerator.next();
            if (nextResult.done) {
              if (nextResult.value) {
                this.drawStep(nextResult.value);
              }
              if (onUpdate) {
                onUpdate(this.getStats());
              }
              if (onComplete) {
                onComplete();
              }

              this.animationId = null;
              return;
            }

            this.drawStep(nextResult.value);
            if (onUpdate) {
              onUpdate(this.getStats());
            }
          }

          this.animationId = requestAnimationFrame(() => animate());
        }
      } else {
        // ソート完了
        if (result.value) {
          this.drawStep(result.value);
        }

        if (onUpdate) {
          onUpdate(this.getStats());
        }

        if (onComplete) {
          onComplete();
        }

        this.animationId = null;
      }
    };

    this.animationId = requestAnimationFrame(() => animate());
  }

  /**
   * アニメーションを一時停止
   */
  pause(): void {
    this.isPaused = true;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * アニメーションを再開
   */
  resume(
    sortGenerator: Generator<SortStep> | AsyncGenerator<SortStep>,
    onUpdate?: (stats: { comparisons: number; swaps: number; time: number }) => void,
    onComplete?: () => void
  ): void {
    this.isPaused = false;
    this.start(sortGenerator, onUpdate, onComplete);
  }

  /**
   * アニメーションを停止
   */
  stop(): void {
    this.isPaused = true;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 配列を描画(初期状態やリセット時)
   */
  drawArray(array: number[]): void {
    this.drawStep({
      array,
      comparing: [],
      swapping: [],
      sorted: []
    });
  }

  /**
   * 一時停止中かどうか
   */
  isPausedState(): boolean {
    return this.isPaused;
  }
}
