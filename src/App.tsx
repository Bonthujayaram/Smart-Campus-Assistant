import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

// Auth Pages
import Login from "./pages/Login";
// import Register from "./pages/Register";

// Student Pages
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Profile from "./pages/Profile";
import Timetable from "./pages/Timetable";
import Syllabus from "./pages/Syllabus";
import Assignments from "./pages/Assignments";
import Notifications from "./pages/Notifications";
import Contact from "./pages/Contact";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageTimetables from "./pages/admin/ManageTimetables";
import ManageSyllabus from "./pages/admin/ManageSyllabus";
import ManageNotifications from "./pages/admin/ManageNotifications";
import ViewAttendance from "./pages/admin/ViewAttendance";
import StudentReports from "./pages/admin/StudentReports";
import ManageStudent from "./pages/admin/ManageStudent";
import ManageFaculty from "./pages/admin/ManageFaculty";

// Faculty Pages
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyManageAssignments from "./pages/faculty/ManageAssignments";
import FacultyManageAttendance from "./pages/faculty/ManageAttendance";
import FacultyEvaluations from "./pages/faculty/Evaluations";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getDefaultRedirect = (user: any) => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'faculty':
        return '/faculty';
      default:
        return '/dashboard';
    }
  };

  return (
    <>
      {user && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to={getDefaultRedirect(user)} replace />} 
        />
        {/* <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />} /> */}
        
        {/* Student Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="student">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute requiredRole="student">
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/timetable" element={
          <ProtectedRoute requiredRole="student">
            <Timetable />
          </ProtectedRoute>
        } />
        <Route path="/syllabus" element={
          <ProtectedRoute requiredRole="student">
            <Syllabus />
          </ProtectedRoute>
        } />
        <Route path="/assignments" element={
          <ProtectedRoute requiredRole="student">
            <Assignments />
          </ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute requiredRole="student">
            <Attendance />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute requiredRole="student">
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/contact" element={
          <ProtectedRoute requiredRole="student">
            <Contact />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/timetables" element={
          <ProtectedRoute requiredRole="admin">
            <ManageTimetables />
          </ProtectedRoute>
        } />
        <Route path="/admin/syllabus" element={
          <ProtectedRoute requiredRole="admin">
            <ManageSyllabus />
          </ProtectedRoute>
        } />
        <Route path="/admin/notifications" element={
          <ProtectedRoute requiredRole="admin">
            <ManageNotifications />
          </ProtectedRoute>
        } />
        <Route path="/admin/attendance" element={
          <ProtectedRoute requiredRole="admin">
            <ViewAttendance />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute requiredRole="admin">
            <StudentReports />
          </ProtectedRoute>
        } />
        <Route path="/admin/students" element={
          <ProtectedRoute requiredRole="admin">
            <ManageStudent />
          </ProtectedRoute>
        } />
        <Route path="/admin/faculty" element={
          <ProtectedRoute requiredRole="admin">
            <ManageFaculty />
          </ProtectedRoute>
        } />

        {/* Faculty Routes */}
        <Route path="/faculty" element={
          <ProtectedRoute requiredRole="faculty">
            <FacultyDashboard />
          </ProtectedRoute>
        } />
        <Route path="/faculty/assignments" element={
          <ProtectedRoute requiredRole="faculty">
            <FacultyManageAssignments />
          </ProtectedRoute>
        } />
        <Route path="/faculty/attendance" element={
          <ProtectedRoute requiredRole="faculty">
            <FacultyManageAttendance />
          </ProtectedRoute>
        } />
        <Route path="/faculty/evaluations" element={
          <ProtectedRoute requiredRole="faculty">
            <FacultyEvaluations />
          </ProtectedRoute>
        } />
        <Route path="/faculty/notifications" element={
          <ProtectedRoute requiredRole="faculty">
            <Notifications />
          </ProtectedRoute>
        } />

        {/* Default Routes */}
        <Route path="/" element={
          user ? (
            <Navigate to={getDefaultRedirect(user)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
