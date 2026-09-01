/**
 * Registers the PWA service worker in production/supported environments.
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ BCLN Media Portal PWA ServiceWorker registered:', registration.scope);
        })
        .catch((error) => {
          console.warn('⚠️ PWA ServiceWorker registration failed:', error);
        });
    });
  }
}
