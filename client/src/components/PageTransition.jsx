import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function PageTransition({ children }) {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="animate-fade-in">
      {children}
    </div>
  );
}
