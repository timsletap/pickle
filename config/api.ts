import Constants from 'expo-constants';

const getApiUrl = (): string => {
  const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost;
  const localhost = debuggerHost?.split(':')[0];
  
  if (!localhost) {
    return "http://localhost:8000";
  }
  
  return `http://${localhost}:8000`;
};

export const API_BASE_URL: string = getApiUrl();