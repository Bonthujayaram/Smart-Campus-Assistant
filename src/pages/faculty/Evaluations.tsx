import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Eye, Check, X } from 'lucide-react';
import { getApiUrl } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { Assignment, Submission } from '@/types';
import { toast } from '@/hooks/use-toast';

interface EvaluationSubmission extends Submission {
  student_name: string;
  student_registration: string;
}

const Evaluations = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [submissions, setSubmissions] = useState<EvaluationSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignment) {
      fetchSubmissions(parseInt(selectedAssignment));
    }
  }, [selectedAssignment]);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(getApiUrl(`/faculty/${user?.facultyId}/assignments`));
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch assignments',
        variant: 'destructive',
      });
    }
  };

  const fetchSubmissions = async (assignmentId: number) => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(`/assignments/${assignmentId}/submissions`));
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (submissionId: number, status: 'approved' | 'rejected' | 'pending') => {
    try {
      const response = await fetch(getApiUrl(`/submissions/${submissionId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update submission status');
      }

      const data = await response.json();
        toast({
          title: 'Success',
        description: `Assignment ${status === 'approved' ? 'approved' : 'rejected'} successfully${
          data.file_deleted ? ' and file removed' : ''
        }`,
        });
      
        if (selectedAssignment) {
        await fetchSubmissions(parseInt(selectedAssignment));
      }
    } catch (error) {
      console.error('Error updating submission status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update submission status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Evaluate Assignments</h1>
          <p className="text-gray-600 mt-2">Review and grade student submissions</p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
              <SelectTrigger>
                <SelectValue placeholder="Select Assignment" />
              </SelectTrigger>
              <SelectContent>
                {assignments.map((assignment) => (
                  <SelectItem key={assignment.id} value={assignment.id.toString()}>
                    {assignment.title} - {assignment.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submission</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.student_registration}</TableCell>
                      <TableCell>{submission.student_name}</TableCell>
                      <TableCell>
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            submission.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : submission.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {submission.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {submission.file_url ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                          </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Submission Preview</DialogTitle>
                              </DialogHeader>
                              <div className="mt-4 flex justify-center">
                                <img 
                                  src={getApiUrl(`/${submission.file_url}`)} 
                                  alt="Assignment submission" 
                                  className="max-h-[80vh] object-contain rounded-lg shadow-lg"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Submission Text</DialogTitle>
                              </DialogHeader>
                              <div className="mt-4" aria-describedby="submission-text-description">
                                <p id="submission-text-description" className="text-sm text-gray-600 whitespace-pre-wrap">
                                  {submission.text_answer}
                                </p>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                            disabled={submission.status === 'approved'}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                            disabled={submission.status === 'rejected'}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Evaluations; 