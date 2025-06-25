import React, { useState } from "react";
import { getApiUrl } from '../utils/api';
import { toast } from '@/hooks/use-toast';

interface Props {
  assignmentId: number;
  studentId: number;
  onSuccess: () => void;
}

const AssignmentSubmitForm: React.FC<Props> = ({ assignmentId, studentId, onSuccess }) => {
  const [mode, setMode] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "file" && !file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    if (mode === "text" && !text.trim()) {
      toast({
        title: "Error",
        description: "Please enter your answer",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("student_id", String(studentId));
      if (mode === "file" && file) formData.append("file", file);
      if (mode === "text") formData.append("text_answer", text);

      const response = await fetch(getApiUrl(`/assignments/${assignmentId}/submit`), {
        method: "POST",
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.detail === "You have already submitted this assignment") {
          toast({
            title: "Error",
            description: "You have already submitted this assignment",
            variant: "destructive",
          });
        } else {
          throw new Error(data.detail || 'Failed to submit assignment');
        }
        return;
      }

      toast({
        title: "Success",
        description: "Assignment submitted successfully",
      });
      
      // Clear form and call onSuccess only after successful submission
      setFile(null);
      setText("");
      onSuccess(); // Call onSuccess after successful submission
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex mb-4">
        <button 
          type="button" 
          className={`flex-1 py-2 rounded-l-lg ${mode === "file" ? "bg-blue-500 text-white" : "bg-gray-200"}`} 
          onClick={() => setMode("file")}
        >
          Upload File
        </button>
        <button 
          type="button" 
          className={`flex-1 py-2 rounded-r-lg ${mode === "text" ? "bg-blue-500 text-white" : "bg-gray-200"}`} 
          onClick={() => setMode("text")}
        >
          Write Answer
        </button>
      </div>
      {mode === "file" ? (
        <div className="mb-4">
          <input 
            type="file" 
            onChange={handleFileChange} 
            className="w-full p-2 border rounded"
            accept=".pdf,.doc,.docx,.txt"
          />
          {file && (
            <p className="text-sm text-gray-600 mt-1">Selected file: {file.name}</p>
          )}
        </div>
      ) : (
        <textarea 
          value={text} 
          onChange={e => setText(e.target.value)} 
          className="w-full h-32 p-2 border rounded mb-4" 
          placeholder="Write your answer here..." 
        />
      )}
      <button 
        type="submit" 
        className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed" 
        disabled={loading || (mode === "file" && !file) || (mode === "text" && !text.trim())}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default AssignmentSubmitForm;
