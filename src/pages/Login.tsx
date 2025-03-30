
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, signInWithEmailAndPassword, doc, getDoc, db } from '../lib/firebase';
import { toast } from '../components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Layout from '../components/layout/Layout';
import { BookOpen } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = () => {
    setEmail('admin@bookhaven.com');
    setPassword('admin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if it's the admin
      if (email === 'admin@bookhaven.com' && password === 'admin') {
        // Create or update the admin user document
        await getDoc(doc(db, 'users', user.uid))
          .then(async (docSnap) => {
            if (!docSnap.exists()) {
              // Create admin user doc if it doesn't exist
              await fetch('/api/create-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid }),
              });
            }
          });
        
        toast.success('Admin login successful');
        navigate('/admin');
      } else {
        toast.success('Login successful');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessage = error.message || 'An error occurred during login';
      if (errorMessage.includes('user-not-found') || errorMessage.includes('wrong-password')) {
        toast.error('Invalid email or password');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="flex justify-center">
              <BookOpen className="h-12 w-12 text-bookhaven-600" />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{' '}
              <Link to="/register" className="font-medium text-bookhaven-600 hover:text-bookhaven-500">
                create a new account
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="mt-1"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm font-medium text-bookhaven-600 hover:text-bookhaven-500">
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="mt-1"
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" />
                  <Label 
                    htmlFor="remember-me" 
                    className="text-sm font-normal"
                  >
                    Remember me
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleAdminLogin}
                className="text-sm text-bookhaven-600 hover:text-bookhaven-800 underline"
              >
                Use Admin Credentials
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
