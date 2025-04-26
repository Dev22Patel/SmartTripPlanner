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
import Profile from '@/Pages/Profile';
import TripDetails from '@/Pages/TripDetails';
import TopDestinations from '@/Pages/TopDestinations';
import Products from '@/Pages/Products';
import TravelPackages from '@/Pages/TravelPackages';
import AdventureTours from '@/Pages/AdventureTours';
import FamilyTrips from '@/Pages/FamilyTrips';

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
        {/* <Route path='/destination' element={
            <ProtectedRoute>
                <UserPreferencePage />
            </ProtectedRoute>
        } /> */}
        <Route path="/authentication" element={<Authentication />} />
        <Route path="/about-us" element={<AboutPage />} />
        <Route path="/test" element={<ItineraryPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/trip/:id" element={<TripDetails />} />
        <Route path='/products' element={<Products />} />
        <Route path="/top-destinations" element={<TopDestinations />} />
        <Route path="/travel-packages" element={<TravelPackages />} />
        <Route path="/adventure-tours" element={<AdventureTours />} />
        <Route path="/family-trips" element={<FamilyTrips />} />
        
      </Routes>
    );
  };
