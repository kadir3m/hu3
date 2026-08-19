/* ============================================================
   Hızlı Erişim (Quick Access) rail widget — standalone JS
   Bağımlılık yok. Sayfanın sonunda, DOM yüklendikten sonra çalıştırın
   (script etiketini </body>'den hemen önce koymanız yeterli).

   Orijinal projeden farkı: artık belirli bir #mainNav id'sine sabit
   bağımlı değil. Sürükleme sınırını hesaplarken üstte sabit bir nav
   barınız varsa onun yüksekliğini `data-qar-nav-offset` ile verebilir,
   ya da hiç vermezseniz varsayılan bir boşluk kullanılır.
   ============================================================ */
(function () {
  const rail = document.getElementById('qarRail');
  const handle = document.getElementById('qarRailHandle');
  if (!rail || !handle) return;

  // Üstte sabit/sticky bir nav bar'ınız varsa piksel yüksekliğini buraya yazın
  // (örn. <div class="qar-rail" id="qarRail" data-qar-nav-offset="78"> gibi HTML'den de okunabilir).
  const NAV_OFFSET = parseInt(rail.dataset.qarNavOffset || '0', 10);

  function railBounds() {
    const half = rail.offsetHeight / 2;
    return {
      min: NAV_OFFSET + half + 10,
      max: window.innerHeight - half - 12
    };
  }

  function setRailY(px) {
    const { min, max } = railBounds();
    const clamped = Math.min(max, Math.max(min, px));
    rail.style.top = clamped + 'px';
  }

  function enableVerticalDrag(handleEl) {
    let dragging = false, startY = 0, startTop = 0, moved = false;
    const suppressClick = (e) => { e.stopPropagation(); e.preventDefault(); };

    handleEl.addEventListener('pointerdown', (e) => {
      dragging = true; moved = false;
      startY = e.clientY;
      startTop = parseFloat(getComputedStyle(rail).top) || window.innerHeight / 2;
      rail.classList.add('qar-dragging');
      handleEl.setPointerCapture(e.pointerId);
    });
    handleEl.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dy = e.clientY - startY;
      if (Math.abs(dy) > 4) moved = true;
      setRailY(startTop + dy);
    });
    handleEl.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      rail.classList.remove('qar-dragging');
      handleEl.releasePointerCapture(e.pointerId);
      if (moved) {
        // sürükleme bittiğinde tıklama olarak algılanıp menüyü açmasın diye bir sonraki click'i yut
        handleEl.addEventListener('click', suppressClick, { once: true, capture: true });
      } else {
        const open = rail.classList.toggle('qar-open');
        handleEl.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    });
  }

  enableVerticalDrag(handle);

  window.addEventListener('resize', () => {
    if (rail.style.top) setRailY(parseFloat(rail.style.top));
  });
})();
