const authors: Record<string, { name: string; photo: string; bio: string; email: string }> = {
  'Martin Kováč': {
    name: 'Martin Kováč',
    photo: '/author.jpg',
    bio: 'Martin je technologický novinár so zameraním na robotiku, umelú inteligenciu a automatizáciu. Po štúdiu informatiky na STU v Bratislave pracoval v niekoľkých technologických firmách, odkiaľ prináša praktický pohľad na najnovšie inovácie. Pre robotika24 pokrýva témy od priemyselných robotov až po spotrebiteľskú elektroniku a autonómne vozidlá.',
    email: 'martin@umelainteligencia24.sk',
  },
  'Simona Hrušková': {
    name: 'Simona Hrušková',
    photo: '/author2.jpg',
    bio: 'Simona je redaktorka robotika24 so zameraním na výskum, vývoj a nové technológie. Vyštudovala žurnalistiku na Univerzite Komenského v Bratislave a predtým pôsobila v technologickom médiu. Zaujíma sa o prepojenie robotiky so vzdelávaním, zdravotníctvom a udržateľnosťou.',
    email: 'simona@umelainteligencia24.sk',
  },
};

export default function AboutAuthor({ authorName }: { authorName?: string }) {
  const author = authors[authorName || ''] || authors['Martin Kováč'];

  return (
    <div style={{ marginTop: 40, borderTop: '4px solid #37b3f2', backgroundColor: 'var(--bg-secondary)', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, padding: 24 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 16 }}>O autorovi</h3>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <img
          src={author.photo}
          alt={author.name}
          style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{author.name}</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{author.bio}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} className="hover:text-[#37b3f2]">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} className="hover:text-[#37b3f2]">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
