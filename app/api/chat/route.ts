import { NextRequest, NextResponse } from 'next/server';
import { ModelSchema } from '@/config/modelSchemas';

const SYSTEM_PROMPT =
  'You are an expert AI prompt engineering assistant integrated into JSON Prompt Engine. You help users craft perfect prompts for AI image and video models. When given a description, respond with: 1) A brief explanation of your suggestions, 2) A JSON object with field values for the active model. Always respond in the same language the user writes in. Return your response as JSON with format: { explanation: string, fields: Record<string, any> }. IMPORTANT: For the \'subject\' field, always provide the actual subject description from the user\'s request, never use placeholder text or examples in parentheses. Extract the real subject from what the user describes and use it directly. IMPORTANT: Always generate all field values in ENGLISH regardless of the language the user writes in. The user may write in Spanish or any other language, but all prompt fields (subject, style, mood, lighting, camera, etc.) must be in English because AI image and video models work better with English prompts. Your explanation can be in the same language as the user, but the JSON fields must always be in English.';

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const { message, activeModel, modelSchema } = (await req.json()) as {
      message: string;
      activeModel: string;
      modelSchema: ModelSchema;
    };

    if (!modelSchema) {
      return NextResponse.json({ error: 'No model schema provided' }, { status: 400 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const rawText: string = data.content?.[0]?.text ?? '';

    let parsed: { explanation: string; fields: Record<string, any> };
    try {
      const match = rawText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : rawText);
    } catch {
      parsed = { explanation: rawText, fields: {} };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to generate response';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
