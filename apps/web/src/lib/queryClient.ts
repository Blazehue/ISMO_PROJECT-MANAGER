import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Retry network blips, but not 4xx errors like 404s or validation failures.
      retry: (failureCount, error) =>
        failureCount < 2 && !(axios.isAxiosError(error) && error.response && error.response.status < 500),
    },
  },
});
