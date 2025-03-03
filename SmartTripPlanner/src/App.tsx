import { BrowserRouter } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AppRoutes } from './Routes/approutes';
import { ThemeProvider } from './context/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingProvider';
import SmoothScroll from './components/common/SmoothScroll';
import { ToastProvider } from './components/ui/toast';
function App() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    return (
    <BrowserRouter>
    <LoadingProvider>
        <ThemeProvider>
            <AuthProvider >
                <ToastProvider>
                    <MainLayout>
                        <GoogleOAuthProvider clientId={googleClientId}>
                            <SmoothScroll />
                            <AppRoutes />
                        </GoogleOAuthProvider>
                    </MainLayout>
                </ToastProvider>
            </AuthProvider>
        </ThemeProvider>
        </LoadingProvider>
    </BrowserRouter>
  )
}

export default App
