export class MIDIHelper {
  public static async getDefaultOutput(): Promise<WebMidi.MIDIOutput> {
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

  public static async getDefaultInput(): Promise<WebMidi.MIDIInput> {
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