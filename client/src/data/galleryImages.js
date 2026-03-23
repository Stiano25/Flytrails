import { galleryPool } from './localImages.js';

const u = (index) => galleryPool[index % galleryPool.length];

export const galleryImages = [
  { id: '1', url: u(0), location: 'Maasai Mara, Kenya', tags: ['Kenya', 'Safari', 'East Africa'] },
  { id: '2', url: u(1), location: 'Mt Kenya moorland', tags: ['Kenya', 'Hiking', 'East Africa'] },
  { id: '3', url: u(2), location: 'Indian Ocean', tags: ['Kenya', 'Beach', 'East Africa'] },
  { id: '4', url: u(3), location: 'Amboseli', tags: ['Kenya', 'Safari', 'East Africa'] },
  { id: '5', url: u(4), location: 'Savanna sunrise', tags: ['Kenya', 'Safari', 'East Africa'] },
  { id: '6', url: u(5), location: 'Highland trails', tags: ['Hiking', 'East Africa'] },
  { id: '7', url: u(6), location: 'Summit views', tags: ['International', 'Hiking', 'East Africa'] },
  { id: '8', url: u(7), location: 'Coast & islands', tags: ['International', 'Beach', 'East Africa'] },
  { id: '9', url: u(8), location: 'Nairobi', tags: ['Kenya', 'East Africa'] },
  { id: '10', url: u(9), location: 'Rift escarpment', tags: ['Hiking', 'East Africa'] },
  { id: '11', url: u(10), location: 'Misty peaks', tags: ['Hiking', 'East Africa'] },
  { id: '12', url: u(11), location: 'Coastal cliffs', tags: ['Beach', 'East Africa'] },
  { id: '13', url: u(12), location: 'Tropical bay', tags: ['Beach', 'East Africa'] },
  { id: '14', url: u(13), location: 'Grasslands', tags: ['Safari', 'East Africa'] },
  { id: '15', url: u(14), location: 'Safari drive', tags: ['Kenya', 'Safari', 'East Africa'] },
  { id: '16', url: u(15), location: 'Big cats', tags: ['Safari', 'East Africa'] },
  { id: '17', url: u(16), location: 'Dubai', tags: ['International'] },
  { id: '18', url: u(17), location: 'Desert highway', tags: ['International', 'Hiking'] },
  { id: '19', url: u(18), location: 'Mountain lake', tags: ['Hiking', 'East Africa'] },
  { id: '20', url: u(19), location: 'Forest trail', tags: ['Hiking', 'East Africa'] },
  { id: '21', url: u(20), location: 'Sunset horizon', tags: ['Safari', 'East Africa'] },
  { id: '22', url: u(21), location: 'Golden hour', tags: ['Safari', 'East Africa'] },
];
