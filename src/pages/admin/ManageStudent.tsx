import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

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

const ManageStudent = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editStudentId, setEditStudentId] = useState<number | null>(null);
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
      const res = await fetch("https://smart-campus-backend-5ouw.onrender.com/students");
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
        const response = await fetch(`http://127.0.0.1:8000/students/${editStudentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
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
        const response = await fetch("http://127.0.0.1:8000/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      const response = await fetch(`http://127.0.0.1:8000/students/${studentId}`, { method: "DELETE" });
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Manage Students</h1>
          <Button onClick={() => { setShowForm(true); setEditStudentId(null); form.reset(); }} className="bg-blue-700 text-white">Add Student</Button>
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
                  <FormField name="semester" control={form.control} rules={{ required: 'Semester is required', pattern: { value: /^\d+$/, message: 'Semester must be a number' } }} render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )} />
                  <FormField name="branch" control={form.control} rules={{ required: 'Branch is required' }} render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )} />
                  <FormField name="specialization" control={form.control} rules={{ required: 'Specialization is required' }} render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
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
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Student ID</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Registration Number</th>
                <th className="border px-4 py-2">Semester</th>
                <th className="border px-4 py-2">Branch</th>
                <th className="border px-4 py-2">Specialization</th>
                <th className="border px-4 py-2">Starting Year</th>
                <th className="border px-4 py-2">Passout Year</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-4">No students found.</td></tr>
              ) : (
                students.map((student, idx) => (
                  <tr key={student.studentId}>
                    <td className="border px-4 py-2">{idx + 1}</td>
                    <td className="border px-4 py-2">{student.studentId}</td>
                    <td className="border px-4 py-2">{student.name}</td>
                    <td className="border px-4 py-2">{student.email}</td>
                    <td className="border px-4 py-2">{student.registration_number}</td>
                    <td className="border px-4 py-2">{student.semester}</td>
                    <td className="border px-4 py-2">{student.branch}</td>
                    <td className="border px-4 py-2">{student.specialization}</td>
                    <td className="border px-4 py-2">{student.starting_year}</td>
                    <td className="border px-4 py-2">{student.passout_year}</td>
                    <td className="border px-4 py-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(student)} className="mr-2">Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(Number(student.studentId))}>Delete</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageStudent; 