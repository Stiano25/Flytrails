import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../data/api.js';
import { Images, Map, BookOpen, FileText, ArrowRight } from 'lucide-react';

function StatCard({ label, value, icon: Icon, to, color }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:shadow-lg hover:ring-slate-200 md:gap-5 md:p-6"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 md:h-12 md:w-12 ${color}`}>
        <Icon className="h-5 w-5 md:h-6 md:w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl font-bold text-slate-800 md:text-2xl">{value ?? '—'}</p>
        <p className="text-xs text-slate-500 md:text-sm">{label}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

export default function Dashboard() {
  const [counts, setCounts] = useState({ trips: null, gallery: null, blog: null });

  useEffect(() => {
    Promise.all([
      adminApi.getAllTrips(),
      adminApi.getAllGalleryImages(),
      adminApi.getAllBlogPosts(),
    ]).then(([trips, gallery, blog]) => {
      setCounts({ trips: trips.length, gallery: gallery.length, blog: blog.length });
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm ring-1 ring-slate-100">
        <h1 className="font-display text-2xl font-bold text-slate-800 md:text-3xl">Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome back — manage your site content below.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
        <StatCard
          label="Trips"
          value={counts.trips}
          icon={Map}
          to="/admin/trips"
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Gallery images"
          value={counts.gallery}
          icon={Images}
          to="/admin/gallery"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Blog posts"
          value={counts.blog}
          icon={BookOpen}
          to="/admin/blog"
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Site content"
          value="Edit"
          icon={FileText}
          to="/admin/content"
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { to: '/admin/gallery', label: 'Upload gallery images', icon: Images, desc: 'Add or remove photos from the gallery.' },
          { to: '/admin/trips', label: 'Add a new trip', icon: Map, desc: 'Create a trip listing with all details.' },
          { to: '/admin/blog', label: 'Write a blog post', icon: BookOpen, desc: 'Publish guides and travel tips.' },
          { to: '/admin/content', label: 'Edit page texts', icon: FileText, desc: 'Update headlines, contact info, and more.' },
        ].map(({ to, label, icon: Icon, desc }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md hover:ring-slate-200"
          >
            <Icon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-slate-600" />
            <p className="mt-3 font-semibold text-slate-800 group-hover:text-slate-900">{label}</p>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
