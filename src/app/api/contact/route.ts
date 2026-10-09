import { NextResponse } from 'next/server';

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || '';

export async function POST(request: Request) {
  const { name, email, message, captcha } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Vyplňte všetky povinné polia.' }, { status: 400 });
  }

  // Simple math captcha verification
  if (!captcha || captcha !== 'ok') {
    return NextResponse.json({ error: 'Nesprávna captcha.' }, { status: 400 });
  }

  if (SLACK_WEBHOOK) {
    try {
      await fetch(SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `*robotika24 - Kontaktný formulár*\n\nMeno: ${name}\nEmail: ${email}\nSpráva: ${message}`,
        }),
      });
    } catch {}
  }

  return NextResponse.json({ message: 'Správa bola odoslaná. Ďakujeme!' });
}
