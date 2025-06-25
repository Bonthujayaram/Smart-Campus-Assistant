
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Download, Users, FileText, BarChart3, Award } from 'lucide-react';

const StudentReports = () => {
  const [selectedBranch, setSelectedBranch] = useState('Computer Science');
  const [selectedSemester, setSelectedSemester] = useState('6');
  const [selectedReportType, setSelectedReportType] = useState('academic');

  const mockReportData = {
    academic: {
      totalStudents: 312,
      passRate: 85.6,
      averageGrade: 'B+',
      topPerformers: 45,
      subjects: [
        { name: 'Database Management', average: 78.5, passRate: 92 },
        { name: 'Software Engineering', average: 81.2, passRate: 88 },
        { name: 'Computer Networks', average: 76.8, passRate: 85 },
        { name: 'Machine Learning', average: 82.1, passRate: 90 }
      ]
    },
    attendance: {
      overallAttendance: 84.2,
      highAttendance: 198,
      mediumAttendance: 89,
      lowAttendance: 25,
      monthlyTrend: [
        { month: 'Jan', percentage: 87.5 },
        { month: 'Feb', percentage: 84.2 },
        { month: 'Mar', percentage: 82.1 },
        { month: 'Apr', percentage: 85.8 }
      ]
    },
    assignments: {
      totalAssignments: 24,
      submitted: 18240,
      pending: 2464,
      overdue: 384,
      averageScore: 76.8,
      subjects: [
        { name: 'Database Management', submitted: 95, pending: 5, overdue: 2 },
        { name: 'Software Engineering', submitted: 88, pending: 8, overdue: 6 },
        { name: 'Computer Networks', submitted: 92, pending: 6, overdue: 4 },
        { name: 'Machine Learning', submitted: 90, pending: 7, overdue: 5 }
      ]
    }
  };

  const branches = ['Computer Science', 'Information Technology', 'Electronics and Communication', 'Mechanical Engineering'];
  const reportTypes = [
    { value: 'academic', label: 'Academic Performance' },
    { value: 'attendance', label: 'Attendance Report' },
    { value: 'assignments', label: 'Assignment Report' },
    { value: 'comprehensive', label: 'Comprehensive Report' }
  ];

  const handleGenerateReport = (type: string) => {
    toast({
      title: "Report Generated",
      description: `${type} report has been generated successfully`,
    });
  };

  const handleDownloadReport = (format: string) => {
    toast({
      title: "Download Started",
      description: `Report download in ${format} format started`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Reports</h1>
          <p className="text-gray-600">Generate academic performance reports and analytics</p>
        </div>

        {/* Filters */}
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

          <Select value={selectedReportType} onValueChange={setSelectedReportType}>
            <SelectTrigger className="w-full lg:w-64">
              <SelectValue placeholder="Report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Academic Performance Report */}
        {selectedReportType === 'academic' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{mockReportData.academic.totalStudents}</p>
                    <p className="text-gray-600">Total Students</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{mockReportData.academic.passRate}%</p>
                    <p className="text-gray-600">Pass Rate</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{mockReportData.academic.averageGrade}</p>
                    <p className="text-gray-600">Average Grade</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{mockReportData.academic.topPerformers}</p>
                    <p className="text-gray-600">Top Performers</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Subject-wise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {mockReportData.academic.subjects.map((subject) => (
                    <div key={subject.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{subject.name}</h4>
                        <p className="text-sm text-gray-600">Average: {subject.average}% | Pass Rate: {subject.passRate}%</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{subject.average}%</Badge>
                        <Badge className={subject.passRate >= 85 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {subject.passRate}% Pass
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Attendance Report */}
        {selectedReportType === 'attendance' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{mockReportData.attendance.overallAttendance}%</p>
                    <p className="text-gray-600">Overall Attendance</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{mockReportData.attendance.highAttendance}</p>
                    <p className="text-gray-600">High Attendance (≥85%)</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{mockReportData.attendance.mediumAttendance}</p>
                    <p className="text-gray-600">Medium (75-85%)</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{mockReportData.attendance.lowAttendance}</p>
                    <p className="text-gray-600">Low Attendance (&lt;75%)</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Monthly Attendance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {mockReportData.attendance.monthlyTrend.map((month) => (
                    <div key={month.month} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{month.month}</p>
                      <p className="text-2xl font-bold text-blue-600">{month.percentage}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Assignment Report */}
        {selectedReportType === 'assignments' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{mockReportData.assignments.totalAssignments}</p>
                    <p className="text-gray-600">Total Assignments</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{mockReportData.assignments.submitted}</p>
                    <p className="text-gray-600">Submitted</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{mockReportData.assignments.pending}</p>
                    <p className="text-gray-600">Pending</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{mockReportData.assignments.overdue}</p>
                    <p className="text-gray-600">Overdue</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Subject-wise Assignment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {mockReportData.assignments.subjects.map((subject) => (
                    <div key={subject.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{subject.name}</h4>
                        <p className="text-sm text-gray-600">
                          Submitted: {subject.submitted}% | Pending: {subject.pending}% | Overdue: {subject.overdue}%
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-green-100 text-green-800">{subject.submitted}%</Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">{subject.pending}%</Badge>
                        <Badge className="bg-red-100 text-red-800">{subject.overdue}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Download Options */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Download Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                onClick={() => handleDownloadReport('PDF')}
                className="justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF Report
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDownloadReport('Excel')}
                className="justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Excel Report
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDownloadReport('CSV')}
                className="justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Report Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => handleGenerateReport('Academic Performance')}
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4" />
                    <span className="font-medium">Academic Report</span>
                  </div>
                  <div className="text-xs text-gray-500">Grades and performance</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleGenerateReport('Attendance Summary')}
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Attendance Report</span>
                  </div>
                  <div className="text-xs text-gray-500">Daily attendance tracking</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleGenerateReport('Assignment Analytics')}
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">Assignment Report</span>
                  </div>
                  <div className="text-xs text-gray-500">Submission statistics</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleGenerateReport('Comprehensive Analysis')}
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="font-medium">Full Analytics</span>
                  </div>
                  <div className="text-xs text-gray-500">Complete overview</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentReports;
