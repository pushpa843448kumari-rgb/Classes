import { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { User } from './types';
import { Login } from './components/Login';
import { DashboardLayout } from './components/DashboardLayout';
import { ManageCourses } from './components/Admin/ManageCourses';
import { ManageVideos } from './components/Admin/ManageVideos';
import { StudentCourses } from './components/Student/StudentCourses';
import { CoursePlayer } from './components/Student/CoursePlayer';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({ id: userDoc.id, ...userDoc.data() } as User);
          // Set default tabs based on role
          if (userDoc.data().role === 'admin') {
            setCurrentTab('courses'); // Skip general dashboard for brevity
          } else {
            setCurrentTab('courses'); 
          }
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginStatus={() => {}} />;
  }

  // Deep linking logic for course player
  if (selectedCourseId) {
    // When a course is selected, break out of standard dashboard layout for immersive view
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center font-sans sm:p-4">
        {/* Mobile App Container for Player */}
        <div className="w-full max-w-md bg-[#F5F7FA] sm:rounded-[2.5rem] flex flex-col h-[100dvh] sm:h-[calc(100vh-2rem)] overflow-hidden shadow-2xl relative ring-1 ring-slate-800">
          <div className="flex-1 overflow-y-auto p-4 pb-20 scroll-smooth">
            <CoursePlayer 
              courseId={selectedCourseId} 
              onBack={() => setSelectedCourseId(null)} 
            />
          </div>
        </div>
      </div>
    );
  }

  const renderAdminContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <ManageCourses />;
      case 'courses':
        return <ManageCourses />;
      case 'videos':
        return <ManageVideos />;
      case 'settings':
        return <div className="text-slate-500 text-center py-10 font-bold">Settings config coming...</div>;
      default:
        return <ManageCourses />;
    }
  };

  const renderStudentContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <StudentCourses user={currentUser} onNavigateToCourse={setSelectedCourseId} />;
      case 'courses':
        return <StudentCourses user={currentUser} onNavigateToCourse={setSelectedCourseId} showEnrolledOnly={false}/>;
      case 'enrolled':
        return <StudentCourses user={currentUser} onNavigateToCourse={setSelectedCourseId} showEnrolledOnly={true} />;
      case 'profile':
        return <div className="text-slate-500 text-center py-10 font-bold">Profile component coming...</div>;
      default:
        return <StudentCourses user={currentUser} onNavigateToCourse={setSelectedCourseId} />;
    }
  };

  return (
    <DashboardLayout 
      user={currentUser} 
      currentTab={currentTab} 
      onTabChange={(tab) => {
        setCurrentTab(tab);
        setSelectedCourseId(null);
      }}
    >
      {currentUser.role === 'admin' ? renderAdminContent() : renderStudentContent()}
    </DashboardLayout>
  );
}
