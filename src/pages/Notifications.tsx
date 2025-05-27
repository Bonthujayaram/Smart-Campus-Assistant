
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Bell, Calendar, User, AlertCircle, Clock, File } from 'lucide-react';

const Notifications = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const mockNotifications = [
    {
      id: '1',
      title: 'Mid-term Examination Schedule Released',
      message: 'The mid-term examination schedule for semester 6 has been published. Please check the exam dates and plan accordingly.',
      type: 'exam',
      date: '2024-01-23',
      time: '09:30 AM',
      isRead: false,
      priority: 'high',
      sender: 'Academic Office',
      actionRequired: true,
    },
    {
      id: '2',
      title: 'Assignment Due Reminder - Database Project',
      message: 'Your Database Management System project is due tomorrow at 11:59 PM. Please ensure timely submission.',
      type: 'urgent',
      date: '2024-01-22',
      time: '02:15 PM',
      isRead: false,
      priority: 'urgent',
      sender: 'Dr. Smith',
      actionRequired: true,
    },
    {
      id: '3',
      title: 'Library Hours Extended During Exams',
      message: 'The library will remain open 24/7 during the examination period from Feb 1-15. Additional study spaces have been arranged.',
      type: 'general',
      date: '2024-01-22',
      time: '11:00 AM',
      isRead: true,
      priority: 'medium',
      sender: 'Library Administration',
      actionRequired: false,
    },
    {
      id: '4',
      title: 'Guest Lecture on AI Ethics',
      message: 'Join us for an enlightening session on AI Ethics by Dr. Jane Miller from MIT on January 28th at 3:00 PM in the main auditorium.',
      type: 'event',
      date: '2024-01-21',
      time: '04:30 PM',
      isRead: true,
      priority: 'medium',
      sender: 'CS Department',
      actionRequired: false,
    },
    {
      id: '5',
      title: 'Fee Payment Deadline Approaching',
      message: 'This is a reminder that the semester fee payment deadline is January 30th. Late fees will apply after this date.',
      type: 'urgent',
      date: '2024-01-20',
      time: '10:00 AM',
      isRead: false,
      priority: 'high',
      sender: 'Accounts Office',
      actionRequired: true,
    },
    {
      id: '6',
      title: 'Career Fair Registration Open',
      message: 'Registration for the annual career fair is now open. Leading tech companies will be participating. Register by January 25th.',
      type: 'event',
      date: '2024-01-19',
      time: '03:20 PM',
      isRead: true,
      priority: 'medium',
      sender: 'Placement Cell',
      actionRequired: false,
    },
    {
      id: '7',
      title: 'Network Maintenance Scheduled',
      message: 'Campus network maintenance is scheduled for January 26th from 2:00 AM to 4:00 AM. Internet services may be interrupted.',
      type: 'general',
      date: '2024-01-18',
      time: '09:15 AM',
      isRead: true,
      priority: 'low',
      sender: 'IT Services',
      actionRequired: false,
    },
    {
      id: '8',
      title: 'New Course Registration',
      message: 'Registration for elective courses for next semester will begin on February 1st. Course catalog is available on the portal.',
      type: 'general',
      date: '2024-01-17',
      time: '01:45 PM',
      isRead: true,
      priority: 'medium',
      sender: 'Academic Office',
      actionRequired: false,
    },
  ];

  const filteredNotifications = mockNotifications.filter(notification => {
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'read' && notification.isRead) ||
      (selectedStatus === 'unread' && !notification.isRead);
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return Calendar;
      case 'urgent': return AlertCircle;
      case 'event': return User;
      case 'general': return Bell;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-blue-100 text-blue-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    // In a real app, this would update the notification status
    console.log(`Marking notification ${notificationId} as read`);
  };

  const handleMarkAllAsRead = () => {
    // In a real app, this would mark all notifications as read
    console.log('Marking all notifications as read');
  };

  const getNotificationStats = () => {
    const total = filteredNotifications.length;
    const unread = filteredNotifications.filter(n => !n.isRead).length;
    const urgent = filteredNotifications.filter(n => n.priority === 'urgent').length;
    const actionRequired = filteredNotifications.filter(n => n.actionRequired).length;
    return { total, unread, urgent, actionRequired };
  };

  const stats = getNotificationStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">Stay updated with important announcements and reminders</p>
            </div>
            <Button onClick={handleMarkAllAsRead} variant="outline">
              Mark All as Read
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-gray-600">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
                <p className="text-gray-600">Unread</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.urgent}</p>
                <p className="text-gray-600">Urgent</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.actionRequired}</p>
                <p className="text-gray-600">Action Required</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="exam">Exam Related</SelectItem>
              <SelectItem value="event">Events</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const TypeIcon = getTypeIcon(notification.type);
              
              return (
                <Card 
                  key={notification.id} 
                  className={`hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.isRead ? 'ring-1 ring-blue-200' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <Badge className={getTypeColor(notification.type)}>
                              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                            </Badge>
                            {notification.actionRequired && (
                              <Badge className="bg-orange-100 text-orange-800">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-700 mb-3">{notification.message}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(notification.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {notification.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {notification.sender}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {!notification.isRead && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                        {notification.actionRequired && (
                          <Button size="sm">
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications Found</h3>
              <p className="text-gray-600">No notifications match your current filters. Try adjusting your search.</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {filteredNotifications.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="justify-start">
                  <File className="w-4 h-4 mr-2" />
                  Export Notifications
                </Button>
                <Button variant="outline" className="justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Notification Settings
                </Button>
                <Button variant="outline" className="justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar Integration
                </Button>
                <Button variant="outline" className="justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Manage Subscriptions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notifications;
