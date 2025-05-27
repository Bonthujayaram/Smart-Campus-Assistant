
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, MapPin } from 'lucide-react';

const Timetable = () => {
  const [selectedDay, setSelectedDay] = useState('all');
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const mockTimetable = [
    { day: 'Monday', time: '9:00-10:00', subject: 'Database Management', faculty: 'Dr. Smith', room: 'CS-101', type: 'Lecture' },
    { day: 'Monday', time: '10:00-11:00', subject: 'Software Engineering', faculty: 'Prof. Johnson', room: 'CS-102', type: 'Lecture' },
    { day: 'Monday', time: '11:30-12:30', subject: 'Database Lab', faculty: 'Dr. Smith', room: 'CS-Lab1', type: 'Lab' },
    { day: 'Tuesday', time: '9:00-10:00', subject: 'Computer Networks', faculty: 'Dr. Brown', room: 'CS-103', type: 'Lecture' },
    { day: 'Tuesday', time: '10:00-11:00', subject: 'Machine Learning', faculty: 'Prof. Davis', room: 'CS-104', type: 'Lecture' },
    { day: 'Tuesday', time: '2:00-5:00', subject: 'ML Lab', faculty: 'Prof. Davis', room: 'CS-Lab2', type: 'Lab' },
    { day: 'Wednesday', time: '9:00-10:00', subject: 'Operating Systems', faculty: 'Dr. Wilson', room: 'CS-105', type: 'Lecture' },
    { day: 'Wednesday', time: '10:00-11:00', subject: 'Compiler Design', faculty: 'Prof. Taylor', room: 'CS-106', type: 'Lecture' },
    { day: 'Wednesday', time: '11:30-12:30', subject: 'OS Lab', faculty: 'Dr. Wilson', room: 'CS-Lab3', type: 'Lab' },
    { day: 'Thursday', time: '9:00-10:00', subject: 'Web Technology', faculty: 'Prof. Anderson', room: 'CS-107', type: 'Lecture' },
    { day: 'Thursday', time: '10:00-11:00', subject: 'Data Structures', faculty: 'Dr. White', room: 'CS-108', type: 'Lecture' },
    { day: 'Thursday', time: '2:00-5:00', subject: 'Web Development Lab', faculty: 'Prof. Anderson', room: 'CS-Lab4', type: 'Lab' },
    { day: 'Friday', time: '9:00-10:00', subject: 'Algorithm Analysis', faculty: 'Dr. Martin', room: 'CS-109', type: 'Lecture' },
    { day: 'Friday', time: '10:00-11:00', subject: 'Software Testing', faculty: 'Prof. Lee', room: 'CS-110', type: 'Lecture' },
    { day: 'Saturday', time: '9:00-12:00', subject: 'Project Work', faculty: 'Multiple', room: 'CS-Lab5', type: 'Project' },
  ];

  const filteredTimetable = selectedDay === 'all' 
    ? mockTimetable 
    : mockTimetable.filter(slot => slot.day === selectedDay);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Lecture': return 'bg-blue-100 text-blue-800';
      case 'Lab': return 'bg-green-100 text-green-800';
      case 'Project': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentDay = () => {
    const today = new Date().getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[today];
  };

  const isToday = (day: string) => day === getCurrentDay();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Class Timetable</h1>
          <p className="text-gray-600">View your weekly class schedule and important details</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              {days.map((day) => (
                <SelectItem key={day} value={day}>
                  {day} {isToday(day) && '(Today)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'week' ? 'default' : 'outline'}
              onClick={() => setViewMode('week')}
            >
              Week View
            </Button>
            <Button 
              variant={viewMode === 'day' ? 'default' : 'outline'}
              onClick={() => setViewMode('day')}
            >
              Day View
            </Button>
          </div>
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="grid gap-6">
            {days.map((day) => {
              const dayClasses = mockTimetable.filter(slot => slot.day === day);
              return (
                <Card key={day} className={`${isToday(day) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {day}
                        {isToday(day) && <Badge className="bg-blue-500">Today</Badge>}
                      </span>
                      <span className="text-sm text-gray-500">{dayClasses.length} classes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dayClasses.length > 0 ? (
                      <div className="grid gap-3">
                        {dayClasses.map((slot, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge className={getTypeColor(slot.type)}>
                                  {slot.type}
                                </Badge>
                                <span className="font-semibold text-gray-900">{slot.subject}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {slot.time}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {slot.faculty}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {slot.room}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No classes scheduled</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Day View / Filtered View */}
        {(viewMode === 'day' || selectedDay !== 'all') && (
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDay === 'all' ? 'All Classes' : `${selectedDay} Classes`}
                {selectedDay !== 'all' && isToday(selectedDay) && (
                  <Badge className="ml-2 bg-blue-500">Today</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTimetable.length > 0 ? (
                <div className="grid gap-4">
                  {filteredTimetable.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getTypeColor(slot.type)}>
                            {slot.type}
                          </Badge>
                          <span className="font-semibold text-gray-900">{slot.subject}</span>
                          {selectedDay === 'all' && (
                            <Badge variant="outline">{slot.day}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {slot.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {slot.faculty}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {slot.room}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No classes found for the selected filter</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{mockTimetable.filter(s => s.type === 'Lecture').length}</p>
                <p className="text-gray-600">Total Lectures</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{mockTimetable.filter(s => s.type === 'Lab').length}</p>
                <p className="text-gray-600">Lab Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{mockTimetable.filter(s => s.type === 'Project').length}</p>
                <p className="text-gray-600">Project Hours</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
