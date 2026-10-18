import { NextRequest } from "next/server";
import { z } from "zod";
import connectToDatabase from "@/lib/db";
import Conversation from "@/models/Conversation";
import SyllabusNode from "@/models/SyllabusNode";
import { requireAuth, apiError, apiSuccess, handleApiError } from "@/lib/api-utils";
import { generateNoteDraft, Message } from "@/lib/ai";
import { aiRateLimit } from "@/lib/rate-limit";

const DraftSchema = z.object({
  conversationId: z.string().min(1),
  topicHint: z.string().optional(),
  subjectId: z.string().optional(),
  sectionId: z.string().optional(),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validation = DraftSchema.safeParse(body);

    if (!validation.success) {
      return apiError(validation.error.errors[0].message, 400);
    }

    const { conversationId, topicHint, subjectId, sectionId } = validation.data;

    await connectToDatabase();

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: session.userId,
    });

    if (!conversation) {
      return apiError("Conversation not found", 404);
    }

    const messages: Message[] = conversation.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    let draft;
    try {
      draft = await generateNoteDraft(messages, topicHint);
    } catch (aiError) {
      console.error("AI draft generation error:", aiError);
      return apiError("Failed to generate draft. Please try again.", 503);
    }

    // Try to find suggested syllabus nodes
    let suggestedSubject = null;
    let suggestedSection = null;

    if (draft.suggestedSubject) {
      const subjects = await SyllabusNode.find({ nodeType: "subject" });
      const matchedSubject = subjects.find(
        (s) =>
          s.name.toLowerCase().includes(draft.suggestedSubject!.toLowerCase()) ||
          draft.suggestedSubject!.toLowerCase().includes(s.name.toLowerCase())
      );
      if (matchedSubject) {
        suggestedSubject = {
          id: matchedSubject._id.toString(),
          name: matchedSubject.name,
          slug: matchedSubject.slug,
        };

        if (draft.suggestedSection) {
          const sections = await SyllabusNode.find({
            parentId: matchedSubject._id.toString(),
            nodeType: "section",
          });
          const matchedSection = sections.find(
            (s) =>
              s.name.toLowerCase().includes(draft.suggestedSection!.toLowerCase()) ||
              draft.suggestedSection!.toLowerCase().includes(s.name.toLowerCase())
          );
          if (matchedSection) {
            suggestedSection = {
              id: matchedSection._id.toString(),
              name: matchedSection.name,
              slug: matchedSection.slug,
            };
          }
        }
      }
    }

    return apiSuccess({
      draft,
      sourceConversationId: conversationId,
      suggestedSubject,
      suggestedSection,
      subjectId: subjectId || suggestedSubject?.id,
      sectionId: sectionId || suggestedSection?.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
