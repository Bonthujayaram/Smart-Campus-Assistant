import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Users, Calendar, Download, BarChart3 } from 'lucide-react';

const ViewAttendance = () => {
  const [selectedBranch, setSelectedBranch] = useState('Computer Science');
  const [selectedSemester, setSelectedSemester] = useState('6');
  const [selectedDate, setSelectedDate] = useState('2024-01-15');
  const [searchTerm, setSearchTerm] = useState('');

  const mockAttendanceData = [
    {
      studentId: 'ST001',
      name: 'John Doe',
      branch: 'Computer Science',
      semester: 6,
      subjects: {
        'Database Management': { present: 18, total: 20, percentage: 90 },
        'Software Engineering': { present: 16, total: 20, percentage: 80 },
        'Computer Networks': { present: 19, total: 20, percentage: 95 },
        'Machine Learning': { present: 15, total: 20, percentage: 75 }
      },
      overallPercentage: 87.5
    },
    {
      studentId: 'ST002',
      name: 'Jane Smith',
      branch: 'Computer Science',
      semester: 6,
      subjects: {
        'Database Management': { present: 19, total: 20, percentage: 95 },
        'Software Engineering': { present: 18, total: 20, percentage: 90 },
        'Computer Networks': { present: 17, total: 20, percentage: 85 },
        'Machine Learning': { present: 16, total: 20, percentage: 80 }
      },
      overallPercentage: 87.5
    },
    {
      studentId: 'ST003',
      name: 'Mike Johnson',
      branch: 'Computer Science',
      semester: 6,
      subjects: {
        'Database Management': { present: 14, total: 20, percentage: 70 },
        'Software Engineering': { present: 13, total: 20, percentage: 65 },
        'Computer Networks': { present: 15, total: 20, percentage: 75 },
        'Machine Learning': { present: 12, total: 20, percentage: 60 }
      },
      overallPercentage: 67.5
    }
  ];

  const branches = ['Computer Science', 'Information Technology', 'Electronics and Communication', 'Mechanical Engineering'];

  const filteredStudents = mockAttendanceData.filter(student =>
    student.branch === selectedBranch &&
    student.semester.toString() === selectedSemester &&
    (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleExportReport = () => {
    toast({
      title: "Export Started",
      description: "Attendance report is being generated",
    });
  };

  const handleViewDetails = (studentId: string) => {
    toast({
      title: "View Details",
      description: `Opening detailed attendance for ${studentId}`,
    });
  };

  const calculateOverallStats = () => {
    const totalStudents = filteredStudents.length;
    const highAttendance = filteredStudents.filter(s => s.overallPercentage >= 85).length;
    const lowAttendance = filteredStudents.filter(s => s.overallPercentage < 75).length;
    const averageAttendance = filteredStudents.reduce((sum, s) => sum + s.overallPercentage, 0) / totalStudents;

    return { totalStudents, highAttendance, lowAttendance, averageAttendance };
  };

  const stats = calculateOverallStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">View Attendance</h1>
          <p className="text-sm sm:text-base text-gray-600">Monitor student attendance records and generate reports</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6 sm:gap-4 lg:flex-row lg:gap-4">
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

          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />

          <Button onClick={handleExportReport} className="w-full lg:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
                <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.highAttendance}</p>
                <p className="text-xs sm:text-sm text-gray-600">High Attendance (≥85%)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.lowAttendance}</p>
                <p className="text-xs sm:text-sm text-gray-600">Low Attendance (&lt;75%)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-purple-600">
                  {!isNaN(stats.averageAttendance) ? stats.averageAttendance.toFixed(1) : 0}%
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Average Attendance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Attendance List */}
        <div className="grid gap-4 sm:gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.studentId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg sm:text-xl mb-2">{student.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <span className="font-medium">ID: {student.studentId}</span>
                      <Badge variant="outline" className="text-xs">{student.branch}</Badge>
                      <Badge variant="secondary" className="text-xs">Semester {student.semester}</Badge>
                      <Badge className={`${getAttendanceBadge(student.overallPercentage)} text-xs`}>
                        {student.overallPercentage}% Overall
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(student.studentId)}
                      className="text-xs sm:text-sm"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {Object.entries(student.subjects).map(([subject, data]) => (
                    <div key={subject} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base truncate">{subject}</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Present:</span>
                          <span>{data.present}/{data.total}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Percentage:</span>
                          <span className={getAttendanceColor(data.percentage)}>
                            {data.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mt-6 sm:mt-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Button variant="outline" className="justify-start text-xs sm:text-sm h-auto p-3 sm:p-4">
                <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Download Defaulter List</span>
              </Button>
              <Button variant="outline" className="justify-start text-xs sm:text-sm h-auto p-3 sm:p-4">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Monthly Reports</span>
              </Button>
              <Button variant="outline" className="justify-start text-xs sm:text-sm h-auto p-3 sm:p-4">
                <BarChart3 className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Attendance Analytics</span>
              </Button>
              <Button variant="outline" className="justify-start text-xs sm:text-sm h-auto p-3 sm:p-4">
                <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Generate Certificates</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewAttendance;
