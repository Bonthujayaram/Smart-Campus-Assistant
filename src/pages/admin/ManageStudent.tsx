import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { getApiUrl } from '../../utils/api';

interface StudentForm {
  studentId: string;
  name: string;
  email: string;
  registration_number: string;
  semester: string;
  branch: string;
  specialization: string;
  starting_year: string;
  passout_year: string;
}

interface Student extends StudentForm {
  id?: number;
}

const branches = [
  'Computer Science',
  'Information Technology',
  'Electronics and Communication',
  'Mechanical Engineering'
];

const specializations = [
  'AIML',
  'Data Science',
  'ECE',
  'Cyber Security',
  'CN'
];

const ManageStudent = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editStudentId, setEditStudentId] = useState<number | null>(null);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  const totalPages = Math.ceil(students.length / studentsPerPage);
  const paginatedStudents = students.slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage);
  const form = useForm<StudentForm>({
    mode: 'onBlur',
    defaultValues: {
      studentId: '',
      name: '',
      email: '',
      registration_number: '',
      semester: '',
      branch: '',
      specialization: '',
      starting_year: '',
      passout_year: '',
    },
  });

  const fetchStudents = async () => {
    try {
      const res = await fetch(getApiUrl("/students"), {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (e) {
      setStatus("Failed to fetch students");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const onSubmit = async (data: StudentForm) => {
    setStatus(null);
    if (editStudentId !== null) {
      // Edit mode
      try {
        const response = await fetch(getApiUrl(`/students/${editStudentId}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            registration_number: data.registration_number,
            semester: Number(data.semester),
            branch: data.branch,
            specialization: data.specialization,
            starting_year: Number(data.starting_year),
            passout_year: Number(data.passout_year),
          }),
        });
        if (response.ok) {
          setStatus("Student updated successfully!");
          form.reset();
          setShowForm(false);
          setEditStudentId(null);
          fetchStudents();
        } else {
          const err = await response.json();
          setStatus(err.detail || "Failed to update student.");
        }
      } catch (error) {
        setStatus("Network error. Please try again.");
      }
    } else {
      // Add mode
      try {
        const response = await fetch(getApiUrl("/students"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        });
        if (response.ok) {
          setStatus("Student added successfully!");
          form.reset();
          setShowForm(false);
          fetchStudents();
        } else {
          const err = await response.json();
          setStatus(err.detail || "Failed to add student.");
        }
      } catch (error) {
        setStatus("Network error. Please try again.");
      }
    }
  };

  const handleEdit = (student: Student) => {
    setShowForm(true);
    setEditStudentId(Number(student.studentId));
    form.reset({
      studentId: String(student.studentId),
      name: student.name,
      email: student.email,
      registration_number: student.registration_number,
      semester: String(student.semester),
      branch: student.branch,
      specialization: student.specialization,
      starting_year: String(student.starting_year),
      passout_year: String(student.passout_year),
    });
  };

  const handleDelete = async (studentId: number) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const response = await fetch(getApiUrl(`/students/${studentId}`), {
        method: "DELETE",
        credentials: "include"
      });
      if (response.ok) {
        setStatus("Student deleted successfully!");
        fetchStudents();
      } else {
        const err = await response.json();
        setStatus(err.detail || "Failed to delete student.");
      }
    } catch (error) {
      setStatus("Network error. Please try again.");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCSVUpload({ target: { files: e.dataTransfer.files } } as any);
      setCsvDialogOpen(false);
    }
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleCSVUpload(event);
    setCsvDialogOpen(false);
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const studentsToAdd = results.data as StudentForm[];
        for (const student of studentsToAdd) {
          // Optionally validate student fields here
          await fetch(getApiUrl("/students"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(student),
          });
        }
        setStatus("CSV upload complete!");
        fetchStudents();
      },
      error: () => setStatus("Failed to parse CSV file."),
    });
  };

  const handleCSVDownload = async () => {
    try {
      const res = await fetch(getApiUrl("/students"), {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      const allStudents = await res.json();
      const csv = Papa.unparse(allStudents);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "students.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setStatus("Failed to download students CSV.");
    }
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => Number(student.studentId)));
    }
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedStudents.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedStudents.length} selected students?`)) return;
    try {
      setIsDeleting(true);
      // Adjust the endpoint as needed for your backend
      const response = await fetch(getApiUrl("/students/bulk-delete"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: selectedStudents }),
      });
      if (response.ok) {
        setStatus("Selected students deleted successfully!");
        setSelectedStudents([]);
        fetchStudents();
      } else {
        const err = await response.json();
        setStatus(err.detail || "Failed to delete selected students.");
      }
    } catch (error) {
      setStatus("Network error. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <div className="w-full max-w-7xl bg-white rounded-lg shadow p-8 border-4 border-blue-700">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-blue-700">Manage Students</h1>
          <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => { setShowForm(true); setEditStudentId(null); form.reset(); }} 
              className="bg-blue-700 text-white col-span-2 sm:col-span-1"
            >
              Add Student
            </Button>
            <Button 
              onClick={handleCSVDownload} 
              className="bg-green-600 text-white"
            >
              Download CSV
            </Button>
            <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-yellow-500 text-white">Upload CSV</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Students via CSV</DialogTitle>
                </DialogHeader>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  style={{ minHeight: 120 }}
                >
                  <p className="mb-2">Drag and drop your CSV file here, or</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csvFileInput"
                  />
                  <label htmlFor="csvFileInput" className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">Select File</label>
                </div>
                <DialogClose asChild>
                  <Button variant="outline" className="mt-4 w-full">Cancel</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
            <Button 
              onClick={handleBulkDelete} 
              className="bg-red-600 text-white" 
              disabled={isDeleting || !selectedStudents.length}
            >
              {isDeleting ? "Deleting..." : `Delete (${selectedStudents.length})`}
            </Button>
          </div>
        </div>
        {showForm && (
          <div className="mb-8 border p-4 rounded-lg bg-gray-50">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="studentId" control={form.control} rules={{ required: 'Student ID is required' }} render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl><Input {...field} disabled={editStudentId !== null} /></FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )} />
                  <FormField name="name" control={form.control} rules={{ required: 'Name is required' }} render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )} />
                  <FormField name="email" control={form.control} rules={{ required: 'Email is required', pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Please enter a valid email' } }} render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )} />
                  <FormField name="registration_number" control={form.control} rules={{ required: 'Registration Number is required' }} render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )} />
                  <FormField name="semester" control={form.control} rules={{ required: 'Semester is required' }} render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <SelectItem key={sem} value={sem.toString()}>
                              Semester {sem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )} />
                  <FormField name="branch" control={form.control} rules={{ required: 'Branch is required' }} render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )} />
                  <FormField name="specialization" control={form.control} rules={{ required: 'Specialization is required' }} render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {specializations.map((spec) => (
                            <SelectItem key={spec} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )} />
                  <FormField name="starting_year" control={form.control} rules={{ required: 'Starting Year is required', pattern: { value: /^\d{4}$/, message: 'Enter a valid year' } }} render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Starting Year</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )} />
                  <FormField name="passout_year" control={form.control} rules={{ required: 'Passout Year is required', pattern: { value: /^\d{4}$/, message: 'Enter a valid year' } }} render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Passout Year</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-blue-700 text-white">{editStudentId !== null ? 'Update' : 'Submit'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditStudentId(null); form.reset(); }}>Cancel</Button>
                </div>
              </form>
            </Form>
            {status && <div className="mt-4 text-center text-sm text-blue-600">{status}</div>}
          </div>
        )}
        <div className="overflow-x-auto w-full">
          <table className="min-w-full w-full border-separate border-2 border-blue-700 rounded-lg text-sm md:text-base">
            <thead className="bg-gray-100">
              <tr className="font-bold text-xs md:text-sm">
                <th className="border px-2 md:px-4 py-2 min-w-[50px] font-bold"> 
                  <input type="checkbox" checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0} onChange={toggleSelectAll} />
                </th>
                <th className="border px-2 md:px-4 py-2 min-w-[60px] font-bold">ID</th>
                <th className="border px-2 md:px-4 py-2 min-w-[100px] font-bold">Student ID</th>
                <th className="border px-2 md:px-4 py-2 min-w-[180px] font-bold text-left">Name</th>
                <th className="border px-2 md:px-4 py-2 min-w-[340px] font-bold text-left">Email</th>
                <th className="border px-2 md:px-4 py-2 min-w-[320px] font-bold text-left">Registration Number</th>
                <th className="border px-2 md:px-4 py-2 min-w-[120px] font-bold">Semester</th>
                <th className="border px-2 md:px-4 py-2 min-w-[120px] font-bold">Branch</th>
                <th className="border px-2 md:px-4 py-2 min-w-[160px] font-bold">Specialization</th>
                <th className="border px-2 md:px-4 py-2 min-w-[140px] font-bold">Starting Year</th>
                <th className="border px-2 md:px-4 py-2 min-w-[140px] font-bold">Passout Year</th>
                <th className="border px-2 md:px-4 py-2 min-w-[140px] font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length === 0 ? (
                <tr><td colSpan={12} className="text-center py-4">No students found.</td></tr>
              ) : (
                paginatedStudents.map((student, idx) => (
                  <tr key={student.studentId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border px-2 md:px-4 py-2 text-center whitespace-normal">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(Number(student.studentId))}
                        onChange={() => toggleStudentSelection(Number(student.studentId))}
                        aria-label={`Select student ${student.name}`}
                      />
                    </td>
                    <td className="border px-2 md:px-4 py-2 text-center whitespace-normal">{(currentPage - 1) * studentsPerPage + idx + 1}</td>
                    <td className="border px-2 md:px-4 py-2 text-center whitespace-normal">{student.studentId}</td>
                    <td className="border px-2 md:px-4 py-2 text-left whitespace-normal">{student.name}</td>
                    <td className="border px-2 md:px-4 py-2 text-left whitespace-normal">{student.email}</td>
                    <td className="border px-2 md:px-4 py-2 text-left whitespace-normal">{student.registration_number}</td>
                    <td className="border px-2 md:px-4 py-2 text-center whitespace-normal">{student.semester}</td>
                    <td className="border px-2 md:px-4 py-2 text-center whitespace-normal">{student.branch}</td>
                    <td className="border px-2 md:px-4 py-2 text-center whitespace-normal">{student.specialization}</td>
                    <td className="border px-2 md:px-4 py-2 text-center whitespace-normal">{student.starting_year}</td>
                    <td className="border px-2 md:px-4 py-2 text-center whitespace-normal">{student.passout_year}</td>
                    <td className="border px-2 md:px-4 py-2 text-center whitespace-normal">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(student)} className="mr-2">Edit</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default ManageStudent; 
