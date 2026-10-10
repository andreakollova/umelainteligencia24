'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const categories = [
  { name: 'Novinky', slug: '/', subs: [] },
  { name: 'Modely', slug: '/kategoria/modely', subs: [] },
  { name: 'Výskum', slug: '/kategoria/vyskum', subs: [] },
  { name: 'Nástroje', slug: '/kategoria/nastroje', subs: [] },
  { name: 'Biznis', slug: '/kategoria/biznis', subs: [] },
  { name: 'Šport', slug: '/kategoria/sport', subs: [] },
  { name: 'E-shop', slug: '/eshop', subs: [] },
  { name: 'Projekty', slug: '/projekty', subs: [] },
];

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function FlagSK() {
  return <img src="https://flagcdn.com/w40/sk.png" srcSet="https://flagcdn.com/w80/sk.png 2x" width="28" height="18" alt="SK" style={{ borderRadius: 2, display: 'block', objectFit: 'cover' }} />;
}

function FlagCZ() {
  return <img src="https://flagcdn.com/w40/cz.png" srcSet="https://flagcdn.com/w80/cz.png 2x" width="28" height="18" alt="CZ" style={{ borderRadius: 2, display: 'block', objectFit: 'cover' }} />;
}

function LangSelector() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', padding: 4, cursor: 'pointer', background: 'none', border: 'none' }}>
        <FlagSK />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 12px var(--card-shadow)', zIndex: 100, overflow: 'hidden', minWidth: 200 }}>
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)', fontWeight: 600, fontSize: 13, borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <FlagSK /> Slovenská verzia
          </div>
          <a href="https://inteligencia.cz" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-tertiary)', fontSize: 13, textDecoration: 'none' }} className="hover:bg-[var(--bg-tertiary)]">
            <FlagCZ /> Prejsť na českú verziu
          </a>
        </div>
      )}
    </div>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ThemeToggle({ onToggle }: { onToggle?: (dark: boolean) => void }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const isDark = saved === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    onToggle?.(isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    onToggle?.(next);
  };

  return (
    <button onClick={toggle} style={{ color: 'var(--text-tertiary)', cursor: 'pointer', background: 'none', border: 'none', padding: 4 }} className="hover:text-[#37b3f2] transition-colors" aria-label="Prepnúť tmavý režim">
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function PulsingDot() {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7, flexShrink: 0 }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: '#22c55e', opacity: 0.75, animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
      <span style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22c55e' }} />
      <style>{`@keyframes ping{75%,100%{transform:scale(2);opacity:0}}`}</style>
    </span>
  );
}

