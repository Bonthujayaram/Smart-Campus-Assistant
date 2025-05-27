
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, File, User, AlertCircle } from 'lucide-react';

const Assignments = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const mockAssignments = [
    {
      id: '1',
      title: 'Database Design Project',
      subject: 'Database Management Systems',
      description: 'Design a complete database system for a library management system including ER diagrams, normalization, and SQL queries.',
      assignedDate: '2024-01-15',
      dueDate: '2024-01-30',
      status: 'pending',
      faculty: 'Dr. Smith',
      maxMarks: 50,
      submissionType: 'File Upload',
    },
    {
      id: '2',
      title: 'Software Requirements Document',
      subject: 'Software Engineering',
      description: 'Create a comprehensive SRS document for a mobile application following IEEE standards.',
      assignedDate: '2024-01-10',
      dueDate: '2024-01-25',
      status: 'overdue',
      faculty: 'Prof. Johnson',
      maxMarks: 40,
      submissionType: 'Document',
    },
    {
      id: '3',
      title: 'Network Simulation Lab',
      subject: 'Computer Networks',
      description: 'Implement and simulate different network topologies using packet tracer or similar tools.',
      assignedDate: '2024-01-20',
      dueDate: '2024-02-05',
      status: 'pending',
      faculty: 'Dr. Brown',
      maxMarks: 60,
      submissionType: 'Simulation File',
    },
    {
      id: '4',
      title: 'ML Algorithm Implementation',
      subject: 'Machine Learning',
      description: 'Implement and compare three different classification algorithms on a real dataset.',
      assignedDate: '2024-01-12',
      dueDate: '2024-01-28',
      status: 'submitted',
      faculty: 'Prof. Davis',
      maxMarks: 70,
      submissionType: 'Code + Report',
      submittedDate: '2024-01-27',
    },
    {
      id: '5',
      title: 'Process Scheduling Analysis',
      subject: 'Operating Systems',
      description: 'Analyze and implement different CPU scheduling algorithms and compare their performance.',
      assignedDate: '2024-01-18',
      dueDate: '2024-02-10',
      status: 'pending',
      faculty: 'Dr. Wilson',
      maxMarks: 45,
      submissionType: 'Code + Analysis',
    },
    {
      id: '6',
      title: 'Web Application Development',
      subject: 'Web Technology',
      description: 'Develop a responsive web application using modern frameworks and deployment.',
      assignedDate: '2024-01-22',
      dueDate: '2024-02-15',
      status: 'pending',
      faculty: 'Prof. Anderson',
      maxMarks: 80,
      submissionType: 'Live Demo + Code',
    },
  ];

  const subjects = [...new Set(mockAssignments.map(a => a.subject))];

  const filteredAssignments = mockAssignments.filter(assignment => {
    const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
    const matchesSubject = selectedSubject === 'all' || assignment.subject === selectedSubject;
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSubject && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAssignmentStats = () => {
    const pending = filteredAssignments.filter(a => a.status === 'pending').length;
    const submitted = filteredAssignments.filter(a => a.status === 'submitted').length;
    const overdue = filteredAssignments.filter(a => a.status === 'overdue').length;
    return { pending, submitted, overdue };
  };

  const stats = getAssignmentStats();

  const handleSubmit = (assignmentId: string, title: string) => {
    // In a real app, this would open a submission modal or redirect to submission page
    alert(`Opening submission form for: ${title}`);
  };

  const handleViewDetails = (assignmentId: string, title: string) => {
    // In a real app, this would show detailed assignment information
    alert(`Viewing details for: ${title}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments</h1>
          <p className="text-gray-600">Track and manage your academic assignments</p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full lg:w-64">
              <SelectValue placeholder="Filter by subject" />
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

          <Input
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-gray-600">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.submitted}</p>
                <p className="text-gray-600">Submitted</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                <p className="text-gray-600">Overdue</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{filteredAssignments.length}</p>
                <p className="text-gray-600">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length > 0 ? (
          <div className="grid gap-6">
            {filteredAssignments.map((assignment) => {
              const daysRemaining = getDaysRemaining(assignment.dueDate);
              const isUrgent = daysRemaining <= 2 && assignment.status === 'pending';
              
              return (
                <Card key={assignment.id} className={`hover:shadow-lg transition-shadow ${isUrgent ? 'ring-2 ring-red-200' : ''}`}>
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{assignment.title}</CardTitle>
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </Badge>
                          {isUrgent && (
                            <Badge className="bg-red-500 text-white">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{assignment.subject}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(assignment.id, assignment.title)}
                        >
                          View Details
                        </Button>
                        {assignment.status === 'pending' && (
                          <Button 
                            size="sm"
                            onClick={() => handleSubmit(assignment.id, assignment.title)}
                          >
                            Submit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{assignment.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Faculty: {assignment.faculty}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <File className="w-4 h-4" />
                        <span>Max Marks: {assignment.maxMarks}</span>
                      </div>
                    </div>

                    {assignment.status === 'pending' && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">
                            {daysRemaining > 0 
                              ? `${daysRemaining} days remaining`
                              : daysRemaining === 0 
                                ? 'Due today!'
                                : `${Math.abs(daysRemaining)} days overdue`
                            }
                          </span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                          Submission Type: {assignment.submissionType}
                        </p>
                      </div>
                    )}

                    {assignment.status === 'submitted' && assignment.submittedDate && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <File className="w-4 h-4" />
                          <span className="font-medium">
                            Submitted on {new Date(assignment.submittedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {assignment.status === 'overdue' && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">
                            Overdue by {Math.abs(daysRemaining)} days
                          </span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">
                          Contact faculty for late submission guidelines.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Found</h3>
              <p className="text-gray-600">No assignments match your current filters. Try adjusting your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Assignments;
