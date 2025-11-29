// API Configuration
// Automatically detects environment and uses appropriate base URL

const getApiBaseUrl = () => {
  // Production URL
  const PRODUCTION_URL = 'https://pro-manage-one.vercel.app';
  
  // Development URL (local)
  const DEVELOPMENT_URL = 'http://localhost:5000';
  
  // Check multiple conditions for production
  // 1. Check if we're in production mode (build)
  const isProductionBuild = process.env.NODE_ENV === 'production';
  
  // 2. Check if we're running on Vercel (production deployment)
  const isVercelProduction = typeof window !== 'undefined' && 
    (window.location.hostname.includes('vercel.app') || 
     window.location.hostname.includes('vercel.com'));
  
  // Use production URL if either condition is true
  const useProduction = isProductionBuild || isVercelProduction;
  
  return useProduction ? PRODUCTION_URL : DEVELOPMENT_URL;
};

// Export the API base URL
export const API_BASE_URL = getApiBaseUrl();

// Helper function to get full API URL (for convenience)
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};






