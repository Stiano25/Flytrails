import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import HeroCarousel from '../components/home/HeroCarousel.jsx';
import JoinSection from '../components/home/JoinSection.jsx';
import TestimonialsSection from '../components/home/TestimonialsSection.jsx';
import PopularAdventureCard from '../components/home/PopularAdventureCard.jsx';
import { pageHeroImages } from '../data/pageHeroImages.js';
import { useSubmit, useTrips, useGalleryImages, useAccommodations, useFaqs } from '../hooks/useApi.js';
import { api } from '../data/api.js';

const clubs = [
  {
    badge: 'Explorer',
    title: 'Flytrails Explorer',
    desc: 'Newsletter, trip drops, and community forum access — start here.',
    price: 'Free',
    sub: 'Community access',
    to: '/membership',
  },
  {
    badge: 'Popular',
    title: 'Elite membership',
    desc: 'Early access, 5% off trips, members-only day hikes, priority WhatsApp.',
    price: 'KES 2,500/year',
    sub: 'Most popular',
    to: '/membership',
    highlight: true,
  },
  {
    badge: 'Premium',
    title: 'VIP membership',
    desc: '10% off, airport transfer once a year, luxury & international previews.',
    price: 'KES 6,000/year',
    sub: 'Full perks',
    to: '/membership',
  },
];

const why = [
  {
    title: 'Local Experts',
    text: 'Trusted local guides who bring destinations to life through authentic knowledge and real local connections.',
    icon: (
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    ),
  },
  {
    title: 'Intentional Travel',
    text: 'Intentional and respectful journeys that connect you deeply with local communities, cultural experiences, and authentic places.',
    icon: (
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    ),
  },
  {
    title: 'Curated Intimate Journeys',
    text: 'Curated intimate journeys with fewer travelers, designed for deeper connections and a more refined personal experience.',
    icon: (
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    ),
  },
];

