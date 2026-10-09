import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  'https://fxnpgqsztiwqbhvyokgd.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST() {
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('daily_views')
    .select('count')
    .eq('date', today)
    .single();

  if (data) {
    await supabase.from('daily_views').update({ count: data.count + 1 }).eq('date', today);
  } else {
    await supabase.from('daily_views').insert({ date: today, count: 1 });
  }

  return NextResponse.json({ ok: true });
}
