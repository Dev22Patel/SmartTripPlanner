import { BrowserRouter } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AppRoutes } from './Routes/approutes';
import { ThemeProvider } from './context/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingProvider';
function App() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    return (
    <BrowserRouter>
    <LoadingProvider>
        <ThemeProvider>
            <AuthProvider >
                    <MainLayout>
                        <GoogleOAuthProvider clientId={googleClientId}>
                            <AppRoutes />
                        </GoogleOAuthProvider>
                    </MainLayout>
            </AuthProvider>
        </ThemeProvider>
        </LoadingProvider>
    </BrowserRouter>
  )
}

export default App
