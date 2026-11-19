// NAADAM theme — dark / light горим. <head> дотор ачаалж, хуудас зурагдахаас өмнө
// сонголтыг тавина (гэрэлтэй горимд харанхуй анивчихгүй). Сонголт localStorage-д хадгалагдана.
(function () {
  var KEY = 'naadam-theme';
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  // Анх орж буй хүнд сайтын үндсэн өнгө болох харанхуй горим.
  var theme = saved === 'light' ? 'light' : 'dark';
  root.dataset.theme = theme;

  function apply(next) {
    theme = next;
    root.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'light' ? '#f6efe3' : '#071b2c');
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-pressed', String(next === 'light'));
  }

  // Товч дарсан цэгээс шинэ өнгө тойрог хэлбэрээр тэлж шилжинэ (View Transitions API).
  // Энэ API байхгүй хөтөч дээр өнгөнүүд зөөлөн (transition) солигдоно.
  function switchTheme(btn) {
    var next = theme === 'light' ? 'dark' : 'light';
    btn.classList.remove('spin'); void btn.offsetWidth; btn.classList.add('spin');
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return apply(next);
    if (!document.startViewTransition) {
      root.classList.add('theme-fade');
      apply(next);
      clearTimeout(switchTheme.t);
      switchTheme.t = setTimeout(function () { root.classList.remove('theme-fade'); }, 700);
      return;
    }
    var r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('theme-vt');
    var vt = document.startViewTransition(function () { apply(next); });
    vt.ready.then(function () {
      root.animate({clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + end + 'px at ' + x + 'px ' + y + 'px)']},
        {duration: 650, easing: 'cubic-bezier(.4, 0, .2, 1)', pseudoElement: '::view-transition-new(root)'});
    }).catch(function () {});
    vt.finished.then(function () { root.classList.remove('theme-vt'); }, function () { root.classList.remove('theme-vt'); });
  }

  // Нар ↔ сар хэлбэр хувирдаг дүрс: харанхуй горимд нар (гэрэл рүү шилжих), гэрэлтэй горимд сар.
  var ICON = '<svg class="tt-icon" viewBox="0 0 24 24" aria-hidden="true">' +
    '<mask id="tt-mask"><rect width="24" height="24" fill="#fff"/><circle class="tt-cut" cx="17" cy="7" r="6" fill="#000"/></mask>' +
    '<g mask="url(#tt-mask)"><circle class="tt-core" cx="12" cy="12" r="5" fill="currentColor"/></g>' +
    '<g class="tt-rays" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
    [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) {
      return '<path transform="rotate(' + a + ' 12 12)" d="M12 2.5v2.2"/>';
    }).join('') + '</g></svg>';

  function mount() {
    var actions = document.querySelector('.top-actions');
    if (!actions || document.getElementById('theme-toggle')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'theme-toggle';
    btn.className = 'icon-button theme-toggle';
    btn.setAttribute('aria-label', 'Өнгөний горим солих');
    btn.title = 'Өнгөний горим солих';
    btn.innerHTML = ICON;
    btn.addEventListener('click', function () { switchTheme(btn); });
    var sound = document.getElementById('sound-toggle');
    actions.insertBefore(btn, sound || null);
    apply(theme);
  }

  window.naadamTheme = { get: function () { return theme; }, set: apply };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
