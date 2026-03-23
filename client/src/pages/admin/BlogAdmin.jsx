import { useEffect, useState } from 'react';
import { adminApi } from '../../data/api.js';
import BlogForm from './BlogForm.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';

export default function BlogAdmin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formPost, setFormPost] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchPosts() {
    setLoading(true);
    try { setPosts(await adminApi.getAllBlogPosts()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchPosts(); }, []);

  function handleSave(saved) {
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [saved, ...prev];
    });
    setShowForm(false);
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await adminApi.deleteBlogPost(deleteId);
      setPosts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      alert('Failed to delete: ' + e.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Blog</h1>
          <p className="mt-1 text-slate-500">{posts.length} posts</p>
        </div>
        <button
          onClick={() => { setFormPost(undefined); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-accent hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New post
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-slate-400">Loading…</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-500">Post</th>
                <th className="hidden px-4 py-3 font-semibold text-slate-500 md:table-cell">Category</th>
                <th className="hidden px-4 py-3 font-semibold text-slate-500 lg:table-cell">Date</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.image && (
                        <img src={post.image} alt={post.title} className="h-10 w-14 rounded-lg object-cover" />
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          {post.featured && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                          <p className="font-semibold text-slate-800 leading-snug">{post.title}</p>
                        </div>
                        <p className="text-xs text-slate-400 truncate max-w-[220px]">{post.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{post.category}</td>
                  <td className="hidden px-4 py-3 text-slate-500 lg:table-cell">{post.date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      post.isPublished
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {post.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setFormPost(post); setShowForm(true); }}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(post.id)}
                        className="rounded-lg border border-red-100 p-1.5 text-red-400 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {posts.length === 0 && (
            <p className="py-12 text-center text-slate-400">No posts yet — write your first one.</p>
          )}
        </div>
      )}

      {showForm && (
        <BlogForm
          post={formPost}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete post?"
          message="This will permanently remove the blog post. This cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
