import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import './assets/css/App.css';
import ProtectedRoute from './components/ProtectedRoute';
import EssayGuidance from './pages/EssayGuidance';
import EssayBuilder from './pages/EssayBuilder';
import EssayBlock from './pages/EssayBlock';
import { EssayReview } from './components/EssayReview';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/essayguidance" element={<EssayGuidance />} />
          <Route path="/essaybuilder" element={<EssayBuilder />} />
          <Route path="/essayblock/:sectionId" element={<EssayBlock />} />
          <Route path="/essayreview" element={<EssayReview />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
          <Route path='/createpost' element={<ProtectedRoute><CreatePost /></ProtectedRoute>}/>
          <Route path='/posts/:id' element={<ProtectedRoute><PostDetail /></ProtectedRoute>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;