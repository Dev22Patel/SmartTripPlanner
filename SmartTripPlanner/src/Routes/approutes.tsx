import Authentication from '@/Pages/Authentication';
import Home from '@/Pages/Home';
import { Landing } from '@/Pages/LandingPage';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';


export const AppRoutes = () => {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/landing-page" element={
            <ProtectedRoute>
            <Landing />
            </ProtectedRoute>
        } />
        <Route path="/authentication" element={<Authentication />} />
      </Routes>
    );
  };
