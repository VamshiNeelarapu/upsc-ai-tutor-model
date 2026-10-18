"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface NoteDraft {
  title: string;
  overview?: string;
  examRelevance: string[];
  coreConcepts: Array<{ heading: string; body: string }>;
  prelimsFacts: string[];
  mainsPoints: string[];
  revisionTips: string[];
  commonConfusions: string[];
  mcqs: Array<{
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    sourceStatus?: string;
  }>;
  mainsQuestions: Array<{
    question: string;
    directive?: string;
    answerFramework?: string[];
  }>;
  references: Array<{
    title: string;
    url?: string;
    publisher?: string;
    verificationStatus: string;
  }>;
  suggestedSubject?: string;
  suggestedSection?: string;
}

export function useChat(initialConversationId?: string) {
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<NoteDraft | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftData, setDraftData] = useState<{
    subjectId?: string;
    sectionId?: string;
    suggestedSubject?: { id: string; name: string; slug: string } | null;
    suggestedSection?: { id: string; name: string; slug: string } | null;
    sourceConversationId?: string;
  } | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: ChatMessage = {
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content, conversationId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to send message");
        }

        const data = await res.json();
        setConversationId(data.conversationId);

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.message.content,
          timestamp: data.message.timestamp,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Update URL with conversation ID
        if (!initialConversationId && data.conversationId) {
          router.replace(`/chat/${data.conversationId}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        // Remove the optimistic user message
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setLoading(false);
      }
    },
    [conversationId, initialConversationId, router]
  );

  const generateDraft = useCallback(async () => {
    if (!conversationId) {
      setError("No conversation to generate notes from");
      return;
    }

    setDraftLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/notes/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate draft");
      }

      const data = await res.json();
      setDraft(data.draft);
      setDraftData({
        subjectId: data.subjectId,
        sectionId: data.sectionId,
        suggestedSubject: data.suggestedSubject,
        suggestedSection: data.suggestedSection,
        sourceConversationId: conversationId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate draft");
    } finally {
      setDraftLoading(false);
    }
  }, [conversationId]);

  const clearDraft = useCallback(() => {
    setDraft(null);
    setDraftData(null);
  }, []);

  return {
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
    setMessages,
  };
}
