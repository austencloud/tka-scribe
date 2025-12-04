/**
 * Deep Analysis API Endpoint
 * 
 * Server-Sent Events (SSE) endpoint for deep codebase analysis.
 * Uses local Ollama to thoroughly explore the codebase until reaching confidence threshold.
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { runDeepAnalysis, checkOllamaHealth } from "$lib/features/feedback/services/deep-analysis";
import { feedbackService } from "$lib/features/feedback/services/implementations/FeedbackService";
import type { AnalysisEvent } from "$lib/features/feedback/services/deep-analysis/deep-analysis-engine";
import type { FeedbackItem } from "$lib/features/feedback/domain/models/feedback-models";

// Project root path (adjust based on your deployment)
const PROJECT_ROOT = process.cwd();

/**
 * GET - Check Ollama health status
 */
export const GET: RequestHandler = async ({ url }) => {
  const action = url.searchParams.get("action");

  if (action === "health") {
    try {
      const health = await checkOllamaHealth();
      return json(health);
    } catch (error) {
      return json({
        available: false,
        model: null,
        error: error instanceof Error ? error.message : "Health check failed"
      }, { status: 500 });
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

/**
 * POST - Start deep analysis with SSE streaming
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { feedbackId, feedbackData, config } = body;

    // Support either feedbackId (from database) or inline feedbackData (for testing)
    let feedback: FeedbackItem | null = null;

    if (feedbackData) {
      // Use inline feedback data (for testing without Firebase)
      feedback = {
        id: feedbackData.id || 'test-' + Date.now(),
        userId: feedbackData.userId || 'test-user',
        userEmail: feedbackData.userEmail || 'test@example.com',
        userDisplayName: feedbackData.userDisplayName || 'Test User',
        type: feedbackData.type || 'bug',
        title: feedbackData.title || 'Test Feedback',
        description: feedbackData.description || 'Test description',
        priority: feedbackData.priority || null,
        capturedModule: feedbackData.capturedModule || 'unknown',
        capturedTab: feedbackData.capturedTab || 'unknown',
        reportedModule: feedbackData.reportedModule || null,
        reportedTab: feedbackData.reportedTab || null,
        status: feedbackData.status || 'new',
        adminNotes: feedbackData.adminNotes || null,
        createdAt: feedbackData.createdAt ? new Date(feedbackData.createdAt) : new Date(),
        updatedAt: feedbackData.updatedAt ? new Date(feedbackData.updatedAt) : null,
      } as FeedbackItem;
    } else if (feedbackId) {
      // Get from database
      feedback = await feedbackService.getFeedback(feedbackId);
      if (!feedback) {
        return json({ error: "Feedback not found" }, { status: 404 });
      }
    } else {
      return json({ error: "feedbackId or feedbackData is required" }, { status: 400 });
    }

    // Check Ollama health first
    const health = await checkOllamaHealth();
    if (!health.available) {
      return json({ 
        error: "Ollama is not available", 
        details: health.error 
      }, { status: 503 });
    }

    if (!health.model) {
      return json({ 
        error: "Required model not found", 
        details: health.error 
      }, { status: 503 });
    }

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const sendEvent = (event: AnalysisEvent) => {
          const data = JSON.stringify({
            type: event.type,
            timestamp: event.timestamp.toISOString(),
            message: event.message,
            data: event.data
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        try {
          // Run deep analysis with progress callbacks
          const result = await runDeepAnalysis(
            feedback,
            {
              projectRoot: PROJECT_ROOT,
              ...config
            },
            sendEvent
          );

          // Send final result
          const finalEvent: AnalysisEvent = {
            type: "completed",
            timestamp: new Date(),
            message: "Analysis complete",
            data: {
              summary: result.summary,
              technicalAnalysis: result.technicalAnalysis,
              affectedFiles: result.affectedFiles,
              suggestedFix: result.suggestedFix,
              implementationSteps: result.implementationSteps,
              riskAssessment: result.riskAssessment,
              claudeCodePrompt: result.claudeCodePrompt,
              confidence: result.state.confidence,
              filesExplored: result.state.filesRead.length,
              iterations: result.state.iteration
            }
          };
          sendEvent(finalEvent);

        } catch (error) {
          const errorEvent: AnalysisEvent = {
            type: "error",
            timestamp: new Date(),
            message: error instanceof Error ? error.message : "Analysis failed",
            data: { error: String(error) }
          };
          sendEvent(errorEvent);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no" // Disable nginx buffering
      }
    });

  } catch (error) {
    console.error("Deep analysis error:", error);
    return json({
      error: "Failed to start deep analysis",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
};
