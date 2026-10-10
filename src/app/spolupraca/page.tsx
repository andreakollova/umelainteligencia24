import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'Spolupráca',
  description: 'Spolupracujte s Umelá inteligencia24 - tlačové správy, mediálne partnerstvá, redakčná spolupráca pre technologické spoločnosti, startupy a univerzity.',
  alternates: { canonical: '/spolupraca' },
  openGraph: { title: 'Spolupráca | umelá inteligencia24', description: 'Spolupracujte s Umelá inteligencia24 - tlačové správy, mediálne partnerstvá a redakčná spolupráca.', locale: 'sk_SK', siteName: 'inteligencia24' },
  other: { 'geo.region': 'SK', 'content-language': 'sk' },
};

export default function SpolupracaPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Spolupráca</h1>
      <p style={{ fontSize: 18, color: 'var(--text-tertiary)', marginBottom: 32, fontStyle: 'italic' }}>
        Spájame svet umelej inteligencie, technológií a inovácií.
      </p>

      <div style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8 }}>
        <p><strong>Umelá inteligencia24.sk</strong> a <strong>Umelá inteligencia24.cz</strong> sú nezávislé technologické spravodajské portály zamerané na umelú inteligenciu, umelú inteligenciu, automatizáciu a nové technológie.</p>
        <p>Naším cieľom je prinášať slovenským a českým čitateľom aktuálne, kvalitné a zrozumiteľné informácie o technologickom vývoji z celého sveta.</p>
        <p>Veríme, že inovácie si zaslúžia pozornosť. Preto chceme vytvárať priestor nielen pre veľké technologické spoločnosti, ale aj pre startupy, univerzity, výskumné tímy a jednotlivcov, ktorí svojimi projektmi posúvajú technológie dopredu.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 40, marginBottom: 12 }}>Pre koho je spolupráca určená?</h2>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 24, marginBottom: 8 }}>Technologické spoločnosti a výrobcovia AI systémov</h3>
        <p>Vyvíjate robotické systémy, automatizačné riešenia alebo technológie využívajúce umelú inteligenciu? Radi sa dozvieme o vašich produktoch, technologických novinkách a inováciách.</p>
        <p>Môžete nám zasielať tlačové správy, produktové oznámenia, informácie o nových technológiách a oficiálne mediálne materiály.</p>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 24, marginBottom: 8 }}>Startupy a inovatívne projekty</h3>
        <p>Nemusíte byť veľká technologická spoločnosť, aby bol váš projekt zaujímavý. Radi dávame priestor novým nápadom, začínajúcim spoločnostiam a inovatívnym riešeniam.</p>
        <p>Ak pracujete na zaujímavom projekte, vyvíjate vlastného AI modelu alebo pripravujete technologický produkt, dajte nám o sebe vedieť.</p>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 24, marginBottom: 8 }}>Univerzity a výskumné organizácie</h3>
        <p>Zaujímajú nás nové vedecké objavy, výskumné projekty, experimenty a praktické aplikácie umelej inteligencie. Radi predstavíme zaujímavé projekty univerzít a výskumných laboratórií zo Slovenska, Česka aj zahraničia.</p>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 24, marginBottom: 8 }}>Médiá a vydavatelia</h3>
        <p>Sme otvorení spolupráci so zahraničnými aj domácimi technologickými médiami a odbornými publikáciami. Zaujímajú nás možnosti redakčnej spolupráce a licencovania obsahu.</p>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 24, marginBottom: 8 }}>Organizátori podujatí</h3>
        <p>Organizujete konferenciu, technologický veľtrh, súťaž alebo workshop zameraný na umelú inteligenciu? Radi sa dozvieme o aktivitách, ktoré prepájajú odborníkov, vývojárov a technologických nadšencov.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 40, marginBottom: 12 }}>Možnosti spolupráce</h2>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 24, marginBottom: 8 }}>Redakčná spolupráca</h3>
        <p>Prijímame zaujímavé informácie, tlačové správy a odborné podklady. Na základe zaslaných informácií môžeme pripraviť vlastný redakčný článok alebo správu o novom produkte či výskume.</p>
        <p>Redakčné spracovanie podlieha nezávislému rozhodnutiu našej redakcie. Zaslanie tlačovej správy automaticky nezaručuje publikovanie.</p>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 24, marginBottom: 8 }}>Rozhovory a odborné príspevky</h3>
        <p>Radi predstavíme ľudí, ktorí stoja za technologickými inováciami. Sme otvorení rozhovorom s vývojármi, výskumníkmi, zakladateľmi startupov a ďalšími osobnosťami z oblasti umelej inteligencie.</p>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 24, marginBottom: 8 }}>Mediálne partnerstvá</h3>
        <p>Sme otvorení mediálnym partnerstvám s technologickými spoločnosťami, organizátormi podujatí a výskumnými organizáciami. Rozsah a podmienky partnerstva posudzujeme individuálne.</p>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 24, marginBottom: 8 }}>Reklama a komerčná spolupráca</h3>
        <p>Umelá inteligencia24 ponúka priestor aj na diskusiu o reklamnej a komerčnej spolupráci so značkami relevantnými pre našich čitateľov. Platený a sponzorovaný obsah jasne označujeme a oddeľujeme od nezávislého redakčného spravodajstva.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 40, marginBottom: 12 }}>Tlačové správy a mediálne materiály</h2>
        <p>Tlačové správy a podklady nám môžete zasielať na <a href="mailto:studio@drixton.com" style={{ color: '#37b3f2' }}>studio@drixton.com</a>.</p>
        <p>Odporúčame priložiť:</p>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          <li>Názov spoločnosti, organizácie alebo projektu</li>
          <li>Stručné predstavenie novinky a jej technologického významu</li>
          <li>Oficiálnu tlačovú správu alebo odkaz na pôvodný zdroj</li>
          <li>Fotografie, videá alebo odkazy na oficiálny mediálny balík</li>
          <li>Informácie o podmienkach redakčného použitia vizuálnych materiálov</li>
          <li>Kontaktnú osobu pre prípadné doplňujúce otázky</li>
        </ul>
        <p>Materiály môžete zaslať v slovenskom, českom alebo anglickom jazyku.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 40, marginBottom: 12 }}>Kontakt pre spoluprácu</h2>
        <p>E-mail: <a href="mailto:studio@drixton.com" style={{ color: '#37b3f2' }}>studio@drixton.com</a></p>
        <p><a href="https://inteligencia24.sk" style={{ color: '#37b3f2' }}>inteligencia24.sk</a> | <a href="https://inteligencia.cz" style={{ color: '#37b3f2' }}>inteligencia.cz</a></p>
        <p style={{ marginTop: 8 }}>Digitálny a kreatívny partner projektu: <a href="https://drixton.com" target="_blank" rel="noopener noreferrer" style={{ color: '#37b3f2' }}>Drixton Creative Studio</a></p>
      </div>

      <ContactForm />
    </div>
  );
}
