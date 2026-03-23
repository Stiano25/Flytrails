import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../data/api.js';
import { Images, Map, BookOpen, FileText, ArrowRight } from 'lucide-react';

function StatCard({ label, value, icon: Icon, to, color }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md hover:ring-slate-200"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value ?? '—'}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
      <ArrowRight className="ml-auto h-4 w-4 text-slate-300" />
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
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-800">Dashboard</h1>
      <p className="mt-1 text-slate-500">Welcome back — manage your site content below.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { to: '/admin/gallery', label: 'Upload gallery images', icon: Images, desc: 'Add or remove photos from the gallery.' },
          { to: '/admin/trips', label: 'Add a new trip', icon: Map, desc: 'Create a trip listing with all details.' },
          { to: '/admin/blog', label: 'Write a blog post', icon: BookOpen, desc: 'Publish guides and travel tips.' },
          { to: '/admin/content', label: 'Edit page texts', icon: FileText, desc: 'Update headlines, contact info, and more.' },
        ].map(({ to, label, icon: Icon, desc }) => (
          <Link
            key={to}
            to={to}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md"
          >
            <Icon className="h-5 w-5 text-slate-400" />
            <p className="mt-3 font-semibold text-slate-800">{label}</p>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
