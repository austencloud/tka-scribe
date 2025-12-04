/**
 * Ollama Client for Deep Analysis
 *
 * A robust client for interacting with local Ollama instance.
 * Supports streaming, tool calling, and long-running analysis sessions.
 */

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  contextLength: number;
  timeout: number;
}

export const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  baseUrl: "http://localhost:11434",
  model: "qwen2.5:32b", // Larger model - better at tool calling and reasoning
  contextLength: 32768, // qwen2.5:32b supports large context
  timeout: 300000, // 5 minutes for deep analysis
};

export interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: OllamaToolCall[];
}

export interface OllamaToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface OllamaTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, {
        type: string;
        description: string;
        items?: { type: string };
        enum?: string[];
      }>;
      required: string[];
    };
  };
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  tools?: OllamaTool[];
  stream?: boolean;
  options?: {
    temperature?: number;
    num_ctx?: number;
    num_predict?: number;
  };
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
  done_reason?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

export interface OllamaStreamChunk {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

/**
 * Check if Ollama is running and the model is available
 */
export async function checkOllamaHealth(
  config: OllamaConfig = DEFAULT_OLLAMA_CONFIG
): Promise<{ available: boolean; model: string | null; error?: string }> {
  try {
    const response = await fetch(`${config.baseUrl}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return { available: false, model: null, error: `Server returned ${response.status}` };
    }

    const data = await response.json();
    const models: { name: string }[] = data.models || [];
    
    // Check for exact match or version-prefixed match
    const foundModel = models.find(
      (m) => m.name === config.model || m.name.startsWith(`${config.model}:`)
    );

    if (!foundModel) {
      return {
        available: true,
        model: null,
        error: `Model "${config.model}" not found. Available: ${models.map((m) => m.name).join(", ")}`,
      };
    }

    return { available: true, model: foundModel.name };
  } catch (error) {
    return {
      available: false,
      model: null,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

/**
 * Send a chat request to Ollama (non-streaming)
 */
export async function ollamaChat(
  messages: OllamaMessage[],
  tools?: OllamaTool[],
  config: OllamaConfig = DEFAULT_OLLAMA_CONFIG
): Promise<OllamaChatResponse> {
  const request: OllamaChatRequest = {
    model: config.model,
    messages,
    tools,
    stream: false,
    options: {
      temperature: 0.3,
      num_ctx: config.contextLength,
    },
  };

  const response = await fetch(`${config.baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(config.timeout),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Send a streaming chat request to Ollama
 * Yields chunks as they arrive
 */
export async function* ollamaChatStream(
  messages: OllamaMessage[],
  tools?: OllamaTool[],
  config: OllamaConfig = DEFAULT_OLLAMA_CONFIG
): AsyncGenerator<OllamaStreamChunk> {
  const request: OllamaChatRequest = {
    model: config.model,
    messages,
    tools,
    stream: true,
    options: {
      temperature: 0.3,
      num_ctx: config.contextLength,
    },
  };

  const response = await fetch(`${config.baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(config.timeout),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim()) {
        try {
          yield JSON.parse(line);
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }

  // Process remaining buffer
  if (buffer.trim()) {
    try {
      yield JSON.parse(buffer);
    } catch {
      // Skip malformed JSON
    }
  }
}

/**
 * List all available models
 */
export async function listOllamaModels(
  config: OllamaConfig = DEFAULT_OLLAMA_CONFIG
): Promise<{ name: string; size: number; modified_at: string }[]> {
  const response = await fetch(`${config.baseUrl}/api/tags`, {
    method: "GET",
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Failed to list models: ${response.status}`);
  }

  const data = await response.json();
  return data.models || [];
}
