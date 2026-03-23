import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext.jsx';
import {
  LayoutDashboard,
  Images,
  Map,
  BookOpen,
  FileText,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/admin',          label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/admin/gallery',  label: 'Gallery',       icon: Images },
  { to: '/admin/trips',    label: 'Trips',         icon: Map },
  { to: '/admin/blog',     label: 'Blog',          icon: BookOpen },
  { to: '/admin/content',  label: 'Site Content',  icon: FileText },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login');
  }

  const Sidebar = () => (
    <aside className="flex h-full w-60 flex-col bg-slate-900 text-white">
      <div className="flex items-center gap-3 border-b border-slate-700 px-6 py-5">
        <span className="font-display text-lg font-bold text-accent">Flytrails</span>
        <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-700 p-4">
        <p className="truncate px-1 text-xs text-slate-500">{user?.email}</p>
        <button
          onClick={handleSignOut}
          className="mt-2 flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex w-60 flex-shrink-0">
            <Sidebar />
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center gap-4 border-b bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display font-bold text-slate-800">Flytrails Admin</span>
        </div>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
