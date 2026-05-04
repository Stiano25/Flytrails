import { supabase } from '../lib/supabase.js';

// ── Shape normalizers ───────────────────────────────────────────
function mapTrip(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    category: row.category,
    duration: row.duration,
    price: row.price,
    spotsTotal: row.spots_total,
    spotsLeft: row.spots_left,
    difficulty: row.difficulty,
    nextDeparture: row.next_departure,
    description: row.description,
    highlights: row.highlights || [],
    itinerary: row.itinerary || [],
    included: row.included || [],
    notIncluded: row.not_included || [],
    faqs: row.faqs || [],
    image: row.image_url || '',
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

function mapGalleryImage(row) {
  return {
    id: row.id,
    url: row.url,
    location: row.location,
    tags: row.tags || [],
    sortOrder: row.sort_order,
  };
}

function mapBlogPost(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    readTime: row.read_time,
    date: row.date,
    image: row.image_url || '',
    featured: row.featured,
    sections: row.sections || [],
    closing: row.closing || '',
    isPublished: row.is_published,
  };
}

function mapAccommodation(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    shortDescription: row.short_description || '',
    description: row.description || '',
    image: row.image_url || '',
    priceFrom: row.price_from ?? 0,
    amenities: row.amenities || [],
    rating: row.rating ?? null,
    gallery: row.gallery || [],
    bookingWhatsapp: row.booking_whatsapp || '',
    bookingLink: row.booking_link || '',
    isActive: row.is_active,
    sortOrder: row.sort_order ?? 0,
  };
}

function mapTestimonial(row) {
  return {
    id: row.id,
    quote: row.quote,
    authorName: row.author_name,
    authorDetail: row.author_detail || '',
    authorImageUrl: row.author_image_url || '',
    isActive: row.is_active,
    sortOrder: row.sort_order ?? 0,
  };
}

function mapFaq(row) {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    isActive: row.is_active,
    sortOrder: row.sort_order ?? 0,
  };
}

function mapCustomerReview(row) {
  return {
    id: row.id,
    authorName: row.author_name,
    authorEmail: row.author_email || '',
    rating: row.rating,
    body: row.body,
    status: row.status,
    adminReply: row.admin_reply || '',
    adminRepliedAt: row.admin_replied_at || null,
    createdAt: row.created_at,
  };
}

// ── API ─────────────────────────────────────────────────────────
export const api = {
  async getTrips(filters = {}) {
    let query = supabase
      .from('trips')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (filters.category) query = query.eq('category', filters.category);
    if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
    if (filters.maxPrice) query = query.lte('price', filters.maxPrice);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return { data: (data || []).map(mapTrip), total: data?.length || 0, success: true };
  },

  async getTrip(slug) {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw new Error('Trip not found');
    return { data: mapTrip(data), success: true };
  },

  async getGalleryImages(tag = null) {
    let query = supabase
      .from('gallery_images')
      .select('*')
      .order('sort_order', { ascending: true });

    if (tag && tag !== 'All') {
      query = query.contains('tags', [tag]);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return { data: (data || []).map(mapGalleryImage), total: data?.length || 0, success: true };
  },

  async getBlogPosts() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return { data: (data || []).map(mapBlogPost), total: data?.length || 0, success: true };
  },

  async getBlogPost(slug) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw new Error('Blog post not found');
    return { data: mapBlogPost(data), success: true };
  },

  async getAccommodations() {
    const { data, error } = await supabase
      .from('accommodations')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { data: (data || []).map(mapAccommodation), total: data?.length || 0, success: true };
  },

  async getAccommodation(slug) {
    const { data, error } = await supabase
      .from('accommodations')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw new Error('Accommodation not found');
    return { data: mapAccommodation(data), success: true };
  },

  async getSiteContent() {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('section');

    if (error) throw new Error(error.message);
    // Return as key→value map
    const map = {};
    (data || []).forEach((row) => { map[row.key] = row.value; });
    return { data: map, success: true };
  },

  async getTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return { data: (data || []).map(mapTestimonial), total: data?.length || 0, success: true };
  },

  async getFaqs() {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return { data: (data || []).map(mapFaq), total: data?.length || 0, success: true };
  },

  async getCustomerReviews() {
    const { data, error } = await supabase
      .from('customer_reviews')
      .select('id, author_name, rating, body, admin_reply, admin_replied_at, created_at, status')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return { data: (data || []).map(mapCustomerReview), total: data?.length || 0, success: true };
  },

  async submitCustomerReview({ authorName, authorEmail, rating, body }) {
    const name = String(authorName || '').trim();
    const text = String(body || '').trim();
    if (!name) throw new Error('Please enter your name.');
    if (text.length < 10) throw new Error('Review must be at least 10 characters.');
    if (text.length > 5000) throw new Error('Review is too long (max 5000 characters).');

    const email = String(authorEmail || '').trim();
    let ratingVal = null;
    if (rating !== '' && rating != null) {
      const n = Number(rating);
      if (!Number.isFinite(n) || n < 1 || n > 5) throw new Error('Rating must be between 1 and 5.');
      ratingVal = n;
    }

    const { error } = await supabase.from('customer_reviews').insert({
      author_name: name,
      author_email: email || null,
      rating: ratingVal,
      body: text,
      status: 'pending',
    });

    if (error) throw new Error(error.message);
    return { success: true, message: 'Thanks — your review was submitted for moderation.' };
  },

  async subscribeNewsletter(email) {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Newsletter service not found. Make sure the API is running.');
      }
      throw new Error(data.error || 'Failed to subscribe');
    }
    return { success: true, message: 'Successfully subscribed to newsletter' };
  },

  async submitContact({ name, email, phone, subject, message }) {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone: phone || '', subject, message }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(
          data.error ||
            'Contact service not found. Run npm run dev (API + Vite together), or start the API with npm run dev:server. For vite preview, run the API on port 5000 in another terminal.',
        );
      }
      throw new Error(data.error || 'Failed to send message');
    }
    return { success: true, message: data.message || 'Message sent successfully' };
  },
};

