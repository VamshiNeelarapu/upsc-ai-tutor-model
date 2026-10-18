"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { NoteCard } from "@/components/NoteCard";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useNotes } from "@/hooks/useNotes";

const REVISION_STATUSES = [
  { value: "", label: "All" },
  { value: "not_started", label: "Not Started" },
  { value: "learning", label: "Learning" },
  { value: "needs_revision", label: "Needs Revision" },
  { value: "revised", label: "Revised" },
];

export default function NotesPage() {
  const searchParams = useSearchParams();
  const { notes, total, loading, error, fetchNotes, deleteNote } = useNotes();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [subjectId] = useState(searchParams.get("subjectId") || "");
  const [revisionStatus, setRevisionStatus] = useState("");
  const [syllabusMap, setSyllabusMap] = useState<
    Record<string, { name: string; parentName?: string }>
  >({});

  const loadNotes = useCallback(() => {
    fetchNotes({ q, subjectId, revisionStatus });
  }, [q, subjectId, revisionStatus, fetchNotes]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Load syllabus for subject names
  useEffect(() => {
    fetch("/api/syllabus")
      .then((r) => r.json())
      .then((data: Array<{ id: string; name: string; children: Array<{ id: string; name: string }> }>) => {
        const map: Record<string, { name: string; parentName?: string }> = {};
        if (Array.isArray(data)) {
          data.forEach((subject) => {
            map[subject.id] = { name: subject.name };
            subject.children?.forEach((section) => {
              map[section.id] = { name: section.name, parentName: subject.name };
            });
          });
        }
        setSyllabusMap(map);
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadNotes();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
    } catch {
      alert("Failed to delete note");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} note{total !== 1 ? "s" : ""} saved
          </p>
        </div>
        <Link href="/chat">
          <Button size="sm">
            <Plus size={14} aria-hidden="true" />
            New Chat
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search notes"
            />
          </div>
          <Button type="submit" variant="secondary" size="md">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal
            size={14}
            className="text-gray-400"
            aria-hidden="true"
          />
          <span className="text-xs text-gray-500 font-medium">
            Revision status:
          </span>
          {REVISION_STATUSES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setRevisionStatus(value)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                revisionStatus === value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-600 hover:border-blue-400"
              }`}
              aria-pressed={revisionStatus === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadNotes} />
      ) : notes.length === 0 ? (
        <EmptyState
          title="No notes found"
          description={
            q
              ? `No notes match "${q}". Try a different search.`
              : "Start chatting with the AI tutor and generate study notes."
          }
          action={{
            label: "Start new chat",
            onClick: () => (window.location.href = "/chat"),
          }}
        />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              subjectName={
                note.subjectId ? syllabusMap[note.subjectId]?.name : undefined
              }
              sectionName={
                note.sectionId ? syllabusMap[note.sectionId]?.name : undefined
              }
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
