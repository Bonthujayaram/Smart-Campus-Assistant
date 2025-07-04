import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Contact as ContactIcon, User, Bell, File, Calendar, QrCode, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    message: '',
    priority: 'medium',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'technical', label: 'Technical Support', icon: AlertCircle },
    { value: 'academic', label: 'Academic Issues', icon: File },
    { value: 'attendance', label: 'Attendance Problems', icon: User },
    { value: 'timetable', label: 'Timetable Issues', icon: Calendar },
    { value: 'notifications', label: 'Notification Problems', icon: Bell },
    { value: 'qr-scanner', label: 'QR Scanner Help', icon: QrCode },
    { value: 'account', label: 'Account Issues', icon: User },
    { value: 'other', label: 'Other', icon: ContactIcon },
  ];

  const contactInfo = [
    {
      department: 'Academic Office',
      email: 'academic@campus.edu',
      phone: '+1 (555) 123-4567',
      hours: 'Mon-Fri: 9:00 AM - 5:00 PM',
      description: 'For academic issues, timetable problems, and course-related queries.',
    },
    {
      department: 'IT Support',
      email: 'support@campus.edu',
      phone: '+1 (555) 123-4568',
      hours: 'Mon-Fri: 8:00 AM - 6:00 PM',
      description: 'For technical issues, account problems, and app-related support.',
    },
    {
      department: 'Student Affairs',
      email: 'student.affairs@campus.edu',
      phone: '+1 (555) 123-4569',
      hours: 'Mon-Fri: 9:00 AM - 4:00 PM',
      description: 'For general student concerns and administrative matters.',
    },
    {
      department: 'Library',
      email: 'library@campus.edu',
      phone: '+1 (555) 123-4570',
      hours: 'Mon-Sun: 8:00 AM - 10:00 PM',
      description: 'For library-related queries and resource access issues.',
    },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Support Request Submitted",
        description: "We've received your request and will respond within 24 hours.",
      });
      setFormData({
        category: '',
        subject: '',
        message: '',
        priority: 'medium',
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact & Support</h1>
          <p className="text-gray-600">Get help with any issues or questions you may have</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ContactIcon className="w-5 h-5" />
                  Submit Support Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <Select onValueChange={(value) => handleChange('category', value)} value={formData.category}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select issue category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => {
                          const Icon = category.icon;
                          return (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {category.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <Select onValueChange={(value) => handleChange('priority', value)} value={formData.priority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Provide detailed information about your issue..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || !formData.category || !formData.subject || !formData.message}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="mt-6 bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700">Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-red-800">Campus Security:</span>
                    <span className="text-red-700">+1 (555) 123-0000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-red-800">Medical Emergency:</span>
                    <span className="text-red-700">+1 (555) 123-0001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-red-800">IT Emergency:</span>
                    <span className="text-red-700">+1 (555) 123-0002</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Contacts */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Department Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">{info.department}</h3>
                      <p className="text-sm text-gray-700 mb-3">{info.description}</p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="text-blue-600">{info.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span>{info.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hours:</span>
                          <span>{info.hours}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
