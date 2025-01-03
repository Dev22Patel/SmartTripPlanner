import { BrowserRouter } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AppRoutes } from './Routes';
function App() {

  return (
    <>
     <BrowserRouter>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </BrowserRouter>
    </>
  )
}

export default App
