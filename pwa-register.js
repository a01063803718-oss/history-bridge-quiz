(() => {
  if (!('serviceWorker' in navigator)) return;
  let reloading = false;
  let registrationRef = null;

  async function forceUpdate() {
    try {
      if (registrationRef) await registrationRef.update();
    } catch (_) {}
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js', {
        scope: './',
        updateViaCache: 'none'
      });
      registrationRef = registration;
      await forceUpdate();

      if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    } catch (error) {
      console.error('[HBQ] Service Worker registration failed:', error);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') forceUpdate();
  });
  window.addEventListener('pageshow', forceUpdate);

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });
})();
