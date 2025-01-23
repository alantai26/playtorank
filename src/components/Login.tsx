import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { GamepadIcon } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use the `useNavigate` hook for navigation.

  const handleLogin = async (event) => {
    event.preventDefault();

    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    const userId = loginData.user.id;

    try {
      const { data: userGames, error: userGamesError } = await supabase
        .from('user_games')
        .select('*')
        .eq('userid', userId);

      if (userGamesError) {
        console.error('Error fetching user games:', userGamesError);
        setError('Error determining user status. Please try again.');
        return;
      }

      // Navigate based on whether the user has rated at least 10 games.
      if (!userGames || userGames.length < 10) {
        navigate('/rating');
      } else {
        navigate('/rated');
      }
    } catch (fetchError) {
      console.error('Error during login flow:', fetchError);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <nav className="flex items-center justify-between p-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <GamepadIcon className="h-8 w-8 text-purple-500" />
          <span className="text-lg font-semibold">Play to Rank</span>
        </Link>
      </nav>
      <main className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card className="border-purple-800 bg-[#1a1f29]">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Login</CardTitle>
              <CardDescription className="text-gray-400">
                Enter your email and password to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-gray-200">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      className="border-purple-800 bg-[#0f1218] text-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                    Login
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-gray-400">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-purple-400 hover:text-purple-300">
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
