import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'O nás',
  description: 'Umelá inteligencia24 je nezávislý slovenský spravodajský portál zameraný na umelú inteligenciu, umelú inteligenciu a moderné technológie.',
  alternates: { canonical: '/o-nas' },
  openGraph: { title: 'O nás', description: 'Umelá inteligencia24 je nezávislý slovenský spravodajský portál zameraný na umelú inteligenciu, umelú inteligenciu a moderné technológie.', locale: 'sk_SK', siteName: 'inteligencia24', countryName: 'Slovakia' },
  other: { 'geo.region': 'SK', 'content-language': 'sk' },
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>O nás</h1>
      <p style={{ fontSize: 18, color: 'var(--text-tertiary)', marginBottom: 32, fontStyle: 'italic' }}>
        Umelá inteligencia mení svet. My vám prinášame správy o tom, ako.
      </p>

      <div style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8 }}>
        <p><strong>Umelá inteligencia24.sk</strong> je nezávislý spravodajský portál zameraný na umelú inteligenciu, umelú inteligenciu, automatizáciu a technológie budúcnosti.</p>
        <p>Naším cieľom je prinášať slovenským čitateľom aktuálne, zrozumiteľné a dôveryhodné informácie o technologických inováciách, ktoré menia priemysel, zdravotníctvo, dopravu aj náš každodenný život.</p>
        <p>Sledujeme vývoj humanoidných AI systémov, autonómnych systémov, priemyselnej umelej inteligencie, umelej inteligencie a vedeckého výskumu. Zaujímajú nás nielen technologické novinky, ale aj ich praktické využitie a vplyv na spoločnosť.</p>
        <p>Veríme, že informácie o umelej inteligencii by mali byť dostupné každému - nielen odborníkom, ale aj študentom, technologickým nadšencom a ľuďom, ktorí chcú lepšie porozumieť svetu okolo nás.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 40, marginBottom: 12 }}>Ako pracujeme</h2>
        <p>Pri príprave obsahu kladieme dôraz na presnosť, transparentnosť a rešpektovanie pôvodných zdrojov.</p>
        <p>Naše články pripravujeme na základe verejne dostupných a dôveryhodných informácií, medzi ktoré patria najmä oficiálne tlačové správy technologických spoločností, vedecké publikácie, výskumné projekty, univerzitné oznámenia a odborné médiá.</p>
        <p>Informácie spracúvame do vlastných článkov v slovenskom jazyku. Naším cieľom nie je iba prekladať zahraničné správy, ale prinášať ich v zrozumiteľnej podobe s kontextom a vysvetlením pre domácich čitateľov.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 40, marginBottom: 12 }}>Naše redakčné zásady</h2>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 24, marginBottom: 8 }}>Presnosť a overovanie informácií</h3>
        <p>Usilujeme sa publikovať správne, aktuálne a overiteľné informácie. Pri spracovaní článkov uprednostňujeme pôvodné zdroje, ako sú oficiálne oznámenia spoločností, vedecké štúdie a vyjadrenia odborníkov.</p>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 24, marginBottom: 8 }}>Transparentnosť zdrojov</h3>
        <p>Rešpektujeme prácu pôvodných autorov, výskumníkov a médií. Ak článok vychádza z informácií iného zdroja, snažíme sa tento zdroj jasne identifikovať a podľa možností uviesť odkaz na pôvodné informácie.</p>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 24, marginBottom: 8 }}>Nezávislosť</h3>
        <p>Umelá inteligencia24.sk je nezávislý technologický portál. Naším cieľom je informovať o vývoji umelej inteligencie bez uprednostňovania konkrétnych spoločností alebo výrobcov. Platené spolupráce a reklamný obsah budú jasne označené.</p>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 24, marginBottom: 8 }}>Zrozumiteľnosť</h3>
        <p>Technológie môžu byť zložité. Snažíme sa ich preto vysvetľovať jednoducho, vecne a bez zbytočného odborného žargónu, pričom zachovávame technickú presnosť.</p>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 24, marginBottom: 8 }}>Aktualizácie a opravy</h3>
        <p>Technologický vývoj je rýchly a informácie sa môžu meniť. Ak zistíme, že publikovaný článok obsahuje nepresnosť, usilujeme sa ju po overení opraviť alebo aktualizovať.</p>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 24, marginBottom: 8 }}>Používanie umelej inteligencie</h3>
        <p>Pri tvorbe článkov môžeme využívať nástroje umelej inteligencie na podporu redakčnej práce. Informácie získané pomocou týchto nástrojov však nepovažujeme automaticky za overené. Za výber, kontrolu a publikovanie obsahu zodpovedá redakcia Umelá inteligencia24.sk.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 40, marginBottom: 12 }}>Fotografie, videá a autorské práva</h2>
        <p>Rešpektujeme autorské práva a duševné vlastníctvo autorov, fotografov, spoločností a ďalších držiteľov práv.</p>
        <p>Ak ste autorom materiálu publikovaného na našom webe a domnievate sa, že bol použitý bez potrebného oprávnenia, kontaktujte nás. Každý takýto podnet individuálne preveríme.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 40, marginBottom: 12 }}>Nahlásenie chyby</h2>
        <p>Kontaktovať nás môžete v prípade, že:</p>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          <li>článok obsahuje faktickú chybu alebo nepresnú informáciu,</li>
          <li>chýba uvedenie pôvodného zdroja alebo autora,</li>
          <li>sa domnievate, že publikovaný obsah zasahuje do vašich práv,</li>
          <li>chcete poskytnúť doplňujúce informácie alebo požiadať o opravu.</li>
        </ul>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 40, marginBottom: 12 }}>Spolupráca a tlačové správy</h2>
        <p>Radi spolupracujeme s technologickými spoločnosťami, výskumnými organizáciami, univerzitami, startupmi a odborníkmi v oblasti umelej inteligencie a umelej inteligencie.</p>
        <p>Ak máte zaujímavú novinku, nový robotický produkt alebo výskum, môžete nám zaslať tlačovú správu. Zaslanie automaticky nezaručuje jej publikovanie.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 40, marginBottom: 12 }}>Kto stojí za Umelá inteligencia24</h2>
        <p><strong>Umelá inteligencia24.sk</strong> a jeho česká verzia <strong>Umelá inteligencia24.cz</strong> sú nezávislé technologické spravodajské projekty určené čitateľom na Slovensku a v Českej republike.</p>
        <p>Na digitálnom a kreatívnom rozvoji projektov spolupracuje <strong>Drixton Creative Studio</strong>.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 40, marginBottom: 12 }}>Kontakt</h2>
        <p>E-mail: <a href="mailto:studio@drixton.com" style={{ color: '#37b3f2' }}>studio@drixton.com</a></p>
        <p><a href="https://inteligencia24.sk" style={{ color: '#37b3f2' }}>inteligencia24.sk</a> | <a href="https://inteligencia.cz" style={{ color: '#37b3f2' }}>inteligencia.cz</a></p>
      </div>

      <ContactForm />
    </div>
  );
}
