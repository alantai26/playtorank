import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import './App.css';
import Login from './components/Login';
import SignUpForm from './components/SignUp';
import RatingPage from './components/rating';
import RatedPage from './components/rated';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/rating" element={<RatingPage />} />
          <Route path="/rated" element={<RatedPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;