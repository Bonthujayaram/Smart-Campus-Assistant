import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, User, MapPin, Plus, Edit, Trash2 } from 'lucide-react';

const ManageTimetables = () => {
  const [selectedSemester, setSelectedSemester] = useState('6');
  const [selectedBranch, setSelectedBranch] = useState('Computer Science');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [newEntry, setNewEntry] = useState({
    day: '',
    time: '',
    subject: '',
    faculty: '',
    room: '',
    type: 'Lecture',
    branch: 'Computer Science',
    semester: 6,
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const branches = ['Computer Science', 'Information Technology', 'Electronics and Communication', 'Mechanical Engineering'];
  const classTypes = ['Lecture', 'Lab', 'Tutorial', 'Project'];

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/timetables?branch=${encodeURIComponent(selectedBranch)}&semester=${selectedSemester}`);
      const data = await res.json();
      setTimetables(data);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to fetch timetables', variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTimetables();
  }, [selectedBranch, selectedSemester]);

  const handleAddNew = async () => {
    if (!newEntry.day || !newEntry.time || !newEntry.subject || !newEntry.faculty || !newEntry.room) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    try {
      await fetch('http://127.0.0.1:8000/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEntry, branch: selectedBranch, semester: Number(selectedSemester) }),
      });
      toast({ title: 'Success', description: 'Timetable entry added successfully' });
      setNewEntry({ day: '', time: '', subject: '', faculty: '', room: '', type: 'Lecture', branch: selectedBranch, semester: Number(selectedSemester) });
      setIsAddingNew(false);
      fetchTimetables();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to add timetable entry', variant: 'destructive' });
    }
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    const entry = timetables.find(t => t.id === id);
    if (entry) {
      setNewEntry({ ...entry });
      setIsAddingNew(true);
    }
  };

  const handleSaveEdit = async () => {
    if (editingId === null) return;
    try {
      await fetch(`http://127.0.0.1:8000/timetables/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEntry, branch: selectedBranch, semester: Number(selectedSemester) }),
      });
      toast({ title: 'Success', description: 'Timetable entry updated successfully' });
      setEditingId(null);
      setIsAddingNew(false);
      setNewEntry({ day: '', time: '', subject: '', faculty: '', room: '', type: 'Lecture', branch: selectedBranch, semester: Number(selectedSemester) });
      fetchTimetables();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update timetable entry', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://127.0.0.1:8000/timetables/${id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Timetable entry deleted successfully' });
      fetchTimetables();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete timetable entry', variant: 'destructive' });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Lecture': return 'bg-blue-100 text-blue-800';
      case 'Lab': return 'bg-green-100 text-green-800';
      case 'Tutorial': return 'bg-yellow-100 text-yellow-800';
      case 'Project': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Timetables</h1>
          <p className="text-gray-600">Add, edit, and organize class schedules</p>
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
            onClick={() => {
              setIsAddingNew(!isAddingNew);
              setEditingId(null);
              setNewEntry({ day: '', time: '', subject: '', faculty: '', room: '', type: 'Lecture', branch: selectedBranch, semester: Number(selectedSemester) });
            }}
            className="ml-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingId ? 'Edit Entry' : 'Add New Entry'}
          </Button>
        </div>

        {/* Add/Edit Entry Form */}
        {isAddingNew && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-700">{editingId ? 'Edit Timetable Entry' : 'Add New Timetable Entry'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Select value={newEntry.day} onValueChange={(value) => setNewEntry({...newEntry, day: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Time (e.g., 9:00-10:00)"
                  value={newEntry.time}
                  onChange={(e) => setNewEntry({...newEntry, time: e.target.value})}
                />

                <Input
                  placeholder="Subject"
                  value={newEntry.subject}
                  onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}
                />

                <Input
                  placeholder="Faculty"
                  value={newEntry.faculty}
                  onChange={(e) => setNewEntry({...newEntry, faculty: e.target.value})}
                />

                <Input
                  placeholder="Room"
                  value={newEntry.room}
                  onChange={(e) => setNewEntry({...newEntry, room: e.target.value})}
                />

                <Select value={newEntry.type} onValueChange={(value) => setNewEntry({...newEntry, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {classTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 mt-4">
                {editingId ? (
                  <Button onClick={handleSaveEdit}>Save</Button>
                ) : (
                  <Button onClick={handleAddNew}>Add Entry</Button>
                )}
                <Button variant="outline" onClick={() => { setIsAddingNew(false); setEditingId(null); }}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timetable Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{timetables.length}</p>
                <p className="text-gray-600">Total Classes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {timetables.filter(t => t.type === 'Lecture').length}
                </p>
                <p className="text-gray-600">Lectures</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {timetables.filter(t => t.type === 'Lab').length}
                </p>
                <p className="text-gray-600">Lab Sessions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timetable by Day */}
        <div className="grid gap-6">
          {days.map((day) => {
            const dayClasses = timetables.filter(slot => slot.day === day);
            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {day}
                    </span>
                    <span className="text-sm text-gray-500">{dayClasses.length} classes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dayClasses.length > 0 ? (
                    <div className="grid gap-3">
                      {dayClasses.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={getTypeColor(slot.type)}>
                                {slot.type}
                              </Badge>
                              <span className="font-semibold text-gray-900">{slot.subject}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {slot.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {slot.faculty}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {slot.room}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(slot.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDelete(slot.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No classes scheduled for {day}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ManageTimetables;
