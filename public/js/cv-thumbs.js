/* SOBA – thẻ mẫu thiệp: vẽ đúng trang đầu của thiệp (thay cho ảnh tĩnh) và tự cuộn xuống khi rê chuột */
(function () {
  'use strict';
  var CV = window.SobaCV;
  var boxes = document.querySelectorAll('[data-cv-thumb]');
  if (!CV || !boxes.length || !window.fetch) return;
  var cache = {};
  var SPEED = 150; // px/giây khi cuộn xem thử

  function load(key) {
    if (!cache[key])
      cache[key] = fetch('/api/mau-thiet-ke/' + encodeURIComponent(key) + '/bia')
        .then(function (r) {
          return r.ok ? r.json() : null;
        })
        .catch(function () {
          return null;
        });
    return cache[key];
  }

  function mount(box) {
    load(box.getAttribute('data-cv-thumb')).then(function (d) {
      if (!d || !d.doc) return;
      var ctx = { doc: d.doc, mode: 'thumb', guestName: 'Bạn Thân Mến', wishes: [], signatures: [], demo: true, noGift: false };
      var stage = CV.h('div', { class: 'cvth-stage' });
      d.doc.sections.forEach(function (s) {
        stage.appendChild(CV.renderSection(s, ctx));
      });
      // Ảnh trong khung xem thử: tải ngay khi thẻ đã hiện (khung bị cắt nên lazy dễ để trống)
      stage.querySelectorAll('img[loading]').forEach(function (i) {
        i.removeAttribute('loading');
      });
      var wrap = CV.h('div', { class: 'cvth', 'aria-hidden': 'true' }, [stage]);
      box.appendChild(wrap);
      function fit() {
        var w = box.clientWidth;
        if (!w) return;
        var s = w / CV.W;
        stage.style.transform = 'scale(' + s + ')';
        var shift = Math.max(0, d.total * s - box.clientHeight);
        box.style.setProperty('--cvth-shift', -shift + 'px');
        box.style.setProperty('--cvth-dur', (shift / SPEED).toFixed(1) + 's');
      }
      fit();
      if (window.ResizeObserver) new ResizeObserver(fit).observe(box);
      requestAnimationFrame(function () {
        box.classList.add('cvth-ready');
      });
    });
  }

  if (!('IntersectionObserver' in window)) return boxes.forEach(mount);
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        mount(en.target);
      });
    },
    { rootMargin: '300px' }
  );
  boxes.forEach(function (b) {
    io.observe(b);
  });
})();
