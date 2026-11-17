/* SOBA – trang khách xem thiệp thiết kế tự do */
(function () {
  'use strict';
  var CV = window.SobaCV;
  var boot = JSON.parse(document.getElementById('cv-boot').textContent);
  var doc = boot.doc;
  var viewport = document.getElementById('cv-viewport');
  var stage = document.getElementById('cv-stage');
  var ctx = { doc: doc, guestName: boot.guestName, mode: 'view', wishes: boot.wishes, signatures: boot.signatures || [], demo: boot.demo, noGift: !boot.gift };
  var readOnly = boot.preview || boot.demo;

  if (boot.preview && window.self === window.top) viewport.parentNode.insertBefore(CV.h('div', { class: 'cv-preview-bar', text: boot.demo ? 'Bản xem thử mẫu thiệp' : 'Bản xem trước – khách mời sẽ thấy thiệp như thế này' }), viewport);

  doc.sections.forEach(function (s) {
    stage.appendChild(CV.renderSection(s, ctx));
  });
  if (boot.watermark) viewport.appendChild(CV.h('a', { class: 'cv-watermark', href: '/', target: '_blank', rel: 'noopener', text: 'Thiệp được tạo miễn phí tại SOBA ♥' }));

  // Co giãn khung thiết kế 420px theo màn hình
  var total = doc.sections.reduce(function (a, s) {
    return a + s.h;
  }, 0);
  function fit() {
    var w = viewport.clientWidth;
    var s = w / CV.W;
    stage.style.transform = 'scale(' + s + ')';
    stage.style.height = total + 'px';
    stage.parentNode.style.height = total * s + 'px';
  }
  fit();
  window.addEventListener('resize', fit);

  // Đếm ngược
  CV.tickCountdowns(stage);
  setInterval(function () {
    CV.tickCountdowns(stage);
  }, 1000);

  // Hiệu ứng xuất hiện
  var anims = stage.querySelectorAll('.cv-anim');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    anims.forEach(function (a) {
      io.observe(a);
    });
  } else
    anims.forEach(function (a) {
      a.classList.add('in');
    });

  function toast(msg) {
    var t = CV.h('div', { class: 'cv-toast', role: 'status', text: msg });
    document.body.appendChild(t);
    setTimeout(function () {
      t.remove();
    }, 3200);
  }

  function post(path, data) {
    return fetch('/t/' + encodeURIComponent(boot.slug) + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.error || 'Có lỗi xảy ra.');
        return j;
      });
    });
  }
  function formData(form) {
    var o = {};
    new FormData(form).forEach(function (v, k) {
      o[k] = v;
    });
    return o;
  }

  // Xác nhận tham dự
  stage.addEventListener('submit', function (ev) {
    var form = ev.target;
    var isRsvp = form.hasAttribute('data-rsvp');
    var isWish = form.hasAttribute('data-wish');
    if (!isRsvp && !isWish) return;
    ev.preventDefault();
    if (readOnly) return toast('Đây là bản xem trước – khách mời sẽ gửi được khi thiệp được xuất bản.');
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    var data = formData(form);
    post(isRsvp ? '/rsvp' : '/loi-chuc', data)
      .then(function (j) {
        if (isRsvp) {
          form.replaceWith(CV.h('p', { class: 'cv-empty', style: 'padding:20px', text: j.message || 'Cảm ơn bạn!' }));
        } else {
          var list = form.parentNode.querySelector('[data-wish-list]');
          if (j.wish) {
            var empty = list.querySelector('.cv-empty');
            if (empty) empty.remove();
            list.insertBefore(CV.wishItem(j.wish), list.firstChild);
          }
          form.reset();
          toast(j.private ? 'Lời chúc đã được gửi riêng tới cô dâu, chú rể 💌' : 'Cảm ơn bạn đã gửi lời chúc!');
        }
      })
      .catch(function (e) {
        toast(e.message);
      })
      .finally(function () {
        btn.disabled = false;
      });
  });

  // Lời chúc gợi ý (nút ✨ trong sổ lời chúc + bảng "Gửi lời chúc")
  var WISH_IDEAS = [
    'Chúc hai bạn trăm năm hạnh phúc! 💕',
    'Chúc mừng hạnh phúc! 🎉',
    'Đồng tâm đồng lòng, xây tổ ấm thịnh vượng ✨',
    'Sớm có tin vui nha! 👶',
    'Mãi yêu thương nhau như ngày đầu 🥰',
    'Chúc hai bạn bách niên giai lão, sắt son trọn đời 💍',
    'Chúc cô dâu chú rể luôn nắm tay nhau qua mọi mùa của cuộc đời 🌸',
    'Hạnh phúc ngập tràn, tiếng cười đầy nhà nhé! 🏡',
  ];
  var ideaIdx = Math.floor(Math.random() * WISH_IDEAS.length);

  // Khách chọn "không tham dự" → ẩn chọn số người / khách của
  stage.addEventListener('change', function (ev) {
    if (ev.target.name !== 'attending') return;
    var f = ev.target.form;
    if (f && f.hasAttribute('data-rsvp')) f.classList.toggle('cv-rsvp-no', ev.target.value === 'no');
  });

  // Sao chép số tài khoản, album, gợi ý lời chúc
  var albumImgs = [];
  var lbIndex = 0;
  var lb;
  function showLb(i) {
    lbIndex = (i + albumImgs.length) % albumImgs.length;
    lb.querySelector('img').src = albumImgs[lbIndex];
  }
  stage.addEventListener('click', function (ev) {
    var gb = ev.target.closest('[data-giftbox]');
    if (gb) {
      gb.parentNode.classList.toggle('open');
      return;
    }
    if (ev.target.closest('[data-sign]')) return openSignPad();
    if (ev.target.closest('.cv-anim-spin')) return toggleMusic();
    var sg = ev.target.closest('[data-suggest]');
    if (sg) {
      var ta = sg.parentNode.querySelector('textarea');
      ta.value = WISH_IDEAS[ideaIdx++ % WISH_IDEAS.length];
      ta.focus();
      return;
    }
    var c = ev.target.closest('[data-copy]');
    if (c) {
      var v = c.getAttribute('data-copy');
      (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(
        function () {
          toast('Đã sao chép số tài khoản ' + v);
        },
        function () {
          toast('Số tài khoản: ' + v);
        }
      );
      return;
    }
    var a = ev.target.closest('[data-album]');
    if (a) {
      albumImgs = Array.prototype.map.call(a.parentNode.querySelectorAll('img'), function (i) {
        return i.src;
      });
      lb = CV.h('div', { class: 'cv-lightbox', role: 'dialog', 'aria-label': 'Xem ảnh' }, [
        CV.h('img', { alt: '' }),
        CV.h('button', { class: 'cv-lb-close', type: 'button', 'aria-label': 'Đóng', text: '×' }),
        CV.h('button', { class: 'cv-lb-prev', type: 'button', 'aria-label': 'Ảnh trước', text: '‹' }),
        CV.h('button', { class: 'cv-lb-next', type: 'button', 'aria-label': 'Ảnh sau', text: '›' }),
      ]);
      document.body.appendChild(lb);
      showLb(Number(a.getAttribute('data-album')));
      lb.addEventListener('click', function (e2) {
        if (e2.target.classList.contains('cv-lb-prev')) showLb(lbIndex - 1);
        else if (e2.target.classList.contains('cv-lb-next')) showLb(lbIndex + 1);
        else if (e2.target.tagName !== 'IMG') lb.remove();
      });
    }
  });
  document.addEventListener('keydown', function (e) {
    if (!lb || !lb.isConnected) return;
    if (e.key === 'Escape') lb.remove();
    if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
    if (e.key === 'ArrowRight') showLb(lbIndex + 1);
  });

  // Nhạc nền
  var playMusic = function () {};
  var toggleMusic = function () {};
  var musicOn = function () {
    return false;
  };
  if (doc.music && doc.music.url) {
    var melody = window.SobaMusic && window.SobaMusic.keyOf(doc.music.url);
    var audio = melody ? window.SobaMusic.create(melody) : new Audio(doc.music.url);
    audio.loop = true;
    var disc = firstPhoto();
    var mbtn = CV.h('button', { class: 'cv-music' + (boot.toolbar ? ' cv-music-top' : '') + (disc ? ' cv-disc' : ''), type: 'button', 'aria-label': 'Bật/tắt nhạc nền' }, [disc ? CV.h('img', { src: disc, alt: '' }) : null, CV.h('span', { class: 'cv-music-ic', 'aria-hidden': 'true', text: '♫' })]);
    document.body.appendChild(mbtn);
    playMusic = function () {
      return audio.play().then(
        function () {
          mbtn.classList.add('on');
          document.body.classList.add('cv-playing');
        },
        function () {}
      );
    };
    toggleMusic = function () {
      if (audio.paused) playMusic();
      else {
        audio.pause();
        mbtn.classList.remove('on');
        document.body.classList.remove('cv-playing');
      }
    };
    musicOn = function () {
      return !audio.paused;
    };
    mbtn.addEventListener('click', function () {
      toggleMusic();
    });
    if (doc.music.autoplay && !boot.opener) {
      var once = function () {
        playMusic();
        document.removeEventListener('pointerdown', once);
        document.removeEventListener('scroll', once);
      };
      document.addEventListener('pointerdown', once);
      document.addEventListener('scroll', once, { passive: true });
    }
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var h = CV.h;
  var coupleName = ((doc.groom && doc.groom.name) || 'Chú rể') + ' & ' + ((doc.bride && doc.bride.name) || 'Cô dâu');
  var md = CV.mainDate(doc);
  var dateDots = md ? CV.pad(md.getDate()) + ' · ' + CV.pad(md.getMonth() + 1) + ' · ' + md.getFullYear() : '';

  // ===== Màn mở thiệp (gói Basic trở lên) =====
  function firstPhoto() {
    var best = null;
    (doc.sections[0] ? doc.sections[0].els : []).forEach(function (e) {
      if (e.type === 'image' && e.src && (!best || e.w * e.h > best.w * best.h)) best = e;
    });
    return best ? best.src : '';
  }
  var FP_PATHS = ['M30 44a18 18 0 0 1 36 0', 'M24 50a24 24 0 0 1 48-6', 'M36 50c0-8 5-13 12-13s12 5 12 13c0 9-2 16-6 22', 'M42 52c0-4 2-7 6-7s6 3 6 7c0 10-3 18-9 25', 'M48 54c0 10-2 18-8 26', 'M30 56c0 9 3 17 8 24', 'M66 52c0 8-1 15-4 21', 'M20 62c1 6 3 11 6 15', 'M33 22a30 30 0 0 1 38 14'];
  function fingerprintSvg() {
    var ns = 'http://www.w3.org/2000/svg';
    var s = document.createElementNS(ns, 'svg');
    s.setAttribute('viewBox', '0 0 96 96');
    ['cvo-fp-base', 'cvo-fp-ink'].forEach(function (cls) {
      var g = document.createElementNS(ns, 'g');
      g.setAttribute('class', cls);
      FP_PATHS.forEach(function (d) {
        var p = document.createElementNS(ns, 'path');
        p.setAttribute('d', d);
        g.appendChild(p);
      });
      s.appendChild(g);
    });
    return s;
  }
  function openerContent(o) {
    var guest = boot.guestName ? h('div', { class: 'cvo-guest' }, ['Trân trọng kính mời', h('b', { text: boot.guestName })]) : null;
    var names = h('div', { class: 'cvo-names', text: coupleName });
    var date = h('div', { class: 'cvo-date', text: dateDots });
    var hint = h('div', { class: 'cvo-hint', text: o.style === 'fingerprint' ? 'Chạm vào vân tay để mở thiệp' : 'Chạm để mở thiệp' });
    if (o.style === 'envelope') {
      return [
        h('div', { class: 'cvo-env' }, [
          h('div', { class: 'cvo-env-letter' }, [h('div', { class: 'cvo-pre', text: 'Thiệp mời cưới' }), names, date]),
          h('div', { class: 'cvo-env-back' }),
          h('div', { class: 'cvo-env-flap' }),
          h('div', { class: 'cvo-env-front' }, [guest]),
          h('div', { class: 'cvo-seal' }, [h('span', { text: '♥' })]),
        ]),
        hint,
      ];
    }
    if (o.style === 'fingerprint') {
      return [h('div', { class: 'cvo-card' }, [h('div', { class: 'cvo-pre', text: 'Thiệp mời cưới' }), names, date, h('div', { class: 'cvo-fp' }, [fingerprintSvg(), h('span', { class: 'cvo-fp-bar' })]), guest, hint])];
    }
    if (o.style === 'doors') {
      return [
        h('div', { class: 'cvo-door l' }, [h('span', { class: 'cvo-knob' })]),
        h('div', { class: 'cvo-door r' }, [h('span', { class: 'cvo-knob' })]),
        h('div', { class: 'cvo-card' }, [h('div', { class: 'cvo-hy', text: '囍' }), h('div', { class: 'cvo-pre', text: 'Lễ thành hôn' }), names, date, guest, hint]),
      ];
    }
    if (o.style === 'curtain') {
      // Rèm lụa hai bên + khung vòm: ảnh trái tim, "Kính gửi" tên khách, nút mở thiệp
      var pic = firstPhoto();
      return [
        h('div', { class: 'cvo-cur l' }),
        h('div', { class: 'cvo-cur r' }),
        h('div', { class: 'cvo-card cvo-arch' }, [
          h('div', { class: 'cvo-pre', text: 'Kính gửi' }),
          h('div', { class: 'cvo-to', text: boot.guestName || 'Quý Khách' }),
          pic ? h('div', { class: 'cvo-heart' }, [h('img', { src: pic, alt: '' })]) : null,
          h('div', { class: 'cvo-names cvo-names-stack' }, [h('span', { text: (doc.groom && doc.groom.name) || 'Chú rể' }), h('i', { text: '&' }), h('span', { text: (doc.bride && doc.bride.name) || 'Cô dâu' })]),
          h('span', { class: 'cvo-btn', text: 'Ấn mở thiệp' }),
        ]),
      ];
    }
    if (o.style === 'stars') {
      // Bầu trời sao lấp lánh + sao băng
      var sky = h('div', { class: 'cvo-sky', 'aria-hidden': 'true' });
      for (var i = 0; i < 70; i++) {
        sky.appendChild(h('span', { class: 'cvo-star', style: 'left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (Math.random() * 100).toFixed(1) + '%;animation-delay:' + (Math.random() * 3).toFixed(2) + 's;--s:' + (1 + Math.random() * 2.2).toFixed(1) + 'px' }));
      }
      for (var k = 0; k < 3; k++) sky.appendChild(h('span', { class: 'cvo-shoot', style: 'top:' + (8 + k * 18) + '%;left:' + (55 + k * 12) + '%;animation-delay:' + (k * 2.3 + 0.6) + 's' }));
      return [
        sky,
        h('div', { class: 'cvo-card cvo-night' }, [
          h('div', { class: 'cvo-pre', text: 'Thiệp mời cưới' }),
          names,
          date,
          h('div', { class: 'cvo-guest' }, ['Kính mời', h('b', { text: boot.guestName || 'Quý Khách' })]),
          h('span', { class: 'cvo-btn', text: 'Mở thiệp' }),
        ]),
      ];
    }
    // book: bìa thiệp có ảnh, lật sang trái
    var src = firstPhoto();
    return [
      h('div', { class: 'cvo-bk' }, [
        h('div', { class: 'cvo-page' }, [h('div', { class: 'cvo-pre', text: 'Save the date' }), names, date, guest]),
        h('div', { class: 'cvo-cover' }, [src ? h('img', { src: src, alt: '' }) : null, h('div', { class: 'cvo-cover-txt' }, [h('div', { class: 'cvo-pre', text: 'Wedding Invitation' }), h('div', { class: 'cvo-names', text: coupleName })])]),
      ]),
      hint,
    ];
  }
  /** Bướm bay lên khi rèm mở (SVG tự vẽ, màu theo màu chính của thiệp) */
  function butterflies() {
    var ns = 'http://www.w3.org/2000/svg';
    var col = (boot.opener && boot.opener.color) || '#c9a46a';
    for (var i = 0; i < 14; i++) {
      var s = document.createElementNS(ns, 'svg');
      s.setAttribute('viewBox', '0 0 40 30');
      s.setAttribute('class', 'cvo-fly');
      ['M20 15C14 2 2 2 3 10s9 9 17 5', 'M20 15C26 2 38 2 37 10s-9 9-17 5', 'M20 15c-6 6-12 13-6 14s6-8 6-14', 'M20 15c6 6 12 13 6 14s-6-8-6-14'].forEach(function (d, j) {
        var p = document.createElementNS(ns, 'path');
        p.setAttribute('d', d);
        p.setAttribute('fill', col);
        p.setAttribute('fill-opacity', j < 2 ? '.85' : '.6');
        p.setAttribute('class', j % 2 ? 'w-r' : 'w-l');
        s.appendChild(p);
      });
      var size = 22 + Math.random() * 22;
      s.style.cssText = 'left:' + (30 + Math.random() * 40) + 'vw;top:' + (45 + Math.random() * 30) + 'vh;width:' + size + 'px;height:' + size * 0.75 + 'px';
      document.body.appendChild(s);
      var dx = (Math.random() - 0.5) * 120;
      var anim = s.animate(
        [
          { transform: 'translate(0,0) rotate(0deg)', opacity: 0 },
          { opacity: 1, offset: 0.15 },
          { transform: 'translate(' + dx * 0.6 + 'vw,-45vh) rotate(' + (dx > 0 ? 18 : -18) + 'deg)', opacity: 1, offset: 0.7 },
          { transform: 'translate(' + dx + 'vw,-80vh) rotate(' + (dx > 0 ? 30 : -30) + 'deg)', opacity: 0 },
        ],
        { duration: 2600 + Math.random() * 1600, delay: i * 70, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' }
      );
      anim.onfinish = s.remove.bind(s);
    }
  }
  var afterOpen = [];
  function showOpener() {
    var o = boot.opener;
    var rgb = [1, 3, 5].map(function (i) {
      return parseInt(o.paper.substr(i, 2), 16) / 255;
    });
    var dark = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] < 0.45;
    var root = h('div', { class: 'cvo cvo-' + o.style + (dark ? ' cvo-dark' : ''), role: 'button', tabindex: '0', 'aria-label': 'Mở thiệp cưới', style: '--cvo-c:' + o.color + ';--cvo-paper:' + o.paper + ';--cvo-font:' + CV.font(o.font) }, openerContent(o));
    document.body.appendChild(root);
    document.body.classList.add('cvo-lock');
    var opened = false;
    function open() {
      if (opened) return;
      opened = true;
      if (doc.music && doc.music.autoplay) playMusic(); // trình duyệt cho phát vì đây là thao tác của khách
      root.classList.add('opening');
      if (o.style === 'curtain' && !reduced) butterflies();
      var wait = reduced ? 50 : o.style === 'fingerprint' ? 1100 : o.style === 'curtain' || o.style === 'stars' ? 700 : 250;
      setTimeout(function () {
        root.classList.add('open');
        document.body.classList.remove('cvo-lock');
        window.scrollTo(0, 0);
      }, wait);
      setTimeout(function () {
        root.remove();
        afterOpen.forEach(function (fn) {
          fn();
        });
      }, wait + (reduced ? 50 : 1500));
    }
    root.addEventListener('click', open);
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  }

  // ===== Thanh tiện ích nổi: RSVP, lời chúc, bắn tim, hộp quà, thả tim =====
  var store = {
    key: 'soba_' + (boot.slug || 'demo') + '_',
    get: function (k, d) {
      try {
        var v = localStorage.getItem(this.key + k);
        return v ? JSON.parse(v) : d;
      } catch (_) {
        return d;
      }
    },
    set: function (k, v) {
      try {
        localStorage.setItem(this.key + k, JSON.stringify(v));
      } catch (_) {}
    },
  };
  var HEARTS = ['❤️', '💕', '💖', '💗', '💘', '🌸'];
  function hearts(x, y, n) {
    if (reduced) n = Math.min(n, 4);
    for (var i = 0; i < n; i++) {
      var el = h('div', { class: 'cvt-fh', text: HEARTS[(Math.random() * HEARTS.length) | 0], style: 'left:' + x + 'px;top:' + y + 'px;font-size:' + (16 + Math.random() * 22) + 'px' });
      document.body.appendChild(el);
      var dx = (Math.random() - 0.5) * 260;
      var dy = -(260 + Math.random() * 420);
      var rot = (Math.random() - 0.5) * 90;
      var anim = el.animate(
        [
          { transform: 'translate(0,0) scale(.4)', opacity: 1 },
          { transform: 'translate(' + dx * 0.5 + 'px,' + dy * 0.5 + 'px) scale(1.1) rotate(' + rot / 2 + 'deg)', opacity: 1, offset: 0.5 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.9) rotate(' + rot + 'deg)', opacity: 0 },
        ],
        { duration: 1400 + Math.random() * 1300, easing: 'cubic-bezier(.2,.6,.3,1)', delay: i * 35 }
      );
      anim.onfinish = el.remove.bind(el);
    }
  }
  var sheetBg = null;
  var openSheetEl = null;
  function closeSheet() {
    if (openSheetEl) openSheetEl.classList.remove('open');
    if (sheetBg) sheetBg.classList.remove('open');
    openSheetEl = null;
  }
  function sheet(title, sub, body) {
    if (!sheetBg) {
      sheetBg = h('div', { class: 'cvt-sheet-bg' });
      sheetBg.addEventListener('click', closeSheet);
      document.body.appendChild(sheetBg);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeSheet();
      });
    }
    var x = h('button', { class: 'cvt-x', type: 'button', 'aria-label': 'Đóng', text: '×' });
    x.addEventListener('click', closeSheet);
    var el = h('div', { class: 'cvt-sheet', role: 'dialog', 'aria-label': title }, [h('div', { class: 'cvt-grab' }), x, h('h3', { text: title }), sub ? h('p', { class: 'cvt-sub', text: sub }) : null].concat(body));
    document.body.appendChild(el);
    return {
      el: el,
      show: function () {
        closeSheet();
        openSheetEl = el;
        el.classList.add('open');
        sheetBg.classList.add('open');
      },
    };
  }
  function giftAccounts() {
    if (!boot.gift) return [];
    var list = [];
    doc.sections.forEach(function (s) {
      s.els.forEach(function (e) {
        if (e.type === 'widget' && e.widget === 'gift' && e.accounts) list = list.concat(e.accounts);
      });
    });
    if (!list.length && boot.demo) list = CV.demoAccounts(ctx);
    return list;
  }
  function buildToolbar() {
    var accent = (boot.opener && boot.opener.color) || '#d6456c';
    document.body.style.setProperty('--cvt-c', accent);
    document.body.classList.add('cvt-on');
    var bar = h('div', { class: 'cvt-bar' });
    var wishBox = h('div', { class: 'cvt-wishes', 'aria-live': 'polite' });
    document.body.appendChild(wishBox);
    document.body.appendChild(bar);

    // Nút xác nhận tham dự → cuộn tới form RSVP trên thiệp
    var rsvpForm = stage.querySelector('[data-rsvp]');
    if (rsvpForm) {
      var bR = h('button', { class: 'cvt-b cvt-red', type: 'button', 'aria-label': 'Xác nhận tham dự', text: '✉' });
      bR.addEventListener('click', function () {
        rsvpForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      bar.appendChild(bR);
    }

    // Gửi lời chúc (bottom sheet) + lời chúc bay
    var chips = WISH_IDEAS.slice(0, 5);
    var wf = h('form', { class: 'cvt-form' }, [
      h('input', { name: 'name', placeholder: 'Tên của bạn *', maxlength: '120', required: true, value: boot.guestName || '' }),
      h('textarea', { name: 'message', rows: '3', placeholder: 'Viết lời chúc của bạn…', maxlength: '1000', required: true }),
      wishPrivacy ? h('select', { name: 'visibility', 'aria-label': 'Ai sẽ thấy lời nhắn này?' }, [h('option', { value: 'public', text: 'Ai thấy: Tất cả mọi người' }), h('option', { value: 'private', text: 'Ai thấy: Chỉ cô dâu, chú rể' })]) : null,
      h('input', { name: 'website', class: 'cv-hp', tabindex: '-1', autocomplete: 'off' }),
      h(
        'div',
        { class: 'cvt-chips' },
        chips.map(function (c) {
          return h('button', { type: 'button', text: c });
        })
      ),
      h('button', { class: 'cvt-send', type: 'submit', text: 'Gửi lời chúc' }),
    ]);
    wf.querySelector('.cvt-chips').addEventListener('click', function (e) {
      if (e.target.tagName === 'BUTTON') wf.elements.message.value = e.target.textContent;
    });
    var wSheet = sheet('Gửi lời chúc', 'tới ' + coupleName, [wf]);
    var pill = h('button', { class: 'cvt-pill', type: 'button' }, [h('span', { text: 'Gửi lời chúc…' }), h('span', { 'aria-hidden': 'true', text: '💬' })]);
    pill.addEventListener('click', wSheet.show);
    bar.appendChild(pill);

    var pool = (boot.wishes || []).slice(0, 30).map(function (w) {
      return { n: w.name, m: w.message };
    });
    var coupleMsgs = [{ n: coupleName, m: 'Cảm ơn bạn đã mở thiệp cưới của chúng mình 💕' }, { n: coupleName, m: dateDots ? 'Hẹn gặp bạn ngày ' + dateDots.replace(/ · /g, '.') + ' nhé! 🎉' : 'Hẹn gặp bạn trong ngày vui nhé! 🎉' }, { n: coupleName, m: 'Bấm “Gửi lời chúc” để gửi lời yêu thương tới chúng mình ✨' }];
    // Ít lời chúc thì trộn thêm lời nhắn của cô dâu chú rể cho đỡ lặp
    if (pool.length < 4) pool = coupleMsgs.slice(0, 1).concat(pool, coupleMsgs.slice(1));
    function bubble(w, mine) {
      var d = h('div', { class: 'cvt-wb' + (mine ? ' mine' : '') }, [h('b', { text: w.n }), ': ', h('span', { text: w.m })]);
      wishBox.appendChild(d);
      while (wishBox.children.length > 2) wishBox.firstElementChild.remove();
      setTimeout(function () {
        d.classList.add('out');
        setTimeout(function () {
          d.remove();
        }, 500);
      }, 6000);
    }
    var wi = 0;
    bubble(pool[wi++ % pool.length]);
    setInterval(function () {
      if (!document.hidden) bubble(pool[wi++ % pool.length]);
    }, 4000);

    wf.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var r = pill.getBoundingClientRect();
      if (readOnly) {
        closeSheet();
        return toast('Đây là bản xem trước – khách mời sẽ gửi được khi thiệp được xuất bản.');
      }
      var btn = wf.querySelector('.cvt-send');
      btn.disabled = true;
      post('/loi-chuc', formData(wf))
        .then(function (j) {
          var w = { n: wf.elements.name.value.trim(), m: wf.elements.message.value.trim() };
          if (!j.private) {
            pool.push(w);
            bubble(w, true);
          }
          var list = stage.querySelector('[data-wish-list]');
          if (list && j.wish) {
            var empty = list.querySelector('.cv-empty');
            if (empty) empty.remove();
            list.insertBefore(CV.wishItem(j.wish), list.firstChild);
          }
          wf.elements.message.value = '';
          closeSheet();
          hearts(r.left + r.width / 2, r.top, 14);
          toast(j.private ? 'Lời chúc đã được gửi riêng tới cô dâu, chú rể 💌' : 'Cảm ơn bạn đã gửi lời chúc!');
        })
        .catch(function (e) {
          toast(e.message);
        })
        .finally(function () {
          btn.disabled = false;
        });
    });

    // Bắn tim
    var bS = h('button', { class: 'cvt-shoot', type: 'button' }, [h('span', { 'aria-hidden': 'true', text: '💘' }), 'Bắn tim']);
    bS.addEventListener('click', function () {
      var r = bS.getBoundingClientRect();
      hearts(r.left + r.width / 2, r.top, 28);
      if (!reduced) {
        var big = h('div', { class: 'cvt-big', text: '💖' });
        document.body.appendChild(big);
        setTimeout(function () {
          big.remove();
        }, 1300);
      }
    });
    bar.appendChild(bS);

    // Hộp mừng cưới QR
    var accs = giftAccounts();
    if (accs.length) {
      var items = accs.map(function (a) {
        var cp = h('button', { class: 'cvt-copy', type: 'button', 'data-copy': a.accountNo.replace(/\s/g, ''), text: 'Sao chép số tài khoản' });
        return h('div', { class: 'cvt-qr' }, [
          h('div', { class: 'cvt-qr-l', text: a.label }),
          h('img', { src: a.qr, alt: 'Mã QR ' + a.label, loading: 'lazy' }),
          h('div', { class: 'cvt-qr-bank', text: a.bankName }),
          h('div', { class: 'cvt-qr-name', text: a.accountName }),
          h('div', { class: 'cvt-qr-no', text: a.accountNo }),
          cp,
          a.demo ? h('small', { class: 'cvt-demo', text: 'QR minh hoạ – thiệp thật hiện QR ngân hàng của bạn' }) : null,
        ]);
      });
      var gSheet = sheet('Hộp mừng cưới', 'Gửi gắm món quà chúc phúc tới cô dâu & chú rể', [h('div', { class: 'cvt-qrs' }, items)]);
      gSheet.el.addEventListener('click', function (e) {
        var c = e.target.closest('[data-copy]');
        if (!c) return;
        var v = c.getAttribute('data-copy');
        (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(
          function () {
            c.textContent = 'Đã sao chép ✓';
          },
          function () {
            c.textContent = 'STK: ' + v;
          }
        );
      });
      var bG = h('button', { class: 'cvt-b', type: 'button', 'aria-label': 'Hộp mừng cưới', text: '🎁' });
      bG.addEventListener('click', gSheet.show);
      bar.appendChild(bG);
    }

    // Thả tim (đếm trên máy khách)
    var likes = store.get('likes', 0);
    var cnt = h('span', { class: 'cvt-cnt', text: String(likes) });
    var bL = h('button', { class: 'cvt-b cvt-like', type: 'button', 'aria-label': 'Thả tim' }, [h('span', { 'aria-hidden': 'true', text: '❤' }), cnt]);
    bL.addEventListener('click', function () {
      likes++;
      store.set('likes', likes);
      cnt.textContent = String(likes);
      bL.classList.remove('pop');
      void bL.offsetWidth;
      bL.classList.add('pop');
      var r = bL.getBoundingClientRect();
      hearts(r.left + 20, r.top, 6);
    });
    bar.appendChild(bL);
    requestAnimationFrame(function () {
      document.body.classList.add('cvt-show');
    });
  }

  // ===== Ký tên lưu bút: bảng vẽ chữ ký =====
  var wishPrivacy = doc.sections.some(function (sec) {
    return sec.els.some(function (e) {
      return e.widget === 'wishes' && e.privacy;
    });
  });
  var signSheet = null;
  function openSignPad() {
    if (!signSheet) {
      var pad = h('canvas', { class: 'cvs-pad', width: '600', height: '300', 'aria-label': 'Vùng ký tên – dùng ngón tay hoặc chuột để ký' });
      var nameIn = h('input', { name: 'name', placeholder: 'Tên của bạn *', maxlength: '60', value: boot.guestName || '' });
      var again = h('button', { type: 'button', class: 'cvs-clear', text: 'Ký lại' });
      var send = h('button', { type: 'button', class: 'cvt-send', text: 'Gửi chữ ký' });
      var g = pad.getContext('2d');
      var drawing = false;
      var dirty = false;
      var last = null;
      var setPen = function () {
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.lineWidth = 5;
        g.strokeStyle = '#2b2622';
      };
      setPen();
      var pos = function (e) {
        var r = pad.getBoundingClientRect();
        return { x: ((e.clientX - r.left) * pad.width) / r.width, y: ((e.clientY - r.top) * pad.height) / r.height };
      };
      pad.addEventListener('pointerdown', function (e) {
        drawing = true;
        last = pos(e);
        pad.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      pad.addEventListener('pointermove', function (e) {
        if (!drawing) return;
        var p = pos(e);
        g.beginPath();
        g.moveTo(last.x, last.y);
        g.lineTo(p.x, p.y);
        g.stroke();
        last = p;
        dirty = true;
        pad.parentNode.classList.add('signed');
      });
      ['pointerup', 'pointercancel'].forEach(function (t) {
        pad.addEventListener(t, function () {
          drawing = false;
        });
      });
      again.addEventListener('click', function () {
        g.clearRect(0, 0, pad.width, pad.height);
        setPen();
        dirty = false;
        pad.parentNode.classList.remove('signed');
      });
      send.addEventListener('click', function () {
        var name = nameIn.value.trim();
        if (!name) return nameIn.focus();
        if (!dirty) return toast('Bạn hãy ký vào khung trước nhé!');
        if (readOnly) {
          closeSheet();
          return toast('Đây là bản xem trước – khách mời sẽ ký được khi thiệp được xuất bản.');
        }
        send.disabled = true;
        post('/ky-ten', { name: name, data: pad.toDataURL('image/png') })
          .then(function (j) {
            if (j.signature) {
              stage.querySelectorAll('[data-sign-wall]').forEach(function (w) {
                var em = w.querySelector('.cv-sign-empty');
                if (em) em.remove();
                w.insertBefore(CV.signItem(j.signature, 0), w.firstChild);
              });
            }
            again.click();
            closeSheet();
            toast('Cảm ơn bạn đã ký tên chúc phúc! ✍');
          })
          .catch(function (e) {
            toast(e.message);
          })
          .finally(function () {
            send.disabled = false;
          });
      });
      signSheet = sheet('Ký tên lưu bút', 'Chữ ký của bạn sẽ được lưu trên thiệp như một cuốn sổ kỷ niệm', [
        h('div', { class: 'cvt-form' }, [nameIn, h('div', { class: 'cvs-wrap' }, [pad, h('span', { class: 'cvs-hint', 'aria-hidden': 'true', text: 'Ký vào đây' })]), h('div', { class: 'cvs-row' }, [again, send])]),
      ]);
    }
    signSheet.show();
  }

  if (boot.toolbar) {
    if (boot.opener) afterOpen.push(buildToolbar);
    else buildToolbar();
  }
  if (boot.opener) showOpener();

  // Cánh hoa rơi
  if (boot.petals && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var n = 0;
    var timer = setInterval(function () {
      if (++n > 40) return clearInterval(timer);
      var p = CV.h('span', { class: 'cv-petal', style: 'left:' + Math.random() * 100 + 'vw;animation-duration:' + (6 + Math.random() * 5) + 's;--dx:' + (Math.random() * 120 - 60) + 'px' });
      document.body.appendChild(p);
      setTimeout(function () {
        p.remove();
      }, 12000);
    }, 450);
  }
})();
