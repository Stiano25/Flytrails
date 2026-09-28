/**
 * Trip types offered in the home trip finder and the custom tour inquiry form.
 * `noun` is how the type reads in the personalised button ("Plan my October safari for 2").
 */
export const tripTypes = [
  { value: 'safari', label: 'Safari', noun: 'safari', image: '/images/trip-types/safari.jpg' },
  { value: 'beach', label: 'Beach & islands', noun: 'beach trip', image: '/images/trip-types/beach.jpg' },
  { value: 'hiking', label: 'Hiking & mountains', noun: 'hike', image: '/images/trip-types/hiking.jpg' },
  { value: 'camping', label: 'Camping', noun: 'camping trip', image: '/images/trip-types/camping.jpg' },
  { value: 'honeymoon', label: 'Honeymoon', noun: 'honeymoon', image: '/images/trip-types/honeymoon.jpg' },
  { value: 'family', label: 'Family trip', noun: 'family trip', image: '/images/trip-types/family.jpg' },
  { value: 'group', label: 'Group or corporate', noun: 'group trip', image: '/images/trip-types/group.jpg' },
  { value: 'international', label: 'International', noun: 'trip abroad', image: '/images/trip-types/international.jpg' },
];

export const findTripType = (value) => tripTypes.find((t) => t.value === value);
export const tripTypeLabel = (value) => findTripType(value)?.label || '';
