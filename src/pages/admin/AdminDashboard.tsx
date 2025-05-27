
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  FileText, 
  ClipboardList, 
  Bell, 
  UserCheck,
  TrendingUp,
  BookOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats] = useState({
    totalStudents: 1247,
    totalFaculty: 89,
    activeAssignments: 23,
    pendingNotifications: 5,
    attendanceToday: 892,
    upcomingEvents: 7
  });

  const quickActions = [
    {
      title: 'Manage Timetables',
      description: 'Add, edit, or delete class schedules',
      icon: Calendar,
      link: '/admin/timetables',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Manage Syllabus',
      description: 'Upload and organize course materials',
      icon: BookOpen,
      link: '/admin/syllabus',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Manage Assignments',
      description: 'Create and track student assignments',
      icon: ClipboardList,
      link: '/admin/assignments',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Send Notifications',
      description: 'Send announcements to students',
      icon: Bell,
      link: '/admin/notifications',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'View Attendance',
      description: 'Monitor student attendance records',
      icon: UserCheck,
      link: '/admin/attendance',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: 'Student Reports',
      description: 'Generate academic performance reports',
      icon: TrendingUp,
      link: '/admin/reports',
      color: 'bg-pink-500 hover:bg-pink-600'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'New assignment created',
      details: 'Database Design Project for CS Semester 6',
      time: '2 hours ago',
      type: 'assignment',
      status: 'success'
    },
    {
      id: 2,
      action: 'Timetable updated',
      details: 'Monday schedule modified for CS Branch',
      time: '4 hours ago',
      type: 'timetable',
      status: 'success'
    },
    {
      id: 3,
      action: 'Notification sent',
      details: 'Exam schedule announcement to all students',
      time: '6 hours ago',
      type: 'notification',
      status: 'success'
    },
    {
      id: 4,
      action: 'Syllabus uploaded',
      details: 'Machine Learning syllabus for Semester 6',
      time: '1 day ago',
      type: 'syllabus',
      status: 'success'
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      task: 'Review pending assignment submissions',
      priority: 'high',
      dueDate: 'Today'
    },
    {
      id: 2,
      task: 'Update semester 7 timetables',
      priority: 'medium',
      dueDate: 'Tomorrow'
    },
    {
      id: 3,
      task: 'Send mid-term exam notifications',
      priority: 'high',
      dueDate: 'This week'
    },
    {
      id: 4,
      task: 'Upload new course syllabus',
      priority: 'low',
      dueDate: 'Next week'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment': return ClipboardList;
      case 'timetable': return Calendar;
      case 'notification': return Bell;
      case 'syllabus': return FileText;
      default: return AlertCircle;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your Smart Campus system</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Faculty</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFaculty}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeAssignments}</p>
                </div>
                <ClipboardList className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingNotifications}</p>
                </div>
                <Bell className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Today's Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.attendanceToday}</p>
                </div>
                <UserCheck className="w-8 h-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Upcoming Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                </div>
                <Calendar className="w-8 h-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link key={index} to={action.link}>
                      <Button
                        variant="outline"
                        className={`w-full h-auto p-4 ${action.color} text-white border-0 hover:shadow-lg transition-all group`}
                      >
                        <div className="flex flex-col items-center text-center space-y-2">
                          <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-semibold">{action.title}</div>
                            <div className="text-xs opacity-90">{action.description}</div>
                          </div>
                        </div>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.task}</p>
                      <p className="text-sm text-gray-500">{task.dueDate}</p>
                    </div>
                    <Badge className={getPriorityColor(task.priority)} variant="secondary">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-500">{activity.time}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
