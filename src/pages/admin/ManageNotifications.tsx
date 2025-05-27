
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Bell, Send, Eye, Edit, Trash2, Plus, Users, Calendar, AlertCircle } from 'lucide-react';

const ManageNotifications = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'general',
    targetAudience: 'all',
    priority: 'normal'
  });

  const mockNotifications = [
    {
      id: '1',
      title: 'Mid-term Exam Schedule Released',
      message: 'The mid-term examination schedule for all branches has been published. Please check your respective branch notice boards.',
      type: 'exam',
      priority: 'high',
      targetAudience: 'all',
      date: '2024-01-15',
      status: 'sent',
      recipients: 1247
    },
    {
      id: '2',
      title: 'Library Hours Extended',
      message: 'Library hours have been extended till 10 PM for the examination period.',
      type: 'general',
      priority: 'normal',
      targetAudience: 'all',
      date: '2024-01-14',
      status: 'sent',
      recipients: 1247
    },
    {
      id: '3',
      title: 'CS Branch Assignment Deadline',
      message: 'Database Management assignment submission deadline is tomorrow.',
      type: 'assignment',
      priority: 'urgent',
      targetAudience: 'Computer Science',
      date: '2024-01-13',
      status: 'sent',
      recipients: 312
    },
    {
      id: '4',
      title: 'Campus Cultural Event',
      message: 'Annual cultural fest registration is now open. Register before 20th January.',
      type: 'event',
      priority: 'normal',
      targetAudience: 'all',
      date: '2024-01-12',
      status: 'draft',
      recipients: 0
    }
  ];

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

  const handleSendNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: "Error",
        description: "Please fill in title and message",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Notification sent successfully to all recipients",
    });

    setNewNotification({
      title: '',
      message: '',
      type: 'general',
      targetAudience: 'all',
      priority: 'normal'
    });
    setIsCreating(false);
  };

  const handleEdit = (id: string) => {
    toast({
      title: "Edit Mode",
      description: "Edit functionality would be implemented here",
    });
  };

  const handleDelete = (id: string) => {
    toast({
      title: "Success",
      description: "Notification deleted successfully",
    });
  };

  const handleView = (id: string) => {
    toast({
      title: "View",
      description: "Opening notification details",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'assignment': return 'bg-yellow-100 text-yellow-800';
      case 'event': return 'bg-blue-100 text-blue-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = selectedType === 'all' 
    ? mockNotifications 
    : mockNotifications.filter(n => n.type === selectedType);

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

        {/* Create New Notification */}
        {isCreating && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-700">Create New Notification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select onValueChange={(value) => setNewNotification({...newNotification, type: value})}>
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

                  <Select onValueChange={(value) => setNewNotification({...newNotification, targetAudience: value})}>
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

                  <Select onValueChange={(value) => setNewNotification({...newNotification, priority: value})}>
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
                <Button onClick={handleSendNotification}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Notification
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{mockNotifications.length}</p>
                <p className="text-gray-600">Total Notifications</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {mockNotifications.filter(n => n.status === 'sent').length}
                </p>
                <p className="text-gray-600">Sent</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {mockNotifications.filter(n => n.status === 'draft').length}
                </p>
                <p className="text-gray-600">Drafts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {mockNotifications.filter(n => n.priority === 'urgent').length}
                </p>
                <p className="text-gray-600">Urgent</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="grid gap-6">
          {filteredNotifications.map((notification) => (
            <Card key={notification.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      <Badge className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                      <Badge variant={notification.status === 'sent' ? 'default' : 'secondary'}>
                        {notification.status}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{notification.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {notification.targetAudience}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(notification.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bell className="w-4 h-4" />
                        {notification.recipients} recipients
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleView(notification.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(notification.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Quick Templates */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Exam Schedule</div>
                  <div className="text-xs text-gray-500">Announce exam dates</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Assignment Reminder</div>
                  <div className="text-xs text-gray-500">Deadline reminders</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Event Announcement</div>
                  <div className="text-xs text-gray-500">Campus events</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">General Notice</div>
                  <div className="text-xs text-gray-500">General information</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageNotifications;
