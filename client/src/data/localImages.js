/**
 * Local assets in `client/public/images/` (served as `/images/...`).
 */
const i = (name) => `/images/${encodeURIComponent(name)}`;

export const localImages = {
  hiking: i('hiking.jpg'),
  beach: i('beach.jpg'),
  dianiBeach: i('diani beach.jpg'),
  lionSafari: i('LionSafari.jpg'),
  savannah: i('Savannah.jpg'),
  elephantsSavannah: i('elephantssavannah.jpg'),
  mountainTop: i('MountainTop.jpg'),
  sirimonTrek: i('sirimontrek.jpg'),
  baliInternational: i('baliinternational.jpg'),
};

/** Rotate through all gallery-ready assets when more slots than files */
export const galleryPool = [
  localImages.lionSafari,
  localImages.hiking,
  localImages.beach,
  localImages.elephantsSavannah,
  localImages.savannah,
  localImages.sirimonTrek,
  localImages.mountainTop,
  localImages.baliInternational,
  localImages.dianiBeach,
];
