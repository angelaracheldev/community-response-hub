import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { APP_PORTALS, AppPortal, AppPortalConfig } from '../utils/appPortal.config';
import { fetchSessionDisplayName } from '../utils/sessionProfile';

export function useAppSession(portal: AppPortal) {
  const router = useRouter();
  const config: AppPortalConfig = APP_PORTALS[portal];
  const [userName, setUserName] = useState(config.defaultDisplayName);

  useEffect(() => {
    let cancelled = false;
    const portalConfig = APP_PORTALS[portal];

    (async () => {
      const token = await portalConfig.getToken();
      if (!token) {
        if (!cancelled) {
          router.replace(portalConfig.loginRoute);
        }
        return;
      }

      const displayName = await fetchSessionDisplayName(portalConfig.getToken);
      if (!cancelled && displayName) {
        setUserName(displayName);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [portal, router]);

  const logout = useCallback(() => {
    void Promise.resolve(config.clearToken()).then(() => {
      router.replace(config.loginRoute);
    });
  }, [config, router]);

  return {
    config,
    userName,
    roleLabel: config.roleLabel,
    navItems: config.navItems,
    quickActions: config.quickActions,
    getToken: config.getToken,
    logout,
  };
}
