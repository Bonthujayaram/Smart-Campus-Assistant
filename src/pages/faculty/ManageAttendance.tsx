import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, Check, X, Edit2, QrCode } from 'lucide-react';
import { getApiUrl, API_BASE_URL } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import QRAttendanceGenerator from '@/components/QRAttendanceGenerator';

interface TimeTableEntry {
  id: number;
  day: string;
  time: string;
  subject: string;
  room: string;
  type: string;
  branch: string;
  semester: number;
}

interface Student {
  studentId: number;
  name: string;
  registration_number: string;
  branch: string;
  semester: number;
  specialization: string;
}

interface AttendanceRecord {
  id: number;
  student_id: number;
  date: string;
  status: string;
  subject: string;
}

interface Subject {
  subject: string;
}

interface Specialization {
  specialization: string;
}

interface StudentAttendance extends Student {
  isPresent: boolean;
  isEditing: boolean;
  attendanceId?: number;
}

interface TimeTableEntryWithStatus extends TimeTableEntry {
  isAttendanceTaken?: boolean;
}

const branches = [
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Electronics and Communication', label: 'Electronics and Communication' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' }
];

const ManageAttendance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
  const [timetableEntries, setTimetableEntries] = useState<TimeTableEntryWithStatus[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<TimeTableEntryWithStatus | null>(null);
  const [isQRMode, setIsQRMode] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [tempScans, setTempScans] = useState<{[key: string]: boolean}>({});

  // Function to fetch students
  const fetchStudents = useCallback(async () => {
    if (!selectedBranch || !selectedSemester || !selectedSpecialization) {
      setStudents([]);
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        branch: selectedBranch,
        semester: selectedSemester,
        specialization: selectedSpecialization
      });

      const response = await fetch(
        getApiUrl(`/students/filtered?${queryParams}`)
      );
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data.map((student: Student) => ({
        ...student,
        isPresent: false
      })));
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, selectedSemester, selectedSpecialization]);

  // Fetch students when filters change
  useEffect(() => {
    if (selectedSpecialization) {
      fetchStudents();
    }
  }, [fetchStudents, selectedSpecialization]);

  useEffect(() => {
    if (selectedBranch && selectedSemester) {
      fetchSpecializations();
      fetchFacultySubjects();
    }
  }, [selectedBranch, selectedSemester]);

  useEffect(() => {
    if (user?.facultyId) {
      fetchFacultySubjects();
    }
  }, [user?.facultyId]);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!user?.facultyId) return;
      
      try {
        const response = await fetch(getApiUrl(`/faculty/${user.facultyId}/timetable-classes`));
        if (!response.ok) throw new Error('Failed to fetch timetable');
        const data = await response.json();
        await checkAttendanceStatus(data);
      } catch (error) {
        console.error('Error fetching timetable:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch timetable entries',
          variant: 'destructive',
        });
      }
    };

    fetchTimetable();
  }, [user?.facultyId]);

  const fetchFacultySubjects = async () => {
    try {
      const response = await fetch(getApiUrl(`/faculty/${user?.facultyId}/subjects`));
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching faculty subjects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subjects',
        variant: 'destructive',
      });
    }
  };

  const fetchSpecializations = async () => {
    try {
      setLoadingSpecializations(true);
      const response = await fetch(
        getApiUrl(`/students/specializations?branch=${selectedBranch}&semester=${selectedSemester}`)
      );
      if (!response.ok) {
        throw new Error('Failed to fetch specializations');
      }
      const data = await response.json();
      console.log('Fetched specializations:', data); // Debug log
      setSpecializations(data);
    } catch (error) {
      console.error('Error fetching specializations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch specializations',
        variant: 'destructive',
      });
      setSpecializations([]);
    } finally {
      setLoadingSpecializations(false);
    }
  };

  const fetchExistingAttendance = async () => {
    if (!selectedEntry || !date) return;

    try {
      const response = await fetch(
        getApiUrl(`/attendance/by-date-subject?date=${date}&subject=${selectedEntry.subject}`)
      );
      if (!response.ok) {
        throw new Error('Failed to fetch attendance');
      }
      const attendanceData = await response.json();
      
      // Update students with existing attendance data
      setStudents(prevStudents => 
        prevStudents.map(student => {
          const existingAttendance = attendanceData.find(
            (a: { studentId: number, attendance: string, attendance_id: number }) => 
              a.studentId === student.studentId
          );
          return {
            ...student,
            isPresent: existingAttendance ? existingAttendance.attendance === 'P' : false,
            attendanceId: existingAttendance ? existingAttendance.attendance_id : undefined
          };
        })
      );
    } catch (error) {
      console.error('Error fetching existing attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance records',
        variant: 'destructive',
      });
    }
  };

  const handleCheckboxChange = (studentId: number) => {
    setStudents(students.map(student => 
      student.studentId === studentId 
        ? { ...student, isPresent: !student.isPresent }
        : student
    ));
  };

  // Initialize WebSocket connection
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;
    let websocket: WebSocket | null = null;

    const connectWebSocket = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = API_BASE_URL.replace(/^https?:/, wsProtocol);
      
      try {
        websocket = new WebSocket(`${wsUrl}/ws`);

        websocket.onopen = () => {
          console.log('WebSocket connected');
          toast({
            title: 'Connected',
            description: 'Real-time updates enabled',
          });
        };

        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'qr_scan') {
              const { studentId, subject, date: scanDate } = data.data;
              
              // Only update if this is for the current class
              if (selectedEntry?.subject === subject && date === scanDate) {
                setStudents(prevStudents => 
                  prevStudents.map(student => 
                    student.studentId === studentId 
                      ? { ...student, isPresent: true, isPending: true }
                      : student
                  )
                );
                
                // Store temporary scan
                setTempScans(prev => ({
                  ...prev,
                  [studentId]: true
                }));
                
                toast({
                  title: 'New Attendance Scan',
                  description: `A student has scanned for attendance`,
                });
              }
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };

        websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          toast({
            variant: "destructive",
            title: "Connection Error",
            description: "Failed to connect to real-time updates. Retrying...",
          });
        };

        websocket.onclose = () => {
          console.log('WebSocket disconnected');
          // Try to reconnect after 5 seconds
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        };

        setWs(websocket);
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        // Try to reconnect after 5 seconds
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimeout);
      if (websocket) {
        websocket.close();
      }
    };
  }, [selectedEntry?.subject, date]);

  // Modify handleSubmitAttendance to handle temporary scans
  const handleSubmitAttendance = async () => {
    if (!selectedEntry) return;

    setSubmitting(true);
    try {
      const attendanceData = students.map(student => ({
        studentId: student.studentId,
        status: student.isPresent ? 'P' : 'A'
      }));

      const response = await fetch(getApiUrl('/attendance/finalize'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: selectedEntry.subject,
            date: date,
            type: selectedEntry.type,
            attendanceData
          }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit attendance');
      }

      setSubmitted(true);
      setTempScans({});  // Clear temporary scans
      
      toast({
        title: 'Success',
        description: 'Attendance has been submitted successfully',
      });
      
      // Refresh the attendance status
      await fetchExistingAttendance();
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to submit attendance',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = async () => {
    await fetchExistingAttendance();
    setIsEditing(true);
  };

  const handleUpdateAttendance = async () => {
    if (!selectedSubject || !date) {
      toast({
        title: 'Error',
        description: 'Please select subject and date',
        variant: 'destructive',
      });
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);
      const promises = students.map(student => {
        // For existing records, use PUT to update
        if (student.attendanceId) {
          return fetch(getApiUrl(`/attendance/${student.attendanceId}`), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              student_id: student.studentId,
              subject: selectedSubject,
              date,
              status: student.isPresent ? 'present' : 'absent',
            }),
          });
        }
        // For new records, use POST to create
        return fetch(getApiUrl('/attendance/mark'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_id: student.studentId,
            subject: selectedSubject,
            date,
            status: student.isPresent ? 'present' : 'absent',
          }),
        });
      });

      await Promise.all(promises);
      setIsEditing(false);
      
      // Refresh attendance data
      await fetchExistingAttendance();
      
      toast({
        title: 'Success',
        description: 'Attendance updated successfully',
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to update attendance',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEdit = (studentId: number) => {
    setStudents(students.map(student =>
      student.studentId === studentId
        ? { ...student, isEditing: !student.isEditing }
        : student
    ));
  };

  const markAttendance = async (studentId: number, status: string) => {
    if (!selectedSubject) {
      toast({
        title: 'Error',
        description: 'Please select a subject first',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(getApiUrl('/attendance/mark'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          subject: selectedSubject,
          date,
          status,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Attendance marked successfully',
        });
        // Update local state
        setStudents(students.map(student =>
          student.studentId === studentId
            ? { ...student, isPresent: status === 'present', isEditing: false }
            : student
        ));
      } else {
        throw new Error('Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark attendance',
        variant: 'destructive',
      });
    }
  };

  // Set initial filter values when timetable entry is selected
  useEffect(() => {
    if (selectedEntry) {
      setSelectedBranch(selectedEntry.branch);
      setSelectedSemester(selectedEntry.semester.toString());
      setSelectedSpecialization(''); // Reset specialization when entry changes
      setStudents([]); // Clear students list
    }
  }, [selectedEntry]);

  // Add this function to check attendance status
  const checkAttendanceStatus = async (entries: TimeTableEntry[]) => {
    const date = new Date().toISOString().split('T')[0];
    
    try {
      const entriesWithStatus = await Promise.all(
        entries.map(async (entry) => {
          try {
            const response = await fetch(
              getApiUrl(`/attendance/check?date=${date}&subject=${encodeURIComponent(entry.subject)}&type=${encodeURIComponent(entry.type)}`)
            );
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail || 'Failed to check attendance status');
            }
            
            const data = await response.json();
            return {
              ...entry,
              isAttendanceTaken: data.exists
            };
          } catch (error) {
            console.error(`Error checking attendance for ${entry.subject}:`, error);
            toast({
              title: 'Warning',
              description: `Could not verify attendance status for ${entry.subject}`,
              variant: 'destructive',
            });
            return {
              ...entry,
              isAttendanceTaken: false
            };
          }
        })
      );
      setTimetableEntries(entriesWithStatus);
    } catch (error) {
      console.error('Error checking attendance status:', error);
      toast({
        title: 'Error',
        description: 'Failed to check attendance status for some subjects',
        variant: 'destructive',
      });
    }
  };

  // Add this function to handle QR scan success
  const handleQRScanSuccess = async (scanData: { studentId: number; name: string; registration_number: string }) => {
    try {
      // Find the student in the list
      const student = students.find(s => s.studentId === scanData.studentId);
      
      if (!student) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Student not found in the current class list.",
        });
        return;
      }

      // Mark the student as present
      await markAttendance(scanData.studentId, 'present');

      // Update the local state to show the checkbox as checked
    setStudents(prevStudents => 
        prevStudents.map(s =>
          s.studentId === scanData.studentId
            ? { ...s, isPresent: true }
            : s
      )
    );

      toast({
        title: "Success",
        description: `Attendance marked for ${student.name}`,
      });
    } catch (error) {
      console.error('Error processing QR scan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
      });
    }
  };

  // Clean up polling interval
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Attendance</h1>
          <p className="text-gray-600">Mark and manage student attendance</p>
        </div>

        {/* Today's Classes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Today's Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timetableEntries.map((entry) => (
                <Card 
                  key={entry.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedEntry?.id === entry.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{entry.subject}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {entry.type}
                        </span>
                        {entry.isAttendanceTaken && (
                          <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            Taken
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {entry.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {entry.day}
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      Room: {entry.room}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* QR Mode Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            variant={isQRMode ? "secondary" : "default"}
            onClick={() => setIsQRMode(!isQRMode)}
          >
            <QrCode className="w-4 h-4 mr-2" />
            {isQRMode ? 'Manual Mode' : 'QR Mode'}
          </Button>
        </div>

        {/* Filters and Student List */}
        {selectedEntry && (
          <Card>
            <CardHeader className="flex flex-col gap-6">
              {/* Subject Details Card */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium opacity-75">Subject</h3>
                    <p className="text-lg font-semibold">{selectedEntry.subject}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium opacity-75">Branch</h3>
                    <p className="text-lg font-semibold">{selectedEntry.branch}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium opacity-75">Semester</h3>
                    <p className="text-lg font-semibold">{selectedEntry.semester}</p>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Select 
                  value={selectedBranch} 
                  onValueChange={setSelectedBranch}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.value} value={branch.value}>
                        {branch.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={selectedSemester} 
                  onValueChange={setSelectedSemester}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
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
                  value={selectedSpecialization} 
                  onValueChange={setSelectedSpecialization}
                  disabled={!selectedBranch || !selectedSemester || loadingSpecializations}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingSpecializations ? "Loading..." : "Select Specialization"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingSpecializations ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : specializations.length > 0 ? (
                      specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        No specializations found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmitAttendance}
                    disabled={submitting || students.length === 0}
                    className="flex-1 h-10 bg-[#12141C] hover:bg-[#1D2029] text-white"
                  >
                    {submitting ? 'Submitting...' : 'Submit Attendance'}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {isQRMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <QRAttendanceGenerator
                      classInfo={{
                        subject: selectedEntry.subject,
                        branch: selectedEntry.branch,
                        semester: selectedEntry.semester,
                        date: date,
                        type: selectedEntry.type
                      }}
                      onStudentScan={handleQRScanSuccess}
                      showScanner={showQRScanner}
                      onShowScannerChange={setShowQRScanner}
                    />
                  </div>
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Student Attendance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Registration No.</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Present</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {students.map((student) => (
                                <TableRow key={student.studentId}>
                                  <TableCell>{student.registration_number}</TableCell>
                                  <TableCell>{student.name}</TableCell>
                                  <TableCell>
                                    <Checkbox
                                      checked={student.isPresent}
                                      onCheckedChange={() => handleCheckboxChange(student.studentId)}
                                      disabled={isQRMode} // Disable manual checkbox in QR mode
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Registration No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Present</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell>{student.registration_number}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>
                            <Checkbox
                              checked={student.isPresent}
                              onCheckedChange={() => handleCheckboxChange(student.studentId)}
                              disabled={submitting}
                              className={tempScans[student.studentId] ? 'bg-yellow-100' : ''}
                            />
                            {tempScans[student.studentId] && (
                              <span className="ml-2 text-sm text-yellow-600">
                                (Pending submission)
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManageAttendance; 