import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import GlobalAlertModal from './components/GlobalAlertModal.jsx';
import Home from './pages/Home.jsx';
import { AuthProvider } from './lib/AuthContext.jsx';
import ProtectedRoute from './components/admin/ProtectedRoute.jsx';
import SuperAdminRoute from './components/admin/SuperAdminRoute.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';

// Public pages (lazy loaded)
const Trips = lazy(() => import('./pages/Trips.jsx'));
const Accommodations = lazy(() => import('./pages/Accommodations.jsx'));
const AccommodationDetail = lazy(() => import('./pages/AccommodationDetail.jsx'));
const TripDetail = lazy(() => import('./pages/TripDetail.jsx'));
const UpcomingTrips = lazy(() => import('./pages/UpcomingTrips.jsx'));
const CustomTours = lazy(() => import('./pages/CustomTours.jsx'));
const Membership = lazy(() => import('./pages/Membership.jsx'));
const Gallery = lazy(() => import('./pages/Gallery.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const BlogPost = lazy(() => import('./pages/BlogPost.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// Admin pages (lazy loaded)
const Login = lazy(() => import('./pages/admin/Login.jsx'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const GalleryAdmin = lazy(() => import('./pages/admin/GalleryAdmin.jsx'));
const TripsAdmin = lazy(() => import('./pages/admin/TripsAdmin.jsx'));
const AccommodationsAdmin = lazy(() => import('./pages/admin/AccommodationsAdmin.jsx'));
const BlogAdmin = lazy(() => import('./pages/admin/BlogAdmin.jsx'));
const SiteContent = lazy(() => import('./pages/admin/SiteContent.jsx'));
const TestimonialsAdmin = lazy(() => import('./pages/admin/TestimonialsAdmin.jsx'));
const UsersAdmin = lazy(() => import('./pages/admin/UsersAdmin.jsx'));
const Account = lazy(() => import('./pages/admin/Account.jsx'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Routes>
          {/* ── Public site ── */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="trips" element={<Suspense fallback={<PageLoader />}><Trips /></Suspense>} />
            <Route path="accommodations" element={<Suspense fallback={<PageLoader />}><Accommodations /></Suspense>} />
            <Route path="accommodations/:slug" element={<Suspense fallback={<PageLoader />}><AccommodationDetail /></Suspense>} />
            <Route path="trips/:slug" element={<Suspense fallback={<PageLoader />}><TripDetail /></Suspense>} />
            <Route path="upcoming-trips" element={<Suspense fallback={<PageLoader />}><UpcomingTrips /></Suspense>} />
            <Route path="custom-tours" element={<Suspense fallback={<PageLoader />}><CustomTours /></Suspense>} />
            <Route path="membership" element={<Suspense fallback={<PageLoader />}><Membership /></Suspense>} />
            <Route path="gallery" element={<Suspense fallback={<PageLoader />}><Gallery /></Suspense>} />
            <Route path="about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
            <Route path="blog" element={<Suspense fallback={<PageLoader />}><Blog /></Suspense>} />
            <Route path="blog/:slug" element={<Suspense fallback={<PageLoader />}><BlogPost /></Suspense>} />
            <Route path="contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
            <Route path="404" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
            <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
          </Route>

          {/* ── Admin ── */}
          <Route
            path="/admin/login"
            element={<Suspense fallback={<PageLoader />}><Login /></Suspense>}
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
            <Route path="gallery" element={<Suspense fallback={<PageLoader />}><GalleryAdmin /></Suspense>} />
            <Route path="trips" element={<Suspense fallback={<PageLoader />}><TripsAdmin /></Suspense>} />
            <Route path="accommodations" element={<Suspense fallback={<PageLoader />}><AccommodationsAdmin /></Suspense>} />
            <Route path="blog" element={<Suspense fallback={<PageLoader />}><BlogAdmin /></Suspense>} />
            <Route path="content" element={<Suspense fallback={<PageLoader />}><SiteContent /></Suspense>} />
            <Route path="testimonials" element={<Suspense fallback={<PageLoader />}><TestimonialsAdmin /></Suspense>} />
            <Route
              path="users"
              element={
                <Suspense fallback={<PageLoader />}>
                  <SuperAdminRoute>
                    <UsersAdmin />
                  </SuperAdminRoute>
                </Suspense>
              }
            />
            <Route path="account" element={<Suspense fallback={<PageLoader />}><Account /></Suspense>} />
          </Route>
        </Routes>
        <GlobalAlertModal />
      </ErrorBoundary>
    </AuthProvider>
  );
}
