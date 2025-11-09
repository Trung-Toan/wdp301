import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/styles/index.css";
import "../src/styles/accessibility.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./hooks/useAuth";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById("root"));

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Log để debug
if (!googleClientId) {
  console.error('❌ REACT_APP_GOOGLE_CLIENT_ID is not set in environment variables!');
  console.warn('⚠️  Google login will not work without Client ID');
} else {
  console.log('✅ Google Client ID loaded:', googleClientId.substring(0, 20) + '...');
}

root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AccessibilityProvider>
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </GoogleOAuthProvider>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>⚠️ Configuration Error</h2>
            <p>REACT_APP_GOOGLE_CLIENT_ID is not set. Please check your .env file.</p>
            <AuthProvider>
              <App />
            </AuthProvider>
          </div>
        )}
      </AccessibilityProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
