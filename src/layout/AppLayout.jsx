import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    addToast('You have been logged out.');
    navigate('/');
  };

  const navItems = [
    { path: '/', label: 'Home', always: true },
    { path: '/about', label: 'About', always: true },
    { path: '/library', label: 'Library', requiresAuth: true },
    { path: '/exam', label: 'Exam', requiresAuth: true },
    { path: '/contact', label: 'Contact', always: true },
    { path: '/admin', label: 'Admin', always: true },
  ].filter(item => item.always || (item.requiresAuth && isAuthenticated));

  return (
    // STRICT SCREEN LOCK: h-screen and overflow-hidden prevent the whole page from scrolling
    <div className="h-screen flex flex-col bg-brand-bg relative overflow-hidden">
      
      {/* HEADER: shrink-0 prevents it from being squished */}
      <div className="z-[100] w-full shadow-sm shrink-0">
        <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-[#fbfaf6] border-b border-brand-border relative z-50">
          <Link to="/" className="flex items-center gap-3 font-bold text-lg text-brand-dark">
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-primary text-[#f8f5eb] font-serif text-xl">P</span>
            PageTurn
          </Link>
          
          <div className="hidden md:flex items-center gap-8 h-full">
            <nav className="flex items-center gap-8 h-full">
              {navItems.map((page) => (
                <NavLink 
                  key={page.path} 
                  to={page.path} 
                  className={({ isActive }) => `text-sm font-semibold transition-colors ${isActive ? 'text-brand-primary border-b-2 border-brand-accentDark h-full flex items-center' : 'text-gray-500 hover:text-brand-primary h-full flex items-center'}`}
                >
                  {page.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center pl-8 border-l border-gray-200 h-8">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <User size={16} /> {user?.name}
                  </span>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-brand-primary transition-colors" title="Log out">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-sm font-semibold text-brand-primary hover:text-brand-primaryHover">
                  Sign In
                </Link>
              )}
            </div>
          </div>

          <button 
            className="md:hidden p-2 -mr-2 text-brand-dark"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>
        
        {isMobileMenuOpen && (
          <nav className="md:hidden absolute top-16 left-0 w-full bg-[#fbfaf6] border-b border-brand-border flex flex-col shadow-lg z-40">
            {navItems.map((page) => (
              <NavLink 
                key={page.path} 
                to={page.path} 
                className={({ isActive }) => `p-4 border-b border-gray-100 text-sm font-semibold ${isActive ? 'text-brand-primary bg-brand-primary/5' : 'text-gray-600'}`}
              >
                {page.label}
              </NavLink>
            ))}
            <div className="p-4 bg-gray-50">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="text-sm font-semibold text-red-600 flex items-center gap-2">
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <Link to="/login" className="text-sm font-semibold text-brand-primary">Sign In</Link>
              )}
            </div>
          </nav>
        )}
      </div>
      
      {/* MAIN BODY: overflow-y-auto allows internal scrolling for pages like About/Home, but Library will fill it */}
      <main className="flex-1 w-full px-4 md:px-8 py-4 relative flex flex-col min-h-0 overflow-y-auto">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* FOOTER: shrink-0 keeps it permanently pinned to the bottom */}
      <footer className="px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between border-t border-brand-border text-xs text-gray-500 bg-[#fbfaf6] shrink-0">
        <div className="flex items-center gap-2 font-bold text-sm text-brand-primary">
          <span className="w-5 h-5 flex items-center justify-center rounded bg-brand-primary text-[#f8f5eb] font-serif">P</span>
          PageTurn
        </div>
        <span className="mt-2 md:mt-0">Make time for a good story.</span>
        <span className="mt-1 md:mt-0">© {new Date().getFullYear()} PageTurn</span>
      </footer>
    </div>
  );
}
