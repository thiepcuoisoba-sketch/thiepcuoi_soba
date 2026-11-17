/* SOBA – tương tác trang thiệp */
(function () {
  'use strict';
  var body = document.body;
  var slug = body.dataset.slug;
  var isPreview = body.dataset.preview === '1';
  var isDemo = body.dataset.demo === '1';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var params = new URLSearchParams(location.search);

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 2200);
  }

  // ===== Nhạc nền =====
  var audio = $('#bgm');
  var musicBtn = $('#music-btn');
  function setPlaying(on) {
    if (!musicBtn) return;
    musicBtn.classList.toggle('is-playing', on);
    musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    musicBtn.querySelector('use').setAttribute('href', on ? '#i-music' : '#i-mute');
  }
  function playMusic() {
    if (!audio) return;
    var p = audio.play();
    if (p && p.then) p.then(function () { setPlaying(true); }).catch(function () { setPlaying(false); });
  }
  if (musicBtn) {
    setPlaying(false);
    musicBtn.addEventListener('click', function () {
      if (audio.paused) playMusic();
      else { audio.pause(); setPlaying(false); }
    });
  }

  // ===== Mở thiệp =====
  var cover = $('#cover');
  var opened = false;
  function openCard(instant) {
    if (opened) return;
    opened = true;
    body.classList.remove('is-locked');
    if (instant || reduce) {
      cover.classList.add('is-gone');
    } else {
      cover.classList.add('is-opening');
      setTimeout(function () { cover.classList.add('is-leaving'); }, 900);
      setTimeout(function () { cover.classList.add('is-gone'); }, 1500);
    }
    if (audio && audio.dataset.autoplay === '1' && !isPreview) playMusic();
    startPetals();
    setTimeout(revealCheck, 50);
  }
  if (cover) {
    $('#open-btn').addEventListener('click', function () { openCard(false); });
    if (params.get('mo') === '1') openCard(true);
    else setTimeout(function () { $('#open-btn').focus({ preventScroll: true }); }, 300);
  }

  // ===== Hiện dần khi cuộn =====
  var rvEls = $$('.rv');
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 }) : null;
  function revealCheck() {
    if (!io) { rvEls.forEach(function (el) { el.classList.add('in'); }); return; }
    rvEls.forEach(function (el) { io.observe(el); });
  }
  if (!cover) revealCheck();

  // Thanh điều hướng nhanh
  var qn = $('#quick-nav');
  if (qn) {
    window.addEventListener('scroll', function () {
      qn.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.8);
    }, { passive: true });
  }

  // ===== Đếm ngược =====
  var target = body.dataset.date ? new Date(body.dataset.date).getTime() : 0;
  var cd = $('#countdown');
  if (cd && target) {
    var els = { d: $('[data-cd=d]', cd), h: $('[data-cd=h]', cd), m: $('[data-cd=m]', cd), s: $('[data-cd=s]', cd) };
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var tick = function () {
      var diff = Math.max(0, target - Date.now());
      els.d.textContent = pad(Math.floor(diff / 864e5));
      els.h.textContent = pad(Math.floor(diff / 36e5) % 24);
      els.m.textContent = pad(Math.floor(diff / 6e4) % 60);
      els.s.textContent = pad(Math.floor(diff / 1e3) % 60);
    };
    tick();
    setInterval(tick, 1000);
  }

  // ===== Cánh hoa rơi =====
  function startPetals() {
    if (body.dataset.effects !== '1' || reduce) return;
    var box = $('#petals');
    var count = 0;
    var spawn = function () {
      if (count > 60 || document.hidden) return;
      var p = document.createElement('span');
      p.className = 'petal';
      var dur = 7 + Math.random() * 6;
      p.style.left = Math.random() * 100 + 'vw';
      p.style.animationDuration = dur + 's';
      p.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
      p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      p.style.transform = 'scale(' + (0.6 + Math.random() * 0.7) + ')';
      box.appendChild(p);
      count++;
      setTimeout(function () { p.remove(); count--; }, dur * 1000);
    };
    setInterval(spawn, 650);
  }

  // ===== Album / lightbox =====
  var lb = $('#lightbox');
  var imgs = $$('#album-grid img').map(function (i) { return i.src; });
  var cur = 0;
  var lastFocus = null;
  function showLb(i) {
    cur = (i + imgs.length) % imgs.length;
    lb.querySelector('img').src = imgs[cur];
  }
  function closeLb() { lb.classList.remove('is-open'); if (lastFocus) lastFocus.focus(); }
  $$('[data-lb]').forEach(function (b) {
    b.addEventListener('click', function () {
      lastFocus = b;
      showLb(Number(b.dataset.lb));
      lb.classList.add('is-open');
      lb.querySelector('.lb-close').focus();
    });
  });
  if (lb) {
    lb.querySelector('.lb-close').addEventListener('click', closeLb);
    lb.querySelector('.lb-prev').addEventListener('click', function () { showLb(cur - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { showLb(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') showLb(cur - 1);
      if (e.key === 'ArrowRight') showLb(cur + 1);
    });
  }

  // ===== Sao chép số tài khoản =====
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
        toast('Đã sao chép số tài khoản');
      }).catch(function () { toast(text); });
    });
  });

  // ===== Gửi biểu mẫu =====
  function submitForm(form, url, onOk) {
    var msg = form.querySelector('.form-msg');
    var btn = form.querySelector('button[type=submit]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.className = 'form-msg';
      var data = Object.fromEntries(new FormData(form).entries());
      var required = $$('[required]', form).filter(function (el) { return !el.value.trim(); });
      if (required.length) {
        msg.textContent = 'Vui lòng điền đầy đủ thông tin bắt buộc.';
        msg.className = 'form-msg err';
        required[0].focus();
        return;
      }
      if (isPreview || isDemo) {
        msg.textContent = 'Đây là bản xem trước – phản hồi thật sẽ được gửi khi thiệp đã xuất bản.';
        msg.className = 'form-msg ok';
        if (onOk) onOk(data, true);
        return;
      }
      btn.disabled = true;
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.j.error || 'Có lỗi xảy ra');
          msg.textContent = res.j.message || 'Cảm ơn bạn!';
          msg.className = 'form-msg ok';
          if (onOk) onOk(data, false);
        })
        .catch(function (err) {
          msg.textContent = err.message || 'Không gửi được, vui lòng thử lại.';
          msg.className = 'form-msg err';
        })
        .finally(function () { btn.disabled = false; });
    });
  }

  var rsvp = $('#rsvp-form');
  if (rsvp) {
    submitForm(rsvp, '/t/' + slug + '/rsvp', function () {
      rsvp.querySelector('button[type=submit]').innerHTML = 'Đã gửi xác nhận – cảm ơn bạn!';
    });
  }
  var wishForm = $('#wish-form');
  if (wishForm) {
    submitForm(wishForm, '/t/' + slug + '/loi-chuc', function (data) {
      var list = $('#wishes');
      var el = document.createElement('div');
      el.className = 'wish';
      var s = document.createElement('strong');
      s.textContent = data.name;
      var p = document.createElement('p');
      p.textContent = data.message;
      el.appendChild(s);
      el.appendChild(p);
      list.insertBefore(el, list.firstChild);
      wishForm.querySelector('textarea').value = '';
      wishForm.querySelector('.form-msg').textContent = 'Cảm ơn lời chúc của bạn!';
      wishForm.querySelector('.form-msg').className = 'form-msg ok';
    });
  }
})();