// Nav item with hover dropdown for subcategories
function NavItem({ cat }: { cat: typeof categories[0] }) {
  return (
    <div style={{ position: 'relative' }} className="group">
      <Link
        href={cat.slug}
        style={{ padding: '8px 14px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', textDecoration: 'none', whiteSpace: 'nowrap', display: 'block' }}
        className="text-[var(--text-primary)] hover:text-[#37b3f2] transition-colors"
      >
        {cat.name}
      </Link>
      {cat.subs.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, paddingTop: 4,
          display: 'none', zIndex: 100,
        }} className="group-hover:!block">
          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: '0 8px 24px var(--card-shadow)', minWidth: 220, padding: '8px 0' }}>
            {cat.subs.map((sub) => (
              <Link
                key={sub}
                href={cat.slug}
                style={{ display: 'block', padding: '8px 16px', fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}
                className="hover:bg-[var(--bg-tertiary)] hover:text-[#37b3f2] transition-colors"
              >
                {sub}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [latestTitle, setLatestTitle] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 160);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/latest-title')
      .then(r => r.json())
      .then(d => { if (d.title) setLatestTitle(d.title); })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Announcement bar */}
      {latestTitle && (
        <div style={{ padding: '9px 20px', borderBottom: '1px solid var(--border)', overflow: 'hidden' }} className="bg-[var(--bg-tertiary)]">
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, overflow: 'hidden' }}>
            <PulsingDot />
            <p style={{ color: '#374151', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
              {latestTitle}
            </p>
          </div>
        </div>
      )}

      {/* DESKTOP navbar */}
      <header className="hidden md:block" style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 92 }}>
          <Link href="/" style={{ flexShrink: 0 }}>
            <Image src={isDark ? '/logo-dark.png' : '/logo.png'} alt="umelá inteligencia24" width={280} height={72} style={{ height: 72, width: 'auto' }} priority />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {categories.map((cat) => (
              <NavItem key={cat.slug} cat={cat} />
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 16 }}>
              <button onClick={() => setSearchOpen(!searchOpen)} style={{ color: '#6b7280', cursor: 'pointer', background: 'none', border: 'none', padding: 4 }} className="hover:text-[#37b3f2] transition-colors">
                <SearchIcon />
              </button>
              <ThemeToggle onToggle={setIsDark} />
              <LangSelector />
              <Link href="/odber" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 22px', fontSize: 13, fontWeight: 700, color: '#fff', backgroundColor: '#37b3f2', borderRadius: 24, textDecoration: 'none' }} className="hover:bg-[#2da0e0] transition-colors">
                <BellIcon /> Odoberať
              </Link>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 20px', maxWidth: 1280, margin: '0 auto' }}>
            <form action="/hladanie" method="GET" style={{ display: 'flex', gap: 8 }}>
              <input name="q" type="text" placeholder="Hľadať články..." style={{ flex: 1, padding: '10px 16px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 14, outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }} autoFocus />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#37b3f2', color: '#fff', border: 'none', borderRadius: 24, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Hľadať</button>
            </form>
          </div>
        )}
      </header>

      {/* MOBILE navbar: hamburger left, logo center, search right */}
      <header className="md:hidden" style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, padding: '0 16px' }}>
          {/* Hamburger left */}
          <button style={{ color: 'var(--text-primary)', padding: 6, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setMobileOpen(!mobileOpen)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 12h16M4 6h16M4 18h16" />}
            </svg>
          </button>

          {/* Logo center */}
          <Link href="/" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <Image src={isDark ? '/logo-dark.png' : '/logo.png'} alt="umelá inteligencia24" width={200} height={48} style={{ height: 48, width: 'auto' }} priority />
          </Link>

          {/* Search right */}
          <button style={{ color: '#6b7280', padding: 6, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSearchOpen(!searchOpen)}>
            <SearchIcon />
          </button>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div style={{ padding: '8px 16px', borderTop: '1px solid #f3f4f6' }}>
            <form action="/hladanie" method="GET" style={{ display: 'flex', gap: 8 }}>
              <input name="q" type="text" placeholder="Hľadať..." style={{ flex: 1, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 24, fontSize: 14, outline: 'none' }} autoFocus />
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ borderTop: '1px solid #f3f4f6', padding: '8px 0', maxHeight: '70vh', overflowY: 'auto' }}>
            {categories.map((cat) => (
              <div key={cat.slug}>
                <Link href={cat.slug} style={{ display: 'block', padding: '12px 20px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                  {cat.name}
                </Link>
                {cat.subs.length > 0 && (
                  <div style={{ paddingLeft: 36, paddingBottom: 8 }}>
                    {cat.subs.map((sub) => (
                      <Link key={sub} href={cat.slug} style={{ display: 'block', padding: '6px 0', fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                        {sub}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6' }}>
              <Link href="/odber" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', fontSize: 14, fontWeight: 700, color: '#fff', backgroundColor: '#37b3f2', borderRadius: 24, textDecoration: 'none' }}>
                <BellIcon /> Odoberať novinky
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Sticky navbar on scroll - desktop + mobile */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
        backgroundColor: '#051722', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
        transform: scrolled ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          {/* Mobile: hamburger */}
          <button className="md:hidden" style={{ color: '#fff', padding: 6, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setMobileOpen(!mobileOpen)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 12h16M4 6h16M4 18h16" />}
            </svg>
          </button>

          <Link href="/" style={{ flexShrink: 0 }}>
            <Image src="/logo-dark.png" alt="umelá inteligencia24" width={200} height={48} style={{ height: 48, width: 'auto' }} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex" style={{ alignItems: 'center' }}>
            {categories.map((cat) => (
              <Link key={cat.slug} href={cat.slug} style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', textDecoration: 'none', whiteSpace: 'nowrap' }} className="hover:text-[#37b3f2] transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Desktop: search + dark mode, Mobile: only dark mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setSearchOpen(!searchOpen)} style={{ color: '#9ca3af', cursor: 'pointer', background: 'none', border: 'none', padding: 4 }} className="hover:text-white transition-colors hidden md:block">
              <SearchIcon />
            </button>
            <button onClick={() => { const next = !isDark; setIsDark(next); document.documentElement.classList.toggle('dark', next); localStorage.setItem('theme', next ? 'dark' : 'light'); }} style={{ color: '#ffffff', cursor: 'pointer', background: 'none', border: 'none', padding: 4 }} className="hover:text-[#37b3f2] transition-colors">
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
