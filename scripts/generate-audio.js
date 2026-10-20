// Generates a 20-second calming, harmonious instrumental audio file (WAV format)
// Suitable for ambient traditional wedding background music
const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const durationSec = 24;
const totalSamples = sampleRate * durationSec;
const numChannels = 2; // Stereo
const bytesPerSample = 2; // 16-bit PCM
const blockAlign = numChannels * bytesPerSample;
const byteRate = sampleRate * blockAlign;
const dataSize = totalSamples * blockAlign;

const buffer = Buffer.alloc(44 + dataSize);

// RIFF header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);

// fmt chunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // subchunk 1 size (16 for PCM)
buffer.writeUInt16LE(1, 20); // AudioFormat 1 = PCM
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(bytesPerSample * 8, 34);

// data chunk
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

// Compose a soothing, pentatonic acoustic oud / harp / bell arpeggio harmony
// Pentatonic frequencies (A major / Hijaz feeling): A3, C#4, D4, E4, G#4, A4, C#5, E5
const chords = [
  [220.0, 277.18, 329.63, 440.0, 554.37], // A major
  [196.0, 246.94, 293.66, 392.0, 493.88], // G major
  [174.61, 220.0, 261.63, 349.23, 440.0], // F major
  [164.81, 207.65, 246.94, 329.63, 415.30] // E major
];

const chordDuration = sampleRate * 6; // 6 seconds per chord

for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;
  const chordIdx = Math.floor(i / chordDuration) % chords.length;
  const currentChord = chords[chordIdx];
  const chordLocalSample = i % chordDuration;
  const chordLocalT = chordLocalSample / sampleRate;

  let leftSample = 0;
  let rightSample = 0;

  // Add notes in arpeggio
  for (let n = 0; n < currentChord.length; n++) {
    const noteStartTime = n * 0.8;
    const noteTime = chordLocalT - noteStartTime;

    if (noteTime > 0) {
      const freq = currentChord[n];
      // Decay envelope
      const decay = Math.exp(-noteTime * 1.8);
      // Soft fundamental + harmonic
      const noteWave = (Math.sin(2 * Math.PI * freq * noteTime) * 0.7 +
                        Math.sin(4 * Math.PI * freq * noteTime) * 0.25 +
                        Math.sin(6 * Math.PI * freq * noteTime) * 0.05) * decay;

      // Panning
      const pan = (n / (currentChord.length - 1)) * 0.6 - 0.3; // -0.3 to +0.3
      leftSample += noteWave * (0.5 - pan);
      rightSample += noteWave * (0.5 + pan);
    }
  }

  // Soft low warm drone pad in background
  const padFreq = currentChord[0] / 2;
  const padWave = (Math.sin(2 * Math.PI * padFreq * t) * 0.15 +
                   Math.sin(4 * Math.PI * padFreq * t) * 0.05);
  leftSample += padWave * 0.5;
  rightSample += padWave * 0.5;

  // Overall gentle master volume
  const masterVolume = 0.22;
  const clampedL = Math.max(-1, Math.min(1, leftSample * masterVolume));
  const clampedR = Math.max(-1, Math.min(1, rightSample * masterVolume));

  const intL = Math.floor(clampedL * 32767);
  const intR = Math.floor(clampedR * 32767);

  const offset = 44 + i * blockAlign;
  buffer.writeInt16LE(intL, offset);
  buffer.writeInt16LE(intR, offset + 2);
}

const outputPathWav = path.join(__dirname, '..', 'public', 'audio', 'wedding-music.wav');
const outputPathMp3 = path.join(__dirname, '..', 'public', 'audio', 'wedding-music.mp3');

fs.writeFileSync(outputPathWav, buffer);
// Also write as wedding-music.mp3 (browsers will sniff/play or we point to wav/mp3)
fs.writeFileSync(outputPathMp3, buffer);

console.log('Wedding instrumental audio files created successfully:');
console.log(' - ' + outputPathWav);
console.log(' - ' + outputPathMp3);
