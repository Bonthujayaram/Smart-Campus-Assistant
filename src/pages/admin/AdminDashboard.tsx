import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  FileText, 
  ClipboardList, 
  Bell, 
  UserCheck,
  TrendingUp,
  BookOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { getApiUrl } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GraphData {
  studentsByBranch: Array<{ branch: string; count: number }>;
  facultyByDepartment: Array<{ department: string; count: number }>;
  assignmentsBySubject: Array<{ subject: string; count: number }>;
  attendanceByBranch: Array<{ branch: string; percentage: number }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    activeAssignments: 0,
    pendingNotifications: 0,
    attendanceToday: 0,
    upcomingEvents: 0
  });
  const [graphData, setGraphData] = useState<GraphData>({
    studentsByBranch: [],
    facultyByDepartment: [],
    assignmentsBySubject: [],
    attendanceByBranch: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add new state for graph-specific filters
  const [assignmentFilters, setAssignmentFilters] = useState({
    branch: 'Computer Science',
    semester: '6',
    specialization: 'all'
  });

  const [attendanceFilters, setAttendanceFilters] = useState({
    branch: 'Computer Science',
    semester: '6',
    specialization: 'all'
  });

  const [assignmentSpecializations, setAssignmentSpecializations] = useState<string[]>([]);
  const [attendanceSpecializations, setAttendanceSpecializations] = useState<string[]>([]);

  const branches = ['Computer Science', 'Information Technology', 'Electronics and Communication', 'Mechanical Engineering'];

  // Fetch specializations for assignment filters
  useEffect(() => {
    const fetchAssignmentSpecializations = async () => {
      if (!assignmentFilters.branch || !assignmentFilters.semester) return;
      
      try {
        const res = await fetch(getApiUrl(`/students/specializations?branch=${assignmentFilters.branch}&semester=${assignmentFilters.semester}`));
        if (!res.ok) throw new Error('Failed to fetch specializations');
        const data = await res.json();
        setAssignmentSpecializations(data);
      } catch (err) {
        console.error('Failed to fetch specializations:', err);
        setAssignmentSpecializations([]);
      }
    };
    fetchAssignmentSpecializations();
  }, [assignmentFilters.branch, assignmentFilters.semester]);

  // Fetch specializations for attendance filters
  useEffect(() => {
    const fetchAttendanceSpecializations = async () => {
      if (!attendanceFilters.branch || !attendanceFilters.semester) return;
      
      try {
        const res = await fetch(getApiUrl(`/students/specializations?branch=${attendanceFilters.branch}&semester=${attendanceFilters.semester}`));
        if (!res.ok) throw new Error('Failed to fetch specializations');
        const data = await res.json();
        setAttendanceSpecializations(data);
      } catch (err) {
        console.error('Failed to fetch specializations:', err);
        setAttendanceSpecializations([]);
      }
    };
    fetchAttendanceSpecializations();
  }, [attendanceFilters.branch, attendanceFilters.semester]);

  // Fetch initial dashboard data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch analytics overview data and stats only once
        const [analyticsRes, statsRes] = await Promise.all([
          fetch(getApiUrl('/admin/graph-data')),
          fetch(getApiUrl('/dashboard-stats'))
        ]);
        
        if (!analyticsRes.ok) throw new Error('Failed to fetch analytics data');
        if (!statsRes.ok) throw new Error('Failed to fetch dashboard stats');
        
        const [analyticsData, statsData] = await Promise.all([
          analyticsRes.json(),
          statsRes.json()
        ]);

        console.log('Analytics Data:', analyticsData);
        
        if (!analyticsData.studentsByBranch || !analyticsData.facultyByDepartment) {
          throw new Error('Invalid data structure received from server');
        }
        
        setStats(statsData);
        setGraphData(prev => ({
          ...prev,
          studentsByBranch: analyticsData.studentsByBranch.map(item => ({
            ...item,
            branch: formatBranchName(item.branch)
          })),
          facultyByDepartment: analyticsData.facultyByDepartment.map(item => ({
            ...item,
            department: formatDepartmentName(item.department)
          }))
        }));
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch filtered assignment data
  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        const params = new URLSearchParams({
          branch: assignmentFilters.branch,
          semester: assignmentFilters.semester,
          ...(assignmentFilters.specialization !== 'all' && { specialization: assignmentFilters.specialization })
        });
        
        const assignmentRes = await fetch(getApiUrl(`/admin/graph-data/assignments?${params.toString()}`));
        if (!assignmentRes.ok) throw new Error('Failed to fetch assignment data');
        
        const assignmentData = await assignmentRes.json();
        setGraphData(prev => ({
          ...prev,
          assignmentsBySubject: assignmentData.assignmentsBySubject
        }));
      } catch (err: any) {
        console.error('Failed to fetch assignment data:', err);
      }
    };
    fetchAssignmentData();
  }, [assignmentFilters]);

  // Fetch filtered attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const params = new URLSearchParams({
          branch: attendanceFilters.branch,
          semester: attendanceFilters.semester,
          ...(attendanceFilters.specialization !== 'all' && { specialization: attendanceFilters.specialization })
        });
        
        const attendanceRes = await fetch(getApiUrl(`/admin/graph-data/attendance?${params.toString()}`));
        if (!attendanceRes.ok) throw new Error('Failed to fetch attendance data');
        
        const attendanceData = await attendanceRes.json();
        setGraphData(prev => ({
          ...prev,
          attendanceByBranch: attendanceData.attendanceByBranch
        }));
      } catch (err: any) {
        console.error('Failed to fetch attendance data:', err);
      }
    };
    fetchAttendanceData();
  }, [attendanceFilters]);

  const formatDepartmentName = (dept: string) => {
    return dept.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const formatBranchName = (branch: string) => {
    return branch.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const quickActions = [
    {
      title: 'Manage Timetables',
      description: 'Add, edit, or delete class schedules',
      icon: Calendar,
      link: '/admin/timetables',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Manage Syllabus',
      description: 'Upload and organize course materials',
      icon: BookOpen,
      link: '/admin/syllabus',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Send Notifications',
      description: 'Send announcements to students',
      icon: Bell,
      link: '/admin/notifications',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'View Attendance',
      description: 'Monitor student attendance records',
      icon: UserCheck,
      link: '/admin/attendance',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: 'Student Reports',
      description: 'Generate academic performance reports',
      icon: TrendingUp,
      link: '/admin/reports',
      color: 'bg-pink-500 hover:bg-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-inter">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your Smart Campus system</p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading stats...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Faculty</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalFaculty}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeAssignments}</p>
                  </div>
                  <ClipboardList className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Notifications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingNotifications}</p>
                  </div>
                  <Bell className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Today's Attendance</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.attendanceToday}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-indigo-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Upcoming Events</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.link}>
                  <Card className={`${action.color} text-white hover:shadow-lg transition-all duration-300 cursor-pointer h-full`}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <action.icon className="w-6 h-6" />
                        <div>
                          <h3 className="font-semibold">{action.title}</h3>
                          <p className="text-sm opacity-90">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Analytics Graphs */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Analytics Overview
            </h2>
            
            {/* First Row of Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Students by Branch */}
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                <CardHeader className="p-6 border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    Students by Branch ({new Date().getFullYear()})
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] p-6">
                  {graphData.studentsByBranch.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={graphData.studentsByBranch} margin={{ top: 10, right: 30, left: 20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="branch" 
                          stroke="#6b7280"
                          tick={{ fill: '#4b5563', fontSize: 12 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tickMargin={25}
                          label={{ value: 'Branch', position: 'bottom', offset: 35, fill: '#4b5563' }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fill: '#4b5563', fontSize: 12 }}
                          label={{ value: 'Number of Students', angle: -90, position: 'insideLeft', offset: 0, fill: '#4b5563' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            padding: '8px',
                          }}
                        />
                        <Legend 
                          verticalAlign="top" 
                          height={36}
                          iconType="circle"
                        />
                        <Bar dataKey="count" name="Students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No student data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Faculty by Department */}
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                <CardHeader className="p-6 border-b border-gray-100">
                  <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                    Faculty by Department ({new Date().getFullYear()})
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] p-6">
                  {graphData.facultyByDepartment.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={graphData.facultyByDepartment} margin={{ top: 10, right: 30, left: 20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="department" 
                          stroke="#6b7280"
                          tick={{ fill: '#4b5563', fontSize: 12 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tickMargin={25}
                          label={{ value: 'Department', position: 'bottom', offset: 35, fill: '#4b5563' }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fill: '#4b5563', fontSize: 12 }}
                          label={{ value: 'Number of Faculty', angle: -90, position: 'insideLeft', offset: 0, fill: '#4b5563' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            padding: '8px',
                          }}
                        />
                        <Legend 
                          verticalAlign="top" 
                          height={36}
                          iconType="circle"
                        />
                        <Bar dataKey="count" name="Faculty" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No faculty data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Second Row of Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Assignments by Subject */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-green-600">
                    Assignments by Subject
                  </CardTitle>
                  {/* Assignment Filters */}
                  <div className="flex flex-col gap-2 mt-4">
                    <Select 
                      value={assignmentFilters.branch} 
                      onValueChange={(value) => setAssignmentFilters(prev => ({ ...prev, branch: value }))}
                    >
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

                    <Select 
                      value={assignmentFilters.semester} 
                      onValueChange={(value) => setAssignmentFilters(prev => ({ ...prev, semester: value }))}
                    >
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

                    <Select 
                      value={assignmentFilters.specialization} 
                      onValueChange={(value) => setAssignmentFilters(prev => ({ ...prev, specialization: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Specializations</SelectItem>
                        {assignmentSpecializations.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={graphData.assignmentsBySubject}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Assignments" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Percentage Graph */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-orange-600">
                    Attendance Percentage by Branch
                  </CardTitle>
                  {/* Attendance Filters */}
                  <div className="flex flex-col gap-2 mt-4">
                    <Select 
                      value={attendanceFilters.branch} 
                      onValueChange={(value) => setAttendanceFilters(prev => ({ ...prev, branch: value }))}
                    >
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

                    <Select 
                      value={attendanceFilters.semester} 
                      onValueChange={(value) => setAttendanceFilters(prev => ({ ...prev, semester: value }))}
                    >
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

                    <Select 
                      value={attendanceFilters.specialization} 
                      onValueChange={(value) => setAttendanceFilters(prev => ({ ...prev, specialization: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Specializations</SelectItem>
                        {attendanceSpecializations.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={graphData.attendanceByBranch}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="branch" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="percentage" name="Attendance %" fill="#F97316" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
