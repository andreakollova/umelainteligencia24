import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // If accessing via umelainteligencia24.cz, redirect to Google Translate Czech version
  if (hostname.includes('umelainteligencia24.cz')) {
    const path = request.nextUrl.pathname + request.nextUrl.search;
    const skUrl = `https://umelainteligencia24.sk${path}`;
    const translateUrl = skUrl
      .replace('https://umelainteligencia24.sk', 'https://robotika24-sk.translate.goog');
    const separator = translateUrl.includes('?') ? '&' : '?';
    return NextResponse.redirect(translateUrl + separator + '_x_tr_sl=sk&_x_tr_tl=cs&_x_tr_hl=cs');
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next|favicon|logo|mascot|eshop-banner|ads.txt|robots.txt|sitemap.xml).*)',
};
