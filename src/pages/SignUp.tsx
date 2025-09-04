import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '../lib/supabaseClient';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const signupSchema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  role: yup.string().oneOf(['admin', 'manager', 'staff', 'client']).required('Role is required'),
});

const SignUp: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { session } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(signupSchema),
  });

  const handleFormSubmit = async (data: any) => {
    setError('');
    setLoading(true);
    
    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: data.role,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setIsSubmitted(true);
    }
    
    setLoading(false);
  };

  if (session) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-card p-8 rounded-xl shadow-lg"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            {isSubmitted ? 'Check your email' : 'Create an Account'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isSubmitted 
              ? 'A verification link has been sent to your email address.'
              : 'Create your first admin account to get started.'
            }
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center space-x-2"
          >
            <AlertCircle className="w-5 h-5 text-destructive" />
            <span className="text-destructive text-sm">{error}</span>
          </motion.div>
        )}

        {isSubmitted ? (
          <div className="text-center">
            <p className="text-foreground">Please click the link in the email to verify your account and log in.</p>
            <Link to="/login" className="mt-4 inline-block">
              <Button>Back to Login</Button>
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <input {...register('fullName')} className="w-full px-3 py-2 border border-input bg-background rounded-lg" placeholder="e.g., John Doe" />
              {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email address</label>
              <input {...register('email')} type="email" className="w-full px-3 py-2 border border-input bg-background rounded-lg" placeholder="Enter your email" />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'} className="w-full px-3 py-2 pr-10 border border-input bg-background rounded-lg" placeholder="Create a strong password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Role</label>
              <select {...register('role')} className="w-full px-3 py-2 border border-input bg-background rounded-lg">
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="client">Client</option>
              </select>
              {errors.role && <p className="text-destructive text-xs mt-1">{errors.role.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default SignUp;
