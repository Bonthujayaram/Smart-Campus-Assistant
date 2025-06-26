import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { FileText, Edit, Trash2, Plus, Calendar, User } from 'lucide-react';
import { getApiUrl } from '../../utils/api';

const ManageSyllabus = () => {
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newSyllabus, setNewSyllabus] = useState({
    subject: '',
    code: '',
    faculty_id: '',
    credits: '',
    description: '',
    semester: '',
    specialization: ''
  });

  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<any>(null);

  // Fetch available specializations when branch and semester change
  useEffect(() => {
    const fetchSpecializations = async () => {
      if (!selectedBranch || !selectedSemester) {
        setAvailableSpecializations([]);
        return;
      }
      
      try {
        const res = await fetch(getApiUrl(`/students/specializations?branch=${selectedBranch}&semester=${selectedSemester}`));
        if (!res.ok) throw new Error('Failed to fetch specializations');
        const data = await res.json();
        
        // Get unique specializations and ensure they are strings
        const uniqueSpecializations = Array.from(new Set(data)).filter((spec): spec is string => typeof spec === 'string');
        setAvailableSpecializations(uniqueSpecializations);
        
        // Reset specialization selection
        setSelectedSpecialization('');
        setNewSyllabus(prev => ({ ...prev, specialization: '' }));
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to fetch specializations', variant: 'destructive' });
        setAvailableSpecializations([]);
      }
    };
    fetchSpecializations();
  }, [selectedBranch, selectedSemester]);

  // Fetch syllabus when branch or semester changes
  useEffect(() => {
    const fetchSyllabus = async () => {
      if (!selectedBranch || !selectedSemester) {
        setSyllabus([]);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          branch: selectedBranch,
          semester: selectedSemester
        });
        const res = await fetch(getApiUrl(`/syllabus?${params.toString()}`));
        if (!res.ok) throw new Error('Failed to fetch syllabus');
        const data = await res.json();
        setSyllabus(data);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to fetch syllabus', variant: 'destructive' });
        setSyllabus([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, [selectedBranch, selectedSemester]);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetch(getApiUrl('/faculty'));
        const data = await res.json();
        setFacultyList(data);
      } catch (err) {
        setFacultyList([]);
      }
    };
    fetchFaculty();
  }, []);

  // Fetch students when filters change
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedBranch || !selectedSemester || !selectedSpecialization) {
        setStudents([]);
        return;
      }

      setLoadingStudents(true);
      try {
        const params = new URLSearchParams({
          branch: selectedBranch,
          semester: selectedSemester,
          specialization: selectedSpecialization
        });
        
        const res = await fetch(getApiUrl(`/students/filtered?${params.toString()}`));
        if (!res.ok) throw new Error('Failed to fetch students');
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to fetch students', variant: 'destructive' });
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedBranch, selectedSemester, selectedSpecialization]);

  const branches = ['Computer Science', 'Information Technology', 'Electronics and Communication', 'Mechanical Engineering'];

  // Filter displayed syllabus based on selected subject
  const filteredSyllabus = selectedSubject && selectedSubject !== 'all'
    ? syllabus.filter(item => item.subject === selectedSubject)
    : syllabus;

  const handleAddNew = async () => {
    if (!newSyllabus.subject || !newSyllabus.code || !newSyllabus.faculty_id || !newSyllabus.specialization) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    try {
      const res = await fetch(getApiUrl('/syllabus'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSyllabus,
          faculty_id: Number(newSyllabus.faculty_id),
          credits: Number(newSyllabus.credits),
          semester: Number(newSyllabus.semester),
          branch: selectedBranch,
          upload_date: new Date().toISOString().slice(0, 10),
          pdf_url: '',
        }),
      });
      if (!res.ok) throw new Error('Failed to add syllabus');
      toast({ title: 'Success', description: 'Syllabus added successfully' });
      setIsAddingNew(false);
      setNewSyllabus({ 
        subject: '', 
        code: '', 
        faculty_id: '', 
        credits: '', 
        description: '', 
        semester: selectedSemester, 
        specialization: '' 
      });
      // Refresh list
      const data = await res.json();
      setSyllabus((prev) => [...prev, data]);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add syllabus', variant: 'destructive' });
    }
  };

  const handleDownload = (subject: string) => {
    toast({
      title: "Download",
      description: `Downloading ${subject} syllabus`,
    });
  };

  const handleView = (subject: string) => {
    toast({
      title: "View",
      description: `Opening ${subject} syllabus`,
    });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditingSyllabus({
      subject: item.subject || '',
      code: item.code || '',
      faculty_id: (item.faculty_id || '').toString(),
      credits: (item.credits || '').toString(),
      description: item.description || '',
      semester: (item.semester || '').toString(),
      specialization: item.specialization || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingSyllabus || !editingId) return;
    
    try {
      const res = await fetch(getApiUrl(`/syllabus/${editingId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // Add credentials for CORS
        body: JSON.stringify({
          ...editingSyllabus,
          faculty_id: Number(editingSyllabus.faculty_id) || null,
          credits: Number(editingSyllabus.credits) || 0,
          semester: Number(editingSyllabus.semester) || 1,
          branch: selectedBranch,
          upload_date: new Date().toISOString().slice(0, 10),
        }),
      });
      
      if (!res.ok) throw new Error('Failed to update syllabus');
      
      const updatedSyllabus = await res.json();
      setSyllabus(prev => prev.map(item => 
        item.id === editingId ? updatedSyllabus : item
      ));
      
      setEditingId(null);
      setEditingSyllabus(null);
      toast({ title: 'Success', description: 'Syllabus updated successfully' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update syllabus', variant: 'destructive' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingSyllabus(null);
  };

  const handleDelete = async (id: string | number) => {
    try {
      const res = await fetch(getApiUrl(`/syllabus/${id}`), { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete syllabus');
      setSyllabus((prev) => prev.filter((item) => item.id !== id));
      toast({ title: 'Success', description: 'Syllabus deleted successfully' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete syllabus', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Syllabus</h1>
          <p className="text-gray-600">Upload and organize course materials</p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <Select value={selectedBranch} onValueChange={(value) => {
            setSelectedBranch(value);
            setSelectedSemester('');
          }}>
            <SelectTrigger className="w-full lg:w-64">
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
            value={selectedSemester} 
            onValueChange={(value) => {
              setSelectedSemester(value);
            }}
            disabled={!selectedBranch}
          >
            <SelectTrigger className="w-full lg:w-48">
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

          <Button 
            onClick={() => setIsAddingNew(!isAddingNew)} 
            className="ml-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Syllabus
          </Button>
        </div>

        {/* Students List */}
        {loadingStudents ? (
          <div className="text-center py-4">Loading students...</div>
        ) : students.length > 0 ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">
                Students ({students.length})
                <span className="text-sm text-gray-500 ml-2">
                  {selectedBranch} - Semester {selectedSemester} - {selectedSpecialization}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <Card key={student.studentId} className="p-4 bg-white shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-gray-500">{student.registration_number}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                      <Badge>{student.specialization}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          selectedBranch && selectedSemester && selectedSpecialization && (
            <div className="text-center py-4 text-gray-500">
              No students found for the selected criteria
            </div>
          )
        )}

        {/* Add New Form */}
        {isAddingNew && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Syllabus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  placeholder="Subject Name"
                  value={newSyllabus.subject}
                  onChange={(e) => setNewSyllabus({ ...newSyllabus, subject: e.target.value })}
                />
                <Input
                  placeholder="Subject Code"
                  value={newSyllabus.code}
                  onChange={(e) => setNewSyllabus({ ...newSyllabus, code: e.target.value })}
                />
                <Select
                  value={newSyllabus.faculty_id}
                  onValueChange={(value) => setNewSyllabus({ ...newSyllabus, faculty_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyList.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id.toString()}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Credits"
                  type="number"
                  value={newSyllabus.credits}
                  onChange={(e) => setNewSyllabus({ ...newSyllabus, credits: e.target.value })}
                />
                <Input
                  placeholder="Description"
                  value={newSyllabus.description}
                  onChange={(e) => setNewSyllabus({ ...newSyllabus, description: e.target.value })}
                />
                <Select
                  value={newSyllabus.specialization}
                  onValueChange={(value) => setNewSyllabus({ ...newSyllabus, specialization: value })}
                  disabled={!selectedBranch || !selectedSemester || availableSpecializations.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSpecializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => {
                  setIsAddingNew(false);
                  setNewSyllabus({
                    subject: '',
                    code: '',
                    faculty_id: '',
                    credits: '',
                    description: '',
                    semester: '',
                    specialization: ''
                  });
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddNew}>
                  Add Syllabus
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{filteredSyllabus.length}</p>
                <p className="text-xs sm:text-sm text-gray-600">Total Subjects</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {filteredSyllabus.reduce((total, item) => total + item.credits, 0)}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Total Credits</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-purple-600">{selectedSemester}</p>
                <p className="text-xs sm:text-sm text-gray-600">Current Semester</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-orange-600">
                  {new Set(filteredSyllabus.map(s => s.faculty)).size}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Faculty Members</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Syllabus List */}
        <div className="grid gap-6">
          {filteredSyllabus.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {editingId === item.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                      <Input
                        placeholder="Subject Name"
                        value={editingSyllabus.subject}
                        onChange={(e) => setEditingSyllabus({ ...editingSyllabus, subject: e.target.value })}
                      />
                      <Input
                        placeholder="Subject Code"
                        value={editingSyllabus.code}
                        onChange={(e) => setEditingSyllabus({ ...editingSyllabus, code: e.target.value })}
                      />
                      <Select
                        value={editingSyllabus.faculty_id}
                        onValueChange={(value) => setEditingSyllabus({ ...editingSyllabus, faculty_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Faculty" />
                        </SelectTrigger>
                        <SelectContent>
                          {facultyList.map((faculty) => (
                            <SelectItem key={faculty.id} value={faculty.id.toString()}>
                              {faculty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Credits"
                        type="number"
                        value={editingSyllabus.credits}
                        onChange={(e) => setEditingSyllabus({ ...editingSyllabus, credits: e.target.value })}
                      />
                      <Input
                        placeholder="Description"
                        value={editingSyllabus.description}
                        onChange={(e) => setEditingSyllabus({ ...editingSyllabus, description: e.target.value })}
                      />
                      <Select
                        value={editingSyllabus.specialization}
                        onValueChange={(value) => setEditingSyllabus({ ...editingSyllabus, specialization: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSpecializations.map((spec) => (
                            <SelectItem key={spec} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2 col-span-full">
                        <Button onClick={handleSaveEdit}>Save</Button>
                        <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <CardTitle className="text-xl mb-2">{item.subject}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-medium">Code: {item.code}</span>
                          <Badge variant="outline">Semester {item.semester}</Badge>
                          <Badge variant="secondary">{item.credits} Credits</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardHeader>
              {!editingId && (
                <CardContent>
                  <p className="text-gray-700 mb-4">{item.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{item.faculty}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{item.upload_date}</span>
                    </div>
                    {item.specialization && (
                      <Badge variant="outline">{item.specialization}</Badge>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageSyllabus;
