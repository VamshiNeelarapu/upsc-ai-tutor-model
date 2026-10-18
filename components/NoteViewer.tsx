"use client";

import { clsx } from "clsx";
import type { NoteDetail } from "@/hooks/useNotes";
import { Badge } from "./ui/Badge";

interface NoteViewerProps {
  note: NoteDetail;
  className?: string;
}

export function NoteViewer({ note, className }: NoteViewerProps) {
  const { content } = note;

  return (
    <div className={clsx("space-y-6", className)}>
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

      {/* Prelims Facts */}
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

      {/* Mains Points */}
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

      {/* MCQs */}
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

      {/* Mains Questions */}
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
              <div key={i} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="font-medium text-gray-900 text-sm mb-2">
                  Q{i + 1}: {mq.question}
                </p>
                {mq.directive && (
                  <p className="text-xs text-indigo-700 mb-2">
                    Directive: {mq.directive}
                  </p>
                )}
                {mq.answerFramework && mq.answerFramework.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Answer Framework:
                    </p>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {mq.answerFramework.map((point, j) => (
                        <li key={j} className="flex items-start gap-1.5">
                          <span className="text-indigo-400">{j + 1}.</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
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
              "text-sm px-3 py-1.5 rounded-md",
              j === mcq.correctOptionIndex
                ? "bg-green-100 text-green-800 font-medium"
                : "text-gray-700"
            )}
          >
            {option}
            {j === mcq.correctOptionIndex && (
              <span className="ml-2 text-green-600" aria-label="Correct answer">
                ✓
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
        <span className="font-medium">Explanation: </span>
        {mcq.explanation}
      </div>
    </div>
  );
}

export default NoteViewer;
