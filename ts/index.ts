import { MIDIOutputHelper } from "./midiHelper";
import { TouchCanvas } from "./touchCanvas";

document.body.innerHTML = '';

const button = document.createElement('button');
button.textContent = 'Begin!';
button.addEventListener('click', async () => {
  const audioContext = new AudioContext();

  const o = await MIDIOutputHelper.getDefaultOutput();

  const tc = new TouchCanvas(audioContext, o);
});
document.body.appendChild(button);

