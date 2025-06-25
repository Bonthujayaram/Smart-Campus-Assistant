import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Camera } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError }) => {
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [studentId, setStudentId] = useState('');
  const { user } = useAuth();
  const [scanner, setScanner] = useState<any>(null);

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const handleError = (err: string) => {
    setError(err);
    if (onError) onError(err);
    setIsScanning(false);
  };

  const startScanning = () => {
    const currentStudentId = user?.studentId || studentId;
    if (!currentStudentId) {
      handleError('Please enter a Student ID');
      return;
    }

    try {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
          showTorchButtonIfSupported: true,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          videoConstraints: {
            facingMode: { ideal: "environment" }
          }
        },
        false
      );

      html5QrcodeScanner.render((decodedText) => {
        try {
          // Parse the QR data
          const qrData = JSON.parse(decodedText);
          
          // Add student ID to the QR data
          const scanData = {
            ...qrData,
            studentId: parseInt(currentStudentId.toString(), 10)
          };

          // Call the onScan callback with the enhanced data
          onScan(JSON.stringify(scanData));
          
          // Stop scanning after successful scan
          if (scanner) {
            scanner.clear();
          }
      setIsScanning(false);
        } catch (error) {
          handleError('Invalid QR code format');
        }
      }, (errorMessage) => {
        // Ignore the frequent QR scan errors
        if (!errorMessage.includes("No QR code found")) {
          console.error('QR Scan error:', errorMessage);
          if (errorMessage.includes("NotAllowedError")) {
            handleError('Camera access denied. Please check your camera permissions.');
          } else if (errorMessage.includes("NotFoundError")) {
            handleError('No camera found. Please ensure your device has a working camera.');
          } else if (errorMessage.includes("NotReadableError")) {
            handleError('Camera is in use by another application.');
          } else if (!errorMessage.includes("No QR code found")) {
            handleError(errorMessage);
          }
        }
      });

      setScanner(html5QrcodeScanner);
      setIsScanning(true);
    } catch (err) {
      handleError('Failed to start camera. Please check camera permissions.');
    }
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setIsScanning(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!user?.studentId && (
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Enter Student ID"
              value={studentId}
              onChange={(e) => {
                // Only allow numbers
                const value = e.target.value.replace(/[^0-9]/g, '');
                setStudentId(value);
              }}
              className="mb-2"
            />
          </div>
        )}

        <div className="space-y-4">
          <div id="qr-reader" className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden"></div>

          <Button 
            className="w-full" 
            onClick={() => {
              if (isScanning) {
                stopScanning();
              } else {
                startScanning();
              }
            }}
            variant={isScanning ? "destructive" : "default"}
          >
            {isScanning ? 'Stop Camera' : 'Start Camera'}
          </Button>
          
          {isScanning && (
            <p className="text-center text-sm text-gray-500">
              Position the QR code within the camera view
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRScanner; 