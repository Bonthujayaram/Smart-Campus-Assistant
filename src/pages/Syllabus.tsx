
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { File, Calendar, User } from 'lucide-react';

const Syllabus = () => {
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const mockSyllabus = [
    {
      id: '1',
      subject: 'Database Management Systems',
      code: 'CS601',
      semester: 6,
      branch: 'Computer Science',
      credits: 4,
      faculty: 'Dr. Smith',
      uploadDate: '2024-01-15',
      pdfUrl: '/syllabus/dbms.pdf',
      description: 'Introduction to database concepts, SQL, normalization, and transaction management.',
    },
    {
      id: '2',
      subject: 'Software Engineering',
      code: 'CS602',
      semester: 6,
      branch: 'Computer Science',
      credits: 3,
      faculty: 'Prof. Johnson',
      uploadDate: '2024-01-16',
      pdfUrl: '/syllabus/se.pdf',
      description: 'Software development lifecycle, requirements engineering, design patterns.',
    },
    {
      id: '3',
      subject: 'Computer Networks',
      code: 'CS603',
      semester: 6,
      branch: 'Computer Science',
      credits: 4,
      faculty: 'Dr. Brown',
      uploadDate: '2024-01-17',
      pdfUrl: '/syllabus/networks.pdf',
      description: 'Network protocols, OSI model, TCP/IP, routing algorithms.',
    },
    {
      id: '4',
      subject: 'Machine Learning',
      code: 'CS604',
      semester: 6,
      branch: 'Computer Science',
      credits: 4,
      faculty: 'Prof. Davis',
      uploadDate: '2024-01-18',
      pdfUrl: '/syllabus/ml.pdf',
      description: 'Supervised and unsupervised learning, neural networks, deep learning.',
    },
    {
      id: '5',
      subject: 'Operating Systems',
      code: 'CS605',
      semester: 6,
      branch: 'Computer Science',
      credits: 4,
      faculty: 'Dr. Wilson',
      uploadDate: '2024-01-19',
      pdfUrl: '/syllabus/os.pdf',
      description: 'Process management, memory management, file systems, synchronization.',
    },
    {
      id: '6',
      subject: 'Web Technology',
      code: 'CS606',
      semester: 6,
      branch: 'Computer Science',
      credits: 3,
      faculty: 'Prof. Anderson',
      uploadDate: '2024-01-20',
      pdfUrl: '/syllabus/web.pdf',
      description: 'HTML, CSS, JavaScript, server-side programming, web frameworks.',
    },
  ];

  const filteredSyllabus = mockSyllabus.filter(item => {
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

  const handleView = (subject: string, pdfUrl: string) => {
    // In a real app, this would open the PDF in a new tab
    console.log(`Viewing syllabus for ${subject} from ${pdfUrl}`);
    alert(`Opening ${subject} syllabus in new tab`);
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
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <SelectItem key={sem} value={sem.toString()}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
                        onClick={() => handleView(item.subject, item.pdfUrl)}
                      >
                        <File className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleDownload(item.subject, item.pdfUrl)}
                      >
                        Download PDF
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
                <File className="w-4 h-4 mr-2" />
                Download All Current Semester
              </Button>
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
      </div>
    </div>
  );
};

export default Syllabus;
