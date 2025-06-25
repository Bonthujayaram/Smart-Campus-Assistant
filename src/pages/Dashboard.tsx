import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Calendar, File, List, Bell, User, Contact } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const quickActions = [
    { title: 'Dashboard', description: 'Go to your dashboard', icon: Calendar, link: '/dashboard', color: 'bg-blue-500' },
    { title: 'Attendance', description: 'Track your attendance', icon: User, link: '/attendance', color: 'bg-green-500' },
    { title: 'Timetable', description: 'Check your daily schedule', icon: Calendar, link: '/timetable', color: 'bg-blue-500' },
    { title: 'Syllabus', description: 'Access course materials', icon: File, link: '/syllabus', color: 'bg-green-500' },
    { title: 'Assignments', description: 'View pending tasks', icon: List, link: '/assignments', color: 'bg-purple-500' },
    { title: 'Notifications', description: 'Latest updates', icon: Bell, link: '/notifications', color: 'bg-red-500' },
    { title: 'Contact', description: 'Get help and support', icon: Contact, link: '/contact', color: 'bg-gray-500' },
  ];

  // Attendance summary state
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        // Fetch attendance data using student-summary endpoint
        const attendanceRes = await fetch(getApiUrl(`/attendance/student-summary?branch=${user.branch}&semester=${user.semester}&specialization=${user.specialization || ''}`));
        if (!attendanceRes.ok) {
          throw new Error(`HTTP error! status: ${attendanceRes.status}`);
        }
        const attendanceData = await attendanceRes.json();
        // Find this student's attendance from the summary
        const studentAttendance = attendanceData.find((s: any) => s.studentId === user.studentId);
        setAttendanceSummary(studentAttendance);

        // Fetch assignments using student-specific endpoint with specialization
        const params = new URLSearchParams({
          branch: user.branch,
          semester: user.semester.toString()
        });
        if (user.specialization) {
          params.append('specialization', user.specialization);
        }
        
        const assignmentsRes = await fetch(getApiUrl(`/assignments/filtered?${params.toString()}`), {
          credentials: 'include'
        });
        if (!assignmentsRes.ok) {
          throw new Error(`HTTP error! status: ${assignmentsRes.status}`);
        }
        const assignmentsData = await assignmentsRes.json();
        
        // Filter assignments based on specialization
        const filteredAssignments = assignmentsData.filter((assignment: any) => {
          // If assignment has no specialization, show it to everyone
          if (!assignment.specialization) return true;
          // If assignment has specialization, only show if it matches student's specialization
          return assignment.specialization === user.specialization;
        });

        // Fetch submission status for filtered assignments
        const submissionPromises = filteredAssignments.map((assignment: any) =>
          fetch(getApiUrl(`/students/${user.studentId}/assignments/${assignment.id}/status`), {
            credentials: 'include'
          }).then(res => res.json()).catch(() => ({ status: null }))
        );

        const submissionStatuses = await Promise.all(submissionPromises);
        
        // Combine assignment data with submission status
        const assignmentsWithStatus = filteredAssignments.map((assignment: any, index: number) => ({
          ...assignment,
          status: submissionStatuses[index].status
        }));

        console.log('Assignments with status:', assignmentsWithStatus);
        setAssignments(assignmentsWithStatus);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setAttendanceSummary(null);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    if (user?.studentId) {
      console.log('Current user:', user);
      fetchStudentData();
    }
  }, [user]);

  // Calculate assignment statistics
  const totalAssignments = assignments.length;
  const pendingAssignments = assignments.filter(a => !a.status || a.status === 'pending').length;
  const submittedAssignments = assignments.filter(a => a.status === 'approved').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <div className="text-sm sm:text-base text-gray-600 flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div>Student ID: {user?.studentId}</div>
            <div>{user?.branch} | Semester {user?.semester}</div>
          </div>
        </div>

        {/* Attendance & Assignments Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading attendance...</div>
              ) : attendanceSummary ? (
                <div>
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {attendanceSummary.overallPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Attendance</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(attendanceSummary.subjects).map(([subject, data]: any) => (
                      <div key={subject} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="font-semibold text-gray-900">{subject}</div>
                        <div className="mt-1 text-sm">
                          <div className="flex justify-between items-center">
                            <span>Present:</span>
                            <span className="font-medium">{data.present} / {data.total}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span>Percentage:</span>
                            <span className={`font-medium ${data.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                              {data.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No attendance data found.</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading assignments...</div>
              ) : assignments.length > 0 ? (
                <div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">{totalAssignments}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <div className="text-2xl font-bold text-yellow-600">{pendingAssignments}</div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">{submittedAssignments}</div>
                      <div className="text-sm text-gray-600">Submitted</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {assignments.slice(0, 3).map((a: any) => (
                      <div key={a.id} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-gray-900">{a.title}</div>
                            <div className="text-sm text-gray-600">Subject: {a.subject}</div>
                            <div className="text-sm text-gray-600">Due: {new Date(a.due_date).toLocaleDateString()}</div>
                          </div>
                          <Badge className={
                            a.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {a.status || 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {assignments.length > 3 && (
                      <Link to="/assignments">
                        <Button variant="outline" className="w-full mt-2">
                          View All Assignments
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No assignments found.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Link key={index} to={action.link} className={index >= 6 ? 'sm:col-span-1 col-span-2' : ''}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start space-x-3">
                              <div className={`${action.color} p-2 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                                  {action.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">{action.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Profile Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Name:</span>
                    <span className="text-xs sm:text-sm font-medium truncate ml-2">{user?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Student ID:</span>
                    <span className="text-xs sm:text-sm font-medium">{user?.studentId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Branch:</span>
                    <span className="text-xs sm:text-sm font-medium truncate ml-2">{user?.branch}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Semester:</span>
                    <span className="text-xs sm:text-sm font-medium">{user?.semester}</span>
                  </div>
                  <Link to="/profile">
                    <Button variant="outline" className="w-full mt-3 sm:mt-4 text-xs sm:text-sm">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
