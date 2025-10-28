"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  title: string;
  html: string; // full HTML string from your Markdown render
};

function stripHtmlToText(html: string) {
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.textContent || el.innerText || "";
}

// Split into chunks so each utterance stays under API limits and breathes naturally
function chunkText(text: string, maxLen = 1200) {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/); // split by sentence boundaries

  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + " " + s).trim().length > maxLen) {
      if (current) chunks.push(current.trim());
      current = s;
    } else {
      current = (current ? current + " " : "") + s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export default function ReadAloud({ title, html }: Props) {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceIndex, setVoiceIndex] = useState<number>(-1);
  const [rate, setRate] = useState(1);   // 0.5 - 2
  const [pitch, setPitch] = useState(1); // 0 - 2
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const text = useMemo(() => stripHtmlToText(html), [html]);
  const chunks = useMemo(() => chunkText(`${title}. ${text}`), [title, text]);

  const queueRef = useRef<SpeechSynthesisUtterance[]>([]);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "speechSynthesis" in window;
    setSupported(ok);
    if (!ok) return;

    function loadVoices() {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      // try to pick an English-like default
      const i = v.findIndex(
        (vv) => /en-/i.test(vv.lang) || /English/i.test(vv.name)
      );
      if (i >= 0) setVoiceIndex(i);
    }

    loadVoices();
    // Some browsers (Chrome) load voices async
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  function clearQueue(stop = false) {
    queueRef.current = [];
    if (stop) {
      window.speechSynthesis.cancel();
    }
  }

  function buildQueue() {
    clearQueue(true);
    const voice = voiceIndex >= 0 ? voices[voiceIndex] : undefined;

    const list = chunks.map((c) => {
      const ut = new SpeechSynthesisUtterance(c);
      if (voice) ut.voice = voice;
      ut.rate = rate;
      ut.pitch = pitch;
      ut.onend = onUtteranceEnd;
      ut.onerror = onUtteranceEnd;
      return ut;
    });
    queueRef.current = list;
  }

  function onUtteranceEnd() {
    // when one ends, speak next or finish
    const q = queueRef.current;
    if (q.length === 0) {
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }
    const next = q.shift();
    if (next) window.speechSynthesis.speak(next);
  }

  function handlePlay() {
    if (!supported || chunks.length === 0) return;

    // resume if paused
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // fresh start
    buildQueue();
    setIsPlaying(true);
    setIsPaused(false);
    // kick off first item
    const first = queueRef.current.shift();
    if (first) window.speechSynthesis.speak(first);
  }

  function handlePause() {
    if (!supported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }

  function handleStop() {
    if (!supported) return;
    clearQueue(true);
    setIsPlaying(false);
    setIsPaused(false);
  }

  // If user changes rate/pitch/voice mid-play, rebuild
  useEffect(() => {
    if (isPlaying) {
      // rebuild queue with new settings for remaining text
      const remainingText = queueRef.current
        .map((u) => u.text)
        .join(" ");
      const leftovers = remainingText ? chunkText(leftoverTextSanitize(remainingText)) : [];
      clearQueue(true);
      const voice = voiceIndex >= 0 ? voices[voiceIndex] : undefined;
      queueRef.current = leftovers.map((c) => {
        const ut = new SpeechSynthesisUtterance(c);
        if (voice) ut.voice = voice;
        ut.rate = rate;
        ut.pitch = pitch;
        ut.onend = onUtteranceEnd;
        ut.onerror = onUtteranceEnd;
        return ut;
      });
      const next = queueRef.current.shift();
      if (next) window.speechSynthesis.speak(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate, pitch, voiceIndex]);

  function leftoverTextSanitize(t: string) {
    return t.replace(/\s+/g, " ").trim();
  }

  if (!supported) {
    return (
      <div className="mb-4 rounded-lg bg-yellow-50 text-yellow-800 px-4 py-3 text-sm">
        Voice narration isn’t supported in this browser.
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white/60 dark:bg-neutral-900/40 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handlePlay}
          className="rounded-md bg-blue-600 px-3 py-2 text-white text-sm font-medium hover:bg-blue-700"
          aria-label="Play narration"
        >
          ▶ Play
        </button>
        <button
          onClick={handlePause}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          aria-label="Pause narration"
        >
          ⏸ Pause
        </button>
        <button
          onClick={handleStop}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          aria-label="Stop narration"
        >
          ⏹ Stop
        </button>

        {/* Voice, rate, pitch controls */}
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <label className="text-sm text-neutral-700 dark:text-neutral-300">
            Voice{" "}
            <select
              className="ml-1 rounded-md border px-2 py-1 text-sm bg-white dark:bg-neutral-800"
              value={voiceIndex}
              onChange={(e) => setVoiceIndex(parseInt(e.target.value, 10))}
            >
              <option value={-1}>Default</option>
              {voices.map((v, i) => (
                <option key={v.name + i} value={i}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-neutral-700 dark:text-neutral-300">
            Rate{" "}
            <input
              type="range"
              min={0.6}
              max={1.6}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
            />
          </label>

          <label className="text-sm text-neutral-700 dark:text-neutral-300">
            Pitch{" "}
            <input
              type="range"
              min={0.6}
              max={1.6}
              step={0.1}
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
