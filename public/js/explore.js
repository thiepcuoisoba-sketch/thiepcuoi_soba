/* SOBA – trang Khám phá: lưu mẫu, cuộn hàng, popup xem trước */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var toast = function (m) { if (window.sobaToast) window.sobaToast(m); };

  // ===== Header: viền khi cuộn + menu di động =====
  var head = $('.hw-head');
  function onScroll() { if (head) head.classList.toggle('is-scrolled', window.scrollY > 4); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  var drawer = $('[data-drawer]');
  var dToggle = $('[data-drawer-toggle]');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.hidden = !open;
    dToggle.setAttribute('aria-expanded', String(open));
    dToggle.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (dToggle) {
    dToggle.addEventListener('click', function () { setDrawer(drawer.hidden); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) setDrawer(false); });
  }
  var toTop = $('[data-to-top]');
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // ===== Mẫu đã lưu (localStorage) =====
  var KEY = 'soba:fav';
  function readFav() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function writeFav(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
  var favs = readFav();
  function syncFav() {
    $$('[data-fav]').forEach(function (b) { b.setAttribute('aria-pressed', String(favs.indexOf(b.dataset.fav) > -1)); });
    $$('[data-fav-count]').forEach(function (c) { c.textContent = favs.length; c.hidden = !favs.length; });
    var grid = $('[data-fav-mode]');
    if (grid) {
      var shown = 0;
      $$('.xc', grid).forEach(function (c) { var on = favs.indexOf(c.dataset.key) > -1; c.hidden = !on; if (on) shown++; });
      var empty = $('[data-empty]');
      if (empty) empty.hidden = shown > 0;
    }
  }
  function toggleFav(key) {
    var i = favs.indexOf(key);
    if (i > -1) favs.splice(i, 1); else favs.push(key);
    writeFav(favs);
    syncFav();
    toast(i > -1 ? 'Đã bỏ lưu mẫu' : 'Đã lưu mẫu – xem lại ở mục “Mẫu đã lưu”');
    return i === -1;
  }
  syncFav();
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fav]');
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    toggleFav(b.dataset.fav);
  });

  // ===== Nút cuộn hàng =====
  $$('.ex-row').forEach(function (row) {
    var track = $('[data-track]', row);
    var prev = $('[data-row-prev]', row);
    var next = $('[data-row-next]', row);
    if (!track || !prev) return;
    var step = function () { return track.clientWidth * 0.8; };
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    var update = function () {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    track.addEventListener('scroll', update, { passive: true });
    update();
  });

  // ===== Popup xem trước =====
  var modal = $('[data-pv]');
  var dataEl = $('#tpl-data');
  if (!modal || !dataEl) return;
  var tpls = {};
  JSON.parse(dataEl.textContent).forEach(function (t) { tpls[t.key] = t; });
  var frame = $('[data-pv-frame]', modal);
  var favBtn = $('[data-pv-fav]', modal);
  var current = null;
  var lastFocus = null;

  // Mẫu thiết kế tự do (thiệp ảnh) – chỉ có trên trang chủ
  var cvEl = $('#cv-data');
  if (cvEl) JSON.parse(cvEl.textContent).forEach(function (t) {
    tpls['cv:' + t.key] = { name: t.name, cat: '', desc: t.desc, tier: t.tier, tierLabel: t.tierLabel, canvas: t.key, tags: t.tags, features: t.features };
  });
  // Danh sách "Có trong mẫu này": mẫu ảnh có danh sách riêng, mẫu thường giữ danh sách mặc định
  var featList = $('[data-pv-feat]', modal);
  var featDefault = featList ? featList.innerHTML : '';
  function renderFeatures(t) {
    if (!featList) return;
    if (!t.features) {
      featList.innerHTML = featDefault;
      return;
    }
    featList.textContent = '';
    t.features.forEach(function (f) {
      var li = document.createElement('li');
      li.innerHTML = '<svg class="ic"><use href="#i-check"/></svg>';
      li.appendChild(document.createTextNode(f));
      featList.appendChild(li);
    });
  }

  function open(key) {
    var t = tpls[key];
    if (!t) return false;
    current = key;
    lastFocus = document.activeElement;
    var demo = t.canvas ? '/demo-thiet-ke/' + t.canvas : '/demo/' + key;
    $('[data-pv-name]', modal).textContent = t.name;
    $('[data-pv-cat]', modal).textContent = t.canvas ? 'Thiết kế tự do · ' + t.tags.join(' · ') : 'Phong cách ' + (t.cat || '').toLowerCase();
    $('[data-pv-desc]', modal).textContent = t.desc;
    renderFeatures(t);
    var tier = $('[data-pv-tier]', modal);
    tier.textContent = 'Gói ' + t.tierLabel;
    tier.className = 'badge badge-' + t.tier;
    var form = $('[data-pv-form]', modal);
    var input = $('[data-pv-input]', modal);
    if (form && input) {
      form.action = t.canvas ? '/thiep/tao-thiet-ke' : '/thiep/tao';
      input.name = t.canvas ? 'starter' : 'template';
      input.value = t.canvas || key;
    }
    var signup = $('[data-pv-signup]', modal);
    if (signup) signup.href = t.canvas ? '/dang-ky' : '/dang-ky?mau=' + encodeURIComponent(key);
    $('[data-pv-full]', modal).href = demo;
    var detail = $('[data-pv-detail]', modal);
    detail.href = t.canvas ? demo : '/mau-thiep/' + key;
    detail.hidden = Boolean(t.canvas);
    favBtn.setAttribute('aria-pressed', String(favs.indexOf(key) > -1));
    favBtn.querySelector('span').textContent = favs.indexOf(key) > -1 ? 'Đã lưu' : 'Lưu mẫu';
    frame.src = demo + '?to=' + encodeURIComponent('Bạn Thân Mến');
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('[data-pv-close]', modal).focus();
    return true;
  }
  function close() {
    modal.hidden = true;
    frame.src = 'about:blank';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-preview]');
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return; // cho phép mở tab mới
    if (open(a.dataset.preview)) e.preventDefault();
  });
  $$('[data-pv-close]', modal).forEach(function (b) { b.addEventListener('click', close); });
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      var f = $$('a[href], button:not([disabled]), iframe', modal).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  favBtn.addEventListener('click', function () {
    var on = toggleFav(current);
    favBtn.setAttribute('aria-pressed', String(on));
    favBtn.querySelector('span').textContent = on ? 'Đã lưu' : 'Lưu mẫu';
  });
})();
