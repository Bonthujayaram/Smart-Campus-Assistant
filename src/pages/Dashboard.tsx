
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Calendar, File, List, Bell, User, Contact } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const quickStats = [
    { label: 'Attendance', value: '85%', color: 'bg-green-100 text-green-800' },
    { label: 'Pending Assignments', value: '3', color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Upcoming Events', value: '2', color: 'bg-blue-100 text-blue-800' },
    { label: 'Notifications', value: '5', color: 'bg-red-100 text-red-800' },
  ];

  const quickActions = [
    { title: 'View Timetable', description: 'Check your daily schedule', icon: Calendar, link: '/timetable', color: 'bg-blue-500' },
    { title: 'Download Syllabus', description: 'Access course materials', icon: File, link: '/syllabus', color: 'bg-green-500' },
    { title: 'Check Assignments', description: 'View pending tasks', icon: List, link: '/assignments', color: 'bg-purple-500' },
    { title: 'View Notifications', description: 'Latest updates', icon: Bell, link: '/notifications', color: 'bg-red-500' },
    { title: 'Attendance Record', description: 'Track your attendance', icon: User, link: '/attendance', color: 'bg-indigo-500' },
    { title: 'Contact Support', description: 'Get help and support', icon: Contact, link: '/contact', color: 'bg-gray-500' },
  ];

  const recentNotifications = [
    { title: 'Mid-term Exam Schedule Released', time: '2 hours ago', type: 'exam' },
    { title: 'Assignment Due Tomorrow', time: '5 hours ago', type: 'assignment' },
    { title: 'Library Hours Extended', time: '1 day ago', type: 'general' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <div className="text-sm sm:text-base text-gray-600 space-y-1 sm:space-y-0">
            <div>Student ID: {user?.studentId}</div>
            <div className="sm:inline sm:ml-2">{user?.branch} | Semester {user?.semester}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                  <Badge className={`${stat.color} text-xs mt-2`} variant="secondary">
                    {stat.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Quick Actions */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Link key={index} to={action.link}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start space-x-3">
                              <div className={`${action.color} p-2 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                                  {action.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">{action.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                  Recent Notifications
                  <Link to="/notifications">
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                      View All
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {recentNotifications.map((notification, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 leading-tight">{notification.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Name:</span>
                    <span className="text-xs sm:text-sm font-medium truncate ml-2">{user?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Student ID:</span>
                    <span className="text-xs sm:text-sm font-medium">{user?.studentId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Branch:</span>
                    <span className="text-xs sm:text-sm font-medium truncate ml-2">{user?.branch}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Semester:</span>
                    <span className="text-xs sm:text-sm font-medium">{user?.semester}</span>
                  </div>
                  <Link to="/profile">
                    <Button variant="outline" className="w-full mt-3 sm:mt-4 text-xs sm:text-sm">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
