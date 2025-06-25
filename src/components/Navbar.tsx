import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, User, Calendar, File, List, Contact, Menu, X, Users, BookOpen, CheckSquare } from 'lucide-react';
import { getApiUrl } from '@/utils/api';
import { Badge } from '@/components/ui/badge';

const NotificationBadge = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        if (!user?.id) return;
        
        // Fetch notifications
        const notificationsResponse = await fetch(getApiUrl(`/notifications?user_id=${user.id}`));
        const notificationsData = await notificationsResponse.json();
        
        // Fetch read status
        const readStatusResponse = await fetch(getApiUrl(`/notifications/read-status/${user.id}`));
        const readStatusData = await readStatusResponse.json();
        const readIds = new Set(readStatusData.read_notifications);
        
        // Count unread notifications
        const unreadNotifications = notificationsData.notifications.filter(
          (n: any) => !readIds.has(n.id)
        );
        
        setUnreadCount(unreadNotifications.length);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadCount();
    // Poll for new notifications every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [user]);

  if (unreadCount === 0) return null;

  return (
    <Badge variant="destructive" className="ml-2 px-2 py-0.5 text-xs">
      {unreadCount}
    </Badge>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: User },
    { to: '/attendance', label: 'Attendance', icon: User },  
    { to: '/timetable', label: 'Timetable', icon: Calendar },
    { to: '/syllabus', label: 'Syllabus', icon: File },
    { to: '/assignments', label: 'Assignments', icon: List },   
    { to: '/notifications', label: 'Notifications', icon: Bell, showBadge: true },
    { to: '/contact', label: 'Contact', icon: Contact },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Panel', icon: User },
    { to: '/admin/timetables', label: 'Manage Timetables', icon: Calendar },
    { to: '/admin/syllabus', label: 'Manage Syllabus', icon: File },
    { to: '/admin/students', label: 'Manage Student', icon: Users },
    { to: '/admin/faculty', label: 'Manage Faculty', icon: Users },
  ];

  const facultyLinks = [
    { to: '/faculty', label: 'Dashboard', icon: User },
    { to: '/faculty/assignments', label: 'Manage Assignments', icon: BookOpen },
    { to: '/faculty/attendance', label: 'Mark Attendance', icon: CheckSquare },
    { to: '/faculty/evaluations', label: 'Evaluations', icon: List }
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'admin':
        return adminLinks;
      case 'faculty':
        return facultyLinks;
      default:
        return studentLinks;
    }
  };

  const links = getLinks();

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              to={
                user.role === 'admin' 
                  ? '/admin' 
                  : user.role === 'faculty' 
                    ? '/faculty'
                    : '/dashboard'
              } 
              className="flex items-center"
            >
              <span className="text-xl sm:text-2xl font-bold text-blue-600">Smart Campus</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="hidden xl:inline">{link.label}</span>
                  {link.showBadge && <NotificationBadge />}
                </Link>
              );
            })}
          </div>

          {/* User Info & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-600 truncate max-w-32 lg:max-w-none">
              Welcome, {user.name}
            </span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 max-h-96 overflow-y-auto">
            {/* User info on mobile */}
            <div className="px-3 py-2 text-sm text-gray-600 border-b">
              Welcome, {user.name}
            </div>
            
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {link.label}
                  {link.showBadge && <NotificationBadge />}
                </Link>
              );
            })}
            
            {/* Logout button on mobile */}
            <div className="px-3 py-2 border-t">
              <Button onClick={handleLogout} variant="outline" size="sm" className="w-full">
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
