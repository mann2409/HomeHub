/*
IMPORTANT NOTICE: DO NOT REMOVE
./src/api/chat-service.ts
If the user wants to use AI to generate text, answer questions, or analyze images you can use the functions defined in this file to communicate with the OpenAI, Anthropic, and Grok APIs.
*/
import { AIMessage, AIRequestOptions, AIResponse } from "../types/ai";
import { getAnthropicClient } from "./anthropic";
import { getOpenAIClient } from "./openai";
import { getGrokClient } from "./grok";

/**
 * Get a text response from Anthropic
 * @param messages - The messages to send to the AI
 * @param options - The options for the request
 * @returns The response from the AI
 */
export const getAnthropicTextResponse = async (
  messages: AIMessage[],
  options?: AIRequestOptions,
): Promise<AIResponse> => {
  try {
    const client = getAnthropicClient();
    const defaultModel = "claude-3-5-sonnet-20240620";

    const response = await client.messages.create({
      model: options?.model || defaultModel,
      messages: messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
      max_tokens: options?.maxTokens || 2048,
      temperature: options?.temperature || 0.7,
    });

    // Handle content blocks from the response
    const content = response.content.reduce((acc, block) => {
      if ("text" in block) {
        return acc + block.text;
      }
      return acc;
    }, "");

    return {
      content,
      usage: {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
        totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
      },
    };
  } catch (error) {
    console.error("Anthropic API Error:", error);
    throw error;
  }
};

/**
 * Get a simple chat response from Anthropic
 * @param prompt - The prompt to send to the AI
 * @returns The response from the AI
 */
export const getAnthropicChatResponse = async (prompt: string): Promise<AIResponse> => {
  return await getAnthropicTextResponse([{ role: "user", content: prompt }]);
};

/**
 * Get a text response from OpenAI
 * @param messages - The messages to send to the AI
 * @param options - The options for the request
 * @returns The response from the AI
 */
export const getOpenAITextResponse = async (messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> => {
  try {
    console.log('🌐 getOpenAITextResponse called');
    const client = getOpenAIClient();
    const defaultModel = "gpt-4o"; //accepts images as well, use this for image analysis
    const model = options?.model || defaultModel;
    
    console.log('📡 Making OpenAI API request...');
    console.log('   Model:', model);
    console.log('   Messages count:', messages.length);
    console.log('   First message preview:', messages[0]?.content?.substring(0, 100) + '...');

    const response = await client.chat.completions.create({
      model: model,
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens || 2048,
    });
    
    console.log('✅ OpenAI API request successful');
    console.log('   Response ID:', response.id);
    console.log('   Tokens used:', response.usage?.total_tokens);

    return {
      content: response.choices[0]?.message?.content || "",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error: any) {
    // Log the actual error details for debugging (sanitize API key)
    console.error('❌ OpenAI API Error occurred');
    console.error('   Error type:', error?.constructor?.name);
    console.error('   Error message:', error?.message);
    console.error('   Error status:', error?.status || error?.response?.status || error?.statusCode);
    
    // Log response details if available
    if (error?.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response statusText:', error.response.statusText);
    }
    
    // Log error code if available
    if (error?.code) {
      console.error('   Error code:', error.code);
    }
    
    // Check if it's an API key error - handle gracefully without exposing the key
    const errorMessage = error?.message || String(error);
    const statusCode = error?.status || error?.response?.status || error?.statusCode;
    
    // For API key errors, throw a clean error without sensitive info
    if (
      statusCode === 401 || 
      statusCode === 403 ||
      errorMessage.includes('401') ||
      errorMessage.includes('403') ||
      errorMessage.includes('Incorrect API key') ||
      errorMessage.includes('Invalid API key') ||
      errorMessage.includes('invalid_api_key') ||
      errorMessage.includes('authentication')
    ) {
      console.error('   ❌ Detected API key authentication error');
      // Throw a clean error without exposing the API key
      const cleanError = new Error('OpenAI API key invalid or not configured');
      (cleanError as any).isApiKeyError = true;
      (cleanError as any).originalStatus = statusCode;
      throw cleanError;
    }
    
    // For other errors, log and throw (but sanitize message if it contains API key)
    const sanitizedMessage = errorMessage.replace(/sk-[^\s]+/g, 'sk-***');
    console.error('   Full error (sanitized):', sanitizedMessage);
    throw error;
  }
};

/**
 * Get a simple chat response from OpenAI
 * @param prompt - The prompt to send to the AI
 * @returns The response from the AI
 */
export const getOpenAIChatResponse = async (prompt: string): Promise<AIResponse> => {
  return await getOpenAITextResponse([{ role: "user", content: prompt }]);
};

/**
 * Get a text response from Grok
 * @param messages - The messages to send to the AI
 * @param options - The options for the request
 * @returns The response from the AI
 */
export const getGrokTextResponse = async (messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> => {
  try {
    const client = getGrokClient();
    const defaultModel = "grok-3-beta";

    const response = await client.chat.completions.create({
      model: options?.model || defaultModel,
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens || 2048,
    });

    return {
      content: response.choices[0]?.message?.content || "",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error("Grok API Error:", error);
    throw error;
  }
};

/**
 * Get a simple chat response from Grok
 * @param prompt - The prompt to send to the AI
 * @returns The response from the AI
 */
export const getGrokChatResponse = async (prompt: string): Promise<AIResponse> => {
  return await getGrokTextResponse([{ role: "user", content: prompt }]);
};
