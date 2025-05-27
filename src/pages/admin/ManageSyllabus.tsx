import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { FileText, Upload, Download, Eye, Edit, Trash2, Plus, Calendar, User } from 'lucide-react';

const ManageSyllabus = () => {
  const [selectedBranch, setSelectedBranch] = useState('Computer Science');
  const [selectedSemester, setSelectedSemester] = useState('6');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newSyllabus, setNewSyllabus] = useState({
    subject: '',
    code: '',
    faculty: '',
    credits: '',
    description: '',
    semester: '6'
  });

  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/syllabus');
        const data = await res.json();
        setSyllabus(data);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to fetch syllabus', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, []);

  const branches = ['Computer Science', 'Information Technology', 'Electronics and Communication', 'Mechanical Engineering'];

  const handleAddNew = async () => {
    if (!newSyllabus.subject || !newSyllabus.code || !newSyllabus.faculty) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    try {
      const res = await fetch('http://localhost:8000/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSyllabus,
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
      setNewSyllabus({ subject: '', code: '', faculty: '', credits: '', description: '', semester: selectedSemester });
      // Refresh list
      const data = await res.json();
      setSyllabus((prev) => [...prev, data]);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add syllabus', variant: 'destructive' });
    }
  };

  const handleUpload = (id: string) => {
    toast({
      title: "Upload",
      description: "File upload functionality would be implemented here",
    });
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

  const handleEdit = (id: string) => {
    setEditingId(id);
    toast({
      title: "Edit Mode",
      description: "You can now edit this syllabus entry",
    });
  };

  const handleDelete = async (id: string | number) => {
    try {
      const res = await fetch(`https://smart-campus-backend-5ouw.onrender.com/syllabus/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete syllabus');
      setSyllabus((prev) => prev.filter((item) => item.id !== id));
      toast({ title: 'Success', description: 'Syllabus deleted successfully' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete syllabus', variant: 'destructive' });
    }
  };

  const filteredSyllabus = syllabus.filter(item => 
    item.branch === selectedBranch && item.semester.toString() === selectedSemester
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Syllabus</h1>
          <p className="text-gray-600">Upload and organize course materials</p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-full lg:w-64">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-full lg:w-48">
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

          <Button 
            onClick={() => setIsAddingNew(!isAddingNew)} 
            className="ml-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Syllabus
          </Button>
        </div>

        {/* Add New Form */}
        {isAddingNew && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-700">Add New Syllabus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {/* First row: Subject Name, Subject Code, Faculty Name */}
                <Input
                  placeholder="Subject Name"
                  value={newSyllabus.subject}
                  onChange={(e) => setNewSyllabus({...newSyllabus, subject: e.target.value})}
                />
                <Input
                  placeholder="Subject Code"
                  value={newSyllabus.code}
                  onChange={(e) => setNewSyllabus({...newSyllabus, code: e.target.value})}
                />
                <Input
                  placeholder="Faculty Name"
                  value={newSyllabus.faculty}
                  onChange={(e) => setNewSyllabus({...newSyllabus, faculty: e.target.value})}
                />
                {/* Second row: Credits, Description (2 cols), Semester */}
                <Input
                  placeholder="Credits"
                  type="number"
                  value={newSyllabus.credits}
                  onChange={(e) => setNewSyllabus({...newSyllabus, credits: e.target.value})}
                />
                <Input
                  className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-2"
                  placeholder="Description"
                  value={newSyllabus.description}
                  onChange={(e) => setNewSyllabus({...newSyllabus, description: e.target.value})}
                  style={{gridColumn: 'span 2 / span 2'}}
                />
                <Input
                  placeholder="Semester"
                  type="number"
                  value={newSyllabus.semester}
                  onChange={(e) => setNewSyllabus({...newSyllabus, semester: e.target.value})}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddNew}>Add Syllabus</Button>
                <Button variant="outline" onClick={() => setIsAddingNew(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{filteredSyllabus.length}</p>
                <p className="text-gray-600">Total Subjects</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {filteredSyllabus.reduce((total, item) => total + item.credits, 0)}
                </p>
                <p className="text-gray-600">Total Credits</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{selectedSemester}</p>
                <p className="text-gray-600">Current Semester</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {new Set(filteredSyllabus.map(s => s.faculty)).size}
                </p>
                <p className="text-gray-600">Faculty Members</p>
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
                      onClick={() => handleView(item.subject)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(item.subject)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpload(item.id)}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(item.id)}
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
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{item.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Faculty: {item.faculty}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Uploaded: {new Date(item.uploadDate).toLocaleDateString()}
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

export default ManageSyllabus;
