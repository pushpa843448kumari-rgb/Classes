import { ReactNode } from 'react';
import { LogOut, BookOpen, Video, LayoutDashboard, Settings } from 'lucide-react';
import { auth } from '../lib/firebase';
import { User } from '../types';

interface DashboardLayoutProps {
  children: ReactNode;
  user: User;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function DashboardLayout({ children, user, currentTab, onTabChange }: DashboardLayoutProps) {
  const handleLogout = async () => {
    await auth.signOut();
  };

  const adminMenu = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'videos', label: 'Lectures', icon: Video },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const studentMenu = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'courses', label: 'Explore', icon: BookOpen },
    { id: 'enrolled', label: 'My Learning', icon: Video },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  const menu = user.role === 'admin' ? adminMenu : studentMenu;

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center font-sans sm:p-4">
      {/* Mobile App Container */}
      <div className="w-full max-w-md bg-[#F5F7FA] sm:rounded-[2.5rem] flex flex-col h-[100dvh] sm:h-[calc(100vh-2rem)] overflow-hidden shadow-2xl relative ring-1 ring-slate-800">
        
        {/* Top App Bar */}
        <header className="h-16 bg-white px-5 flex items-center justify-between z-10 flex-shrink-0 shadow-sm border-b border-slate-100 relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
              E
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">EduSphere Pro</h2>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="p-4 pb-24 min-h-full">
            {children}
          </div>
        </main>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center px-2 py-3 z-20 pb-[calc(12px+env(safe-area-inset-bottom))]">
          {menu.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-50' : 'bg-transparent'}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                </div>
                <span className={`text-[10px] whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
}
