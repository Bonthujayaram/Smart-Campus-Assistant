import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import { getApiUrl } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { Assignment } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Specialization {
  specialization: string;
}

const ManageAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: '',
    description: '',
    semester: 1,
    branch: '',
    specialization: 'none',
    due_date: '',
  });

  useEffect(() => {
    fetchAssignments();
    fetchBranches();
    if (user?.facultyId) {
      fetchFacultySubjects();
    }
  }, [user?.facultyId]);

  useEffect(() => {
    // Fetch specializations when branch changes in create form
    if (newAssignment.branch) {
      fetchSpecializations(newAssignment.branch);
    }
  }, [newAssignment.branch]);

  useEffect(() => {
    // Fetch specializations when branch changes in edit form
    if (editingAssignment?.branch) {
      fetchSpecializations(editingAssignment.branch);
    }
  }, [editingAssignment?.branch]);

  const fetchBranches = async () => {
    try {
      const response = await fetch(getApiUrl('/branches'));
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch branches',
        variant: 'destructive',
      });
    }
  };

  const fetchSpecializations = async (branch: string) => {
    try {
      const response = await fetch(getApiUrl(`/specializations/${branch}`));
      if (response.ok) {
        const data = await response.json();
        setSpecializations(data);
      }
    } catch (error) {
      console.error('Error fetching specializations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch specializations',
        variant: 'destructive',
      });
    }
  };

  const fetchFacultySubjects = async () => {
    try {
      const response = await fetch(getApiUrl(`/faculty/${user?.facultyId}/subjects`));
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching faculty subjects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch faculty subjects',
        variant: 'destructive',
      });
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(getApiUrl(`/faculty/${user?.facultyId}/assignments`));
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      const data = await response.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
      toast({
        title: 'Error',
        description: 'Failed to fetch assignments',
        variant: 'destructive',
      });
    }
  };

  const handleCreateAssignment = async () => {
    try {
      const response = await fetch(getApiUrl('/assignments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newAssignment,
          specialization: newAssignment.specialization === 'none' ? null : newAssignment.specialization,
          faculty_id: user?.facultyId,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Assignment created successfully',
        });
        fetchAssignments();
        setIsAddDialogOpen(false);
        setNewAssignment({
          title: '',
          subject: '',
          description: '',
          semester: 1,
          branch: '',
          specialization: 'none',
          due_date: '',
        });
      } else {
        throw new Error('Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create assignment',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    try {
      const response = await fetch(getApiUrl(`/assignments/${id}`), {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Assignment deleted successfully',
        });
        fetchAssignments();
      } else {
        throw new Error('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete assignment',
        variant: 'destructive',
      });
    }
  };

  const handleEditAssignment = async () => {
    if (!editingAssignment) return;

    try {
      const response = await fetch(getApiUrl(`/assignments/${editingAssignment.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editingAssignment,
          specialization: editingAssignment.specialization === 'none' ? null : editingAssignment.specialization,
          faculty_id: user?.facultyId,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Assignment updated successfully',
        });
        fetchAssignments();
        setIsEditDialogOpen(false);
        setEditingAssignment(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update assignment');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update assignment',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Assignments</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Create and manage assignments for your classes</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95%] max-w-[500px] p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
                <DialogDescription className="text-sm">
                  Create a new assignment for your students. Fill in all the required fields below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                <Input
                  placeholder="Assignment Title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                />
                <Select
                  value={newAssignment.subject}
                  onValueChange={(value) => setNewAssignment({ ...newAssignment, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                />
                <Select
                  value={newAssignment.semester.toString()}
                  onValueChange={(value) => setNewAssignment({ ...newAssignment, semester: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={newAssignment.branch}
                  onValueChange={(value) => setNewAssignment({ ...newAssignment, branch: value, specialization: 'none' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={newAssignment.specialization}
                  onValueChange={(value) => setNewAssignment({ ...newAssignment, specialization: value })}
                  disabled={!newAssignment.branch}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Specialization (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Specializations</SelectItem>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={newAssignment.due_date}
                  onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                />
                <Button onClick={handleCreateAssignment}>Create Assignment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <span className="text-lg sm:text-xl break-words">{assignment.title}</span>
                  <div className="flex space-x-2 self-end sm:self-start">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setEditingAssignment({
                          ...assignment,
                          specialization: assignment.specialization || 'none'
                        });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 break-words">{assignment.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Semester {assignment.semester}</Badge>
                    <Badge variant="secondary">{assignment.branch}</Badge>
                    {assignment.specialization && (
                      <Badge variant="secondary">{assignment.specialization}</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="break-words">Subject: {assignment.subject}</p>
                    <p>Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Assignment Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95%] max-w-[500px] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Edit Assignment</DialogTitle>
              <DialogDescription className="text-sm">
                Modify the assignment details. All fields are required unless marked as optional.
              </DialogDescription>
            </DialogHeader>
            {editingAssignment && (
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Assignment Title"
                  value={editingAssignment.title}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, title: e.target.value })}
                />
                <Select
                  value={editingAssignment.subject}
                  onValueChange={(value) => setEditingAssignment({ ...editingAssignment, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Description"
                  value={editingAssignment.description}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, description: e.target.value })}
                />
                <Select
                  value={editingAssignment.semester.toString()}
                  onValueChange={(value) => setEditingAssignment({ ...editingAssignment, semester: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={editingAssignment.branch}
                  onValueChange={(value) => setEditingAssignment({ ...editingAssignment, branch: value, specialization: 'none' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={editingAssignment.specialization || 'none'}
                  onValueChange={(value) => setEditingAssignment({ ...editingAssignment, specialization: value })}
                  disabled={!editingAssignment.branch}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Specialization (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Specializations</SelectItem>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={editingAssignment.due_date}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, due_date: e.target.value })}
                />
                <Button onClick={handleEditAssignment}>Update Assignment</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ManageAssignments; 
