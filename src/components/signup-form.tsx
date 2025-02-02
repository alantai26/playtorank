import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "@/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GamepadIcon } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      })

      if (signUpError) {
        throw new Error(signUpError.message)
      }

      setError("")
      setEmail("")
      setUsername("")
      setPassword("")
      navigate("/login")
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <nav className="flex items-center justify-between p-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <GamepadIcon className="h-8 w-8 text-purple-500" />
          <span className="text-lg font-semibold">Play to Rank</span>
        </Link>
      </nav>
      <main className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm rounded-xl bg-[#1a1f29] p-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">Create Account</h1>
            <p className="text-gray-400">Enter your details to create your account</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="texxt-gray-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                className="h-11 bg-white border-0 text-gray-900"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-200">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="gamertag"
                className="h-11 bg-white border-0 text-gray-900"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-white border-0 text-gray-900"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full h-11 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium">
              Create Account
            </Button>
            <p className="text-center text-gray-400 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-[#8b5cf6] hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}

