import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { addToast } = useToastStore();
  const [email, setEmail] = useState('');

  // Get the path the user was trying to access, default to library
  const from = location.state?.from?.pathname || '/library';

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email) return;
    
    login(email);
    addToast('Welcome back!', 'success');
    navigate(from, { replace: true });
  };

  return (
    <div className="max-w-md mx-auto mt-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white border border-brand-border p-8 rounded-xl shadow-sm text-center">
        <div className="w-12 h-12 flex items-center justify-center mx-auto rounded-lg bg-brand-primary text-[#f8f5eb] font-serif text-2xl mb-6">P</div>
        <h1 className="text-3xl text-brand-primary mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-8 text-sm">Enter your email to access your library.</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-6 text-left">
          <Input 
            label="Email Address" 
            type="email" 
            required 
            placeholder="reader@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
        
        <p className="mt-6 text-xs text-gray-400">
          * This is a mock login. Any valid email format will work.
        </p>
      </div>
    </div>
  );
}
