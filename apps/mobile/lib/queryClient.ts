import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { AppState, Platform } from 'react-native';

// Pause queries while offline and resume (refetching stale data) when the connection returns.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected) && state.isInternetReachable !== false)),
);

// Refetch when the app comes back to the foreground.
AppState.addEventListener('change', (status) => {
  if (Platform.OS !== 'web') focusManager.setFocused(status === 'active');
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Keep data around long enough to be useful offline.
      gcTime: 1000 * 60 * 60 * 24,
      retry: (failureCount, error) =>
        failureCount < 2 && !(axios.isAxiosError(error) && error.response && error.response.status < 500),
    },
  },
});

/**
 * Offline viewing: the query cache (projects, tasks, dashboard) is saved to
 * AsyncStorage and restored on launch, so the last-seen data is readable
 * without a connection. It's cleared on logout.
 */
export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'ismo.query-cache',
  throttleTime: 1000,
});
