import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
