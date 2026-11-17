/* SOBA – tương tác chung cho website & bảng điều khiển */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Toast dùng chung
  var toastEl;
  window.sobaToast = function (msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove('is-show'); }, 2400);
  };

  // Header khi cuộn
  var header = $('[data-header]');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Menu di động
  var toggle = $('[data-menu-toggle]');
  var mnav = $('[data-mobile-nav]');
  if (toggle && mnav) {
    toggle.addEventListener('click', function () {
      var open = !mnav.classList.contains('is-open');
      mnav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  // Sidebar app
  var sideToggle = $('[data-side-toggle]');
  var side = $('[data-side]');
  var scrim = $('[data-scrim]');
  if (sideToggle && side) {
    var setSide = function (open) {
      side.classList.toggle('is-open', open);
      if (scrim) scrim.classList.toggle('is-open', open);
      sideToggle.setAttribute('aria-expanded', String(open));
    };
    sideToggle.addEventListener('click', function () { setSide(!side.classList.contains('is-open')); });
    if (scrim) scrim.addEventListener('click', function () { setSide(false); });
  }

  // Hiện dần khi cuộn
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) { el.style.transitionDelay = Math.min((i % 4) * 70, 210) + 'ms'; io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Lọc mẫu thiệp
  var filter = $('[data-filter]');
  var grid = $('[data-filter-grid]');
  if (filter && grid) {
    filter.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter-value]');
      if (!btn) return;
      var v = btn.dataset.filterValue;
      $$('[data-filter-value]', filter).forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      $$('.tpl-card', grid).forEach(function (c) { c.hidden = v !== 'all' && c.dataset.tier !== v; });
    });
  }

  // Flash tự ẩn
  $$('[data-autohide]').forEach(function (el) {
    setTimeout(function () { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; setTimeout(function () { el.remove(); }, 400); }, 5000);
  });

  // Dropdown
  $$('[data-dropdown]').forEach(function (dd) {
    var btn = dd.querySelector('[data-dropdown-btn]');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !dd.classList.contains('is-open');
      $$('[data-dropdown].is-open').forEach(function (o) { o.classList.remove('is-open'); });
      dd.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', function () {
    $$('[data-dropdown].is-open').forEach(function (o) { o.classList.remove('is-open'); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') $$('[data-dropdown].is-open').forEach(function (o) { o.classList.remove('is-open'); });
  });

  // Xác nhận trước khi gửi form nguy hiểm
  $$('form[data-confirm]').forEach(function (f) {
    f.addEventListener('submit', function (e) { if (!window.confirm(f.dataset.confirm)) e.preventDefault(); });
  });

  // Sao chép
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]');
    if (!b) return;
    var text = b.dataset.copy;
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { window.sobaToast('Đã sao chép'); });
    else { window.prompt('Sao chép nội dung:', text); }
  });

  // Chia sẻ
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-share]');
    if (!b) return;
    var url = b.dataset.share;
    if (navigator.share) navigator.share({ title: b.dataset.title || 'Thiệp cưới', url: url }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { window.sobaToast('Đã sao chép đường link'); });
  });
})();
