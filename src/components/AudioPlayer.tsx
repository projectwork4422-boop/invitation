"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  shouldPlay: boolean;
  audioSrc?: string;
}

export function AudioPlayer({ shouldPlay }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Web Audio synthesizer fallback ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [usingSynth, setUsingSynth] = useState(false);

  // Calming, gentle acoustic oud/harp pentatonic melody notes (frequencies in Hz)
  const melodyNotes = [
    220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25,
  ];
  const arpeggioPattern = [
    0, 2, 4, 7, 6, 4, 2, 4, 5, 7, 9, 7, 5, 4, 2, 0,
  ];

  const playSynthesizedMelody = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      let step = 0;

      const playNote = () => {
        if (!ctx || ctx.state === "closed" || isMuted) return;

        const noteIndex = arpeggioPattern[step % arpeggioPattern.length];
        const freq = melodyNotes[noteIndex % melodyNotes.length];

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.05, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.3);

        step++;
      };

      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
      }

      playNote();
      synthTimerRef.current = setInterval(playNote, 950);
      setUsingSynth(true);
      setIsPlaying(true);
    } catch (e) {
      console.warn("Web Audio API not supported or suspended:", e);
    }
  }, [isMuted, melodyNotes, arpeggioPattern]);

  const stopSynthesizedMelody = useCallback(() => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "running") {
      audioCtxRef.current.suspend();
    }
    setUsingSynth(false);
  }, []);

  const startAudio = useCallback(async () => {
    setHasInteracted(true);
    if (!audioRef.current) return;

    try {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.6;
      await audioRef.current.play();
      setIsPlaying(true);
      setIsMuted(false);
    } catch {
      console.info("Audio element playback failed, activating ambient synthesizer.");
      playSynthesizedMelody();
    }
  }, [playSynthesizedMelody]);

  const toggleMute = () => {
    if (!hasInteracted) {
      startAudio();
      return;
    }

    if (usingSynth) {
      if (isPlaying) {
        stopSynthesizedMelody();
        setIsPlaying(false);
        setIsMuted(true);
      } else {
        setIsMuted(false);
        playSynthesizedMelody();
      }
      return;
    }

    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsMuted(false);
          })
          .catch(() => {
            playSynthesizedMelody();
          });
      } else {
        if (isMuted) {
          audioRef.current.muted = false;
          setIsMuted(false);
          setIsPlaying(true);
        } else {
          audioRef.current.muted = true;
          setIsMuted(true);
          setIsPlaying(false);
        }
      }
    }
  };

  useEffect(() => {
    if (shouldPlay && !hasInteracted) {
      startAudio();
    }
  }, [shouldPlay, hasInteracted, startAudio]);

  // If autoplay was temporarily restricted, resume upon the user's next tap/click
  useEffect(() => {
    if (!shouldPlay) return;

    const resumeOnUserGesture = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsMuted(false);
          })
          .catch(() => {});
      }
      window.removeEventListener("click", resumeOnUserGesture);
      window.removeEventListener("touchstart", resumeOnUserGesture);
    };

    window.addEventListener("click", resumeOnUserGesture, { once: true });
    window.addEventListener("touchstart", resumeOnUserGesture, { once: true });

    return () => {
      window.removeEventListener("click", resumeOnUserGesture);
      window.removeEventListener("touchstart", resumeOnUserGesture);
    };
  }, [shouldPlay]);

  useEffect(() => {
    return () => {
      stopSynthesizedMelody();
    };
  }, [stopSynthesizedMelody]);

  const handleAudioError = () => {
    if (shouldPlay && !usingSynth) {
      playSynthesizedMelody();
    }
  };

  return (
    <aside aria-label="Audio player controls" className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
      <audio
        ref={audioRef}
        loop
        preload="auto"
        onError={handleAudioError}
        onPlay={() => {
          setIsPlaying(true);
          setIsMuted(false);
        }}
        onPause={() => setIsPlaying(false)}
      >
        <source
          src="/audio/Tujh%20Mein%20Rab%20Dikhta%20Hai%20_%20Violin%20Cover%20_%20Binesh%20Babu%20bollywood%20srk%20love%20violin%20cover%20music.mp3"
          type="audio/mpeg"
        />
        <source
          src="/audio/Tujh Mein Rab Dikhta Hai _ Violin Cover _ Binesh Babu bollywood srk love violin cover music.mp3"
          type="audio/mpeg"
        />
        <source src="/audio/wedding-music.mp3" type="audio/mpeg" />
      </audio>

      <button
        onClick={toggleMute}
        type="button"
        aria-label={isPlaying && !isMuted ? "Mute background wedding music" : "Play background wedding music"}
        className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-[#FFFFFF]/95 hover:bg-[#FAF7F0] text-[#29251F] border border-[#E5DCCB] hover:border-[#B89B63] shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {isPlaying && !isMuted ? (
          <Volume2 className="w-5 h-5 text-[#B89B63] transition-transform duration-300 group-hover:scale-110" />
        ) : (
          <VolumeX className="w-5 h-5 text-[#7A7366] transition-transform duration-300 group-hover:scale-110" />
        )}
      </button>
    </aside>
  );
}
