import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CompareProvider>
          {/* Main application routing matrix */}
          <AppRoutes />
        </CompareProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
