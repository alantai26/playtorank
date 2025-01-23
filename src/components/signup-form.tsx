import { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { supabase } from '@/supabaseClient';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // Sign up user with metadata
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username, // Attach username as metadata
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      // Clear the form and navigate to login page
      setError('');
      setEmail('');
      setUsername('');
      setPassword('');
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-purple-800 bg-[#1a1f29]">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Create Account</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="border-purple-800 bg-[#0f1218] text-white placeholder:text-gray-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-gray-200">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="gamertag"
                  required
                  className="border-purple-800 bg-[#0f1218] text-white placeholder:text-gray-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-gray-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  className="border-purple-800 bg-[#0f1218] text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                Create Account
              </Button>
            </div>
            <div className="mt-4 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-400 hover:text-purple-300">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
