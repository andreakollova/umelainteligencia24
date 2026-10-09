// Glossary terms for "Vieš, čo je to..." Instagram posts
// Each term: { en, sk, explanation, slug }

export const glossaryTerms = [
  {
    en: 'RaaS',
    sk: 'Robot ako služba',
    explanation: 'Obchodný model, pri ktorom si firma robota nekúpi, ale **prenajme za mesačný poplatok**, ktorý zahŕňa údržbu aj aktualizácie softvéru. Robotizácia sa tak sprístupňuje aj menším firmám, ktoré nemajú na nákup drahého stroja. Funguje podobne ako **predplatné Netflixu**, len namiesto filmov dostanete pracovnú silu.',
    slug: 'raas',
  },
  {
    en: 'Mocap',
    sk: 'Snímanie pohybu',
    explanation: 'Technika, pri ktorej sa pohyby človeka zaznamenávajú pomocou **obleku so senzormi** alebo sústavy kamier. Zaznamenaný pohyb sa potom prenesie na robota, ktorý ho napodobní. Takto sa humanoidy naučili **tancovať**, robiť **bojové umenia** či gestikulovať ako človek.',
    slug: 'mocap',
  },
  {
    en: 'Sim-to-Real Gap',
    sk: 'Rozdiel medzi simuláciou a realitou',
    explanation: 'Problém, keď robot, ktorý vo **virtuálnej simulácii** funguje bezchybne, v skutočnom svete zlyháva. Príčinou sú drobnosti, ktoré simulácia nevystihne presne, napríklad **trenie**, osvetlenie či nepresnosti motorov. Prekonanie tohto rozdielu patrí k **najväčším výzvam** dnešnej robotiky.',
    slug: 'sim-to-real-gap',
  },
  {
    en: 'OTA',
    sk: 'Bezdrôtová aktualizácia',
    explanation: 'Spôsob, akým robot dostáva nový softvér cez internet, podobne ako mobilný telefón. Cez noc sa tak môže naučiť **novú zručnosť** alebo dostať opravy chýb bez príchodu technika. Takto sa dnes aktualizujú napríklad autá **Tesla** aj domáce **robotické vysávače**.',
    slug: 'ota',
  },
  {
    en: 'Fleet Learning',
    sk: 'Flotilové učenie',
    explanation: 'Prístup, pri ktorom sa to, čo sa naučí jeden robot, cez **cloud** okamžite odovzdá všetkým robotom rovnakého typu. Ak jeden robot prvýkrát zistí, ako otvoriť nový typ dverí, na druhý deň to vedia **všetky**. Roboty sa tak môžu učiť oveľa rýchlejšie ako ľudia, z ktorých sa každý musí všetko naučiť sám.',
    slug: 'fleet-learning',
  },
  {
    en: 'Pinkie',
    sk: 'Robotická ruka bez malíčka',
    explanation: 'Aktuálna téma z dielne **Boston Dynamics**, ktorá navrhla pre svojho humanoida **Atlas** novú ruku iba so **štyrmi prstami**. Inžinieri si na celý deň zlepili malíček a prstenník páskou, aby zistili, čo bez nich nezvládnu. Ukázalo sa, že malíček nie je pre robota nevyhnutný, a každý prst navyše znamená viac motorov, vyššiu cenu a viac miest, kde sa môže niečo pokaziť.',
    slug: 'pinkie',
  },
  {
    en: 'Wizard',
    sk: 'Skrytý operátor',
    explanation: 'Situácia, keď robot pôsobí úplne samostatne, no v skutočnosti ho časť času na diaľku ovláda **človek**, podobne ako čarodejníka z rozprávky, ktorý sa skrýval za oponou. Zaujalo, keď firma **Nucleus** zverejnila dvojhodinové nestrihané video humanoida v továrni a priznala, že **60 %** práce urobil sám a **40 %** ho riadil operátor. Pri virálnych videách robotov sa preto oplatí pýtať, koľko z toho robot zvládol naozaj sám.',
    slug: 'wizard',
  },
  {
    en: 'WAM',
    sk: 'Model sveta a akcie',
    explanation: 'Najnovší typ umelej inteligencie, ktorý si dokáže predstaviť, ako bude svet vyzerať o chvíľu, a zároveň rozhodnúť, aký pohyb má robot urobiť. Spája tak **predstavivosť** modelov, ktoré generujú videá, s ovládaním robotického tela. Firma **Runway**, známa nástrojmi na tvorbu videí, predstavila svoj model **Praxis-1** určený pre robotiku.',
    slug: 'wam',
  },
  {
    en: 'Spoof',
    sk: 'Podvrhnutie vstupu',
    explanation: 'Útok, pri ktorom niekto robotovi podstrčí **falošné údaje**, napríklad oklame jeho kameru, **lidar** alebo **GPS**. Robot potom môže dodržiavať všetky svoje bezpečnostné pravidlá, a napriek tomu konať na základe zmanipulovaných informácií. S tým, ako roboty prichádzajú medzi ľudí, sa ochrana ich zmyslov stáva rovnako dôležitou ako ochrana počítačov pred hackermi.',
    slug: 'spoof',
  },
];
