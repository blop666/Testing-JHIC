"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Mail, MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

type Message = { id: number; sender: "ai" | "user"; text: string };

const initialMessage: Message = {
  id: 1,
  sender: "ai",
  text: "Halo! Saya asisten virtual SMKN 1 Cibinong. Ada yang bisa saya bantu?",
};

function renderMarkdown(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^##\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^#\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^\s*[-*•]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
    .replace(/\n{2,}/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

export default function AIChatCard({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [emailForm, setEmailForm] = useState<{ userEmail: string; message: string } | null>(null);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => () => {
    abortRef.current?.abort();
  }, []);

  const sendEmail = async () => {
    if (!emailForm || emailStatus === "sending") return;
    setEmailStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Pengguna Chatbot", email: emailForm.userEmail, subject: "Pertanyaan dari Chatbot", message: emailForm.message }),
      });
      const result = (await response.json()) as { success?: boolean };
      if (!response.ok || !result.success) throw new Error("gagal");
      setEmailStatus("sent");
      setMessages((current) => [...current, { id: Date.now() + 1, sender: "ai", text: "Pesan Anda telah terkirim ke pihak sekolah. Kami akan membalas melalui email Anda." }]);
      setEmailForm(null);
    } catch {
      setEmailStatus("error");
    }
  };

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;
    setMessages((current) => [...current, { id: Date.now(), sender: "user", text }]);
    setInput("");
    setIsTyping(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
        signal: controller.signal,
      });
      const result = (await response.json()) as {
        success?: boolean;
        data?: { answer?: string; status?: string; emailHandoff?: { userEmail?: string; userName?: string; subject?: string; message?: string } };
        error?: { message?: string };
      };

      const answer = result.data?.answer ?? result.error?.message ?? "Maaf, layanan chatbot sedang tidak tersedia. Silakan hubungi pihak sekolah melalui halaman Kontak.";
      setMessages((current) => [...current, { id: Date.now() + 1, sender: "ai", text: answer }]);

      if (result.data?.status === "email" && result.data.emailHandoff?.message && result.data.emailHandoff?.userEmail) {
        setEmailForm({ userEmail: result.data.emailHandoff.userEmail, message: result.data.emailHandoff.message });
      }
    } catch {
      setMessages((current) => [...current, { id: Date.now() + 1, sender: "ai", text: "Maaf, layanan chatbot sedang tidak tersedia. Silakan coba lagi nanti." }]);
    } finally {
      clearTimeout(timeoutId);
      abortRef.current = null;
      setIsTyping(false);
    }
  };

  return (
    <div className={cn("fixed bottom-4 right-4 z-[90] sm:bottom-6 sm:right-6", className)}>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button type="button" aria-label="Tutup chatbot" onClick={() => setIsOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/35 sm:hidden" />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="ai-chat-title"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="absolute bottom-16 right-0 flex h-[min(620px,calc(100vh-6rem))] w-[calc(100vw-2rem)] max-w-[390px] origin-bottom-right flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_28px_80px_rgba(8,46,112,0.3)] ring-1 ring-blue-950/10"
            >
              <header className="relative overflow-hidden bg-[linear-gradient(135deg,#124ba3,#082e70)] px-5 pb-5 pt-4 text-white">
                <div className="relative flex items-center gap-3">
                  <span className="grid size-11 place-content-center rounded-2xl bg-white text-blue-800 shadow-lg"><Bot className="size-6" /></span>
                  <div className="min-w-0 flex-1">
                    <h2 id="ai-chat-title" className="font-semibold">Asisten CibiOne</h2>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-blue-100"><span className="size-2 rounded-full bg-emerald-400" /> Siap membantu</p>
                  </div>
                  <button type="button" onClick={() => setIsOpen(false)} aria-label="Tutup chatbot" className="grid size-10 place-content-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><X className="size-5" /></button>
                </div>
              </header>

              <div ref={messagesRef} className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#f5f8ff] p-4 text-sm" aria-live="polite">
                {messages.map((message) => (
                  <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("max-w-[84%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm", message.sender === "ai" ? "self-start rounded-bl-md bg-white text-slate-700" : "self-end rounded-br-md bg-blue-700 text-white")}>
                    {message.sender === "ai" ? (
                      <div className="chat-markdown space-y-2 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-blue-900 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-slate-900" dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
                    ) : (
                      message.text
                    )}
                  </motion.div>
                ))}
                {isTyping && <div className="flex w-fit gap-1.5 self-start rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm" aria-label="Asisten sedang mengetik">{[0, 1, 2].map((dot) => <motion.span key={dot} className="size-2 rounded-full bg-blue-500" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: dot * 0.12 }} />)}</div>}
                {emailForm && (
                  <div className="self-start rounded-2xl rounded-bl-md border border-blue-100 bg-white p-4 shadow-sm">
                    <p className="mb-3 text-sm font-semibold text-blue-900">Kirim pesan ke pihak sekolah</p>
                    <label className="mb-1 block text-xs text-slate-500" htmlFor="chat-email">Email Anda</label>
                    <input id="chat-email" type="email" value={emailForm.userEmail} onChange={(e) => setEmailForm((f) => (f ? { ...f, userEmail: e.target.value } : f))} className="mb-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    <label className="mb-1 block text-xs text-slate-500" htmlFor="chat-email-msg">Pesan</label>
                    <textarea id="chat-email-msg" rows={3} value={emailForm.message} onChange={(e) => setEmailForm((f) => (f ? { ...f, message: e.target.value } : f))} className="mb-3 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    <button type="button" onClick={sendEmail} disabled={emailStatus === "sending"} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"><Mail className="size-4" />{emailStatus === "sending" ? "Mengirim..." : "Kirim Email"}</button>
                    {emailStatus === "error" && <p className="mt-2 text-xs text-red-600">Gagal mengirim. Coba lagi.</p>}
                  </div>
                )}
              </div>

              <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-slate-200 bg-white p-3">
                <label htmlFor="ai-chat-input" className="sr-only">Tulis pertanyaan</label>
                <textarea ref={inputRef} id="ai-chat-input" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Tanyakan tentang sekolah..." rows={1} className="min-h-11 min-w-0 flex-1 resize-none overflow-y-auto wrap-break-word rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                <button type="submit" disabled={!input.trim() || isTyping} aria-label="Kirim pesan" className="grid size-11 shrink-0 place-content-center rounded-xl bg-blue-700 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"><Send className="size-4" /></button>
              </form>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls="ai-chat-title" aria-label={isOpen ? "Tutup asisten virtual" : "Buka asisten virtual"} className="grid size-14 place-content-center rounded-full bg-blue-700 text-white shadow-[0_12px_28px_rgba(8,46,112,0.28)] transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:size-16">
        {isOpen ? <X className="size-6" /> : <MessageCircle className="size-7" strokeWidth={1.8} />}
      </button>
    </div>
  );
}
