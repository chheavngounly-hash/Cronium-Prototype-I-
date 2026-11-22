/**
 * Voice Recording & Web Audio Service for Cronium Messenger
 * Supports real MediaRecorder recording with AnalyserNode frequency extraction,
 * and robust simulated speech fallbacks for hermetic sandbox/iframe environments.
 */

class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private startTime: number = 0;
  private isSimulated: boolean = false;
  private recordedWaveform: number[] = [];
  private currentPlayingSource: AudioBufferSourceNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;

  async startRecording(): Promise<boolean> {
    this.audioChunks = [];
    this.recordedWaveform = [];
    this.startTime = Date.now();
    this.isSimulated = false;

    try {
      // Try initializing AudioContext
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.micStream = stream;

        if (this.audioContext) {
          const source = this.audioContext.createMediaStreamSource(stream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 64;
          source.connect(this.analyser);
        }

        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/ogg')
          ? 'audio/ogg'
          : 'audio/mp4';

        this.mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.audioChunks.push(e.data);
          }
        };

        this.mediaRecorder.start(100);
        return true;
      }
    } catch {
      // Graceful fallback to simulated audio mode
      this.isSimulated = true;
    }

    this.isSimulated = true;
    return true;
  }

  getLiveWaveform(barCount: number = 24): number[] {
    if (this.analyser && !this.isSimulated) {
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.analyser.getByteFrequencyData(dataArray);

      const step = Math.max(1, Math.floor(bufferLength / barCount));
      const waveform: number[] = [];

      for (let i = 0; i < barCount; i++) {
        const index = Math.min(bufferLength - 1, i * step);
        const value = dataArray[index] / 255;
        // Normalize between 0.15 and 0.95
        const normalized = Math.max(0.15, Math.min(0.95, value * 1.5));
        waveform.push(normalized);
      }

      // Record snapshot into history
      const avg = waveform.reduce((a, b) => a + b, 0) / waveform.length;
      if (this.recordedWaveform.length < 32) {
        this.recordedWaveform.push(avg);
      }

      return waveform;
    }

    // Dynamic simulated speech-wave generation
    const elapsed = (Date.now() - this.startTime) / 1000;
    const waveform: number[] = [];

    for (let i = 0; i < barCount; i++) {
      // Combination of sines to simulate natural human speech modulations
      const baseFreq = (i / barCount) * Math.PI * 4;
      const wave1 = Math.sin(baseFreq + elapsed * 6);
      const wave2 = Math.cos(baseFreq * 1.5 - elapsed * 4);
      const wave3 = Math.sin(elapsed * 10 + i);

      const rawAmp = 0.35 + 0.3 * wave1 + 0.2 * wave2 + 0.15 * wave3;
      const normalized = Math.max(0.15, Math.min(0.95, rawAmp));
      waveform.push(normalized);
    }

    const avg = waveform.reduce((a, b) => a + b, 0) / waveform.length;
    if (this.recordedWaveform.length < 32) {
      this.recordedWaveform.push(avg);
    }

    return waveform;
  }

  async stopRecording(): Promise<{ audioUrl: string; duration: number; waveform: number[] }> {
    const duration = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const finalWaveform = this.generateSampledWaveform(this.recordedWaveform, 28);

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      return new Promise((resolve) => {
        this.mediaRecorder!.onstop = () => {
          const blob = new Blob(this.audioChunks, {
            type: this.mediaRecorder?.mimeType || 'audio/webm',
          });
          const audioUrl = URL.createObjectURL(blob);
          this.cleanup();
          resolve({ audioUrl, duration, waveform: finalWaveform });
        };
        this.mediaRecorder!.stop();
      });
    }

    // If simulated or fallback, synthesize playable audio tone
    const audioUrl = await this.synthesizeVoiceAudioSnippet(duration);
    this.cleanup();
    return { audioUrl, duration, waveform: finalWaveform };
  }

  cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    this.cleanup();
  }

  private cleanup(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    this.analyser = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  private generateSampledWaveform(history: number[], targetBars: number): number[] {
    if (history.length === 0) {
      // Generate pleasing speech pattern
      return Array.from({ length: targetBars }, (_, i) => {
        const factor = Math.sin((i / targetBars) * Math.PI);
        const noise = (Math.random() * 0.35 + 0.15);
        return Math.max(0.18, Math.min(0.95, factor * 0.7 + noise * 0.3));
      });
    }

    const result: number[] = [];
    const step = history.length / targetBars;
    for (let i = 0; i < targetBars; i++) {
      const idx = Math.min(history.length - 1, Math.floor(i * step));
      result.push(history[idx] || 0.4);
    }
    return result;
  }

  /**
   * Synthesize a melodic human-like harmonic voice note using Web Audio API
   * Produces an actual playable AudioBlob so users can listen back seamlessly
   */
  private async synthesizeVoiceAudioSnippet(duration: number): Promise<string> {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return '';

      const sampleRate = 44100;
      const length = sampleRate * duration;
      const ctx = new OfflineAudioContext(1, length, sampleRate);

      // Create warm harmonic vocal frequencies
      const frequencies = [220, 277, 330, 440, 330, 277, 220];
      const segmentLen = duration / frequencies.length;

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, idx * segmentLen);

        // Vocal formant filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, idx * segmentLen);
        filter.Q.setValueAtTime(3.0, idx * segmentLen);

        gain.gain.setValueAtTime(0.001, idx * segmentLen);
        gain.gain.exponentialRampToValueAtTime(0.3, idx * segmentLen + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, (idx + 1) * segmentLen - 0.02);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(idx * segmentLen);
        osc.stop((idx + 1) * segmentLen);
      });

      const renderedBuffer = await ctx.startRendering();
      return this.audioBufferToWavBlobUrl(renderedBuffer);
    } catch {
      return '';
    }
  }

  private audioBufferToWavBlobUrl(buffer: AudioBuffer): string {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    let sampleRate = buffer.sampleRate;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
      out.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      out.setUint32(pos, data, true);
      pos += 4;
    }

    // RIFF identifier
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    // format chunk identifier
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // bits per sample

    // data chunk identifier
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4); // chunk length

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    const blob = new Blob([out.buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  /**
   * Play any audio URL with speed control and callback
   */
  play(audioUrl: string, playbackRate: number = 1.0, onEnded?: () => void): HTMLAudioElement {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }

    const audio = new Audio(audioUrl);
    audio.playbackRate = playbackRate;
    audio.onended = () => {
      onEnded?.();
    };
    audio.play().catch(() => {
      onEnded?.();
    });

    this.currentAudioElement = audio;
    return audio;
  }

  stopPlayback(): void {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
  }
}

export const audioRecorderService = new AudioRecorderService();
