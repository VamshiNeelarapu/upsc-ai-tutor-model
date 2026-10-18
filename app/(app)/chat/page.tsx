"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Wand2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatMessage from "@/components/ChatMessage";
import Button from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useChat } from "@/hooks/useChat";
import type { NoteDraft } from "@/hooks/useChat";

export default function NewChatPage() {
  const router = useRouter();
  const {
    conversationId,
    messages,
    loading,
    error,
    draft,
    draftData,
    draftLoading,
    sendMessage,
    generateDraft,
    clearDraft,
  } = useChat();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || loading) return;
    setInput("");
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReviewDraft = () => {
    if (!draft || !draftData) return;
    const params = new URLSearchParams({
      draft: JSON.stringify(draft),
      sourceConversationId: draftData.sourceConversationId || "",
      ...(draftData.subjectId && { subjectId: draftData.subjectId }),
      ...(draftData.sectionId && { sectionId: draftData.sectionId }),
    });
    // Store in sessionStorage to avoid URL size limits
    sessionStorage.setItem("noteDraft", JSON.stringify({ draft, draftData }));
    router.push("/notes/draft");
  };

  return (
    <div className="flex h-full">
      {/* Chat panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center">
              <div className="text-5xl mb-4" aria-hidden="true">🎓</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Ask your UPSC AI Tutor
              </h2>
              <p className="text-gray-500 max-w-md text-sm">
                Ask about any UPSC topic. The AI will teach you in a structured,
                exam-focused way and help you create study notes.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {SAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt);
                      inputRef.current?.focus();
                    }}
                    className="text-left text-sm px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-gray-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message, i) => (
                <ChatMessage
                  key={i}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}

              {loading && (
                <div className="flex gap-3 px-4 py-4 bg-slate-50">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <LoadingSpinner size="sm" />
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    Thinking...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 mb-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => {}}
              className="text-red-400 hover:text-red-600 ml-2"
              aria-label="Dismiss error"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-gray-200 bg-white p-4">
          {/* Generate notes button (shows after AI response) */}
          {messages.some((m) => m.role === "assistant") && (
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={generateDraft}
                loading={draftLoading}
                disabled={!conversationId}
              >
                <Wand2 size={14} aria-hidden="true" />
                Generate Study Notes
              </Button>
              {draftLoading && (
                <span className="text-xs text-gray-500">
                  Generating structured notes...
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any UPSC topic... (Enter to send, Shift+Enter for new line)"
              className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] max-h-32"
              rows={1}
              aria-label="Chat message input"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              loading={loading}
              aria-label="Send message"
            >
              <Send size={16} aria-hidden="true" />
            </Button>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Press Enter to send, Shift+Enter for a new line
          </p>
        </div>
      </div>

      {/* Draft panel */}
      {draft && (
        <DraftPanel
          draft={draft}
          onReview={handleReviewDraft}
          onClose={clearDraft}
        />
      )}
    </div>
  );
}

function DraftPanel({
  draft,
  onReview,
  onClose,
}: {
  draft: NoteDraft;
  onReview: () => void;
  onClose: () => void;
}) {
  return (
    <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <p className="text-sm font-medium text-gray-900">Note Draft Ready</p>
          <p className="text-xs text-gray-500">Review before saving</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close draft panel"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{draft.title}</h3>
          {draft.suggestedSubject && (
            <p className="text-xs text-blue-600 mt-1">
              📁 {draft.suggestedSubject}
              {draft.suggestedSection ? ` > ${draft.suggestedSection}` : ""}
            </p>
          )}
        </div>

        {draft.overview && (
          <p className="text-xs text-gray-600 line-clamp-3">{draft.overview}</p>
        )}

        {draft.prelimsFacts.length > 0 && (
          <div>
            <p className="text-xs font-medium text-purple-700 mb-1">
              Key Prelims Facts ({draft.prelimsFacts.length})
            </p>
            <ul className="text-xs text-gray-600 space-y-0.5">
              {draft.prelimsFacts.slice(0, 3).map((f, i) => (
                <li key={i} className="truncate">• {f}</li>
              ))}
              {draft.prelimsFacts.length > 3 && (
                <li className="text-gray-400">
                  +{draft.prelimsFacts.length - 3} more...
                </li>
              )}
            </ul>
          </div>
        )}

        {draft.mcqs.length > 0 && (
          <p className="text-xs text-gray-500">
            {draft.mcqs.length} MCQs · {draft.mainsQuestions.length} Mains Qs
          </p>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <Button className="w-full" onClick={onReview}>
          Review & Save Note
        </Button>
      </div>
    </div>
  );
}

const SAMPLE_PROMPTS = [
  "Teach me the Indus Valley Civilization for UPSC",
  "Explain the Indian Constitution's fundamental rights",
  "What is monetary policy and RBI's role?",
  "Explain biodiversity hotspots in India",
];
