import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "@/supabaseClient"
import { SignUpForm } from "@/components/signup-form"
import { RatingPage } from "@/components/rating.tsx"
import RatedPage from "@/components/rated.tsx"
import Home from "@/components/Home.tsx"
import Login from "@/components/Login.tsx"

const AuthWrapper = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return children(user)
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <Routes>
          <Route path="/" element={<AuthWrapper>{(user) => (user ? <RatedPage /> : <Home />)}</AuthWrapper>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/rating" element={<RatingPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

