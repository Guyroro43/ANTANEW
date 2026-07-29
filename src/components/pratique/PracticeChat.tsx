'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, MicOff, MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PERSONAS, getPersona } from '@/lib/personas';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface PracticeChatProps {
  firstName: string;
}

type Mode = 'text' | 'voice';
type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: { transcript: string };
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

const PERSONA_STORAGE_KEY = 'anta_pratique_persona';

export function PracticeChat({ firstName }: PracticeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: `Hi ${firstName}! 👋 I'm Kora, your English practice partner. Tell me about your day, or ask me anything — let's chat!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [mode, setMode] = useState<Mode>('text');
  const [personaId, setPersonaId] = useState('kora');
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const persona = getPersona(personaId);

  useEffect(() => {
    const stored = window.localStorage.getItem(PERSONA_STORAGE_KEY);
    if (stored) setPersonaId(stored);
    setVoiceSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));

    return () => {
      recognitionRef.current?.stop();
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  const choosePersona = (id: string) => {
    setPersonaId(id);
    window.localStorage.setItem(PERSONA_STORAGE_KEY, id);
    setShowPersonaPicker(false);
  };

  const playSegment = (audioContentBase64: string) =>
    new Promise<void>((resolve) => {
      const audio = new Audio(`data:audio/mpeg;base64,${audioContentBase64}`);
      audioRef.current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });

  const playSpeech = async (text: string) => {
    if (!text.trim()) return;

    setAvatarState('speaking');
    try {
      const response = await fetch('/api/pratique/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, personaId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Échec de la synthèse vocale.');

      const segments = (data.segments ?? []) as { audioContentBase64: string }[];
      for (const segment of segments) {
        await playSegment(segment.audioContentBase64);
      }
    } catch {
      // Silencieux : un échec de synthèse vocale ne doit pas bloquer la conversation.
    } finally {
      setAvatarState('idle');
    }
  };

  const sendMessage = async (text: string, speak: boolean) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const history = messages;
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setIsSending(true);
    setError(null);
    if (speak) setAvatarState('thinking');

    try {
      const response = await fetch('/api/pratique/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history, spoken: speak }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Échec de la réponse IA.');
      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
      if (speak) await playSpeech(data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la réponse IA.');
      setAvatarState('idle');
    } finally {
      setIsSending(false);
    }
  };

  const toggleRecording = (onFinal: (transcript: string) => void) => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const RecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!RecognitionCtor) return;

    const recognition = new RecognitionCtor();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.resultIndex]?.[0]?.transcript ?? '';
      onFinal(transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    setIsRecording(true);
    setAvatarState('listening');
    recognition.start();
  };

  const handleVoiceMicTap = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }
    toggleRecording((transcript) => {
      setAvatarState('idle');
      if (transcript.trim()) sendMessage(transcript, true);
    });
  };

  const handleTextMicTap = () => {
    toggleRecording((transcript) => {
      setAvatarState('idle');
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-red-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <div className="border-b border-slate-200 bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 p-4 text-white dark:border-slate-700 dark:from-green-700 dark:via-green-600 dark:to-emerald-500">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPersonaPicker((v) => !v)}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20"
          >
            <Image src={persona.avatar} alt={persona.name} width={40} height={40} className="h-full w-full object-cover" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-bold">{persona.name}</p>
            <p className="truncate text-xs text-white/80">Partenaire de conversation — entraînement libre, pas une évaluation</p>
          </div>
          <button
            type="button"
            onClick={() => setMode((m) => (m === 'text' ? 'voice' : 'text'))}
            aria-label={mode === 'text' ? 'Passer en mode vocal' : 'Passer en mode texte'}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
          >
            {mode === 'text' ? <Mic className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
          </button>
        </div>

        {showPersonaPicker && (
          <div className="mt-3 flex gap-3">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => choosePersona(p.id)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition',
                  p.id === personaId ? 'bg-white/25' : 'hover:bg-white/10',
                )}
              >
                <span className="h-12 w-12 overflow-hidden rounded-full border-2 border-white/60">
                  <Image src={p.avatar} alt={p.name} width={48} height={48} className="h-full w-full object-cover" />
                </span>
                <span className="text-xs font-semibold">{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {mode === 'text' ? (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm',
                        msg.role === 'user'
                          ? 'bg-red-600 text-white dark:bg-green-600'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
                      )}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isSending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {persona.name} écrit…
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input, false);
            }}
            className="flex items-center gap-2 border-t border-slate-200 p-3 dark:border-slate-700"
          >
            {voiceSupported && (
              <button
                type="button"
                onClick={handleTextMicTap}
                aria-label={isRecording ? 'Arrêter la dictée vocale' : 'Dicter un message'}
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition',
                  isRecording
                    ? 'animate-pulse bg-red-600 text-white'
                    : 'border border-slate-300 text-slate-600 hover:border-red-400 dark:border-slate-600 dark:text-slate-300',
                )}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write in English…"
              disabled={isSending}
              className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              aria-label="Envoyer"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700 disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
          {!voiceSupported ? (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Ton navigateur ne supporte pas la reconnaissance vocale. Utilise le mode texte à la place.
            </p>
          ) : (
            <>
              <motion.div
                animate={
                  avatarState === 'listening'
                    ? { scale: [1, 1.05, 1] }
                    : avatarState === 'speaking'
                      ? { scale: [1, 1.03, 1] }
                      : { scale: 1 }
                }
                transition={{ repeat: avatarState === 'idle' || avatarState === 'thinking' ? 0 : Infinity, duration: 0.9 }}
                className={cn(
                  'relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full ring-4 transition-all sm:h-52 sm:w-52',
                  avatarState === 'listening' && 'ring-red-400',
                  avatarState === 'speaking' && 'ring-yellow-400',
                  avatarState === 'thinking' && 'ring-slate-300 opacity-70',
                  avatarState === 'idle' && 'ring-slate-200 dark:ring-slate-700',
                )}
              >
                <Image src={persona.avatar} alt={persona.name} fill className="object-cover" />
              </motion.div>

              <div className="text-center">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{persona.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {avatarState === 'listening' && 'Je t’écoute…'}
                  {avatarState === 'thinking' && 'Je réfléchis…'}
                  {avatarState === 'speaking' && 'En train de parler…'}
                  {avatarState === 'idle' && 'Appuie sur le micro pour parler'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleVoiceMicTap}
                disabled={avatarState === 'thinking' || avatarState === 'speaking'}
                aria-label={isRecording ? 'Arrêter' : 'Parler'}
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition disabled:opacity-50',
                  isRecording ? 'animate-pulse bg-red-600' : 'bg-gradient-to-br from-red-600 to-yellow-500 hover:opacity-90',
                )}
              >
                {isRecording ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
              </button>

              {error && <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}

              <button
                type="button"
                onClick={() => setMode('text')}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:underline dark:text-slate-400"
              >
                <X className="h-3.5 w-3.5" />
                Revenir au texte
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
