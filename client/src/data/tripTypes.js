/** Trip types offered in the home trip finder and the custom tour inquiry form. */
export const tripTypes = [
  { value: 'safari', label: 'Safari' },
  { value: 'hiking', label: 'Hiking & mountains' },
  { value: 'beach', label: 'Beach & islands' },
  { value: 'international', label: 'International' },
  { value: 'camping', label: 'Camping' },
  { value: 'honeymoon', label: 'Honeymoon' },
  { value: 'family', label: 'Family trip' },
  { value: 'group', label: 'Group or corporate' },
];

export const tripTypeLabel = (value) => tripTypes.find((t) => t.value === value)?.label || '';
