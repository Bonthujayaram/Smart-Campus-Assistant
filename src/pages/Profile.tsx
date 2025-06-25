import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { User } from 'lucide-react';
import { getApiUrl } from '@/utils/api';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    branch: '',
    semester: '',
    registration_number: '',
    specialization: '',
    role: ''
  });

  const fetchStudentDetails = async () => {
    try {
      setError(null);
      if (!user?.studentId) {
        throw new Error('Student ID not found');
      }

      const response = await fetch(getApiUrl(`/students/${user.studentId}`));
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setFormData({
        name: data.name || '',
        email: data.email || '',
        studentId: data.studentId?.toString() || '',
        branch: data.branch || '',
        semester: data.semester?.toString() || '',
        registration_number: data.registration_number || '',
        specialization: data.specialization || '',
        role: user.role || ''
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching student details:', error);
      setError('Failed to load profile data. Please check your internet connection and try again.');
      // Retry logic for network errors
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchStudentDetails();
        }, 2000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setError(null);
      const response = await fetch(getApiUrl(`/students/${user?.studentId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          registration_number: formData.registration_number,
          semester: parseInt(formData.semester),
          specialization: formData.specialization
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast({
        title: "Success",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    fetchStudentDetails();
    setIsEditing(false);
    setError(null);
  };

  const handleRetry = () => {
    setRetryCount(0);
    setLoading(true);
    fetchStudentDetails();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your personal information</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center flex-wrap gap-2">
              {error}
              <Button variant="link" className="p-0 h-auto font-normal underline" onClick={handleRetry}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <CardTitle className="text-xl sm:text-2xl">Personal Information</CardTitle>
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)} 
                disabled={!!error}
                className="w-full sm:w-auto"
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  onClick={handleSave}
                  className="flex-1 sm:flex-none"
                >
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded border break-words">{formData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="w-full"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded border break-words">{formData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <p className="p-2 bg-gray-50 rounded border break-words">{formData.studentId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number
                </label>
                {isEditing ? (
                  <Input
                    value={formData.registration_number}
                    onChange={(e) => handleChange('registration_number', e.target.value)}
                    placeholder="Enter registration number"
                    className="w-full"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded border break-words">{formData.registration_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <p className="p-2 bg-gray-50 rounded border break-words">{formData.branch}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                {isEditing ? (
                  <Select 
                    onValueChange={(value) => handleChange('semester', value)} 
                    value={formData.semester}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded border break-words">Semester {formData.semester}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                {isEditing ? (
                  <Input
                    value={formData.specialization}
                    onChange={(e) => handleChange('specialization', e.target.value)}
                    placeholder="Enter specialization"
                    className="w-full"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded border break-words">{formData.specialization || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <p className="p-2 bg-gray-50 rounded border break-words capitalize">{formData.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
