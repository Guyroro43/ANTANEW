'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface PracticeChatProps {
  firstName: string;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la réponse IA.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-[1.5rem] border border-red-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/60 md:h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 p-4 text-white dark:border-slate-700 dark:from-green-700 dark:via-green-600 dark:to-emerald-500">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="font-bold">Kora</p>
          <p className="text-xs text-white/80">Partenaire de conversation — entraînement libre, pas une évaluation</p>
        </div>
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
