import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { getApiUrl } from '@/utils/api';

interface StudentAttendance {
  studentId: number;
  name: string;
  branch: string;
  semester: number;
  specialization: string;
  subjects: {
    [key: string]: {
      present: number;
      total: number;
      percentage: number;
    };
  };
  overallPercentage: number;
}

const ViewAttendance = () => {
  const [selectedBranch, setSelectedBranch] = useState('Computer Science');
  const [selectedSemester, setSelectedSemester] = useState('6');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const branches = ['Computer Science', 'Information Technology', 'Electronics and Communication', 'Mechanical Engineering'];

  // Fetch available specializations when branch and semester change
  useEffect(() => {
    const fetchSpecializations = async () => {
      if (!selectedBranch || !selectedSemester) return;
      
      try {
        const res = await fetch(getApiUrl(`/students/specializations?branch=${selectedBranch}&semester=${selectedSemester}`));
        if (!res.ok) throw new Error('Failed to fetch specializations');
        const data = await res.json();
        setAvailableSpecializations(data);
        setSelectedSpecialization('all'); // Reset to "all" instead of empty string
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to fetch specializations', variant: 'destructive' });
        setAvailableSpecializations([]);
      }
    };
    fetchSpecializations();
  }, [selectedBranch, selectedSemester]);

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedBranch, selectedSemester, selectedSpecialization]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        branch: selectedBranch,
        semester: selectedSemester,
        ...(selectedSpecialization !== 'all' && { specialization: selectedSpecialization })
      });
      
      const response = await fetch(getApiUrl(`/attendance/student-summary?${params.toString()}`));
      if (!response.ok) throw new Error('Failed to fetch attendance data');
      const data = await response.json();
      setAttendanceData(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch attendance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = attendanceData.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toString().toLowerCase().includes(searchTerm.toLowerCase())
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

          <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
            <SelectTrigger className="w-full lg:w-64">
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {availableSpecializations.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading attendance data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={fetchAttendanceData}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Student Attendance List */}
        {!loading && !error && (
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
                        {student.specialization && (
                          <Badge variant="outline" className="text-xs">{student.specialization}</Badge>
                        )}
                        <Badge className={`${getAttendanceBadge(student.overallPercentage)} text-xs`}>
                          {student.overallPercentage.toFixed(1)}% Overall
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(student.studentId.toString())}
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
                              {data.percentage.toFixed(1)}%
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
        )}
      </div>
    </div>
  );
};

export default ViewAttendance;
