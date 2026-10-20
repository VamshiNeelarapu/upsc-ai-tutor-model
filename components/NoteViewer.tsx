"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { clsx } from "clsx";
import type { NoteDetail } from "@/hooks/useNotes";
import { Badge } from "./ui/Badge";

interface PYQ {
  year: number;
  type: "prelims" | "mains";
  paper: string;
  question: string;
  marks?: number;
  answerHint?: string;
}

type NoteContentWithPYQ = NoteDetail["content"] & { pyqs?: PYQ[] };

interface NoteViewerProps {
  note: NoteDetail;
  className?: string;
  defaultMode?: "full" | "revision";
}

export function NoteViewer({ note, className, defaultMode = "full" }: NoteViewerProps) {
  const { content } = note;
  const [mode, setMode] = useState<"full" | "revision">(defaultMode);

  return (
    <div className={clsx("space-y-6", className)}>
      {/* Mode Toggle */}
      <div className="flex">
        <div className="inline-flex bg-gray-100 rounded-full p-1 gap-1">
          <button
            onClick={() => setMode("full")}
            className={clsx(
              "px-4 py-1.5 text-sm font-medium rounded-full transition-all",
              mode === "full"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Full Notes
          </button>
          <button
            onClick={() => setMode("revision")}
            className={clsx(
              "px-4 py-1.5 text-sm font-medium rounded-full transition-all",
              mode === "revision"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Quick Revision
          </button>
        </div>
      </div>

      {/* ── FULL NOTES MODE ── */}
      {mode === "full" && (
        <>
          {/* Exam Relevance */}
          {note.examRelevance.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {note.examRelevance.map((rel) => (
                <Badge
                  key={rel}
                  variant={
                    rel === "prelims"
                      ? "info"
                      : rel === "mains"
                      ? "info"
                      : "default"
                  }
                >
                  {rel.charAt(0).toUpperCase() + rel.slice(1)}
                </Badge>
              ))}
            </div>
          )}

          {/* Overview */}
          {content.overview && (
            <section aria-labelledby="overview-heading">
              <h2
                id="overview-heading"
                className="text-lg font-semibold text-gray-900 mb-3"
              >
                Overview
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {content.overview}
              </p>
            </section>
          )}

          {/* Core Concepts */}
          {content.coreConcepts.length > 0 && (
            <section aria-labelledby="concepts-heading">
              <h2
                id="concepts-heading"
                className="text-lg font-semibold text-gray-900 mb-3"
              >
                Core Concepts
              </h2>
              <div className="space-y-3">
                {content.coreConcepts.map((concept, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {concept.heading}
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {concept.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Common Confusions */}
          {content.commonConfusions.length > 0 && (
            <section aria-labelledby="confusions-heading">
              <h2
                id="confusions-heading"
                className="text-lg font-semibold text-gray-900 mb-3"
              >
                Common Confusions
              </h2>
              <ul className="space-y-2">
                {content.commonConfusions.map((confusion, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded-md p-3"
                  >
                    <span className="text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true">
                      !
                    </span>
                    {confusion}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* PYQs */}
          {((content as NoteContentWithPYQ).pyqs?.length ?? 0) > 0 && (
            <section aria-labelledby="pyqs-heading">
              <h2 id="pyqs-heading" className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                Previous Year Questions
                <span className="text-xs font-normal text-gray-400">(UPSC CSE)</span>
              </h2>
              <p className="text-xs text-amber-600 mb-3">⚠ PYQ text is AI-generated from memory — verify exact wording from official UPSC sources before citing.</p>
              <div className="space-y-2">
                {/* Prelims PYQs */}
                {(content as NoteContentWithPYQ).pyqs!.filter(q => q.type === "prelims").length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
                      <span className="bg-purple-100 px-2 py-0.5 rounded text-xs">PRELIMS</span>
                    </h3>
                    <div className="space-y-2">
                      {(content as NoteContentWithPYQ).pyqs!.filter(q => q.type === "prelims").map((q, i) => (
                        <div key={i} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-semibold text-purple-700">{q.year}</span>
                            <span className="text-xs text-purple-500">{q.paper}</span>
                          </div>
                          <p className="text-sm text-gray-800">{q.question}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Mains PYQs */}
                {(content as NoteContentWithPYQ).pyqs!.filter(q => q.type === "mains").length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-1.5">
                      <span className="bg-indigo-100 px-2 py-0.5 rounded text-xs">MAINS</span>
                    </h3>
                    <div className="space-y-2">
                      {(content as NoteContentWithPYQ).pyqs!.filter(q => q.type === "mains").map((q, i) => (
                        <div key={i} className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-semibold text-indigo-700">{q.year}</span>
                            <span className="text-xs text-indigo-500">{q.paper}</span>
                            {q.marks && <span className="text-xs text-gray-400">{q.marks} marks</span>}
                          </div>
                          <p className="text-sm text-gray-800 mb-2">{q.question}</p>
                          {q.answerHint && (
                            <p className="text-xs text-indigo-600 italic border-t border-indigo-200 pt-2">
                              💡 {q.answerHint}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* References */}
          {content.references.length > 0 && (
            <section aria-labelledby="references-heading">
              <h2
                id="references-heading"
                className="text-lg font-semibold text-gray-900 mb-3"
              >
                References
              </h2>
              <ul className="space-y-2">
                {content.references.map((ref, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span
                      className={clsx(
                        "text-xs px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0",
                        ref.verificationStatus === "verified"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      )}
                    >
                      {ref.verificationStatus}
                    </span>
                    <div>
                      {ref.url ? (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {ref.title}
                        </a>
                      ) : (
                        <span className="text-gray-700">{ref.title}</span>
                      )}
                      {ref.publisher && (
                        <span className="text-gray-500 ml-1">— {ref.publisher}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {/* ── QUICK REVISION MODE ── */}
      {mode === "revision" && (
        <>
          {/* Key Prelims Facts */}
          {content.prelimsFacts.length > 0 && (
            <section aria-labelledby="prelims-heading">
              <h2
                id="prelims-heading"
                className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"
              >
                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded">
                  PRELIMS
                </span>
                Key Facts
              </h2>
              <ul className="space-y-2">
                {content.prelimsFacts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span
                      className="text-purple-500 mt-0.5 flex-shrink-0"
                      aria-hidden="true"
                    >
                      •
                    </span>
                    {fact}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Mains Key Points */}
          {content.mainsPoints.length > 0 && (
            <section aria-labelledby="mains-heading">
              <h2
                id="mains-heading"
                className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"
              >
                <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded">
                  MAINS
                </span>
                Key Points
              </h2>
              <ul className="space-y-2">
                {content.mainsPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span
                      className="text-indigo-500 mt-0.5 flex-shrink-0"
                      aria-hidden="true"
                    >
                      •
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Revision Tips */}
          {content.revisionTips.length > 0 && (
            <section aria-labelledby="revision-heading">
              <h2
                id="revision-heading"
                className="text-lg font-semibold text-gray-900 mb-3"
              >
                Revision Tips
              </h2>
              <ul className="space-y-2">
                {content.revisionTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true">
                      ✓
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Practice MCQs */}
          {content.mcqs.length > 0 && (
            <section aria-labelledby="mcqs-heading">
              <h2
                id="mcqs-heading"
                className="text-lg font-semibold text-gray-900 mb-3"
              >
                Practice MCQs
              </h2>
              <div className="space-y-4">
                {content.mcqs.map((mcq, i) => (
                  <MCQDisplay key={i} mcq={mcq} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* Mains Practice Questions */}
          {content.mainsQuestions.length > 0 && (
            <section aria-labelledby="mains-questions-heading">
              <h2
                id="mains-questions-heading"
                className="text-lg font-semibold text-gray-900 mb-3"
              >
                Mains Practice Questions
              </h2>
              <div className="space-y-4">
                {content.mainsQuestions.map((mq, i) => (
                  <MainsQuestionDisplay key={i} mq={mq} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* PYQs in Quick Revision */}
          {((content as NoteContentWithPYQ).pyqs?.length ?? 0) > 0 && (
            <section aria-labelledby="pyqs-revision-heading">
              <h2 id="pyqs-revision-heading" className="text-lg font-semibold text-gray-900 mb-1">
                Previous Year Questions
              </h2>
              <p className="text-xs text-amber-600 mb-3">⚠ AI-generated from memory — verify before citing.</p>
              <div className="space-y-2">
                {(content as NoteContentWithPYQ).pyqs!.map((q, i) => (
                  <div key={i} className={clsx(
                    "border rounded-lg p-3",
                    q.type === "prelims" ? "bg-purple-50 border-purple-200" : "bg-indigo-50 border-indigo-200"
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={clsx("text-xs font-semibold", q.type === "prelims" ? "text-purple-700" : "text-indigo-700")}>
                        {q.year}
                      </span>
                      <span className={clsx("text-xs px-1.5 py-0.5 rounded font-medium", q.type === "prelims" ? "bg-purple-100 text-purple-700" : "bg-indigo-100 text-indigo-700")}>
                        {q.type === "prelims" ? "Prelims" : q.paper}
                      </span>
                      {q.marks && <span className="text-xs text-gray-400">{q.marks}m</span>}
                    </div>
                    <p className="text-sm text-gray-800">{q.question}</p>
                    {q.answerHint && (
                      <p className="text-xs text-indigo-600 italic mt-1.5">💡 {q.answerHint}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

interface MCQDisplayProps {
  mcq: {
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    sourceStatus?: string;
  };
  index: number;
}

function MCQDisplay({ mcq, index }: MCQDisplayProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <p className="font-medium text-gray-900 text-sm mb-3">
        Q{index + 1}: {mcq.question}
      </p>
      <ul className="space-y-1.5 mb-3">
        {mcq.options.map((option, j) => (
          <li
            key={j}
            className={clsx(
              "text-sm px-3 py-1.5 rounded-md border transition-colors",
              revealed && j === mcq.correctOptionIndex
                ? "bg-green-100 border-green-300 text-green-800 font-medium"
                : "border-transparent text-gray-700"
            )}
          >
            <span className="text-gray-400 mr-2 text-xs">
              {String.fromCharCode(65 + j)}.
            </span>
            {option}
            {revealed && j === mcq.correctOptionIndex && (
              <span className="ml-2 text-green-600 text-xs" aria-label="Correct answer">
                ✓ Correct
              </span>
            )}
          </li>
        ))}
      </ul>

      {revealed ? (
        <div className="space-y-2">
          <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
            <span className="font-medium">Explanation: </span>
            {mcq.explanation}
          </div>
          <button
            onClick={() => setRevealed(false)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <EyeOff size={12} />
            Hide answer
          </button>
        </div>
      ) : (
        <button
          onClick={() => setRevealed(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
        >
          <Eye size={12} />
          Show answer
        </button>
      )}
    </div>
  );
}

interface MainsQuestionDisplayProps {
  mq: {
    question: string;
    directive?: string;
    answerFramework?: string[];
  };
  index: number;
}

function MainsQuestionDisplay({ mq, index }: MainsQuestionDisplayProps) {
  const [revealed, setRevealed] = useState(false);
  const hasFramework = mq.answerFramework && mq.answerFramework.length > 0;

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
      <p className="font-medium text-gray-900 text-sm mb-2">
        Q{index + 1}: {mq.question}
      </p>
      {mq.directive && (
        <p className="text-xs text-indigo-700 mb-3">
          Directive: <span className="font-medium">{mq.directive}</span>
        </p>
      )}

      {hasFramework && (
        revealed ? (
          <div className="space-y-2">
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-600 mb-1">Answer Framework:</p>
              <ul className="text-xs text-gray-700 space-y-1">
                {mq.answerFramework!.map((point, j) => (
                  <li key={j} className="flex items-start gap-1.5">
                    <span className="text-indigo-400 flex-shrink-0">{j + 1}.</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setRevealed(false)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mt-2"
            >
              <EyeOff size={12} />
              Hide answer framework
            </button>
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-400 bg-white hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors"
          >
            <Eye size={12} />
            Show answer framework
          </button>
        )
      )}
    </div>
  );
}

export default NoteViewer;
