/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 706:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidiFloat = void 0;
//  npm install @types/webmidi
class MidiFloat {
    midiOutput;
    previousNote = null;
    previousBend = 0;
    constructor(midiOutput) {
        this.midiOutput = midiOutput;
    }
    setNote(note) {
        const newNote = Math.round(note);
        if (this.previousNote != newNote) {
            // Send Note On event for new note
            this.sendNoteOn(newNote);
            // Send Note Off event for previous note after the on
            // event so that we get a legato transition.
            if (this.previousNote !== null) {
                this.sendNoteOff(this.previousNote);
            }
        }
        // Send pitch bend event for fractional part of note
        const pitchBend = note - newNote;
        if (pitchBend != this.previousBend) {
            this.sendPitchBend(pitchBend);
            this.previousBend = pitchBend;
        }
        // Save new note as previous note
        this.previousNote = newNote;
    }
    noteOff() {
        // Send Note Off event for previous note
        if (this.previousNote !== null) {
            this.sendNoteOff(this.previousNote);
            this.previousNote = null;
        }
    }
    sendNoteOn(note) {
        const message = [0x90, note, 96];
        this.midiOutput.send(message);
        // console.log(`${message}`)
    }
    sendNoteOff(note) {
        const message = [0x90, note, 0];
        this.midiOutput.send(message);
        // console.log(`${message}`)
    }
    // `bend` is a floating point number -1 to +1 for
    // the amount of desired bend measured in semitones.
    sendPitchBend(bend) {
        // Convert bend value from semitones to 14-bit pitch bend value
        const value = Math.round((bend * (2 << 10) + (2 << 12)));
        const message = [0xE0, value & 0x7F, value >> 7 & 0x7F];
        // Send MIDI message
        // console.log(`${message}`)
        this.midiOutput.send(message);
    }
}
exports.MidiFloat = MidiFloat;
//# sourceMappingURL=midiFloat.js.map

/***/ }),

/***/ 398:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MIDIHelper = void 0;
class MIDIHelper {
    static async getDefaultOutput() {
        if (!navigator.requestMIDIAccess)
            throw new Error("Your browser does not support WebMIDI API");
        const access = await navigator.requestMIDIAccess();
        return new Promise((resolve, reject) => {
            document.body.innerHTML = '';
            for (const [name, o] of access.outputs.entries()) {
                const button = document.createElement('button');
                button.textContent = `${o.name} ${o.id} ${o.manufacturer} ${o.type}`;
                button.addEventListener('click', function () {
                    resolve(o);
                }.bind(o));
                document.body.appendChild(button);
            }
        });
    }
    static async getDefaultInput() {
        if (!navigator.requestMIDIAccess)
            throw new Error("Your browser does not support WebMIDI API");
        const access = await navigator.requestMIDIAccess();
        return new Promise((resolve, reject) => {
            document.body.innerHTML = '';
            for (const [name, i] of access.inputs.entries()) {
                const button = document.createElement('button');
                button.textContent = `${i.name} ${i.id} ${i.manufacturer} ${i.type}`;
                button.addEventListener('click', function () {
                    resolve(i);
                }.bind(i));
                document.body.appendChild(button);
            }
        });
    }
}
exports.MIDIHelper = MIDIHelper;
//# sourceMappingURL=midiHelper.js.map

/***/ }),

/***/ 168:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MidiTruncate = void 0;
class MidiTruncate {
    lowNote;
    constructor(lowNote, i, o) {
        this.lowNote = lowNote;
        document.body.innerHTML = `MIDI Truncate running ${lowNote}; In=${i.name} Out=${o.name}`;
        i.addEventListener('midimessage', (e) => {
            o.send(this.translate(e.data));
        });
    }
    translate(data) {
        if (data.length < 3) {
            return data;
        }
        let code = data[0] & 0xf0;
        if (code == 0x80 || code == 0x90) {
            const newData = new Uint8Array(data);
            const oldKey = data[1];
            const newKey = ((oldKey - this.lowNote + 8 * 12) % 12) + this.lowNote;
            newData[1] = newKey;
            return newData;
        }
        else {
            return data;
        }
    }
}
exports.MidiTruncate = MidiTruncate;
//# sourceMappingURL=midiTruncate.js.map

/***/ }),

