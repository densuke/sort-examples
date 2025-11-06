/**
 * ソートアルゴリズム用音響エンジン
 * 値に応じた音程を生成
 */

export class SortAudioEngine {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private enabled: boolean = false;
  private oscillators: Map<number, OscillatorNode> = new Map();

  // 音階範囲(4オクターブ分)
  private readonly MIN_FREQ = 220; // A3
  private readonly MAX_FREQ = 3520; // A7

  /**
   * コンストラクタ
   */
  constructor() {
    // Web Audio APIの初期化は遅延実行
  }

  /**
   * 音響エンジンを初期化
   */
  private initAudioContext(): void {
    if (this.audioContext) return;

    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.1; // 音量を小さめに
    this.gainNode.connect(this.audioContext.destination);
  }

  /**
   * 音響を有効化
   */
  enable(): void {
    this.initAudioContext();
    this.enabled = true;
  }

  /**
   * 音響を無効化
   */
  disable(): void {
    this.enabled = false;
    this.stopAllSounds();
  }

  /**
   * 有効状態を取得
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 有効状態をトグル
   */
  toggle(): boolean {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.enabled;
  }

  /**
   * 値を周波数に変換
   *
   * @param value 配列の値
   * @param maxValue 配列の最大値
   * @returns 周波数(Hz)
   */
  private valueToFrequency(value: number, maxValue: number): number {
    // 値を0-1の範囲に正規化
    const normalized = value / maxValue;

    // 対数スケールで周波数を計算(音階は対数的に感じられる)
    const logMin = Math.log(this.MIN_FREQ);
    const logMax = Math.log(this.MAX_FREQ);
    const frequency = Math.exp(logMin + normalized * (logMax - logMin));

    return frequency;
  }

  /**
   * 比較音を再生
   *
   * @param indices 比較対象のインデックス配列
   * @param array 配列
   */
  playCompare(indices: number[], array: number[]): void {
    if (!this.enabled || !this.audioContext || !this.gainNode) return;

    const maxValue = Math.max(...array);

    // 各インデックスの値に対応する音を再生
    indices.forEach(index => {
      if (index >= 0 && index < array.length) {
        const frequency = this.valueToFrequency(array[index], maxValue);
        this.playTone(index, frequency, 0.05, 'sine');
      }
    });
  }

  /**
   * 交換音を再生
   *
   * @param indices 交換対象のインデックス配列
   * @param array 配列
   */
  playSwap(indices: number[], array: number[]): void {
    if (!this.enabled || !this.audioContext || !this.gainNode) return;

    const maxValue = Math.max(...array);

    // 交換音は少し長めで目立つように
    indices.forEach(index => {
      if (index >= 0 && index < array.length) {
        const frequency = this.valueToFrequency(array[index], maxValue);
        this.playTone(index, frequency, 0.08, 'square');
      }
    });
  }

  /**
   * 値アクセス音を再生
   */
  playAccess(indices: number[], array: number[]): void {
    if (!this.enabled || !this.audioContext || !this.gainNode) return;

    const maxValue = Math.max(...array);
    indices.forEach(index => {
      if (index >= 0 && index < array.length) {
        const frequency = this.valueToFrequency(array[index], maxValue);
        this.playTone(index + 10000, frequency, 0.04, 'triangle');
      }
    });
  }

  /**
   * トーンを再生
   *
   * @param id 音の識別子
   * @param frequency 周波数
   * @param duration 再生時間(秒)
   * @param type 波形タイプ
   */
  private playTone(
    id: number,
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine'
  ): void {
    if (!this.audioContext || !this.gainNode) return;

    // 既存の音を停止
    this.stopSound(id);

    // オシレーターを作成
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // エンベロープ用のゲインノードを作成
    const envelopeGain = this.audioContext.createGain();
    envelopeGain.gain.value = 0;

    // 接続
    oscillator.connect(envelopeGain);
    envelopeGain.connect(this.gainNode);

    // エンベロープ設定(ADSR)
    const now = this.audioContext.currentTime;
    const attackTime = 0.01;
    const releaseTime = 0.02;

    envelopeGain.gain.setValueAtTime(0, now);
    envelopeGain.gain.linearRampToValueAtTime(0.3, now + attackTime);
    envelopeGain.gain.setValueAtTime(0.3, now + duration - releaseTime);
    envelopeGain.gain.linearRampToValueAtTime(0, now + duration);

    // 再生
    oscillator.start(now);
    oscillator.stop(now + duration);

    // 停止後にクリーンアップ
    oscillator.onended = () => {
      this.oscillators.delete(id);
    };

    this.oscillators.set(id, oscillator);
  }

  /**
   * 特定の音を停止
   *
   * @param id 音の識別子
   */
  private stopSound(id: number): void {
    const oscillator = this.oscillators.get(id);
    if (oscillator) {
      try {
        oscillator.stop();
      } catch (e) {
        // 既に停止している場合のエラーを無視
      }
      this.oscillators.delete(id);
    }
  }

  /**
   * 全ての音を停止
   */
  private stopAllSounds(): void {
    this.oscillators.forEach((oscillator, id) => {
      try {
        oscillator.stop();
      } catch (e) {
        // 既に停止している場合のエラーを無視
      }
    });
    this.oscillators.clear();
  }

  /**
   * リソースをクリーンアップ
   */
  dispose(): void {
    this.stopAllSounds();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.gainNode = null;
    this.enabled = false;
  }
}
