import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { File, Calendar, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getApiUrl } from '../utils/api';

const Syllabus = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState<any>(null);

  // Fetch current student info
  useEffect(() => {
    if (!user?.email) return;
    const fetchStudent = async () => {
      try {
        const res = await fetch(getApiUrl(`/students/me?email=${encodeURIComponent(user.email)}`));
        const data = await res.json();
        setStudent(data);
        if (data?.semester) setSelectedSemester(data.semester.toString());
      } catch (err) {
        setStudent(null);
      }
    };
    fetchStudent();
  }, [user]);

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const res = await fetch(getApiUrl('/syllabus'));
        const data = await res.json();
        setSyllabus(data);
      } catch (err) {
        setSyllabus([]);
      }
    };
    fetchSyllabus();
  }, []);

  const filteredSyllabus = syllabus.filter(item => {
    const matchesSemester = selectedSemester === 'all' || item.semester.toString() === selectedSemester;
    const matchesSearch = item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSemester && matchesSearch;
  });

  const handleDownload = (subject: string, pdfUrl: string) => {
    // In a real app, this would download the actual PDF
    console.log(`Downloading syllabus for ${subject} from ${pdfUrl}`);
    alert(`Download started for ${subject} syllabus`);
  };

  const handleView = (subject: string, pdfUrl: string, item: any) => {
    setSelectedSyllabus({ subject, pdfUrl, item });
    setOpenDialog(true);
  };

  const getTotalCredits = () => {
    return filteredSyllabus.reduce((total, item) => total + item.credits, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Syllabus</h1>
          <p className="text-gray-600">Access and download syllabus for all your subjects</p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Search subjects or codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <p className="text-2xl font-bold text-green-600">{getTotalCredits()}</p>
                <p className="text-gray-600">Total Credits</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {selectedSemester === 'all' ? 'All' : selectedSemester}
                </p>
                <p className="text-gray-600">Current Semester</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Syllabus Grid */}
        {filteredSyllabus.length > 0 ? (
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
                        onClick={() => handleView(item.subject, item.pdfUrl, item)}
                      >
                        <File className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{item.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Faculty: {item.faculty || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Uploaded: {item.upload_date && !isNaN(new Date(item.upload_date).getTime())
                        ? new Date(item.upload_date).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Syllabus Found</h3>
              <p className="text-gray-600">No syllabus matches your current filters. Try adjusting your search.</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Academic Calendar
              </Button>
              <Button variant="outline" className="justify-start">
                <User className="w-4 h-4 mr-2" />
                Faculty Contact Info
              </Button>
              <Button variant="outline" className="justify-start">
                <File className="w-4 h-4 mr-2" />
                Course Catalog
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PDF Modal Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-3xl w-full">
            <DialogHeader>
              <DialogTitle>{selectedSyllabus?.subject || 'Syllabus'}</DialogTitle>
            </DialogHeader>
            {selectedSyllabus && (
              <div className="mb-4 space-y-2">
                <div><b>Code:</b> {selectedSyllabus.item?.code}</div>
                <div><b>Semester:</b> {selectedSyllabus.item?.semester}</div>
                <div><b>Credits:</b> {selectedSyllabus.item?.credits}</div>
                <div><b>Faculty:</b> {selectedSyllabus.item?.faculty || 'N/A'}</div>
                <div><b>Uploaded:</b> {selectedSyllabus.item?.upload_date && !isNaN(new Date(selectedSyllabus.item.upload_date).getTime())
                  ? new Date(selectedSyllabus.item.upload_date).toLocaleDateString()
                  : 'N/A'}</div>
                <div><b>Description:</b> {selectedSyllabus.item?.description}</div>
              </div>
            )}
            {selectedSyllabus?.pdfUrl ? (
              <iframe
                src={selectedSyllabus.pdfUrl}
                title={selectedSyllabus.subject}
                className="w-full h-[60vh] border rounded"
              />
            ) : (
              <div className="text-center text-gray-500 py-8">No PDF available for this syllabus.</div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Syllabus;