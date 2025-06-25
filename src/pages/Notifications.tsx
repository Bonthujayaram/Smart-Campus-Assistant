import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Bell, Calendar, User, AlertCircle, Clock, File } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/utils/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  target_audience: string;
  priority: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  recipients_count: number;
  isRead?: boolean;
  actionRequired?: boolean;
}

interface Assignment {
  id: number;
  title: string;
  subject: string;
  description: string;
  due_date: string;
  faculty: {
    name: string;
  };
  specialization?: string;
  status?: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch notifications with user ID
        const notificationsResponse = await fetch(getApiUrl(`/notifications?user_id=${user?.id}`));
        const notificationsData = await notificationsResponse.json();
        
        // Fetch read status
        const readStatusResponse = await fetch(getApiUrl(`/notifications/read-status/${user?.id}`));
        const readStatusData = await readStatusResponse.json();
        const readIds = new Set(readStatusData.read_notifications);
        
        // Process notifications with read status
        const processedNotifications = (notificationsData?.notifications || []).map((n: Notification) => ({
          ...n,
          isRead: readIds.has(n.id),
          actionRequired: n.priority === 'urgent'
        }));

        setNotifications(processedNotifications);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredNotifications = notifications.filter(notification => {
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
      case 'assignment': return File;
      case 'general': return Bell;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-blue-100 text-blue-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      case 'assignment': return 'bg-green-100 text-green-800';
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

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      if (!user?.id) {
        console.error('User ID not found');
        return;
      }

      // Call backend to mark as read
      const response = await fetch(getApiUrl(`/notifications/${notificationId}/read`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to mark notification as read');
      }

      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all visible notifications as read
      const promises = filteredNotifications
        .filter(n => !n.isRead)
        .map(n => handleMarkAsRead(n.id));
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationStats = () => {
    const total = filteredNotifications.length;
    const unread = filteredNotifications.filter(n => !n.isRead).length;
    const urgent = filteredNotifications.filter(n => n.priority === 'urgent').length;
    const actionRequired = filteredNotifications.filter(n => n.actionRequired).length;
    return { total, unread, urgent, actionRequired };
  };

  const stats = getNotificationStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading notifications...</p>
      </div>
    );
  }

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
              <SelectItem value="assignment">Assignments</SelectItem>
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
                              {new Date(notification.sent_at || notification.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(notification.sent_at || notification.created_at).toLocaleTimeString()}
                            </div>
                            {'faculty' in notification && notification.faculty && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                                {(notification as any).faculty}
                              </div>
                            )}
                            {'subject' in notification && (
                              <div className="flex items-center gap-1">
                                <File className="w-4 h-4" />
                                {(notification as any).subject}
                                {(notification as any).specialization && (
                                  <Badge className="ml-2 bg-purple-100 text-purple-800">
                                    {(notification as any).specialization}
                                  </Badge>
                                )}
                              </div>
                            )}
                            {'due_date' in notification && (
                              <div className="flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Due: {new Date((notification as any).due_date).toLocaleDateString()}
                                {(notification as any).submission_status && (
                                  <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                                    Status: {(notification as any).submission_status}
                                  </Badge>
                                )}
                            </div>
                            )}
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
                        {notification.type === 'assignment' && (
                          <Button 
                            size="sm"
                            onClick={() => window.location.href = `/assignments`}
                          >
                            View Assignment
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
      </div>
    </div>
  );
};

export default Notifications;
