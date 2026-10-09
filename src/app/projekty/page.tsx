import { supabase } from '@/lib/supabase';

export const metadata = {
  title: 'Open Source Robotické Projekty',
  description: 'Prehľad najlepších open source projektov z oblasti umelej inteligencie. Hardware, softvér, simulátory a datasety pre umelú inteligenciu.',
  alternates: { canonical: '/projekty' },
  openGraph: { title: 'Open Source Robotické Projekty', description: 'Prehľad najlepších open source projektov z oblasti umelej inteligencie. Hardware, softvér, simulátory a datasety pre umelú inteligenciu.', locale: 'sk_SK', siteName: 'umelainteligencia24', countryName: 'Slovakia' },
  other: { 'geo.region': 'SK', 'content-language': 'sk' },
};

export const revalidate = 60;

type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  stars: number;
  license: string;
  external_url: string;
  image_url: string | null;
  source_name: string;
  is_new: boolean;
};

export default async function ProjektyPage() {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('stars', { ascending: false });

  const projects = (data || []) as Project[];
  const categories = [...new Set(projects.map(p => p.category))];

  return (
    <div className="max-w-[1280px] mx-auto px-4 pt-6 pb-20">
      <div className="border-b-2 border-[#37b3f2] mb-6">
        <h1 className="text-2xl font-bold pb-2" style={{ color: 'var(--text-primary)' }}>Open Source Projekty</h1>
        <p className="text-sm pb-3" style={{ color: 'var(--text-tertiary)' }}>
          {projects.length} projektov z komunity umelej inteligencie
        </p>
      </div>

      {categories.map((cat) => {
        const catProjects = projects.filter(p => p.category === cat);
        return (
          <section key={cat} className="mb-10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              {cat}
              <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>({catProjects.length})</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="max-md:!grid-cols-2 max-sm:!grid-cols-1">
              {catProjects.map((project) => (
                <a
                  key={project.id}
                  href={project.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', textDecoration: 'none', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.2s' }}
                  className="group hover:border-[#37b3f2]"
                >
                  {project.image_url && (
                    <div style={{ aspectRatio: '16/9', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}>
                      <img src={project.image_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  {!project.image_url && (
                    <div style={{ aspectRatio: '16/9', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 32, color: 'var(--text-muted)' }}>{'</>'}</span>
                    </div>
                  )}
                  <div style={{ padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{project.subcategory}</span>
                      {project.is_new && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', backgroundColor: '#37b3f2', padding: '2px 6px', borderRadius: 3, textTransform: 'uppercase' }}>New</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginBottom: 6, color: 'var(--text-primary)' }} className="group-hover:text-[#37b3f2] transition-colors">
                      {project.title}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.45, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                      {(project.tags || []).slice(0, 3).map((tag) => (
                        <span key={tag} style={{ fontSize: 10, color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 4 }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                      <span>{project.stars.toLocaleString()} stars</span>
                      {project.license && <span>{project.license}</span>}
                      <span style={{ marginLeft: 'auto' }}>growbotics.ai</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
