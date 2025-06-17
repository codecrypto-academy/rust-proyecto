
export interface AppConfig {
  useMockData: boolean;
  solana: {
    cluster: string;
    programId: string;
  };
}

export const getAppConfig = (): AppConfig => {
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  
  return {
    useMockData,
    solana: {
      cluster: import.meta.env.VITE_SOLANA_CLUSTER || 'http://localhost:8899',
      programId: import.meta.env.VITE_PROGRAM_ID || 'CgEPCH2sZKj5Zi7Ms2pJsvi4KKVde76GYbSRnfePGHtn'
    }
  };
};

export const appConfig = getAppConfig();
