import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/** `false` only when we're sure there's no connection. */
export function useIsOnline() {
  const [online, setOnline] = useState(true);
  useEffect(
    () =>
      NetInfo.addEventListener((state) =>
        setOnline(state.isConnected !== false && state.isInternetReachable !== false),
      ),
    [],
  );
  return online;
}
