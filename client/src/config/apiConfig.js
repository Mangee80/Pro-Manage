// API Configuration
// Automatically detects environment and uses appropriate base URL

const getApiBaseUrl = () => {
  // Check if we're in production mode (build)
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Production URL
  const PRODUCTION_URL = 'https://pro-manage-one.vercel.app';
  
  // Development URL (local)
  const DEVELOPMENT_URL = 'http://localhost:5000';
  
  // Return appropriate URL based on environment
  return isProduction ? PRODUCTION_URL : DEVELOPMENT_URL;
};

// Export the API base URL
export const API_BASE_URL = getApiBaseUrl();

// Helper function to get full API URL (for convenience)
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

