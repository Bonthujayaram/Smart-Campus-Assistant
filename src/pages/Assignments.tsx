import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, File, User, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import AssignmentSubmitForm from "@/components/AssignmentSubmitForm";
import { getApiUrl } from '../utils/api';
import { toast } from '@/hooks/use-toast';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(user?.branch || 'all');
  const [selectedSemester, setSelectedSemester] = useState(user?.semester?.toString() || 'all');
  const [selectedSpecialization, setSelectedSpecialization] = useState(user?.specialization || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [specializations, setSpecializations] = useState([]);

  const fetchSpecializations = async () => {
    if (selectedBranch === 'all') return;
    try {
      const response = await fetch(getApiUrl(`/students/specializations?branch=${selectedBranch}&semester=${selectedSemester}`));
      if (!response.ok) throw new Error('Failed to fetch specializations');
      const data = await response.json();
      setSpecializations(data);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  };

  useEffect(() => {
    if (selectedBranch !== 'all' && selectedSemester !== 'all') {
      fetchSpecializations();
    }
  }, [selectedBranch, selectedSemester]);

  const fetchStudentSubmissions = async () => {
    try {
      const response = await fetch(getApiUrl(`/students/${user.studentId}/assignments`), {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      const data = await response.json();
      const submissionsMap = {};
      data.forEach(assignment => {
        if (assignment.status === "submitted" || assignment.status === "pending" || 
            assignment.status === "approved" || assignment.status === "rejected") {
          submissionsMap[assignment.id] = {
            status: assignment.status,
            submitted: true
          };
        }
      });
      setSubmissions(submissionsMap);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch submission status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAssignments();
        if (user?.studentId) {
          await fetchStudentSubmissions();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [selectedBranch, selectedSemester, selectedSpecialization, user?.studentId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedBranch !== 'all') params.append('branch', selectedBranch);
      if (selectedSemester !== 'all') params.append('semester', selectedSemester);
      if (selectedSpecialization !== 'all') params.append('specialization', selectedSpecialization);

      const response = await fetch(getApiUrl(`/assignments/filtered?${params.toString()}`), {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      const data = await response.json();
      
      // Filter assignments based on specialization
      const filteredData = selectedSpecialization === 'all' 
        ? data 
        : data.filter(a => a.specialization === selectedSpecialization);
      
      setAssignments(filteredData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((assignment: any) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = selectedSpecialization === 'all' || 
                                 assignment.specialization === selectedSpecialization;
    
    return matchesSearch && matchesSpecialization;
  });

  const handleSubmit = (assignment) => {
    if (submissions[assignment.id]?.submitted) {
      toast({
        title: "Assignment Already Submitted",
        description: "You have already submitted this assignment. Do you want to submit again?",
        variant: "default"
      });
    }
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
  };

  const getSubmissionStatus = (assignmentId) => {
    return submissions[assignmentId]?.status || null;
  };

  const isSubmitted = (assignmentId) => {
    return submissions[assignmentId]?.submitted || false;
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      submitted: { color: "bg-blue-100 text-blue-800", icon: CheckCircle2 }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleSubmitSuccess = async () => {
    setShowSubmitModal(false);
    // Update the local submissions state immediately
    if (selectedAssignment) {
      setSubmissions(prev => ({
        ...prev,
        [selectedAssignment.id]: {
          status: 'pending',
          submitted: true
        }
      }));
    }
    // Fetch the latest data
    await fetchStudentSubmissions();
    toast({
      title: "Success",
      description: "Assignment submitted successfully",
    });
  };

  if (loading) return <div>Loading assignments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments</h1>
          <p className="text-gray-600">View and submit your assignments</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger>
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Information Technology">Information Technology</SelectItem>
              <SelectItem value="Electronics and Communication">Electronics and Communication</SelectItem>
              <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger>
              <SelectValue placeholder="Select Semester" />
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

          <Select 
            value={selectedSpecialization} 
            onValueChange={setSelectedSpecialization}
            disabled={selectedBranch === 'all' || selectedSemester === 'all'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Assignments List */}
        {filteredAssignments.length > 0 ? (
          <div className="grid gap-6">
            {filteredAssignments.map((assignment: any) => (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{assignment.title}</CardTitle>
                    {getStatusBadge(getSubmissionStatus(assignment.id))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{assignment.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>Branch: {assignment.branch}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <File className="w-4 h-4" />
                      <span>Subject: {assignment.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Semester: {assignment.semester}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button 
                      onClick={() => handleSubmit(assignment)}
                      variant={isSubmitted(assignment.id) ? "secondary" : "default"}
                    >
                      {isSubmitted(assignment.id) ? "Resubmit Assignment" : "Submit Assignment"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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

        {showSubmitModal && selectedAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                onClick={() => setShowSubmitModal(false)}
              >✕</button>
              <h2 className="text-2xl font-bold mb-2">Submit: {selectedAssignment.title}</h2>
              <AssignmentSubmitForm
                assignmentId={selectedAssignment.id}
                studentId={user.studentId}
                onSuccess={handleSubmitSuccess}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
