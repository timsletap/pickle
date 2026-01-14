import { API_BASE_URL } from './api';

export interface HealthCheckResult {
  isHealthy: boolean;
  message: string;
  apiUrl: string;
}

/**
 * Check if the backend API is reachable and healthy
 */
export async function checkApiHealth(): Promise<HealthCheckResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/api/teams/`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        isHealthy: true,
        message: 'Backend API is connected',
        apiUrl: API_BASE_URL,
      };
    } else {
      return {
        isHealthy: false,
        message: `Backend returned error: ${response.status}`,
        apiUrl: API_BASE_URL,
      };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        isHealthy: false,
        message: `Connection timeout - Backend not responding at ${API_BASE_URL}`,
        apiUrl: API_BASE_URL,
      };
    }

    return {
      isHealthy: false,
      message: `Cannot reach backend at ${API_BASE_URL}. Is it running?`,
      apiUrl: API_BASE_URL,
    };
  }
}

/**
 * Get helpful error message for users when API is down
 */
export function getSetupInstructions(): string {
  return `
Backend Connection Failed!

To fix this:

1. Start the backend server:
   cd backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

2. Check your .env file:
   - Make sure EXPO_PUBLIC_API_URL matches your computer's IP
   - Find your IP: Run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)

3. Verify connection:
   - Open browser and visit: ${API_BASE_URL}/api/teams/
   - Should see: []

4. Check network:
   - Computer and phone must be on same WiFi network
   - Firewall must allow port 8000

See SETUP.md for detailed instructions.
  `.trim();
}
