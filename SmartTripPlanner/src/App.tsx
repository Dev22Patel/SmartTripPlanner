import { BrowserRouter } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AppRoutes } from './Routes/Index';
import { ThemeProvider } from './context/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingProvider';
function App() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    return (
    <BrowserRouter>
        <ThemeProvider>
            <AuthProvider >
                <LoadingProvider>
                    <MainLayout>
                        <GoogleOAuthProvider clientId={googleClientId}>
                            <AppRoutes />
                        </GoogleOAuthProvider>
                    </MainLayout>
                </LoadingProvider>
            </AuthProvider>
        </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
