export class SingleTone {
  private oscillator: OscillatorNode;
  private lowPassFilter: BiquadFilterNode;
  private gain: GainNode;

  constructor(private audioContext: AudioContext) {
    // Create oscillator node
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = 'square';

    // Create low pass filter node
    this.lowPassFilter = this.audioContext.createBiquadFilter();
    this.lowPassFilter.type = 'lowpass';

    this.gain = this.audioContext.createGain();
    this.gain.gain.setValueAtTime(0, audioContext.currentTime);
    this.oscillator.connect(this.lowPassFilter);
    this.lowPassFilter.connect(this.gain);
    this.gain.connect(this.audioContext.destination);

    this.setNote(69 - 12);

    this.oscillator.start();
  }

  public setFrequency(frequency: number) {
    this.oscillator.frequency.value = frequency;
    this.lowPassFilter.frequency.value = frequency * 2;

    // this.oscillator.frequency.setTargetAtTime(frequency, this.audioContext.currentTime, 1 / 60);
    // this.lowPassFilter.frequency.setTargetAtTime(frequency * 2, this.audioContext.currentTime, 1 / 60);
  }

  public setNote(note: number) {
    // Convert MIDI note number to frequency in Hz
    const frequency = 440 * Math.pow(2, (note - 69) / 12);

    // Call setFrequency function with the calculated frequency
    this.setFrequency(frequency);
  }

  public setGain(gain: number) {
    // Set gain value
    this.gain.gain.setTargetAtTime(gain, this.audioContext.currentTime, 0.1);
  }
}