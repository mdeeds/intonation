import { MIDIHelper } from "./midiHelper";
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

});
document.body.appendChild(button);

