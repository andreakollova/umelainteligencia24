import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

const supabase = createClient(
  'https://fxnpgqsztiwqbhvyokgd.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || '';
const SLACK_CHANNEL_ID = 'C0C7F44R3UN';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Neplatný email' }, { status: 400 });
  }

  // Hash email for GDPR compliance - we never store the actual email
  const emailHash = createHash('sha256').update(email.toLowerCase().trim()).digest('hex');

  // Check if already subscribed
  const { data: existing } = await supabase
    .from('subscribers')
    .select('id')
    .eq('email_hash', emailHash)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ message: 'Už ste prihlásený na odber.' });
  }

  // Save hashed email
  const { error } = await supabase
    .from('subscribers')
    .insert({ email_hash: emailHash });

  if (error) {
    return NextResponse.json({ error: 'Chyba pri ukladaní' }, { status: 500 });
  }

  // Get subscriber count
  const { count } = await supabase
    .from('subscribers')
    .select('id', { count: 'exact', head: true });

  // Notify via Slack - only send masked email (first 2 chars + domain)
  const [localPart, domain] = email.split('@');
  const masked = localPart.substring(0, 2) + '***@' + domain;

  if (SLACK_WEBHOOK) {
    try {
      await fetch(SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: SLACK_CHANNEL_ID,
          text: `*umelá inteligencia24 - Nový odberateľ*\n${masked}\nCelkom odberateľov: ${count}`,
        }),
      });
    } catch {}
  }

  return NextResponse.json({ message: 'Úspešne prihlásený na odber!' });
}
