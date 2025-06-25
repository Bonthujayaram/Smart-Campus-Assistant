import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { getApiUrl } from '@/utils/api';
import { toast } from '@/components/ui/use-toast';
import { RefreshCw, Camera } from 'lucide-react';
import QRScanner from './QRScanner';

interface QRAttendanceGeneratorProps {
  classInfo: {
    subject: string;
    branch: string;
    semester: number;
    date: string;
    type: string;
  };
  onStudentScan: (scanData: { studentId: number; name: string; registration_number: string }) => void;
  showScanner?: boolean;
  onShowScannerChange?: (show: boolean) => void;
}

const QRAttendanceGenerator: React.FC<QRAttendanceGeneratorProps> = ({ 
  classInfo, 
  onStudentScan,
  showScanner = false,
  onShowScannerChange
}) => {
  const [qrData, setQrData] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh QR code every 30 seconds
  useEffect(() => {
    generateQRData(); // Generate initial QR code
    const interval = setInterval(generateQRData, 30000);
    return () => clearInterval(interval);
  }, [classInfo]); // Regenerate when classInfo changes
  
  const setShowScanner = (show: boolean) => {
    if (onShowScannerChange) {
      onShowScannerChange(show);
    }
  };

  const generateQRData = () => {
    const data = {
      ...classInfo,
      timestamp: Date.now(),
      type: classInfo.type,
      sessionId: `${classInfo.subject}_${classInfo.date}_${Date.now()}`,
      // Ensure all required fields are present
      subject: classInfo.subject,
      branch: classInfo.branch,
      semester: classInfo.semester,
      date: classInfo.date,
      // Add a flag to indicate this is a faculty-generated QR code
      isFacultyGenerated: true
    };
    setQrData(JSON.stringify(data));
    setRefreshKey(prev => prev + 1);
  };

  const handleScan = async (data: string) => {
    try {
      // Parse the scanned data
      const scannedData = JSON.parse(data);
      
      // Ensure we have a student ID
      if (!scannedData.studentId) {
        throw new Error('Student ID is required');
      }

      const requestData = {
        qrData: JSON.stringify({
          ...scannedData,
          timestamp: Date.now() // Update timestamp for validation
        }),
        studentId: parseInt(scannedData.studentId.toString(), 10)
      };

      const response = await fetch(getApiUrl('/attendance/qr-scans'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.newScans && result.newScans.length > 0) {
          result.newScans.forEach((scan: { studentId: number; name: string; registration_number: string }) => {
            onStudentScan(scan);
          });
          toast({
            title: "Success",
            description: "Attendance marked successfully",
          });
          setShowScanner(false);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process QR scan');
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process QR scan. Please try again.",
      });
    }
  };

  const handleError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Camera Error",
      description: error,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Generator</CardTitle>
      </CardHeader>
      <CardContent>
        {showScanner ? (
          <QRScanner
            onScan={handleScan}
            onError={handleError}
          />
        ) : qrData ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <QRCodeSVG
                key={refreshKey}
                value={qrData}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-center text-sm text-gray-500">
              QR code will refresh automatically every 30 seconds
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default QRAttendanceGenerator; 