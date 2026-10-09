import { supabase } from '@/lib/supabase';

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

export default async function ProjectsSection() {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('stars', { ascending: false })
    .limit(6);

  const projects = (data || []) as Project[];
  if (!projects.length) return null;

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 48px' }}>
      <div style={{ borderBottom: '2px solid #37b3f2', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', paddingBottom: 8 }}>Open Source Projekty</h2>
        <a href="/projekty" style={{ fontSize: 13, fontWeight: 600, color: '#37b3f2', textDecoration: 'none', paddingBottom: 8 }}>
          Zobraziť všetky &rarr;
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="max-md:!grid-cols-2 max-sm:!grid-cols-1">
        {projects.map((project) => (
          <a
            key={project.id}
            href={project.external_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', textDecoration: 'none', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.2s' }}
            className="group hover:border-[#37b3f2]"
          >
            {project.image_url ? (
              <div style={{ aspectRatio: '16/9', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}>
                <img src={project.image_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="group-hover:scale-105 transition-transform duration-300" />
              </div>
            ) : (
              <div style={{ aspectRatio: '16/9', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 28, color: 'var(--text-muted)' }}>{'</>'}</span>
              </div>
            )}
            <div style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#37b3f2', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{project.category}</span>
                {project.is_new && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', backgroundColor: '#37b3f2', padding: '2px 6px', borderRadius: 3, textTransform: 'uppercase' }}>New</span>
                )}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 6 }} className="group-hover:text-[#37b3f2] transition-colors">
                {project.title}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.45, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {project.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                <span>{project.stars.toLocaleString()} stars</span>
                {project.license && <span>{project.license}</span>}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
