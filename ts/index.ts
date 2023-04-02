import { MIDIHelper } from "./midiHelper";
import { MidiTruncate } from "./midiTruncate";
import { TouchCanvas } from "./touchCanvas";

document.body.innerHTML = '';

const button = document.createElement('button');
button.textContent = 'Begin!';
button.addEventListener('click', async () => {
  const audioContext = new AudioContext();
  const o = await MIDIHelper.getDefaultOutput();
  document.body.innerHTML = '';

  const i = await MIDIHelper.getDefaultInput();
  document.body.innerHTML = '';

  {
    const b = document.createElement('button');
    b.textContent = 'TouchCanvas';
    b.addEventListener('click', () => { new TouchCanvas(audioContext, o); });
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
      new MidiTruncate(/*lowNote=*/59, i, o);
    });
    document.body.appendChild(b);
  }

});
document.body.appendChild(button);