export default function Home() {
  const [newsletterOk, setNewsletterOk] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const { submit: submitNewsletter, loading: newsletterLoading } = useSubmit();
  const { data: tripsData } = useTrips();
  const { data: galleryData } = useGalleryImages();
  const { data: accommodationsData } = useAccommodations();
  const { data: faqsData } = useFaqs();
  const popular = (tripsData || []).slice(0, 6);
  const moments = (galleryData || []).slice(0, 9);
  const featuredAccommodations = (accommodationsData || []).slice(0, 3);
  const homeFaqs = (faqsData || []).slice(0, 8);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    
    const result = await submitNewsletter(() => api.subscribeNewsletter(email));
    
    if (result.success) {
      e.target.reset();
      setNewsletterOk(true);
      setTimeout(() => setNewsletterOk(false), 5000);
    }
  };

  return (
    <>
      <HeroCarousel />
      <JoinSection />
      <TestimonialsSection />

      {/* These are the popular ones */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Glassmorphic background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.3),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(27,67,50,0.1),transparent_40%)]" />
        
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center md:mb-14"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-5 inline-block rounded-2xl border border-white/30 bg-white/20 px-5 py-2.5 backdrop-blur-md"
            >
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">Featured</span>
            </motion.div>
            
            <h2 className="font-display text-3xl font-bold text-brand-dark md:text-4xl lg:text-5xl">
              These are the popular ones
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-brand-dark/70 md:text-lg">
              Handpicked experiences that our travelers love most — join the adventure
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {popular.map((trip, index) => (
              <PopularAdventureCard key={trip.id} trip={trip} index={index} />
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-16 flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <Link
              to="/trips"
              className="group inline-flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 px-8 py-4 text-base font-semibold text-primary shadow-2xl transition-all duration-300 hover:bg-white/30 hover:scale-105"
            >
              <span>View all destinations</span>
              <motion.svg 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </Link>
            <Link
              to="/custom-tours"
              className="group inline-flex items-center gap-3 rounded-2xl bg-primary/90 backdrop-blur-md border border-primary/30 px-8 py-4 text-base font-semibold text-white shadow-2xl transition-all duration-300 hover:bg-primary hover:scale-105 hover:shadow-primary/25"
            >
              <span>Request custom trip</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Accommodations preview */}
      <section className="bg-white py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-bold text-brand-dark sm:text-3xl md:text-4xl">Accommodations</h2>
              <p className="mt-2 max-w-xl text-sm text-brand-dark/70 sm:text-base">Handpicked stays to match your travel style.</p>
            </div>
            <Link
              to="/accommodations"
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10 sm:py-2"
            >
              View all stays
            </Link>
          </div>
          {featuredAccommodations.length === 0 ? (
            <p className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-brand-dark/60 sm:p-6">
              Accommodations will appear here once added by admin.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {featuredAccommodations.map((item) => (
                <Link
                  key={item.id}
                  to={`/accommodations/${item.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-primary/20 hover:shadow-md"
                >
                  {item.image && (
                    <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-4 sm:p-5">
                    <h3 className="line-clamp-2 font-semibold leading-snug text-brand-dark group-hover:text-primary">{item.title}</h3>
                    <p className="mt-1 text-sm text-brand-dark/70">{item.location}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-brand-dark/75">{item.shortDescription || item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Moments — gallery strip */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Glassmorphic background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-white/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(212,169,106,0.15),transparent_50%)]" />
        
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end mb-12"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-block rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 mb-6"
              >
                <span className="text-sm font-semibold uppercase tracking-wider text-accent">Gallery</span>
              </motion.div>
              
              <h2 className="font-display text-4xl font-bold text-brand-dark md:text-5xl">
                Moments worth sharing
              </h2>
              <p className="mt-4 text-lg text-brand-dark/70">
                Real adventures, real memories from travelers like you
              </p>
            </div>
            
            <Link
              to="/gallery"
              className="group inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 text-sm font-semibold text-primary transition-all duration-300 hover:bg-white/30 hover:scale-105"
            >
              <span>View full gallery</span>
              <motion.svg 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </Link>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
            {moments.map((g, index) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                className="group relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl"
              >
                <div className="aspect-[4/3]">
                  <img
                    src={g.url}
                    alt={g.location}
                    width="400"
                    height="300"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-sm font-semibold text-white drop-shadow-lg">{g.location}</p>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Home FAQs */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-brand-dark md:text-4xl">Frequently asked questions</h2>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-600">Everything you need to know before you book with Flytrails.</p>
          </div>

          {homeFaqs.length === 0 ? (
            <p className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center text-sm text-brand-dark/60">
              FAQs will appear here once added by admin.
            </p>
          ) : (
            <div className="space-y-3">
              {homeFaqs.map((faq, index) => (
                <div key={faq.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex((prev) => (prev === index ? -1 : index))}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-brand-dark">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-primary transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className="border-t border-neutral-100 px-5 py-4 text-sm leading-relaxed text-neutral-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Exclusive clubs / membership */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Glassmorphic background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(27,67,50,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,169,106,0.1),transparent_50%)]" />
        
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 mb-6"
            >
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">Community</span>
            </motion.div>
            
            <h2 className="font-display text-4xl font-bold text-brand-dark md:text-5xl">
              Exclusive membership
            </h2>
            <p className="mt-4 text-lg text-brand-dark/70 max-w-2xl mx-auto">
              Connect, learn, and travel with like-minded adventurers
            </p>
          </motion.div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {clubs.map((c, index) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ 
                  delay: index * 0.2, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -10, 
                  scale: c.highlight ? 1.05 : 1.02,
                  transition: { duration: 0.3 }
                }}
                className={`
                  group relative overflow-hidden rounded-3xl p-8 transition-all duration-500
                  ${c.highlight 
                    ? 'bg-gradient-to-br from-accent/20 to-primary/20 backdrop-blur-xl border-2 border-accent/40 shadow-2xl shadow-accent/10 scale-105' 
                    : 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl'
                  }
                  hover:shadow-3xl
                `}
              >
                {/* Background shimmer */}
                <div className="absolute inset-0 bg-shimmer-gradient bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {c.highlight && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="absolute -top-4 right-4 rounded-full bg-accent/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-brand-dark shadow-lg border border-accent/30"
                    >
                      Most popular
                    </motion.div>
                  )}
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 + 0.3 }}
                    className="mb-4"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary/80">{c.badge}</span>
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 + 0.4 }}
                    className="font-display text-2xl font-bold text-brand-dark mb-4"
                  >
                    {c.title}
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 + 0.5 }}
                    className="text-sm leading-relaxed text-brand-dark/70 mb-8 flex-1"
                  >
                    {c.desc}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 + 0.6 }}
                    className="mb-6"
                  >
                    <p className="font-display text-3xl font-bold text-primary mb-1">{c.price}</p>
                    <p className="text-xs text-brand-dark/60">{c.sub}</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 + 0.7 }}
                  >
                    <Link
                      to={c.to}
                      className={`
                        group/btn relative overflow-hidden inline-flex w-full justify-center items-center gap-2 rounded-2xl py-3 px-6 text-sm font-semibold transition-all duration-300
                        ${c.highlight
                          ? 'bg-accent/90 text-brand-dark hover:bg-accent hover:scale-105 shadow-lg border border-accent/30'
                          : 'bg-white/10 text-primary border border-primary/30 hover:bg-white/20 hover:scale-105'
                        }
                      `}
                    >
                      <span className="relative z-10">Learn more</span>
                      <motion.svg 
                        className="h-4 w-4 relative z-10" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </motion.svg>
                      
                      {/* Button shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-16 text-center"
          >
            <Link 
              to="/membership" 
              className="group inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 text-sm font-semibold text-primary transition-all duration-300 hover:bg-white/30 hover:scale-105"
            >
              <span>Explore all membership options</span>
              <motion.svg 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="text-center font-display text-3xl font-bold text-brand-dark md:text-4xl">Why travel with Flytrails</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">Authentic, thoughtfully crafted journeys across East Africa and beyond.</p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {why.map((w) => (
              <div
                key={w.title}
                className="rounded-2xl border border-neutral-100 bg-[#faf9f7] p-8 text-center shadow-sm transition hover:shadow-md"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    {w.icon}
                  </svg>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-brand-dark">{w.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stay inspired */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Glassmorphic background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-brand-dark/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(212,169,106,0.3),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.1),transparent_50%)]" />
        
        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 mb-8"
            >
              <span className="text-sm font-semibold uppercase tracking-wider text-accent">Newsletter</span>
            </motion.div>
            
            <h2 className="font-display text-4xl font-bold text-white md:text-5xl mb-4">
              Stay inspired
            </h2>
            <p className="text-lg text-white/80 mb-12">
              Travel tips, new trip drops, and member-only updates — no spam, just adventure
            </p>
          </motion.div>
          
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mx-auto flex max-w-lg flex-col gap-4 sm:flex-row"
            onSubmit={handleNewsletterSubmit}
          >
            <label htmlFor="home-news" className="sr-only">
              Email address
            </label>
            <div className="relative flex-1">
              <input
                id="home-news"
                name="email"
                type="email"
                required
                disabled={newsletterLoading}
                placeholder="Enter your email"
                className="w-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 text-white placeholder:text-white/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
            
            <motion.button
              type="submit"
              disabled={newsletterLoading || newsletterOk}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden rounded-2xl bg-accent/90 backdrop-blur-md px-8 py-4 font-semibold text-brand-dark shadow-2xl transition-all duration-300 hover:bg-accent hover:shadow-accent/25 disabled:opacity-50 disabled:cursor-not-allowed border border-accent/30 min-w-[140px]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {newsletterLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-brand-dark/30 border-t-brand-dark rounded-full"
                    />
                    Subscribing...
                  </>
                ) : newsletterOk ? (
                  <>
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                    Subscribed!
                  </>
                ) : (
                  'Subscribe'
                )}
              </span>
              
              {/* Button shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </motion.button>
          </motion.form>
          
          {newsletterOk && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-accent font-medium"
              role="status"
            >
              🎉 You're in — watch your inbox for amazing adventures!
            </motion.p>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-28">
        {/* Background image with video effect */}
        <div className="absolute inset-0">
          <div className="animate-video-effect">
            <img
              src={pageHeroImages.homeCta}
              alt="Mountain lake landscape"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/95 via-brand-dark/85 to-primary/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,169,106,0.2),transparent_70%)]" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 mb-8"
            >
              <span className="text-sm font-semibold uppercase tracking-wider text-accent">Ready to explore?</span>
            </motion.div>
            
            <h2 className="font-display text-4xl font-bold text-white md:text-6xl mb-6">
              Ready to begin your journey?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Find the perfect adventure for your next escape — we'll handle the details
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <Link
              to="/trips"
              className="group inline-flex items-center gap-3 rounded-2xl bg-accent/90 backdrop-blur-md border border-accent/30 px-10 py-5 text-lg font-bold text-brand-dark shadow-2xl transition-all duration-300 hover:bg-accent hover:scale-105 hover:shadow-accent/25"
            >
              <span>Browse destinations</span>
              <motion.svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </Link>
            
            <Link
              to="/upcoming-trips"
              className="group inline-flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 px-10 py-5 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105"
            >
              <span>Check departures</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
