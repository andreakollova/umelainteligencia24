import { NextResponse } from 'next/server';

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || '';

export async function POST(request: Request) {
  const { name, email, phone, product, size, note } = await request.json();

  if (!name || !email || !product || !size) {
    return NextResponse.json({ error: 'Vyplňte všetky povinné polia.' }, { status: 400 });
  }

  if (SLACK_WEBHOOK) {
    try {
      await fetch(SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `*robotika24 ESHOP - Nová objednávka*\n\nProdukt: ${product}\nVeľkosť: ${size}\nMeno: ${name}\nEmail: ${email}\nTelefón: ${phone || '-'}\nPoznámka: ${note || '-'}`,
        }),
      });
    } catch {}
  }

  return NextResponse.json({ message: 'Objednávka bola odoslaná! Budeme vás kontaktovať.' });
}
