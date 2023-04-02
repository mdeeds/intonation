export class MidiTruncate {
  constructor(private lowNote: number, i: WebMidi.MIDIInput, o: WebMidi.MIDIOutput) {
    document.body.innerHTML = `MIDI Truncate running ${lowNote}; In=${i.name} Out=${o.name}`;
    i.addEventListener('midimessage', (e: WebMidi.MIDIMessageEvent) => {
      o.send(this.translate(e.data));
    });
  }

  private translate(data: Uint8Array): Uint8Array {
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
    } else {
      return data;
    }
  }
}