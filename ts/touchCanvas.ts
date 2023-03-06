import { SingleTone } from "./singleTone";
import { MidiFloat } from "./midiFloat";

type XY = [x: number, y: number];

export class TouchCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private keyPitch = 60;
  private lowNote = 67 - 24;
  private activePoints: Map<number, XY> = new Map<number, XY>();
  private tones: Map<number, SingleTone> = new Map<number, SingleTone>();
  private midiFloat: MidiFloat;

  constructor(audioContext: AudioContext, private midiOutput: WebMidi.MIDIOutput) {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    for (let i = 0; i < 10; ++i) {
      this.tones.set(i, new SingleTone(audioContext));
    }
    this.midiFloat = new MidiFloat(midiOutput);

    // Set canvas dimensions to fill the screen
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Add canvas to document body
    document.body.innerHTML = '';
    document.body.appendChild(this.canvas);

    // Get 2D rendering context
    this.ctx = this.canvas.getContext('2d')!;

    // Set up touch handler
    this.canvas.addEventListener('touchstart', this.handleDown.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this));
    this.canvas.addEventListener('touchmove', this.handleDown.bind(this));

    // // Set up mouse handler
    // this.canvas.addEventListener('mousedown', this.handleDown.bind(this));
    // this.canvas.addEventListener('mouseup', this.handleUp.bind(this));
    // this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));

    const render = () => {
      this.drawKeyboard();
      this.setTone();
      window.requestAnimationFrame(render);
    };
    render();
  }

  private setTone() {
    for (let i = 0; i < 10; ++i) {
      const tone = this.tones.get(i);
      if (this.activePoints.has(i)) {
        const xy = this.activePoints.get(i);
        const note = this.lowNote + xy[0] / this.keyPitch - 0.5;
        tone.setNote(note);
        tone.setGain(0.1);
        this.midiFloat.setNote(note);
      } else {
        tone.setGain(0);
        this.midiFloat.noteOff();
      }
    }
  }

  private drawKeyboard() {
    this.ctx.fillStyle = 'grey';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const numKeys = Math.ceil(this.canvas.width / this.keyPitch);
    // Draw lines
    for (let i = 0; i < numKeys; i++) {
      // Calculate x position of line
      const x = (i + 0.5) * this.keyPitch;

      const w1 = this.keyPitch * 0.05;
      const w2 = this.keyPitch * 0.3;

      const noteNumber = (this.lowNote + i) % 12;
      if (noteNumber == 1 || noteNumber == 3 || noteNumber == 6 || noteNumber == 8 || noteNumber == 10) {
        // Draw black line
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x - w2, 0, 2 * w2, this.canvas.height / 2);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x - w1, 0, 2 * w1, this.canvas.height / 2);
      } else {
        // Draw white line
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillRect(x - w2, 0, 2 * w2, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x - w1, 0, 2 * w1, this.canvas.height);
      }
    }

    for (const [i, xy] of this.activePoints) {
      this.fillCircle(xy[0], xy[1]);
    }
  }

  private handleDown(event: TouchEvent) {
    // Get event coordinates
    for (let i = 0; i < event.touches.length; ++i) {
      const touch = event.touches.item(i)
      // console.log(`Down: ${touch.identifier}`);
      const x = touch.clientX - this.canvas.offsetLeft;
      const y = touch.clientY - this.canvas.offsetTop;
      this.fillCircle(x, y);
      this.activePoints.set(touch.identifier, [x, y]);
    }
    event.preventDefault();
  }

  private fillCircle(x: number, y: number) {
    // Fill circle at event coordinates
    this.ctx.beginPath();
    this.ctx.arc(x, y, 40, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'red';
    this.ctx.fill();
  }

  private activeIds = new Set<number>();
  private handleTouchEnd(event: TouchEvent) {
    this.activeIds.clear();
    for (let i = 0; i < event.touches.length; ++i) {
      this.activeIds.add(event.touches.item(i).identifier);
    }
    for (const [i, tone] of this.tones) {
      if (!this.activeIds.has(i) && this.activePoints.has(i)) {
        // console.log(`Up: ${i}`);
        this.tones.get(i).setGain(0);
        this.activePoints.delete(i);
        // TODO: Send MIDI Off
      }
    }
    event.preventDefault();
    // Handle touch end events
  }
}