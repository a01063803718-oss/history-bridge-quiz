(() => {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        const activeUrl = reg.active?.scriptURL || '';
        const waitingUrl = reg.waiting?.scriptURL || '';
        const installingUrl = reg.installing?.scriptURL || '';
        if (![activeUrl, waitingUrl, installingUrl].some(u => u.includes('service-worker-v35.js'))) {
          await reg.unregister();
        }
      }

      const reg = await navigator.serviceWorker.register('./service-worker-v35.js?v=35', {
        scope: './',
        updateViaCache: 'none'
      });
      await reg.update();
    } catch (err) {
      console.error('HBQ v35 service worker update failed:', err);
    }
  });
})();
