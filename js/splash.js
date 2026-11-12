// NAADAM splash — сайт нээгдэхэд бүтэн дэлгэцээр Монгол бичгийн гарчиг гарна.
// Дээр нь дарах (эсвэл Enter / Space / Esc) үед гэрийн хаалга шиг хоёр тийш нээгдэж сайт руу орно.
// app.js-ээс өмнө энгийн script байдлаар ачаалагдана, тиймээс сайт splash-гүй харагдах агшин байхгүй.

(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const splash = document.createElement('div');
  splash.id = 'splash';
  splash.className = 'splash';
  splash.setAttribute('role', 'button');
  splash.setAttribute('tabindex', '0');
  splash.setAttribute('aria-label', 'Наадам — нэвтрэхийн тулд дарна уу');
  splash.dataset.i18nSkip = '';
  splash.innerHTML = `
    <div class="splash-door splash-door-left" aria-hidden="true"></div>
    <div class="splash-door splash-door-right" aria-hidden="true"></div>
    <div class="splash-content">
      <div class="splash-ring" aria-hidden="true"></div>
      <svg class="splash-defs" width="0" height="0" aria-hidden="true">
        <!-- Бийрийн ирмэг: үсгийн хүрээг бага зэрэг долгилуулж бийрээр бичсэн мэт болгоно -->
        <filter id="splash-brush" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03 0.6" numOctaves="2" seed="7" result="wave"/>
          <feDisplacementMap in="SourceGraphic" in2="wave" scale="3.5" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </svg>
      <div class="splash-calligraphy">
        <div class="splash-script" lang="mn-Mong">
          <span>ᠡᠷᠡ ᠶᠢᠨ</span>
          <span>ᠭᠤᠷᠪᠠᠨ</span>
          <span>ᠨᠠᠭᠠᠳᠤᠮ</span>
        </div>
        <div class="splash-seal" lang="mn-Mong" aria-hidden="true"><span>ᠮᠣᠩᠭᠣᠯ</span></div>
      </div>
      <p class="splash-title">ЭРИЙН ГУРВАН <em>НААДАМ</em></p>
      <p class="splash-sub">Бөх · Хурдан морь · Сур харваа</p>
      <span class="splash-hint">✦ Нэвтрэхийн тулд дарна уу ✦</span>
    </div>`;

  document.body.prepend(splash);
  document.documentElement.classList.add('splash-lock');
  splash.focus({ preventScroll: true });

  let opened = false;
  function open() {
    if (opened) return;
    opened = true;
    splash.classList.add('is-open');
    document.documentElement.classList.remove('splash-lock');
    const done = () => {
      splash.remove();
      window.dispatchEvent(new Event('naadam:entered'));
    };
    if (reducedMotion) done();
    else setTimeout(done, 1300);
  }

  splash.addEventListener('click', open);
  splash.addEventListener('keydown', e => {
    if (['Enter', ' ', 'Escape'].includes(e.key)) { e.preventDefault(); open(); }
  });
})();
