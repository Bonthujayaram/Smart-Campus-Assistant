import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { getApiUrl } from '@/utils/api';

interface AcademicReport {
  totalStudents: number;
  passRate: number;
  averageGrade: string;
  topPerformers: number;
  subjects: Array<{
    name: string;
    average: number;
    passRate: number;
  }>;
}

interface AttendanceReport {
  overallAttendance: number;
  highAttendance: number;
  mediumAttendance: number;
  lowAttendance: number;
  monthlyTrend: Array<{
    month: string;
    percentage: number;
  }>;
}

interface AssignmentReport {
  totalAssignments: number;
  submitted: number;
  pending: number;
  overdue: number;
  averageScore: number;
  subjects: Array<{
    name: string;
    submitted: number;
    pending: number;
    overdue: number;
  }>;
}

interface ReportData {
  academic: AcademicReport;
  attendance: AttendanceReport;
  assignments: AssignmentReport;
}

const StudentReports = () => {
  const [selectedBranch, setSelectedBranch] = useState('Computer Science');
  const [selectedSemester, setSelectedSemester] = useState('6');
  const [selectedReportType, setSelectedReportType] = useState('academic');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    academic: {
      totalStudents: 0,
      passRate: 0,
      averageGrade: '',
      topPerformers: 0,
      subjects: []
    },
    attendance: {
      overallAttendance: 0,
      highAttendance: 0,
      mediumAttendance: 0,
      lowAttendance: 0,
      monthlyTrend: []
    },
    assignments: {
      totalAssignments: 0,
      submitted: 0,
      pending: 0,
      overdue: 0,
      averageScore: 0,
      subjects: []
    }
  });

  const branches = ['Computer Science', 'Information Technology', 'Electronics and Communication', 'Mechanical Engineering'];
  const reportTypes = [
    { value: 'academic', label: 'Academic Performance' },
    { value: 'attendance', label: 'Attendance Report' },
    { value: 'assignments', label: 'Assignment Report' }
  ];

  useEffect(() => {
    fetchReportData();
  }, [selectedBranch, selectedSemester, selectedReportType]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        branch: selectedBranch,
        semester: selectedSemester,
        type: selectedReportType
      });

      const response = await fetch(getApiUrl(`/reports/students?${params.toString()}`));
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }

      const data = await response.json();
      setReportData(prevData => ({
        ...prevData,
        ...data
      }));
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch report data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">No report data available</p>
          <Button onClick={fetchReportData} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Student Reports</h1>
          <p className="text-sm sm:text-base text-gray-600">Generate academic performance reports and analytics</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-full">
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
            <SelectTrigger className="w-full">
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
            <SelectTrigger className="w-full">
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
                    <p className="text-2xl font-bold text-blue-600">{reportData.academic.totalStudents}</p>
                    <p className="text-gray-600">Total Students</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{reportData.academic.passRate}%</p>
                    <p className="text-gray-600">Pass Rate</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{reportData.academic.averageGrade}</p>
                    <p className="text-gray-600">Average Grade</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{reportData.academic.topPerformers}</p>
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
                  {reportData.academic.subjects.map((subject) => (
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
                    <p className="text-2xl font-bold text-blue-600">{reportData.attendance.overallAttendance}%</p>
                    <p className="text-gray-600">Overall Attendance</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{reportData.attendance.highAttendance}</p>
                    <p className="text-gray-600">High Attendance (≥85%)</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{reportData.attendance.mediumAttendance}</p>
                    <p className="text-gray-600">Medium (75-85%)</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{reportData.attendance.lowAttendance}</p>
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
                  {reportData.attendance.monthlyTrend.map((month) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{reportData.assignments.totalAssignments}</p>
                    <p className="text-sm sm:text-base text-gray-600">Total Assignments</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{reportData.assignments.submitted}</p>
                    <p className="text-sm sm:text-base text-gray-600">Submitted</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-yellow-600">{reportData.assignments.pending}</p>
                    <p className="text-sm sm:text-base text-gray-600">Pending</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-red-600">{reportData.assignments.overdue}</p>
                    <p className="text-sm sm:text-base text-gray-600">Overdue</p>
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
                  {reportData.assignments.subjects.map((subject) => (
                    <div key={subject.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                      <div>
                        <h4 className="font-medium text-gray-900">{subject.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Submitted: {subject.submitted}% | Pending: {subject.pending}% | Overdue: {subject.overdue}%
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">{subject.submitted}%</Badge>
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm">{subject.pending}%</Badge>
                        <Badge className="bg-red-100 text-red-800 text-xs sm:text-sm">{subject.overdue}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentReports;
