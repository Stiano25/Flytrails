import { WHATSAPP_URL } from '../config.js';

/** FAQ groups, in the order a traveller meets them. */
export const FAQ_GROUPS = [
  { id: 'before', label: 'Before you book' },
  { id: 'payments', label: 'Payments & changes' },
  { id: 'trip', label: 'On the trip' },
  { id: 'membership', label: 'Membership' },
];

/**
 * Shown when the admin FAQ list is empty. Every answer restates what the site already publishes
 * (Terms & Conditions, Custom tours and Membership pages); nothing new is promised here.
 * Each answer ends with the most useful next step.
 */
export const FALLBACK_FAQS = [
  {
    group: 'before',
    q: 'Can you plan a private or custom trip for us?',
    a: 'Yes. Tell us your dates, budget and where you’d like to go, and we design itineraries for families, teams, honeymoons and celebrations across Kenya, East Africa and selected international destinations.',
    action: { label: 'Plan my trip', to: '/?plan=1' },
  },
  {
    group: 'before',
    q: 'What documents do I need?',
    a: 'You’re responsible for valid ID or a passport, any visas you need, and vaccinations or health requirements for your destination. Flytrails isn’t responsible for denied entry due to incomplete documents.',
    action: { label: 'Read the full terms', to: '/terms' },
  },
  {
    group: 'before',
    q: 'I have a medical condition. Can I still join?',
    a: 'Please tell us about any medical conditions that may affect your participation before the trip, so we can advise you and plan around it.',
    action: { label: 'Chat on WhatsApp', href: WHATSAPP_URL },
  },
  {
    group: 'payments',
    q: 'How do I confirm my booking?',
    a: 'A booking is confirmed once the deposit or full payment specified for that trip has been received.',
    action: { label: 'See upcoming trips', to: '/upcoming-trips' },
  },
  {
    group: 'payments',
    q: 'Can I get a refund if I cancel?',
    a: 'Cancellations you make may carry cancellation fees, and deposits are generally non-refundable. Refund timelines can also depend on third-party providers.',
    action: { label: 'Read the full terms', to: '/terms' },
  },
  {
    group: 'payments',
    q: 'What happens if Flytrails cancels a trip?',
    a: 'You’ll be offered a full refund or the option to move to another trip.',
    action: { label: 'Chat on WhatsApp', href: WHATSAPP_URL },
  },
  {
    group: 'payments',
    q: 'Why might a trip price change?',
    a: 'Prices can change because of outside costs such as fuel, park fees and exchange rates.',
    action: { label: 'Browse trips', to: '/trips' },
  },
  {
    group: 'trip',
    q: 'Can the itinerary change once we’re travelling?',
    a: 'Occasionally, because of weather, safety concerns or government regulations. When that happens we always aim for a similar or better experience.',
    action: { label: 'Chat on WhatsApp', href: WHATSAPP_URL },
  },
  {
    group: 'trip',
    q: 'Will I appear in trip photos?',
    a: 'We photograph our trips and may use the pictures in our marketing. If you’d rather not be photographed, just let the photographer know in advance.',
    action: { label: 'See trip albums', to: '/gallery' },
  },
  {
    group: 'membership',
    q: 'How do I pay for Elite or VIP membership?',
    a: 'Reach out to us and we’ll send M-Pesa or bank details, then activate your perks within 24 hours.',
    action: { label: 'Compare memberships', to: '/membership' },
  },
  {
    group: 'membership',
    q: 'Can I upgrade my membership mid-year?',
    a: 'Yes. Upgrades are prorated for the months left in your membership year.',
    action: { label: 'Compare memberships', to: '/membership' },
  },
  {
    group: 'membership',
    q: 'Do member discounts stack with early-bird prices?',
    a: 'Member discounts apply to the public trip price, and we’ll always quote you the best rate you’re eligible for.',
    action: { label: 'Browse trips', to: '/trips' },
  },
  {
    group: 'membership',
    q: 'Is the community forum moderated?',
    a: 'Yes. Our team keeps discussions respectful, helpful and free of spam.',
    action: { label: 'Join free', to: '/membership' },
  },
];

const GROUP_HINTS = [
  ['membership', /member|elite|vip|explorer|upgrade/i],
  ['payments', /pay|deposit|refund|cancel|price|cost|m-?pesa|fee/i],
  ['trip', /itinerar|pack|weather|guide|photo|during|safety|bring|wear/i],
];

/** Admin FAQs don't carry a group, so place them by their wording. */
export function groupFor(question) {
  return GROUP_HINTS.find(([, re]) => re.test(question))?.[0] || 'before';
}
