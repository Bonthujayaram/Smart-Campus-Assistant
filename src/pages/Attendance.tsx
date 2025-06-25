import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Clock, Camera, QrCode } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { getApiUrl } from '../utils/api';
import { useToast } from '@/components/ui/use-toast';

const Attendance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('current');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [student, setStudent] = useState<any>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [qrHistory, setQrHistory] = useState<any[]>([]);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'success' | 'failed' | null>(null);

  useEffect(() => {
    if (!user?.studentId) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get student details
        const studentRes = await fetch(getApiUrl(`/students/${user.studentId}`));
        if (!studentRes.ok) throw new Error('Failed to fetch student details');
        const studentData = await studentRes.json();
        setStudent(studentData);

        // Get attendance summary
        const attendanceRes = await fetch(getApiUrl(`/attendance/student-summary?branch=${studentData.branch}&semester=${studentData.semester}&specialization=${studentData.specialization || ''}`));
        if (!attendanceRes.ok) throw new Error('Failed to fetch attendance summary');
        const attendanceData = await attendanceRes.json();
        
        // Find this student's attendance
        const studentAttendance = attendanceData.find((s: any) => s.studentId === user.studentId);
        setAttendanceSummary(studentAttendance);

        // Get subjects from syllabus
        const syllabusRes = await fetch(getApiUrl(`/syllabus?branch=${studentData.branch}&semester=${studentData.semester}`));
        if (!syllabusRes.ok) throw new Error('Failed to fetch syllabus');
        const syllabusData = await syllabusRes.json();
        setSubjects(syllabusData);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.studentId]);

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  function AttendanceScanner({ onScan }) {
    const [error, setError] = useState(null);

    const handleScan = (err: unknown, result: any) => {
      if (err) {
        setError(err instanceof Error ? err.message : 'Camera error');
        return;
      }

      if (result?.text) {
        onScan(result.text);
      }
    };

    return (
      <div style={{ width: '100%' }}>
        <BarcodeScannerComponent
          width="100%"
          height="100%"
          onUpdate={handleScan}
          facingMode="environment"
          torch={false}
          delay={500}
        />
        {error && (
          <div style={{ color: 'red', marginTop: 8 }}>
            Camera error: {error}<br />
            <span>
              - Make sure you allowed camera access.<br />
              - Try a different browser.<br />
              - If on a laptop/desktop, ensure your webcam is working.
            </span>
          </div>
        )}
      </div>
    );
  }

  const handleQRScan = async (qrData: string) => {
    try {
      // Check if user and studentId are available
      if (!user || !user.studentId) {
        setScanStatus('failed');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please log in again to mark attendance",
        });
        return;
      }

      // Parse and validate QR data
      let parsedQRData;
      try {
        parsedQRData = JSON.parse(qrData);
        console.log("Parsed QR data:", parsedQRData); // Debug log
        
        // Validate all required fields
        const requiredFields = ['subject', 'branch', 'semester', 'date', 'type', 'timestamp'];
        const missingFields = requiredFields.filter(field => !parsedQRData[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Invalid QR code: Missing ${missingFields.join(', ')}`);
        }

        // Validate QR code type
        if (parsedQRData.type !== 'faculty-generated') {
          throw new Error('Invalid QR code type');
        }

        // Validate timestamp (30 seconds expiry)
        const currentTime = Date.now();
        const qrTimestamp = parsedQRData.timestamp;
        if (currentTime - qrTimestamp > 30000) { // 30 seconds
          throw new Error('QR code has expired');
        }
      } catch (e) {
        setScanStatus('failed');
        toast({
          variant: "destructive",
          title: "Error",
          description: e instanceof Error ? e.message : "Invalid QR code format",
        });
        return;
      }

      console.log("Sending data to server:", {
        qrData: JSON.stringify(parsedQRData),
        studentId: user.studentId
      }); // Debug log

      // Make the API call with the parsed QR data
      const response = await fetch(getApiUrl('/attendance/qr-scans'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrData: JSON.stringify(parsedQRData),
          studentId: user.studentId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData); // Debug log
        throw new Error(errorData.detail || errorData.message || 'Failed to mark attendance');
      }

      const data = await response.json();
      setScanStatus('success');
      toast({
        title: 'Success',
        description: data.message || 'Attendance marked successfully',
      });
      
      // Close the scanner
      setScannerOpen(false);
      
      // Refresh attendance data after a short delay
      setTimeout(() => {
      window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error scanning QR code:', error);
      setScanStatus('failed');
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to process QR code',
      });
    }
  };

  // Add a check for user context before showing scanner
  const handleOpenScanner = () => {
    if (!user || !user.studentId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please log in to mark attendance",
      });
      return;
    }
    setScannerOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Tracker</h1>
          <p className="text-gray-600">Monitor your class attendance and QR scan history</p>
        </div>

        {/* QR Scan Instructions */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <QrCode className="w-5 h-5" />
              QR Code Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">How to mark attendance:</h3>
                <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                  <li>Open the Smart Campus mobile app</li>
                  <li>Navigate to QR Scanner</li>
                  <li>Scan the QR code displayed by your faculty</li>
                  <li>Attendance will be automatically recorded</li>
                </ol>
              </div>
              <div className="text-center">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700" 
                  onClick={handleOpenScanner}
                  disabled={!user || !user.studentId}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Open QR Scanner
                </Button>
                {(!user || !user.studentId) && (
                  <p className="text-xs text-red-600 mt-2">Please log in to mark attendance</p>
                )}
                {(user && user.studentId) && (
                  <p className="text-xs text-blue-600 mt-2">Mobile app required</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scanner Modal */}
        {scannerOpen && (
          <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <CardContent className="bg-white p-6 rounded-lg max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Scan QR Code</h3>
                <Button variant="ghost" onClick={() => setScannerOpen(false)}>
                  Close
                </Button>
              </div>
              <AttendanceScanner onScan={handleQRScan} />
            </CardContent>
          </Card>
        )}

        {/* Attendance Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Overall Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading attendance data...</div>
              ) : error ? (
                <div className="text-red-600">{error}</div>
              ) : attendanceSummary ? (
                <div>
                  <div className="mb-4">
                    <div className={`text-4xl font-bold ${getAttendanceColor(attendanceSummary.overallPercentage)}`}>
                      {attendanceSummary.overallPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Attendance</div>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(attendanceSummary.subjects).map(([subject, data]: [string, any]) => (
                      <div key={subject} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{subject}</span>
                          <span className={getAttendanceColor(data.percentage)}>
                            {data.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Present: {data.present}/{data.total}</span>
                          <span>Required: {Math.max(0, Math.ceil(0.75 * data.total) - data.present)}</span>
                        </div>
                        <Progress 
                          value={data.percentage} 
                          className={`h-2 ${getProgressColor(data.percentage)}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>No attendance data found</div>
              )}
            </CardContent>
          </Card>

          {/* Subject Details */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Details</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading subject details...</div>
              ) : error ? (
                <div className="text-red-600">{error}</div>
              ) : subjects.length > 0 ? (
                <div className="space-y-4">
                  {subjects.map((subject: any) => (
                    <div key={subject.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{subject.subject}</h3>
                          <p className="text-sm text-gray-600">Code: {subject.code}</p>
                          <p className="text-sm text-gray-600">Credits: {subject.credits}</p>
                        </div>
                        <Badge variant="outline">{subject.type || 'Theory'}</Badge>
                      </div>
                      {subject.faculty && (
                        <div className="mt-2 text-sm text-gray-600">
                          Faculty: {subject.faculty}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div>No subjects found</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Toast */}
        {scanStatus && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white ${
            scanStatus === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {scanStatus === 'success' ? 'Attendance marked successfully!' : 'Failed to mark attendance.'}
            <button className="ml-4" onClick={() => setScanStatus(null)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
