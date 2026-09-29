import HomeHero from '../components/home/HomeHero.jsx';
import TestimonialsSection from '../components/home/TestimonialsSection.jsx';
import TripsShowcase from '../components/home/TripsShowcase.jsx';
import WhyFlytrails from '../components/home/WhyFlytrails.jsx';
import StaysPreview from '../components/home/StaysPreview.jsx';
import AlbumsTeaser from '../components/home/AlbumsTeaser.jsx';
import CommunitySection from '../components/home/CommunitySection.jsx';
import FaqGuide from '../components/site/FaqGuide.jsx';
import { useTrips, useGalleryImages, useAccommodations, useFaqs } from '../hooks/useApi.js';

/**
 * Home: plan (hero finder) → trust (stories) → options (trips, why us, stays, albums) → answers (FAQ) → belong (community).
 * Sections without data hide themselves.
 */
export default function Home() {
  const { data: tripsData } = useTrips();
  const { data: galleryData } = useGalleryImages();
  const { data: accommodationsData } = useAccommodations();
  const { data: faqsData } = useFaqs();

  return (
    <>
      <HomeHero />
      <TestimonialsSection />
      <TripsShowcase trips={tripsData} />
      <WhyFlytrails />
      <StaysPreview stays={accommodationsData} />
      <AlbumsTeaser images={galleryData} />
      <FaqGuide faqs={faqsData} />
      <CommunitySection />
    </>
  );
}
