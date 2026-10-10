// Instagram caption templates for inteligencia24 posts
// Format: Kategoria | Nazov clanku + rotujuci popis + hashtags

const descriptions = [
  `Prinášame vám najnovšie poznatky zo sveta robotiky a automatizácie.
Celý článok nájdete na našom webe, odkaz je v profile.`,

  `Aktuálny pohľad na vývoj v oblasti robotiky a umelej inteligencie.
Podrobnosti si prečítajte na inteligencia.sk, odkaz nájdete v profile.`,

  `Technológie, ktoré menia spôsob, akým pracujeme a žijeme.
Viac informácií nájdete v článku na našom webe, odkaz je v profile.`,

  `Sledujte s nami trendy, ktoré formujú budúcnosť robotiky.
Celý článok je dostupný na našom webe, odkaz nájdete v profile.`,

  `Prehľad najdôležitejších noviniek z oblasti robotiky na jednom mieste.
Celý článok si môžete prečítať na našom webe, odkaz nájdete v profile.`,

  `Odborný pohľad na riešenia, ktoré posúvajú hranice moderných technológií.
Viac sa dozviete v článku na našom webe, odkaz je v profile.`,

  `Ako robotika a umelá inteligencia ovplyvňujú priemysel a každodenný život.
Podrobnosti nájdete na našom webe, odkaz je dostupný v profile.`,

  `Zostaň informovaný o vývoji, ktorý formuje technologickú budúcnosť.
Celý článok nájdete na inteligencia.sk, odkaz je v profile.`,
];

const hashtags = [
  '#inteligencia24 #robotika #automatizácia #technológie #inovácie',
  '#inteligencia24 #umeláinteligencia #robotika #technológie #priemysel',
  '#inteligencia24 #inovácie #automatizácia #AI #budúcnosť',
  '#inteligencia24 #robotika #technológie #trendy #inovácie',
  '#inteligencia24 #robotika #novinky #technológie #automatizácia',
  '#inteligencia24 #inovácie #robotika #AI #výskum',
  '#inteligencia24 #umeláinteligencia #priemysel #technológie #digitalizácia',
  '#inteligencia24 #technológie #robotika #budúcnosť #inovácie',
];

// Category slug to display name
const categoryNames = {
  roboty: 'Roboty',
  technologie: 'Technológie',
  vyvoj: 'Vývoj',
};

// Build caption: Kategoria | Nazov clanku \n\n popis \n\n hashtags
export function getArticleCaption(index, title, categorySlug) {
  const cat = categoryNames[categorySlug] || 'Technológie';
  const desc = descriptions[index % descriptions.length];
  const tags = hashtags[index % hashtags.length];
  return `${cat} | ${title}\n\n${desc}\n\n${tags}`;
}

// Glossary post captions
export const glossaryCaptions = [
  `Nový pojem z nášho slovníčka robotiky! Ulož si to na neskôr alebo pošli kamošovi.
#inteligencia24 #robotika #vzdelávanie #technológie #slovníček`,

  `Vieš čo to znamená? Pozri naše vysvetlenie!
#inteligencia24 #robotika #slovníček #technológie #učímesa`,

  `Dnešný pojem zo sveta robotiky. Vedel si to?
#inteligencia24 #robotika #vzdelávanie #pojmy #technológie`,
];

// Get caption for glossary post: "Vieš, čo je to... Term?" + rotujúci popis
export function getGlossaryCaption(index, termEN) {
  const desc = glossaryCaptions[index % glossaryCaptions.length];
  return `Vieš, čo je to... ${termEN}?\n\n${desc}`;
}
