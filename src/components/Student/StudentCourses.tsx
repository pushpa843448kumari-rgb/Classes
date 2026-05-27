import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Course, Enrollment, User } from '../../types';
import { PlayCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface StudentCoursesProps {
  user: User;
  onNavigateToCourse: (courseId: string) => void;
  showEnrolledOnly?: boolean;
}

export function StudentCourses({ user, onNavigateToCourse, showEnrolledOnly = false }: StudentCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    // Listen to all courses
    const qCourses = query(collection(db, 'courses'));
    const unSubCourses = onSnapshot(qCourses, (snapshot) => {
      setCourses(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
    });

    // Listen to user's enrollments
    const qEnrollments = query(collection(db, 'enrollments'), where('studentId', '==', user.id));
    const unSubEnrollments = onSnapshot(qEnrollments, (snapshot) => {
      setEnrollments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Enrollment)));
    });

    return () => {
      unSubCourses();
      unSubEnrollments();
    };
  }, [user.id]);

  const handleEnroll = async (courseId: string) => {
    try {
      await addDoc(collection(db, 'enrollments'), {
        courseId,
        studentId: user.id,
        enrolledAt: serverTimestamp()
      });
    } catch (e) {
      console.error(e);
      alert("Error enrolling");
    }
  };

  const displayCourses = showEnrolledOnly 
    ? courses.filter(c => enrollments.some(e => e.courseId === c.id))
    : courses;

  return (
    <div className="space-y-4 max-w-full mx-auto font-sans">
      <div className="px-1">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          {showEnrolledOnly ? 'My Learning' : 'Explore Courses'}
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          {showEnrolledOnly ? 'Continue where you left off.' : 'Discover new educational programs and skills.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayCourses.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 border-dashed">
            No courses found.
          </div>
        )}
        
        {displayCourses.map(course => {
          const isEnrolled = enrollments.some(e => e.courseId === course.id);
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="h-40 bg-slate-50 border-b border-slate-100 p-6 flex flex-col justify-end">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest rounded-full w-max mb-3">
                  {course.category}
                </span>
                <h3 className="text-xl font-bold text-slate-800 line-clamp-2">{course.title}</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-slate-600 text-sm flex-1 line-clamp-3 mb-6">
                  {course.description || 'No description available for this course.'}
                </p>
                
                {isEnrolled ? (
                  <button
                    onClick={() => onNavigateToCourse(course.id)}
                    className="w-full bg-indigo-50 text-indigo-700 py-2.5 rounded-xl font-bold flex justify-center items-center space-x-2 hover:bg-indigo-100 transition"
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span>Watch Lectures</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                  >
                    <span>Enroll Now</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