// ── Admin API (authenticated) ────────────────────────────────────
export const adminApi = {
  // --- Trips ---
  async getAllTrips() {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map(mapTrip);
  },

  async upsertTrip(trip) {
    const row = {
      slug: trip.slug,
      title: trip.title,
      location: trip.location,
      category: trip.category,
      duration: trip.duration,
      price: Number(trip.price),
      spots_total: Number(trip.spotsTotal),
      spots_left: Number(trip.spotsLeft),
      difficulty: trip.difficulty,
      next_departure: trip.nextDeparture || null,
      description: trip.description,
      highlights: trip.highlights,
      itinerary: trip.itinerary,
      included: trip.included,
      not_included: trip.notIncluded,
      faqs: trip.faqs,
      image_url: trip.image || null,
      is_active: trip.isActive !== false,
      sort_order: Number(trip.sortOrder) || 0,
    };
    if (trip.id) row.id = trip.id;

    const { data, error } = await supabase
      .from('trips')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapTrip(data);
  },

  async deleteTrip(id) {
    const { error } = await supabase.from('trips').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Gallery ---
  async getAllGalleryImages() {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map(mapGalleryImage);
  },

  async uploadGalleryImage(file, location, tags) {
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filename, file, { cacheControl: '3600', upsert: false });
    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filename);

    const { data, error } = await supabase
      .from('gallery_images')
      .insert({ url: publicUrl, location, tags })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapGalleryImage(data);
  },

  async updateGalleryImage(id, { location, tags }) {
    const { data, error } = await supabase
      .from('gallery_images')
      .update({ location, tags })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapGalleryImage(data);
  },

  async deleteGalleryImage(id) {
    const { error } = await supabase.from('gallery_images').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Blog ---
  async getAllBlogPosts() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(mapBlogPost);
  },

  async upsertBlogPost(post) {
    const row = {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      read_time: post.readTime || null,
      date: post.date,
      image_url: post.image || null,
      featured: !!post.featured,
      sections: post.sections || [],
      closing: post.closing || null,
      is_published: post.isPublished !== false,
    };
    if (post.id) row.id = post.id;

    const { data, error } = await supabase
      .from('blog_posts')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapBlogPost(data);
  },

  async deleteBlogPost(id) {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async uploadBlogImage(file) {
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from('blog')
      .upload(filename, file, { cacheControl: '3600', upsert: false });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = supabase.storage.from('blog').getPublicUrl(filename);
    return publicUrl;
  },

  async uploadTripImage(file) {
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from('trips')
      .upload(filename, file, { cacheControl: '3600', upsert: false });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = supabase.storage.from('trips').getPublicUrl(filename);
    return publicUrl;
  },

  // --- Accommodations ---
  async getAllAccommodations() {
    const { data, error } = await supabase
      .from('accommodations')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map(mapAccommodation);
  },

  async upsertAccommodation(accommodation) {
    const row = {
      slug: accommodation.slug,
      title: accommodation.title,
      location: accommodation.location,
      short_description: accommodation.shortDescription || null,
      description: accommodation.description || null,
      image_url: accommodation.image || null,
      price_from: Number(accommodation.priceFrom) || 0,
      amenities: accommodation.amenities || [],
      rating: accommodation.rating === '' || accommodation.rating == null ? null : Number(accommodation.rating),
      gallery: accommodation.gallery || [],
      booking_whatsapp: accommodation.bookingWhatsapp || null,
      booking_link: accommodation.bookingLink || null,
      is_active: accommodation.isActive !== false,
      sort_order: Number(accommodation.sortOrder) || 0,
    };
    if (accommodation.id) row.id = accommodation.id;

    const { data, error } = await supabase
      .from('accommodations')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapAccommodation(data);
  },

  async deleteAccommodation(id) {
    const { error } = await supabase.from('accommodations').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async uploadAccommodationImage(file) {
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from('accommodations')
      .upload(filename, file, { cacheControl: '3600', upsert: false });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = supabase.storage.from('accommodations').getPublicUrl(filename);
    return publicUrl;
  },

  // --- Testimonials ---
  async getAllTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(mapTestimonial);
  },

  async upsertTestimonial(t) {
    const row = {
      quote: t.quote,
      author_name: t.authorName,
      author_detail: t.authorDetail || null,
      author_image_url: t.authorImageUrl || null,
      is_active: t.isActive !== false,
      sort_order: Number(t.sortOrder) || 0,
    };
    if (t.id) row.id = t.id;

    const { data, error } = await supabase
      .from('testimonials')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapTestimonial(data);
  },

  async deleteTestimonial(id) {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  /** Uploads author photo to Storage (public testimonials bucket). Max 10 MB, images only. */
  async uploadTestimonialPhoto(file) {
    const maxBytes = 10 * 1024 * 1024;
    if (!file || !file.size) throw new Error('Please choose an image file.');
    if (file.size > maxBytes) throw new Error('Image must be 10 MB or smaller.');
    if (!file.type.startsWith('image/')) throw new Error('File must be an image (JPEG, PNG, WebP, GIF, or AVIF).');

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from('testimonials')
      .upload(filename, file, { cacheControl: '3600', upsert: false });
    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = supabase.storage.from('testimonials').getPublicUrl(filename);
    return publicUrl;
  },

  // --- FAQs ---
  async getAllFaqs() {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(mapFaq);
  },

  async upsertFaq(faq) {
    const row = {
      question: faq.question,
      answer: faq.answer,
      is_active: faq.isActive !== false,
      sort_order: Number(faq.sortOrder) || 0,
    };
    if (faq.id) row.id = faq.id;

    const { data, error } = await supabase
      .from('faqs')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapFaq(data);
  },

  async deleteFaq(id) {
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Customer reviews (public submissions + staff moderation) ---
  async getAllCustomerReviews() {
    const { data, error } = await supabase
      .from('customer_reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(mapCustomerReview);
  },

  async updateCustomerReview({ id, status, adminReply }) {
    const payload = { status };
    if (adminReply !== undefined) {
      const reply = String(adminReply || '').trim();
      payload.admin_reply = reply || null;
      payload.admin_replied_at = reply ? new Date().toISOString() : null;
    }

    const { data, error } = await supabase
      .from('customer_reviews')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapCustomerReview(data);
  },

  async deleteCustomerReview(id) {
    const { error } = await supabase.from('customer_reviews').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- Site Content ---
  async getAllSiteContent() {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('section');
    if (error) throw new Error(error.message);
    return data || [];
  },

  async updateSiteContent(key, value) {
    const { error } = await supabase
      .from('site_content')
      .update({ value })
      .eq('key', key);
    if (error) throw new Error(error.message);
  },
};

// ── Error handling wrapper ──────────────────────────────────────
export const withErrorHandling = (apiCall) => {
  return async (...args) => {
    try {
      return await apiCall(...args);
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message || 'Something went wrong' };
    }
  };
};
