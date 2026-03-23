import { localImages } from './localImages.js';

/** Blog metadata + full body for featured posts */
export const blogPosts = [
  {
    slug: 'packing-guide-maasai-mara',
    title: 'What to Pack for Maasai Mara (Year-Round)',
    excerpt: 'Layers, lenses, and little things that make safari mornings easier — without overpacking.',
    category: 'Safari',
    readTime: '6 min read',
    date: '2025-02-10',
    image: localImages.lionSafari,
    featured: true,
    content: null,
  },
  {
    slug: 'best-time-mt-kenya',
    title: 'Best Time to Hike Mt Kenya',
    excerpt: 'Dry seasons, crowds, and how to pick a window that matches your fitness and schedule.',
    category: 'Hiking',
    readTime: '5 min read',
    date: '2025-01-22',
    image: localImages.sirimonTrek,
    featured: true,
    content: null,
  },
  {
    slug: 'solo-female-travel-east-africa',
    title: 'Solo Female Travel in East Africa: Tips',
    excerpt: 'Safety, community, and how group travel can be the perfect first step.',
    category: 'Travel Tips',
    readTime: '7 min read',
    date: '2024-12-05',
    image: localImages.savannah,
    featured: false,
    content: null,
  },
  {
    slug: 'first-group-trip',
    title: 'What to Expect on Your First Group Trip',
    excerpt: 'Pacing, personalities, and why the first day always feels like a reunion.',
    category: 'Community',
    readTime: '4 min read',
    date: '2024-11-18',
    image: localImages.beach,
    featured: false,
    content: null,
  },
  {
    slug: 'budget-travel-kenya',
    title: 'Budget Travel Tips for Kenya',
    excerpt: 'Smart splurges, local eats, and how to stretch your shilling without missing the magic.',
    category: 'Budget',
    readTime: '8 min read',
    date: '2024-10-30',
    image: localImages.elephantsSavannah,
    featured: false,
    content: null,
  },
  {
    slug: 'zanzibar-guide',
    title: 'A Short Guide to Zanzibar',
    excerpt: 'Stone Town, spices, and the beaches worth the extra ferry ride.',
    category: 'International',
    readTime: '6 min read',
    date: '2024-09-12',
    image: localImages.dianiBeach,
    featured: false,
    content: null,
  },
];

/** Full article bodies — at least two detailed posts */
export const blogFullContent = {
  'packing-guide-maasai-mara': {
    title: 'What to Pack for Maasai Mara (Year-Round)',
    sections: [
      {
        heading: 'Start with layers',
        body: [
          'Mornings and evenings on the Mara can be cool, even when midday is warm. Pack a light fleece, a windbreaker, and a breathable long-sleeve for sun protection.',
          'Neutral colours (khaki, olive, tan) are practical — they hide dust and blend in on drives.',
        ],
      },
      {
        heading: 'Gear that matters',
        body: [
          'Binoculars: if you have one, bring it. If not, don\'t stress — our vehicles are set up for spotting.',
          'Camera: zoom lens if you shoot; a phone with a decent telephoto works for many guests.',
          'Power: a small power bank for long game-drive days.',
        ],
      },
      {
        heading: 'Don\'t forget',
        body: [
          'Reusable water bottle, sunscreen, lip balm, and a wide-brim hat.',
          'A soft duffel is easier than a rigid suitcase in camp vehicles.',
        ],
      },
    ],
    closing: 'You\'ll get a full checklist PDF when you book — Flytrails keeps group sizes small so logistics stay human.',
  },
  'best-time-mt-kenya': {
    title: 'Best Time to Hike Mt Kenya',
    sections: [
      {
        heading: 'Dry seasons',
        body: [
          'January–February and July–October offer the most stable weather on the mountain. Trails are firmer, views clearer, and summit mornings less likely to be socked in by storms.',
        ],
      },
      {
        heading: 'Shoulder months',
        body: [
          'March and November can work with flexible dates — you may get short showers, but trails are quieter. We adjust pacing and add buffer days when needed.',
        ],
      },
      {
        heading: 'Your fitness window',
        body: [
          'Pick dates that match your training schedule, not only the weather. A prepared hiker in a wetter week often has a better experience than a rushed hiker in perfect skies.',
        ],
      },
    ],
    closing: 'Questions? Ask us on WhatsApp — we\'ll match you to a departure that fits.',
  },
};

export function getPostBySlug(slug) {
  return blogPosts.find((p) => p.slug === slug);
}

export function getFeaturedBlogPosts() {
  return blogPosts.filter((p) => p.featured).slice(0, 3);
}
