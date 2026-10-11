// Instagram caption templates for inteligencia24 posts
// Format: Kategoria | Nazov clanku + rotujuci popis + hashtags

const descriptions = [
  `Prinášame vám najnovšie poznatky zo sveta umelej inteligencie a AI technológií.
Celý článok nájdete na našom webe, odkaz je v profile.`,

  `Aktuálny pohľad na vývoj v oblasti umelej inteligencie a moderných technológií.
Podrobnosti si prečítajte na inteligencia24.sk, odkaz nájdete v profile.`,

  `Technológie, ktoré menia spôsob, akým pracujeme a žijeme.
Viac informácií nájdete v článku na našom webe, odkaz je v profile.`,

  `Sledujte s nami trendy, ktoré formujú budúcnosť umelej inteligencie.
Celý článok je dostupný na našom webe, odkaz nájdete v profile.`,

  `Prehľad najdôležitejších noviniek z oblasti AI na jednom mieste.
Celý článok si môžete prečítať na našom webe, odkaz nájdete v profile.`,

  `Odborný pohľad na riešenia, ktoré posúvajú hranice moderných technológií.
Viac sa dozviete v článku na našom webe, odkaz je v profile.`,

  `Ako umelá inteligencia ovplyvňuje priemysel a každodenný život.
Podrobnosti nájdete na našom webe, odkaz je dostupný v profile.`,

  `Zostaň informovaný o vývoji, ktorý formuje technologickú budúcnosť.
Celý článok nájdete na inteligencia24.sk, odkaz je v profile.`,
];

const hashtags = [
  '#inteligencia24 #umeláinteligencia #AI #technológie #inovácie',
  '#inteligencia24 #umeláinteligencia #strojovéučenie #technológie #priemysel',
  '#inteligencia24 #inovácie #AI #technológie #budúcnosť',
  '#inteligencia24 #umeláinteligencia #technológie #trendy #inovácie',
  '#inteligencia24 #AI #novinky #technológie #deeplearning',
  '#inteligencia24 #inovácie #umeláinteligencia #AI #výskum',
  '#inteligencia24 #umeláinteligencia #priemysel #technológie #digitalizácia',
  '#inteligencia24 #technológie #AI #budúcnosť #inovácie',
];

// Category slug to display name
const categoryNames = {
  modely: 'Modely',
  vyskum: 'Výskum',
  nastroje: 'Nástroje',
  biznis: 'Biznis',
  sport: 'Šport',
  technologie: 'Technológie',
};

// Build caption: Kategoria | Nazov clanku \n\n popis \n\n hashtags
export function getArticleCaption(index, title, categorySlug) {
  const cat = categoryNames[categorySlug] || 'Technológie';
  const desc = descriptions[index % descriptions.length];
  const tags = hashtags[index % hashtags.length];
  return `${cat} | ${title}\n\n${desc}\n\nZdroj: inteligencia24.sk\n© inteligencia24.sk - Všetky práva vyhradené.\n\n${tags}`;
}

// Glossary post captions
export const glossaryCaptions = [
  `Nový pojem z nášho AI slovníčka! Ulož si to na neskôr alebo pošli kamošovi.
#inteligencia24 #AI #vzdelávanie #technológie #slovníček`,

  `Vieš čo to znamená? Pozri naše vysvetlenie!
#inteligencia24 #AI #slovníček #technológie #učímesa`,

  `Dnešný pojem zo sveta umelej inteligencie. Vedel si to?
#inteligencia24 #AI #vzdelávanie #pojmy #technológie`,
];

// Get caption for glossary post: "Vieš, čo je to... Term?" + rotujúci popis
export function getGlossaryCaption(index, termEN) {
  const desc = glossaryCaptions[index % glossaryCaptions.length];
  return `Vieš, čo je to... ${termEN}?\n\n${desc}`;
}
