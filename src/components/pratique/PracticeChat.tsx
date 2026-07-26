'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface PracticeChatProps {
  firstName: string;
}

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
  const [speakReplies, setSpeakReplies] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    setVoiceSupported(typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));

    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() ?? [];
      const englishFirst = [...voices].sort((a, b) => Number(b.lang.startsWith('en')) - Number(a.lang.startsWith('en')));
      setAvailableVoices(englishFirst);
      setSelectedVoiceURI((prev) => prev || englishFirst.find((v) => v.lang.startsWith('en'))?.voiceURI || '');
    };

    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);

    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const sanitizeForSpeech = (text: string) =>
    text
      .replace(/💡/g, '')
      .replace(/[*_#`~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // La correction (ligne préfixée "💡" dans le prompt de Kora) est toujours
    // en français, le reste toujours en anglais — pas besoin de détection de
    // langue générique, la structure du message le dit déjà.
    const segments = text
      .split('\n')
      .map((line) => ({ isFrench: line.trim().startsWith('💡'), text: sanitizeForSpeech(line) }))
      .filter((segment) => segment.text.length > 0);

    const englishVoice = availableVoices.find((v) => v.voiceURI === selectedVoiceURI);
    const frenchVoice = availableVoices.find((v) => v.lang.startsWith('fr'));

    const playNext = (index: number) => {
      if (index >= segments.length) return;
      const segment = segments[index];
      const utterance = new SpeechSynthesisUtterance(segment.text);
      const voice = segment.isFrench ? frenchVoice : englishVoice;
      utterance.lang = voice?.lang ?? (segment.isFrench ? 'fr-FR' : 'en-US');
      if (voice) utterance.voice = voice;
      utterance.onend = () => playNext(index + 1);
      window.speechSynthesis.speak(utterance);
    };

    playNext(0);
  };

  const toggleRecording = () => {
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
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', text: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/pratique/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: messages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Échec de la réponse IA.');
      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
      if (speakReplies) speak(data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la réponse IA.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-red-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <div className="border-b border-slate-200 bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 p-4 text-white dark:border-slate-700 dark:from-green-700 dark:via-green-600 dark:to-emerald-500">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">Kora</p>
            <p className="truncate text-xs text-white/80">Partenaire de conversation — entraînement libre, pas une évaluation</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSpeakReplies((prev) => !prev);
              window.speechSynthesis?.cancel();
            }}
            aria-label={speakReplies ? 'Désactiver la lecture audio des réponses' : 'Activer la lecture audio des réponses'}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
          >
            {speakReplies ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
        {speakReplies && availableVoices.length > 0 && (
          <select
            value={selectedVoiceURI}
            onChange={(e) => setSelectedVoiceURI(e.target.value)}
            className="mt-3 w-full rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs text-white outline-none [&>option]:text-slate-900"
          >
            {availableVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        )}
      </div>

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
                Kora écrit…
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
          handleSend();
        }}
        className="flex items-center gap-2 border-t border-slate-200 p-3 dark:border-slate-700"
      >
        {voiceSupported && (
          <button
            type="button"
            onClick={toggleRecording}
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
    </div>
  );
}
