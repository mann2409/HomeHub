/*
IMPORTANT NOTICE: DO NOT REMOVE
This is a custom client for the OpenAI API. You may update this service, but you should not need to.

valid model names:
gpt-4.1-2025-04-14
o4-mini-2025-04-16
gpt-4o-2024-11-20
*/
import OpenAI from "openai";

export const getOpenAIClient = () => {
  const apiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ OpenAI API key not found in environment variables");
    return new OpenAI({
      apiKey: undefined, // This will cause an error when making requests
    });
  }
  
  console.log('🔑 OpenAI client created with API key (length:', apiKey.length, ')');
  console.log('🔑 API key prefix:', apiKey.substring(0, 7) + '...');
  
  return new OpenAI({
    apiKey: apiKey,
  });
};
