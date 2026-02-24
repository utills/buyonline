'use client';

import { useConfigStore } from '../store/useConfigStore';

/**
 * Provides dynamic next/prev route navigation based on the journey configuration.
 * Respects enabled phases and steps from the configurator, skipping disabled ones.
 *
 * Usage:
 *   const { nextRoute, prevRoute } = useJourneyNav();
 *   router.push(nextRoute('/plans', '/addons')); // falls back to '/addons' if config empty
 */
export function useJourneyNav() {
  const config = useConfigStore((s) => s.config);

  // Build an ordered flat list of enabled step routes from the current config
  const enabledRoutes: string[] = config.phases
    .filter((p) => p.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((p) =>
      p.steps
        .filter((s) => s.enabled)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((s) => s.route),
    );

  /**
   * Returns the next enabled route after `current`, or `fallback` if not found.
   */
  function nextRoute(current: string, fallback: string): string {
    if (enabledRoutes.length === 0) return fallback;
    const idx = enabledRoutes.indexOf(current);
    if (idx === -1 || idx >= enabledRoutes.length - 1) return fallback;
    return enabledRoutes[idx + 1];
  }

  /**
   * Returns the previous enabled route before `current`, or `fallback` if not found.
   */
  function prevRoute(current: string, fallback: string): string {
    if (enabledRoutes.length === 0) return fallback;
    const idx = enabledRoutes.indexOf(current);
    if (idx <= 0) return fallback;
    return enabledRoutes[idx - 1];
  }

  /**
   * Whether a given route is enabled in the current config.
   */
  function isRouteEnabled(route: string): boolean {
    if (enabledRoutes.length === 0) return true; // default: all enabled
    return enabledRoutes.includes(route);
  }

  return { nextRoute, prevRoute, isRouteEnabled, enabledRoutes };
}
