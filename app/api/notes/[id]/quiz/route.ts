import { NextRequest } from "next/server";
import { z } from "zod";
import connectToDatabase from "@/lib/db";
import StudyNote from "@/models/StudyNote";
import { requireAuth, apiError, apiSuccess, handleApiError } from "@/lib/api-utils";
import { generateQuiz, StudyNoteContent } from "@/lib/ai";
import { aiRateLimit } from "@/lib/rate-limit";

const QuizSchema = z.object({
  count: z.number().min(1).max(20).default(5),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request as unknown as Request);

    // Rate limiting
    const limit = aiRateLimit(session.userId);
    if (!limit.success) {
      return apiError("Too many AI requests. Please wait a moment.", 429);
    }

    if (!process.env.AI_API_KEY) {
      return apiError(
        "AI is not configured. Please set AI_API_KEY in your environment variables.",
        503
      );
    }

    const body = await request.json().catch(() => ({}));
    const validation = QuizSchema.safeParse(body);
    const count = validation.success ? validation.data.count : 5;

    await connectToDatabase();

    const note = await StudyNote.findOne({
      _id: params.id,
      userId: session.userId,
    });

    if (!note) {
      return apiError("Note not found", 404);
    }

    // Try to use existing MCQs first, then generate new ones
    const existingMcqs = note.content.mcqs || [];

    if (existingMcqs.length >= count) {
      // Shuffle and return existing
      const shuffled = [...existingMcqs].sort(() => Math.random() - 0.5);
      return apiSuccess({ questions: shuffled.slice(0, count) });
    }

    // Generate new questions
    const noteContent: StudyNoteContent = {
      title: note.title,
      overview: note.content.overview,
      coreConcepts: note.content.coreConcepts,
      prelimsFacts: note.content.prelimsFacts,
      mainsPoints: note.content.mainsPoints,
      revisionTips: note.content.revisionTips,
      commonConfusions: note.content.commonConfusions,
      mcqs: note.content.mcqs,
      mainsQuestions: note.content.mainsQuestions,
      references: note.content.references,
      examRelevance: note.examRelevance as ("prelims" | "mains" | "csat" | "essay")[],
    };

    try {
      const generatedQuestions = await generateQuiz(noteContent, count);
      return apiSuccess({ questions: generatedQuestions });
    } catch (aiError) {
      console.error("Quiz generation error:", aiError);

      // Fall back to existing MCQs if AI fails
      if (existingMcqs.length > 0) {
        return apiSuccess({ questions: existingMcqs });
      }

      return apiError("Failed to generate quiz questions. Please try again.", 503);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
