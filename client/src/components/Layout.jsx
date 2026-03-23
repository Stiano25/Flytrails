import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import PageTransition from './PageTransition.jsx';

export default function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#f6f3ed] via-[#faf8f5] to-[#f0ebe4]">
      <Navbar />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
