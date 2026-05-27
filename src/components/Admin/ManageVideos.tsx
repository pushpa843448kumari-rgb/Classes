import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Course, Video } from '../../types';
import { Video as VideoIcon, Plus, Trash2, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ManageVideos() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newVideo, setNewVideo] = useState({ title: '', videoUrl: '', courseId: '' });

  useEffect(() => {
    const qCourses = query(collection(db, 'courses'));
    const unSubCourses = onSnapshot(qCourses, (snapshot) => {
      setCourses(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
    });

    const qVideos = query(collection(db, 'videos'));
    const unSubVideos = onSnapshot(qVideos, (snapshot) => {
      setVideos(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Video)));
    });

    return () => {
      unSubCourses();
      unSubVideos();
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title || !newVideo.videoUrl || !newVideo.courseId) return;
    
    try {
      await addDoc(collection(db, 'videos'), {
        title: newVideo.title,
        videoUrl: newVideo.videoUrl,
        courseId: newVideo.courseId,
        createdAt: serverTimestamp()
      });
      setIsCreating(false);
      setNewVideo({ title: '', videoUrl: '', courseId: '' });
    } catch (error) {
      console.error("Error adding video:", error);
      alert("Failed to add video.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this video lecture?')) {
      await deleteDoc(doc(db, 'videos', id));
    }
  };

  return (
    <div className="space-y-4 max-w-full mx-auto font-sans">
      <div className="flex justify-between items-start bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex-col gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-rose-100 p-2.5 rounded-xl">
            <VideoIcon className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Video Lectures</h1>
            <p className="text-slate-500 text-xs mt-0.5">Upload external video resources.</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 text-white w-full py-2.5 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2 hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold text-sm">Add Lecture</span>
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
              <h3 className="text-sm font-bold text-slate-800">New Video Link</h3>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lecture Title</label>
                  <input
                    type="text"
                    required
                    value={newVideo.title}
                    onChange={e => setNewVideo({ ...newVideo, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Course Selection</label>
                  <select
                    required
                    value={newVideo.courseId}
                    onChange={e => setNewVideo({ ...newVideo, courseId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors bg-white font-medium"
                  >
                    <option value="">Select Course...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5 mt-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Video URL</label>
                <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                  <Link className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    required
                    value={newVideo.videoUrl}
                    onChange={e => setNewVideo({ ...newVideo, videoUrl: e.target.value })}
                    className="w-full bg-transparent border-none focus:ring-0 outline-none text-slate-700 text-sm"
                  />
                </div>
              </div>

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
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 font-bold text-sm flex items-center justify-center gap-2 transition-all flex-1"
                >
                  Publish
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {videos.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed text-sm font-medium">
            No video lectures added yet.
          </div>
        ) : (
          videos.map(video => {
            const course = courses.find(c => c.id === video.courseId);
            return (
              <div key={video.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm line-clamp-2">{video.title}</h4>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded border border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-600 truncate max-w-full">
                      {course?.title || 'Unknown Course'}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(video.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl text-xs">
                  <Link className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <a href={video.videoUrl} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-indigo-600 truncate font-medium">
                    {video.videoUrl}
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
