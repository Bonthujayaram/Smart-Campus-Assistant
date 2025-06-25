import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiUrl } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, Clock, Calendar, GraduationCap, School, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalSubjects: number;
  teachingBranches: number;
  totalAssignments: number;
  pendingEvaluations: number;
  recentSubmissions: number;
  totalAttendanceToday: number;
  classesToday: number;
  activeStudents: number;
}

interface GraphData {
  submissions: Array<{ date: string; count: number }>;
  attendance: Array<{ date: string; count: number }>;
}

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalSubjects: 0,
    teachingBranches: 0,
    totalAssignments: 0,
    pendingEvaluations: 0,
    recentSubmissions: 0,
    totalAttendanceToday: 0,
    classesToday: 0,
    activeStudents: 0
  });
  const [graphData, setGraphData] = useState<GraphData>({
    submissions: [],
    attendance: []
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(getApiUrl(`/faculty/${user?.facultyId}/dashboard-stats`));
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch dashboard statistics',
          variant: 'destructive',
        });
      }
    };

    const fetchGraphData = async () => {
      try {
        const response = await fetch(getApiUrl(`/faculty/${user?.facultyId}/graph-data`));
        if (!response.ok) {
          throw new Error('Failed to fetch graph data');
        }
        const data = await response.json();
        setGraphData(data);
      } catch (error) {
        console.error('Error fetching graph data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch graph data',
          variant: 'destructive',
        });
      }
    };

    if (user?.facultyId) {
      fetchDashboardStats();
      fetchGraphData();
    }
  }, [user?.facultyId]);

  const sections = [
    {
      title: "Teaching Overview",
      cards: [
        {
          title: "Total Subjects",
          value: stats.totalSubjects,
          icon: BookOpen,
          color: "text-blue-600"
        },
        {
          title: "Teaching Branches",
          value: stats.teachingBranches,
          icon: School,
          color: "text-purple-600"
        }
      ]
    },
    {
      title: "Assignment Management",
      cards: [
        {
          title: "Total Assignments",
          value: stats.totalAssignments,
          icon: GraduationCap,
          color: "text-green-600"
        },
        {
          title: "Pending Evaluations",
          value: stats.pendingEvaluations,
          icon: Clock,
          color: "text-yellow-600"
        },
        {
          title: "Recent Submissions",
          value: stats.recentSubmissions,
          icon: CheckCircle,
          color: "text-emerald-600"
        }
      ]
    },
    {
      title: "Today's Schedule",
      cards: [
        {
          title: "Classes Today",
          value: stats.classesToday,
          icon: Calendar,
          color: "text-indigo-600"
        },
        {
          title: "Attendance Marked",
          value: stats.totalAttendanceToday,
          icon: CheckCircle,
          color: "text-teal-600"
        }
      ]
    },
    {
      title: "Student Engagement",
      cards: [
        {
          title: "Active Students",
          value: stats.activeStudents,
          icon: Users,
          color: "text-rose-600"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-inter">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Faculty Dashboard</h1>
      
      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg backdrop-blur-lg backdrop-filter bg-opacity-90 transition-all duration-300 hover:shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {section.title}
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.cards.map((card, cardIdx) => (
                <Card key={cardIdx} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">{card.title}</p>
                        <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg bg-opacity-10 ${card.color.replace('text-', 'bg-')}`}>
                        <card.icon className={`w-8 h-8 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Graphs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submissions Graph */}
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardHeader className="p-6 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Assignment Submissions (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] p-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData.submissions} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                    label={{ value: 'Date', position: 'bottom', offset: 20, fill: '#4b5563' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                    label={{ value: 'Number of Submissions', angle: -90, position: 'insideLeft', offset: 0, fill: '#4b5563' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      padding: '8px',
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    iconType="circle"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#2563eb" 
                    name="Submissions"
                    strokeWidth={2}
                    dot={{ stroke: '#2563eb', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Attendance Graph */}
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardHeader className="p-6 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                Attendance Overview (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] p-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData.attendance} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                    label={{ value: 'Date', position: 'bottom', offset: 20, fill: '#4b5563' }}
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
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    iconType="circle"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#059669" 
                    name="Attendance"
                    strokeWidth={2}
                    dot={{ stroke: '#059669', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard; 