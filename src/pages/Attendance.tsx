
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Clock, Camera, QrCode } from 'lucide-react';

const Attendance = () => {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('current');

  const mockAttendance = [
    {
      subject: 'Database Management Systems',
      totalClasses: 45,
      attendedClasses: 40,
      percentage: 88.9,
      lastAttended: '2024-01-22',
      facultyName: 'Dr. Smith',
    },
    {
      subject: 'Software Engineering',
      totalClasses: 42,
      attendedClasses: 35,
      percentage: 83.3,
      lastAttended: '2024-01-21',
      facultyName: 'Prof. Johnson',
    },
    {
      subject: 'Computer Networks',
      totalClasses: 38,
      attendedClasses: 30,
      percentage: 78.9,
      lastAttended: '2024-01-20',
      facultyName: 'Dr. Brown',
    },
    {
      subject: 'Machine Learning',
      totalClasses: 40,
      attendedClasses: 36,
      percentage: 90.0,
      lastAttended: '2024-01-22',
      facultyName: 'Prof. Davis',
    },
    {
      subject: 'Operating Systems',
      totalClasses: 44,
      attendedClasses: 32,
      percentage: 72.7,
      lastAttended: '2024-01-19',
      facultyName: 'Dr. Wilson',
    },
    {
      subject: 'Web Technology',
      totalClasses: 36,
      attendedClasses: 34,
      percentage: 94.4,
      lastAttended: '2024-01-23',
      facultyName: 'Prof. Anderson',
    },
  ];

  const mockQRHistory = [
    {
      id: '1',
      subject: 'Database Management Systems',
      date: '2024-01-23',
      time: '09:00 AM',
      location: 'CS-101',
      status: 'success',
    },
    {
      id: '2',
      subject: 'Machine Learning',
      date: '2024-01-22',
      time: '02:00 PM',
      location: 'CS-Lab2',
      status: 'success',
    },
    {
      id: '3',
      subject: 'Web Technology',
      date: '2024-01-22',
      time: '10:00 AM',
      location: 'CS-107',
      status: 'success',
    },
    {
      id: '4',
      subject: 'Software Engineering',
      date: '2024-01-21',
      time: '11:00 AM',
      location: 'CS-102',
      status: 'success',
    },
    {
      id: '5',
      subject: 'Computer Networks',
      date: '2024-01-20',
      time: '09:00 AM',
      location: 'CS-103',
      status: 'failed',
    },
  ];

  const subjects = mockAttendance.map(item => item.subject);

  const filteredAttendance = selectedSubject === 'all' 
    ? mockAttendance 
    : mockAttendance.filter(item => item.subject === selectedSubject);

  const getOverallAttendance = () => {
    const totalClasses = mockAttendance.reduce((sum, item) => sum + item.totalClasses, 0);
    const totalAttended = mockAttendance.reduce((sum, item) => sum + item.attendedClasses, 0);
    return (totalAttended / totalClasses) * 100;
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRequiredClasses = (item: any) => {
    const required = Math.ceil((0.75 * item.totalClasses) - item.attendedClasses);
    return Math.max(0, required);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Tracker</h1>
          <p className="text-gray-600">Monitor your class attendance and QR scan history</p>
        </div>

        {/* QR Scan Instructions */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <QrCode className="w-5 h-5" />
              QR Code Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">How to mark attendance:</h3>
                <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                  <li>Open the Smart Campus mobile app</li>
                  <li>Navigate to QR Scanner</li>
                  <li>Scan the QR code displayed by your faculty</li>
                  <li>Attendance will be automatically recorded</li>
                </ol>
              </div>
              <div className="text-center">
                <Button className="bg-blue-600 hover:bg-blue-700" disabled>
                  <Camera className="w-4 h-4 mr-2" />
                  Open QR Scanner
                </Button>
                <p className="text-xs text-blue-600 mt-2">Mobile app required</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className={`text-2xl font-bold ${getAttendanceColor(getOverallAttendance())}`}>
                  {getOverallAttendance().toFixed(1)}%
                </p>
                <p className="text-gray-600">Overall Attendance</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{subjects.length}</p>
                <p className="text-gray-600">Total Subjects</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {mockAttendance.filter(item => item.percentage >= 75).length}
                </p>
                <p className="text-gray-600">Above 75%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {mockAttendance.filter(item => item.percentage < 75).length}
                </p>
                <p className="text-gray-600">Below 75%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="january">January 2024</SelectItem>
              <SelectItem value="february">February 2024</SelectItem>
              <SelectItem value="march">March 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attendance Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Subject-wise Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredAttendance.map((item, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.subject}</h3>
                          <p className="text-sm text-gray-600">{item.facultyName}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getAttendanceColor(item.percentage)}`}>
                            {item.percentage.toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.attendedClasses}/{item.totalClasses}
                          </p>
                        </div>
                      </div>
                      
                      <Progress 
                        value={item.percentage} 
                        className="h-2"
                      />
                      
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Last attended: {new Date(item.lastAttended).toLocaleDateString()}</span>
                        {item.percentage < 75 && (
                          <Badge variant="destructive">
                            Need {getRequiredClasses(item)} more classes
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Scan History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Recent QR Scans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockQRHistory.map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{scan.subject}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(scan.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {scan.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {scan.location}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        className={scan.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }
                      >
                        {scan.status === 'success' ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline" className="w-full">
                    View All QR History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Guidelines */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Attendance Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span><strong>85%+</strong> - Excellent attendance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span><strong>75-84%</strong> - Good attendance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span><strong>Below 75%</strong> - Attendance shortage</span>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-xs">
                      <strong>Note:</strong> Minimum 75% attendance is required to appear in exams.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
