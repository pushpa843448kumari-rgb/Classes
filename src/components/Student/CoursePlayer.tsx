import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Course, Video } from '../../types';
import { PlayCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface CoursePlayerProps {
  courseId: string;
  onBack: () => void;
}

export function CoursePlayer({ courseId, onBack }: CoursePlayerProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  useEffect(() => {
    // Fetch course details
    const fetchCourse = async () => {
      const docRef = doc(db, 'courses', courseId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setCourse({ id: snap.id, ...snap.data() } as Course);
      }
    };
    fetchCourse();

    // Listen to videos for this course
    const qVideos = query(collection(db, 'videos'), where('courseId', '==', courseId));
    const unSub = onSnapshot(qVideos, (snapshot) => {
      const vids = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Video));
      setVideos(vids);
      if (vids.length > 0 && !activeVideo) {
        setActiveVideo(vids[0]);
      }
    });

    return () => unSub();
  }, [courseId]);

  if (!course) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading course data...</div>;
  }

  // Extract YouTube ID safely for embedding
  const getEmbedUrl = (url: string) => {
    let videoId = '';
    
    // Check for youtube.com/watch?v=
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get('v') || '';
    } 
    // Check for youtu.be/
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url; // fallback to raw string, though might not embed if not youtube
  };


  return (
    <div className="max-w-full mx-auto flex flex-col gap-6 font-sans">
      {/* Main Content */}
      <div className="flex-1 space-y-4">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="bg-black rounded-3xl overflow-hidden aspect-video shadow-lg relative border border-slate-200">
          {activeVideo ? (
            <iframe
              src={getEmbedUrl(activeVideo.videoUrl)}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 font-medium">
              No active video selected.
            </div>
          )}
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{activeVideo?.title || 'No Video Playing'}</h1>
          <p className="text-slate-500 mt-1 font-bold text-[10px] uppercase tracking-widest">{course.title}</p>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mt-4">
          <h3 className="font-bold text-slate-800 text-sm mb-1.5">About this Course</h3>
          <p className="text-slate-600 leading-relaxed max-w-none text-xs">{course.description}</p>
        </div>
      </div>

      {/* Playlist Sidebar */}
      <div className="w-full flex flex-col space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[300px]">
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-800">Course Content</h3>
            <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold">{videos.length} lectures</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {videos.length === 0 ? (
              <p className="text-center text-slate-400 p-4 text-sm font-medium">No videos uploaded yet.</p>
            ) : (
              videos.map((video, index) => {
                const isActive = activeVideo?.id === video.id;
                return (
                  <button
                    key={video.id}
                    onClick={() => setActiveVideo(video)}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-start space-x-3 transition-colors border ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm' 
                        : 'hover:bg-slate-50 text-slate-700 border-transparent'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isActive ? (
                        <PlayCircle className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {video.title}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
