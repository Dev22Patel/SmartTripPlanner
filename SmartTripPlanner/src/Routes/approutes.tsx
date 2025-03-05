import Authentication from '@/Pages/Authentication';
import Home from '@/Pages/Home';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '@/Pages/LandingPage';
import PreferenceForm from '@/Pages/preferencesPage/PreferencesForm';
import AboutPage from '@/Pages/AboutUsPage';
import ItineraryBuilderPage from '@/Pages/ItineraryBuilderPage/itinerary-builder-page';
import UserPreferencePage from '@/Pages/AI_itineraryPage/userPreference';
import ItineraryPage from '@/Pages/testpage';


export const AppRoutes = () => {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/landing-page" element={
            <ProtectedRoute>
            <Dashboard />
            </ProtectedRoute>
        } />
        <Route path="/preferences" element={
            <ProtectedRoute>
                <PreferenceForm />
            </ProtectedRoute>
        } />
        <Route path='/itinerary-builder' element={
            <ProtectedRoute>
                <ItineraryBuilderPage />
            </ProtectedRoute>
        } />
        <Route path='/destination/:place' element={
            <ProtectedRoute>
                <UserPreferencePage />
            </ProtectedRoute>
        } />
        <Route path="/authentication" element={<Authentication />} />
        <Route path="/about-us" element={<AboutPage />} />
        <Route path="/test" element={<ItineraryPage />} />
      </Routes>
    );
  };
