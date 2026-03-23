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

  async subscribeNewsletter(email) {
    // TODO: connect to email service (Resend, Mailchimp, etc.)
    console.log('Newsletter subscription for:', email);
    return { success: true, message: 'Successfully subscribed to newsletter' };
  },

  async submitContact(formData) {
    // TODO: connect to email service or Supabase edge function
    console.log('Contact form submission:', formData);
    return { success: true, message: 'Message sent successfully' };
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