/***/ 201:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SingleTone = void 0;
class SingleTone {
    audioContext;
    oscillator;
    lowPassFilter;
    gain;
    constructor(audioContext) {
        this.audioContext = audioContext;
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
    setFrequency(frequency) {
        this.oscillator.frequency.value = frequency;
        this.lowPassFilter.frequency.value = frequency * 2;
        // this.oscillator.frequency.setTargetAtTime(frequency, this.audioContext.currentTime, 1 / 60);
        // this.lowPassFilter.frequency.setTargetAtTime(frequency * 2, this.audioContext.currentTime, 1 / 60);
    }
    setNote(note) {
        // Convert MIDI note number to frequency in Hz
        const frequency = 440 * Math.pow(2, (note - 69) / 12);
        // Call setFrequency function with the calculated frequency
        this.setFrequency(frequency);
    }
    setGain(gain) {
        // Set gain value
        this.gain.gain.setTargetAtTime(gain, this.audioContext.currentTime, 0.1);
    }
}
exports.SingleTone = SingleTone;
//# sourceMappingURL=singleTone.js.map

/***/ }),

/***/ 448:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TouchCanvas = void 0;
const singleTone_1 = __webpack_require__(201);
const midiFloat_1 = __webpack_require__(706);
class TouchCanvas {
    midiOutput;
    canvas;
    ctx;
    keyPitch = 60;
    lowNote = 67 - 24;
    activePoints = new Map();
    tones = new Map();
    midiFloat;
    constructor(audioContext, midiOutput) {
        this.midiOutput = midiOutput;
        // Create canvas element
        this.canvas = document.createElement('canvas');
        for (let i = 0; i < 10; ++i) {
            this.tones.set(i, new singleTone_1.SingleTone(audioContext));
        }
        this.midiFloat = new midiFloat_1.MidiFloat(midiOutput);
        // Set canvas dimensions to fill the screen
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Add canvas to document body
        document.body.innerHTML = '';
        document.body.appendChild(this.canvas);
        // Get 2D rendering context
        this.ctx = this.canvas.getContext('2d');
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
    setTone() {
        for (let i = 0; i < 10; ++i) {
            const tone = this.tones.get(i);
            if (this.activePoints.has(i)) {
                const xy = this.activePoints.get(i);
                const note = this.lowNote + xy[0] / this.keyPitch - 0.5;
                tone.setNote(note);
                tone.setGain(0.1);
                this.midiFloat.setNote(note);
            }
            else {
                tone.setGain(0);
                this.midiFloat.noteOff();
            }
        }
    }
    drawKeyboard() {
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
            }
            else {
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
    handleDown(event) {
        // Get event coordinates
        for (let i = 0; i < event.touches.length; ++i) {
            const touch = event.touches.item(i);
            // console.log(`Down: ${touch.identifier}`);
            const x = touch.clientX - this.canvas.offsetLeft;
            const y = touch.clientY - this.canvas.offsetTop;
            this.fillCircle(x, y);
            this.activePoints.set(touch.identifier, [x, y]);
        }
        event.preventDefault();
    }
    fillCircle(x, y) {
        // Fill circle at event coordinates
        this.ctx.beginPath();
        this.ctx.arc(x, y, 40, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'red';
        this.ctx.fill();
    }
    activeIds = new Set();
    handleTouchEnd(event) {
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
exports.TouchCanvas = TouchCanvas;
//# sourceMappingURL=touchCanvas.js.map

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const midiHelper_1 = __webpack_require__(398);
const midiTruncate_1 = __webpack_require__(168);
const touchCanvas_1 = __webpack_require__(448);
document.body.innerHTML = '';
const button = document.createElement('button');
button.textContent = 'Begin!';
button.addEventListener('click', async () => {
    const audioContext = new AudioContext();
    const o = await midiHelper_1.MIDIHelper.getDefaultOutput();
    document.body.innerHTML = '';
    const i = await midiHelper_1.MIDIHelper.getDefaultInput();
    document.body.innerHTML = '';
    {
        const b = document.createElement('button');
        b.textContent = 'TouchCanvas';
        b.addEventListener('click', () => { new touchCanvas_1.TouchCanvas(audioContext, o); });
        document.body.appendChild(b);
    }
    {
        const b = document.createElement('button');
        b.textContent = 'MIDI Truncate';
        // https://newt.phys.unsw.edu.au/jw/notes.html
        // B3 59
        // C4 60
        // D4 62
        // E4 64
        // F4 65
        // G4 67
        // A4 69 
        b.addEventListener('click', () => {
            new midiTruncate_1.MidiTruncate(/*lowNote=*/ 59, i, o);
        });
        document.body.appendChild(b);
    }
});
document.body.appendChild(button);
//# sourceMappingURL=index.js.map
})();

/******/ })()
;
//# sourceMappingURL=index.js.map