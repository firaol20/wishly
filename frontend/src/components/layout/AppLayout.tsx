import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Toaster } from 'react-hot-toast';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#FFFBF0]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFBF0',
            border: '1px solid #E7E5E4',
            color: '#292524',
            fontFamily: 'Lato, sans-serif',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#F59E0B', secondary: '#FFFBF0' } },
        }}
      />
    </div>
  );
}
