import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Mail, Phone, Building, Calendar, UserCheck, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getApiUrl } from '@/utils/api';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Faculty {
  id: number;
  name: string;
  email: string;
  faculty_code: string;
  department: string;
  designation: string;
  joining_date: string;
  specialization: string;
  contact_number: string;
  is_active: boolean;
}

const ManageFaculty = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [departments, setDepartments] = useState(['Computer Science', 'Information Technology', 'Electronics and Communication', 'Mechanical Engineering']);
  const [specializations, setSpecializations] = useState(['AIML', 'Data Science', 'ECE', 'Cyber Security', 'CN']);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    email: '',
    faculty_code: '',
    department: '',
    designation: '',
    joining_date: '',
    specialization: '',
    contact_number: '',
    is_active: true
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await fetch(getApiUrl('/faculty'));
      const data = await response.json();
      setFaculty(data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch faculty list',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFaculty = async () => {
    try {
      const response = await fetch(getApiUrl('/faculty'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFaculty),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Faculty member added successfully',
        });
        fetchFaculty();
        setIsAddDialogOpen(false);
        setNewFaculty({
          name: '',
          email: '',
          faculty_code: '',
          department: '',
          designation: '',
          joining_date: '',
          specialization: '',
          contact_number: '',
          is_active: true
        });
      } else {
        throw new Error('Failed to add faculty');
      }
    } catch (error) {
      console.error('Error creating faculty:', error);
      toast({
        title: 'Error',
        description: 'Failed to add faculty member',
        variant: 'destructive',
      });
    }
  };

  const handleEditFaculty = async () => {
    if (!editingFaculty) return;

    try {
      const response = await fetch(getApiUrl(`/faculty/${editingFaculty.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingFaculty),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Faculty member updated successfully',
        });
        fetchFaculty();
        setIsEditDialogOpen(false);
        setEditingFaculty(null);
      } else {
        throw new Error('Failed to update faculty');
      }
    } catch (error) {
      console.error('Error updating faculty:', error);
      toast({
        title: 'Error',
        description: 'Failed to update faculty member',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFaculty = async (id: number) => {
    try {
      const response = await fetch(getApiUrl(`/faculty/${id}`), {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Faculty member deleted successfully',
        });
        fetchFaculty();
      } else {
        throw new Error('Failed to delete faculty');
      }
    } catch (error) {
      console.error('Error deleting faculty:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete faculty member',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Faculty', value: faculty.length, color: 'text-blue-600' },
    { label: 'Departments', value: new Set(faculty.map(f => f.department)).size, color: 'text-green-600' },
    { label: 'Active Faculty', value: faculty.filter(f => f.is_active).length, color: 'text-purple-600' },
    { label: 'New This Month', value: faculty.filter(f => {
      const joinDate = new Date(f.joining_date);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return joinDate >= oneMonthAgo;
    }).length, color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Manage Faculty</h1>
            <p className="text-sm sm:text-base text-gray-600">Add and manage faculty members</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add New Faculty
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95%] max-w-[500px] p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>Add New Faculty Member</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                <Input
                  placeholder="Name"
                  value={newFaculty.name}
                  onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newFaculty.email}
                  onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                />
                <Input
                  placeholder="Faculty Code"
                  value={newFaculty.faculty_code}
                  onChange={(e) => setNewFaculty({ ...newFaculty, faculty_code: e.target.value })}
                />
                <Select 
                  value={newFaculty.department}
                  onValueChange={(value) => setNewFaculty({ ...newFaculty, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Designation"
                  value={newFaculty.designation}
                  onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })}
                />
                <Select 
                  value={newFaculty.specialization}
                  onValueChange={(value) => setNewFaculty({ ...newFaculty, specialization: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Contact Number"
                  value={newFaculty.contact_number}
                  onChange={(e) => setNewFaculty({ ...newFaculty, contact_number: e.target.value })}
                />
                <Input
                  type="date"
                  placeholder="Joining Date"
                  value={newFaculty.joining_date}
                  onChange={(e) => setNewFaculty({ ...newFaculty, joining_date: e.target.value })}
                />
                <Button onClick={handleCreateFaculty}>Add Faculty</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 sm:p-6">
                <div className="text-center">
                  <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm sm:text-base text-gray-600">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Faculty List */}
        <div className="grid gap-4 sm:gap-6">
          {faculty.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg sm:text-xl">{member.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <Badge variant="outline">{member.faculty_code}</Badge>
                      <Badge variant="secondary">{member.department}</Badge>
                      <Badge variant={member.is_active ? "secondary" : "destructive"}>
                        {member.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingFaculty(member)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95%] max-w-[500px] p-4 sm:p-6">
                        <DialogHeader>
                          <DialogTitle>Edit Faculty Member</DialogTitle>
                        </DialogHeader>
                        {editingFaculty && (
                          <div className="grid gap-3 py-4">
                            <Input
                              placeholder="Name"
                              value={editingFaculty.name}
                              onChange={(e) => setEditingFaculty({ ...editingFaculty, name: e.target.value })}
                            />
                            <Input
                              placeholder="Email"
                              type="email"
                              value={editingFaculty.email}
                              onChange={(e) => setEditingFaculty({ ...editingFaculty, email: e.target.value })}
                            />
                            <Input
                              placeholder="Faculty Code"
                              value={editingFaculty.faculty_code}
                              onChange={(e) => setEditingFaculty({ ...editingFaculty, faculty_code: e.target.value })}
                            />
                            <Select 
                              value={editingFaculty.department}
                              onValueChange={(value) => setEditingFaculty({ ...editingFaculty, department: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Department" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.map((dept) => (
                                  <SelectItem key={dept} value={dept}>
                                    {dept}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Designation"
                              value={editingFaculty.designation}
                              onChange={(e) => setEditingFaculty({ ...editingFaculty, designation: e.target.value })}
                            />
                            <Select 
                              value={editingFaculty.specialization}
                              onValueChange={(value) => setEditingFaculty({ ...editingFaculty, specialization: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Specialization" />
                              </SelectTrigger>
                              <SelectContent>
                                {specializations.map((spec) => (
                                  <SelectItem key={spec} value={spec}>
                                    {spec}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Contact Number"
                              value={editingFaculty.contact_number}
                              onChange={(e) => setEditingFaculty({ ...editingFaculty, contact_number: e.target.value })}
                            />
                            <Input
                              type="date"
                              placeholder="Joining Date"
                              value={editingFaculty.joining_date}
                              onChange={(e) => setEditingFaculty({ ...editingFaculty, joining_date: e.target.value })}
                            />
                            <Button onClick={handleEditFaculty}>Save Changes</Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteFaculty(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Mail className="w-4 h-4 flex-shrink-0 text-gray-500" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 flex-shrink-0 text-gray-500" />
                    <span>{member.contact_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 flex-shrink-0 text-gray-500" />
                    <span>{member.designation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0 text-gray-500" />
                    <span>Joined: {new Date(member.joining_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-full">
                    <UserCheck className="w-4 h-4 flex-shrink-0 text-gray-500" />
                    <span className="truncate">Specialization: {member.specialization}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageFaculty; 
