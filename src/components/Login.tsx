import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Mail, EyeOff, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface LoginProps {
  onLoginStatus: (status: boolean) => void;
}

export function Login({ onLoginStatus }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const userEmail = user.email || '';
        const role = userEmail === 'shavpankaj124@gmail.com' ? 'admin' : 'student';
        
        await setDoc(userRef, {
          email: userEmail,
          role: role,
          name: user.displayName || 'Unknown User',
          createdAt: serverTimestamp()
        });
      }
      onLoginStatus(true);
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login failed. Please check console for details.');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Assuming user is already created in Firebase with this email
      await signInWithEmailAndPassword(auth, email, password);
      onLoginStatus(true);
    } catch (error: any) {
      console.error('Error with email login:', error);
      if (error?.code === 'auth/operation-not-allowed') {
        alert('Email/Password sign-in is disabled. Please enable it in the Firebase Console (Authentication > Sign-in method), or use Google Sign In instead.');
      } else {
        alert('Login failed. Please check your credentials or use Google Sign In.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Header outside the card */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#2D45B2] rounded-full flex items-center justify-center shadow-md">
          <span className="text-2xl font-bold text-white italic">E</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">EduSphere Pro</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white rounded-3xl shadow-lg p-8 px-10"
      >
        <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Welcome back</h2>
        <p className="text-slate-400 text-sm mb-8">Sign in to your account</p>
        
        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Email</label>
            <div className="relative flex items-center">
              <input 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:border-[#2D45B2] focus:ring-1 focus:ring-[#2D45B2] outline-none transition-colors pr-10"
              />
              <Mail className="absolute right-3 w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <a href="#" className="text-sm font-bold text-[#2D45B2] hover:underline">Forgot password?</a>
            </div>
            <div className="relative flex items-center">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:border-[#2D45B2] focus:ring-1 focus:ring-[#2D45B2] outline-none transition-colors pr-10"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#2D45B2] text-white hover:bg-[#253995] py-3.5 rounded-2xl font-bold transition-colors mt-2 text-sm"
          >
            Sign In
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-slate-100"></div>
          <span className="px-4 text-sm text-slate-400">or continue with</span>
          <div className="flex-1 border-t border-slate-100"></div>
        </div>
        
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-3.5 rounded-2xl font-bold transition-all shadow-sm text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.86-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
        
        <p className="mt-8 text-center text-sm text-slate-500">
          Don't have an account? <a href="#" className="font-bold text-[#2D45B2] hover:underline">Create one</a>
        </p>
      </motion.div>
    </div>
  );
}
