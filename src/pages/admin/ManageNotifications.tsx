import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Bell, Send, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { getApiUrl } from '../../utils/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
}

const ManageNotifications = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    drafts: 0,
    urgent: 0
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'general',
    targetAudience: 'all',
    priority: 'normal'
  });

  const notificationTypes = [
    { value: 'general', label: 'General' },
    { value: 'exam', label: 'Exam' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'event', label: 'Event' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const targetAudiences = [
    { value: 'all', label: 'All Students' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Electronics and Communication', label: 'Electronics & Communication' },
    { value: 'Mechanical Engineering', label: 'Mechanical Engineering' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const fetchNotifications = async () => {
    try {
      const response = await fetch(getApiUrl(`/notifications?type=${selectedType}`));
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
        // Update stats
        setStats({
          total: data.notifications.length,
          sent: data.notifications.filter((n: Notification) => n.status === 'sent').length,
          drafts: data.notifications.filter((n: Notification) => n.status === 'draft').length,
          urgent: data.notifications.filter((n: Notification) => n.priority === 'urgent').length
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [selectedType]);

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: "Error",
        description: "Please fill in title and message",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(getApiUrl('/notifications'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newNotification.title,
          message: newNotification.message,
          type: newNotification.type,
          target_audience: newNotification.targetAudience,
          priority: newNotification.priority,
          status: 'sent'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const data = await response.json();
      
      if (data.success) {
    toast({
      title: "Success",
          description: "Notification sent successfully",
    });

    setNewNotification({
      title: '',
      message: '',
      type: 'general',
      targetAudience: 'all',
      priority: 'normal'
    });
    setIsCreating(false);
        // Refresh notifications list
        fetchNotifications();
      } else {
        throw new Error(data.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'general': return 'bg-gray-100 text-gray-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'assignment': return 'bg-blue-100 text-blue-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteNotification = async (notification: Notification) => {
    try {
      const response = await fetch(getApiUrl(`/notifications/${notification.id}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Notification deleted successfully",
        });
        fetchNotifications();
      } else {
        throw new Error(data.message || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete notification",
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
  };

  const handleEditClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setNewNotification({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      targetAudience: notification.target_audience,
      priority: notification.priority
    });
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleUpdateNotification = async () => {
    if (!selectedNotification) return;

    try {
      setIsLoading(true);
      const response = await fetch(getApiUrl(`/notifications/${selectedNotification.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newNotification.title,
          message: newNotification.message,
          type: newNotification.type,
          target_audience: newNotification.targetAudience,
          priority: newNotification.priority,
          status: selectedNotification.status
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification');
      }

      const data = await response.json();
      
      // Success message from backend
      toast({
        title: "Success",
        description: data.message || "Notification updated successfully",
      });
      
      setNewNotification({
        title: '',
        message: '',
        type: 'general',
        targetAudience: 'all',
        priority: 'normal'
      });
      setIsCreating(false);
      setIsEditing(false);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (error) {
      console.error('Error updating notification:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update notification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Notifications</h1>
          <p className="text-gray-600">Send announcements and updates to students</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {notificationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={() => setIsCreating(!isCreating)} 
            className="ml-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Notification
          </Button>
        </div>

        {/* Create/Edit Notification Form */}
        {isCreating && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-700">
                {isEditing ? 'Edit Notification' : 'Create New Notification'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select 
                    value={newNotification.type}
                    onValueChange={(value) => setNewNotification({...newNotification, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Notification Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={newNotification.targetAudience}
                    onValueChange={(value) => setNewNotification({...newNotification, targetAudience: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Target Audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {targetAudiences.map((audience) => (
                        <SelectItem key={audience.value} value={audience.value}>
                          {audience.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={newNotification.priority}
                    onValueChange={(value) => setNewNotification({...newNotification, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  placeholder="Notification Title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                />

                <Textarea
                  placeholder="Notification Message"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={isEditing ? handleUpdateNotification : handleSendNotification} 
                  disabled={isLoading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : isEditing ? 'Update Notification' : 'Send Notification'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    setSelectedNotification(null);
                    setNewNotification({
                      title: '',
                      message: '',
                      type: 'general',
                      targetAudience: 'all',
                      priority: 'normal'
                    });
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-gray-600">Total Notifications</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
                <p className="text-gray-600">Sent</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.drafts}</p>
                <p className="text-gray-600">Drafts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                <p className="text-gray-600">Urgent</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{notification.title}</h3>
                      <Badge className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                    </div>
                        <p className="text-gray-600">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Target: {notification.target_audience}</span>
                          <span>•</span>
                          <span>Sent: {new Date(notification.sent_at || notification.created_at).toLocaleString()}</span>
                          <span>•</span>
                          <span>Recipients: {notification.recipients_count}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                          onClick={() => handleEditClick(notification)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedNotification(notification);
                            setDeleteDialogOpen(true);
                          }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                </CardContent>
            </Card>
          ))}
        </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No Notifications</h3>
            <p className="text-gray-600">Create your first notification using the button above.</p>
            <Button 
              onClick={() => setIsCreating(true)} 
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Notification
              </Button>
            </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the notification.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => selectedNotification && handleDeleteNotification(selectedNotification)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ManageNotifications;
