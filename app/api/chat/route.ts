import { NextRequest } from "next/server";
import { z } from "zod";
import connectToDatabase from "@/lib/db";
import Conversation from "@/models/Conversation";
import { requireAuth, apiError, apiSuccess, handleApiError } from "@/lib/api-utils";
import { chat, UPSC_SYSTEM_PROMPT, Message } from "@/lib/ai";
import { aiRateLimit } from "@/lib/rate-limit";

const ChatSchema = z.object({
  message: z.string().min(1, "Message is required").max(5000),
  conversationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request as unknown as Request);

    // Rate limiting
    const limit = aiRateLimit(session.userId);
    if (!limit.success) {
      return apiError("Too many AI requests. Please wait a moment.", 429);
    }

    const body = await request.json();
    const validation = ChatSchema.safeParse(body);

    if (!validation.success) {
      return apiError(validation.error.errors[0].message, 400);
    }

    const { message, conversationId } = validation.data;

    await connectToDatabase();

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        userId: session.userId,
      });
      if (!conversation) {
        return apiError("Conversation not found", 404);
      }
    } else {
      // Create new conversation with title from first message
      const title =
        message.length > 60 ? message.substring(0, 60) + "..." : message;
      conversation = await Conversation.create({
        userId: session.userId,
        title,
        messages: [],
      });
    }

    // Add user message
    conversation.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Build message history for AI
    const aiMessages: Message[] = [
      { role: "system", content: UPSC_SYSTEM_PROMPT },
      ...conversation.messages.slice(-20).map((m) => ({
        // Last 20 messages for context
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Check if AI is configured
    if (!process.env.AI_API_KEY) {
      return apiError(
        "AI is not configured. Please set AI_API_KEY in your environment variables.",
        503
      );
    }

    let aiResponse: string;
    try {
      aiResponse = await chat(aiMessages);
    } catch (aiError) {
      console.error("AI error:", aiError);
      const errorMessage =
        aiError instanceof Error ? aiError.message : "AI service unavailable";

      if (errorMessage.includes("API_KEY") || errorMessage.includes("authentication")) {
        return apiError(
          "AI authentication failed. Please check your API key configuration.",
          503
        );
      }

      return apiError(
        "AI service is temporarily unavailable. Please try again.",
        503
      );
    }

    // Add assistant response
    conversation.messages.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    });

    await conversation.save();

    return apiSuccess({
      conversationId: conversation._id.toString(),
      message: {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
