/**
 * DEVELOPMENT ONLY. A made-up stay used to preview the accommodation page while the database has none.
 * Reached only at /accommodations/demo?demo=1 when running `npm run dev`; production builds never use it
 * (every reference is behind import.meta.env.DEV). Not real inventory, prices or ratings.
 */
export const DEMO_STAY = {
  id: 'demo',
  slug: 'demo',
  title: 'Demo stay (preview only)',
  location: 'Diani, Kenya',
  shortDescription: 'Placeholder content to preview the stay page layout.',
  description:
    'This is placeholder text so the page layout can be reviewed before real stays are added in admin.\n\nReal stays will show their own description, photos, amenities and prices here.',
  image: '/images/diani%20beach.jpg',
  priceFrom: 0,
  amenities: ['Sample amenity', 'Another amenity', 'Third amenity'],
  rating: null,
  gallery: ['/images/beach.jpg', '/images/baliinternational.jpg', '/images/diani%20beach.jpg'],
  bookingWhatsapp: '',
  bookingLink: '',
};
