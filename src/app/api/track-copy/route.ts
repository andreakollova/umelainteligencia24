import { NextResponse } from 'next/server';

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || '';

export async function POST(request: Request) {
  const { url, textLength, firstWords } = await request.json();

  // Only notify for significant copies (100+ chars)
  if (textLength < 100) {
    return NextResponse.json({ ok: true });
  }

  if (SLACK_WEBHOOK) {
    try {
      await fetch(SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `*robotika24 - Kopírovanie obsahu*\n\nNiekto skopíroval ${textLength} znakov z:\n${url}\n\nPrvých 100 znakov:\n_${firstWords}_`,
        }),
      });
    } catch {}
  }

  return NextResponse.json({ ok: true });
}
