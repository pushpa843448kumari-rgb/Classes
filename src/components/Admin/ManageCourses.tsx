import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Course } from '../../types';
import { Plus, Pencil, Trash2, Search, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ManageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', category: '' });

  useEffect(() => {
    const q = query(collection(db, 'courses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setCourses(coursesData);
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.category) return;
    
    try {
      await addDoc(collection(db, 'courses'), {
        title: newCourse.title,
        description: newCourse.description,
        category: newCourse.category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsCreating(false);
      setNewCourse({ title: '', description: '', category: '' });
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Failed to create course. Ensure you are an admin.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await deleteDoc(doc(db, 'courses', id));
    }
  };

  return (
    <div className="space-y-4 max-w-full mx-auto font-sans">
      <div className="flex justify-between items-start bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex-col gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 p-2.5 rounded-xl">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Courses</h1>
            <p className="text-slate-500 text-xs mt-0.5">Manage educational programs.</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 text-white w-full py-2.5 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2 hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold text-sm">New Course</span>
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreate} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-4 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Create New Course</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Course Title"
                  required
                  value={newCourse.title}
                  onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Category (e.g., Coding)"
                  required
                  value={newCourse.category}
                  onChange={e => setNewCourse({ ...newCourse, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <textarea
                placeholder="Course Description"
                rows={3}
                value={newCourse.description}
                onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold text-sm rounded-xl transition flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-md flex-1"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {courses.map(course => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
          >
            <div className="bg-slate-50 p-6 flex flex-col justify-end border-b border-slate-100">
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest rounded-full w-max mb-2">
                {course.category}
              </span>
              <h3 className="text-lg font-bold text-slate-800 truncate">{course.title}</h3>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <p className="text-slate-500 text-sm line-clamp-2 min-h-[2.5rem] flex-1">
                {course.description || 'No description provided.'}
              </p>
              <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  ID: {course.id.slice(0, 8)}
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleDelete(course.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-rose-50 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
