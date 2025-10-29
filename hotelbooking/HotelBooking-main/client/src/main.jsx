import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Validate publishable key: treat common placeholder or empty values as not-configured
const isClerkKeyValid = Boolean(PUBLISHABLE_KEY) && !PUBLISHABLE_KEY.includes('YOUR_CLERK_PUBLISHABLE_KEY') && PUBLISHABLE_KEY !== '""' && PUBLISHABLE_KEY !== '';

if (!isClerkKeyValid) {
  console.warn("Clerk Publishable Key not found or is a placeholder. Authentication will not work. Please set VITE_CLERK_PUBLISHABLE_KEY in your .env file with a valid publishable key.");
}

const AppWithProviders = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

createRoot(document.getElementById("root")).render(
  isClerkKeyValid ? (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AppWithProviders />
    </ClerkProvider>
  ) : (
    <AppWithProviders />
  )
);
