//  npm install @types/webmidi
export class MidiFloat {
  private previousNote: number | null = null;
  private previousBend: number = 0;

  constructor(private midiOutput: WebMidi.MIDIOutput) { }

  public setNote(note: number) {
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

  public noteOff() {
    // Send Note Off event for previous note
    if (this.previousNote !== null) {
      this.sendNoteOff(this.previousNote);
      this.previousNote = null;
    }
  }

  private sendNoteOn(note: number) {
    const message = [0x90, note, 96];
    this.midiOutput.send(message);
    // console.log(`${message}`)
  }

  private sendNoteOff(note: number) {
    const message = [0x90, note, 0];
    this.midiOutput.send(message);
    // console.log(`${message}`)
  }

  // `bend` is a floating point number -1 to +1 for
  // the amount of desired bend measured in semitones.
  sendPitchBend(bend: number) {
    // Convert bend value from semitones to 14-bit pitch bend value
    const value = Math.round((bend * (2 << 10) + (2 << 12)));
    const message = [0xE0, value & 0x7F, value >> 7 & 0x7F];

    // Send MIDI message
    // console.log(`${message}`)
    this.midiOutput.send(message);
  }
}
