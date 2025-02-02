import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "@/supabaseClient"
import SignUpForm from "@/components/signup-form"
import { RatingPage } from "@/components/rating"
import RatedPage from "@/components/rated"
import Login from "@/components/Login"
import PlayToRankLanding from "@/components/Home.tsx"
import { User } from "@supabase/supabase-js" 

interface AuthWrapperProps {
  children: (user: User | null) => React.ReactNode
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return <>{children(user)}</>
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <Routes>
          <Route 
            path="/" 
            element={
              <AuthWrapper>
                {(user) => <PlayToRankLanding user = {user}  />}
              </AuthWrapper>
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route
            path="/rating"
            element={
              <AuthWrapper>
                {(user) => (user ? <RatingPage /> : <Navigate to="/login" />)}
              </AuthWrapper>
            }
          />
          <Route
            path="/ranked-games"
            element={
              <AuthWrapper>
                {(user) => (user ? <RatedPage /> : <Navigate to="/login" />)}
              </AuthWrapper>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App