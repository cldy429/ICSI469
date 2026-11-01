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
    if (btn) {
      btn.textContent = next === 'light' ? '☾' : '☀';
      btn.setAttribute('aria-pressed', String(next === 'light'));
    }
  }

  function mount() {
    var actions = document.querySelector('.top-actions');
    if (!actions || document.getElementById('theme-toggle')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'theme-toggle';
    btn.className = 'icon-button theme-toggle';
    btn.setAttribute('aria-label', 'Өнгөний горим солих');
    btn.title = 'Өнгөний горим солих';
    btn.addEventListener('click', function () { apply(theme === 'light' ? 'dark' : 'light'); });
    var sound = document.getElementById('sound-toggle');
    actions.insertBefore(btn, sound || null);
    apply(theme);
  }

  window.naadamTheme = { get: function () { return theme; }, set: apply };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
