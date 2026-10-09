import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data } = await supabase
    .from('articles')
    .select('title')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({ title: data?.title || '' });
}
