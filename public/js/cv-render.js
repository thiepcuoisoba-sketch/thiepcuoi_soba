/* SOBA – bộ hiển thị thiệp thiết kế tự do (dùng chung cho trình thiết kế và trang khách xem) */
(function () {
  'use strict';
  var W = 420;
  var FALLBACK = { 'Great Vibes': 'cursive', 'Dancing Script': 'cursive', Charm: 'cursive', 'Be Vietnam Pro': 'sans-serif', Montserrat: 'sans-serif', Oswald: 'sans-serif' };
  var WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  var SVGNS = 'http://www.w3.org/2000/svg';

  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k) || attrs[k] == null || attrs[k] === false) continue;
        if (k === 'class') el.className = attrs[k];
        else if (k === 'text') el.textContent = attrs[k];
        else if (k === 'style') el.style.cssText = attrs[k];
        else el.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
      }
    }
    (kids || []).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }
  function font(name) {
    return "'" + (name || 'Be Vietnam Pro') + "', " + (FALLBACK[name] || 'serif');
  }
  function pad(n) {
    return String(n).padStart(2, '0');
  }
  function mainDate(doc) {
    if (!doc.date) return null;
    var p = doc.date.split('-').map(Number);
    var t = (doc.time || '00:00').split(':').map(Number);
    return new Date(p[0], p[1] - 1, p[2], t[0] || 0, t[1] || 0);
  }

  /** Thay các mã {ten_khach}, {chu_re}... trong chữ */
  function fill(text, ctx) {
    var doc = ctx.doc;
    var d = mainDate(doc);
    var map = {
      ten_khach: ctx.guestName || (ctx.mode === 'edit' ? 'Tên khách mời' : 'Quý khách'),
      chu_re: (doc.groom && doc.groom.name) || 'Chú rể',
      co_dau: (doc.bride && doc.bride.name) || 'Cô dâu',
      ngay: d ? pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() : '',
      gio: doc.time || '',
      thu: d ? WEEKDAYS[d.getDay()] : '',
      ngay_so: d ? pad(d.getDate()) : '',
      thang: d ? pad(d.getMonth() + 1) : '',
      nam: d ? String(d.getFullYear()) : '',
    };
    return String(text || '').replace(/\{(ten_khach|chu_re|co_dau|ngay_so|ngay|gio|thu|thang|nam)\}/g, function (_, k) {
      return map[k];
    });
  }

  // ===== Phần tử =====
  function textEl(e, ctx) {
    var css = [
      'font-family:' + font(e.font),
      'font-size:' + e.size + 'px',
      'color:' + e.color,
      'text-align:' + e.align,
      'line-height:' + e.lh,
      'letter-spacing:' + e.ls + 'px',
      'font-weight:' + (e.bold ? 700 : 400),
      'font-style:' + (e.italic ? 'italic' : 'normal'),
      'text-decoration:' + (e.underline ? 'underline' : 'none'),
      'text-transform:' + (e.upper ? 'uppercase' : 'none'),
      e.bg ? 'background:' + e.bg : '',
      e.shadow ? 'text-shadow:0 2px 8px rgba(0,0,0,.35)' : '',
    ].join(';');
    return h('div', { class: 'cv-text', style: css, text: fill(e.text, ctx) });
  }

  var FILTER = { none: '', warm: 'sepia(.25) saturate(1.2) brightness(1.03)', bw: 'grayscale(1) contrast(1.05)', film: 'contrast(1.1) saturate(.85) sepia(.15)', soft: 'brightness(1.08) saturate(.9) contrast(.92)' };

  function imageEl(e) {
    var radius = e.mask === 'circle' ? '50%' : e.mask === 'arch' ? e.w / 2 + 'px ' + e.w / 2 + 'px ' + e.radius + 'px ' + e.radius + 'px' : e.radius + 'px';
    var css = 'border-radius:' + radius + (e.border ? ';border:' + e.border + 'px solid ' + e.borderColor : '') + (e.shadow ? ';box-shadow:0 10px 30px -10px rgba(0,0,0,.45)' : '');
    var box = h('div', { class: 'cv-img', style: css });
    if (e.src) {
      box.appendChild(
        h('img', {
          src: e.src,
          alt: '',
          draggable: 'false',
          loading: 'lazy',
          style: 'object-position:' + e.ox + '% ' + e.oy + '%;transform:scale(' + e.zoom + ');transform-origin:' + e.ox + '% ' + e.oy + '%;' + (FILTER[e.filter] ? 'filter:' + FILTER[e.filter] : ''),
        })
      );
    } else {
      box.appendChild(h('div', { class: 'cv-img-empty' }, [h('span', { text: '+ Thêm ảnh' })]));
    }
    return box;
  }

  function svg(viewBox, path, e) {
    var s = document.createElementNS(SVGNS, 'svg');
    s.setAttribute('viewBox', viewBox);
    s.setAttribute('preserveAspectRatio', 'none');
    s.setAttribute('class', 'cv-svg');
    if (e.shadow) s.style.filter = 'drop-shadow(0 8px 14px rgba(0,0,0,.35))';
    var p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', path);
    p.setAttribute('fill', e.fill || 'none');
    if (e.stroke && e.sw) {
      p.setAttribute('stroke', e.stroke);
      p.setAttribute('stroke-width', e.sw);
      p.setAttribute('vector-effect', 'non-scaling-stroke');
    }
    s.appendChild(p);
    return s;
  }

  function shapeEl(e) {
    if (e.shape === 'heart') return svg('0 0 100 90', 'M50 88 C20 66 2 48 2 27 C2 12 14 2 28 2 C38 2 46 8 50 16 C54 8 62 2 72 2 C86 2 98 12 98 27 C98 48 80 66 50 88Z', e);
    if (e.shape === 'star') return svg('0 0 100 100', 'M50 3 L62 37 L98 38 L69 60 L80 96 L50 75 L20 96 L31 60 L2 38 L38 37Z', e);
    if (e.shape === 'tri') return svg('0 0 100 100', 'M0 0 L100 0 L50 100Z', e);
    var css = [];
    if (e.shape === 'line') css.push('background:' + (e.fill || e.stroke || '#999999'));
    else {
      if (e.fill) css.push('background:' + (e.grad ? 'linear-gradient(to ' + (e.grad === 'down' ? 'bottom' : 'top') + ',' + e.fill + ',transparent)' : e.fill));
      if (e.stroke && e.sw) css.push('border:' + e.sw + 'px solid ' + e.stroke);
      css.push('border-radius:' + (e.shape === 'circle' || e.shape === 'ring' ? '50%' : e.radius + 'px'));
    }
    if (e.shadow) css.push('box-shadow:0 12px 30px -12px rgba(0,0,0,.45)');
    return h('div', { class: 'cv-shape', style: css.join(';') });
  }

  // ===== Tiện ích =====
  function cdBox(n, label, e) {
    return h('div', { class: 'cv-cd-box', style: 'border-color:' + e.color }, [h('b', { 'data-cd': n, text: '00', style: 'color:' + e.color }), h('span', { text: label })]);
  }
  var WIDGETS = {
    countdown: function (e, ctx) {
      var d = mainDate(ctx.doc);
      return h('div', { class: 'cv-cd', 'data-target': d ? d.toISOString() : '' }, [cdBox('d', 'Ngày', e), cdBox('h', 'Giờ', e), cdBox('m', 'Phút', e), cdBox('s', 'Giây', e)]);
    },
    calendar: function (e, ctx) {
      var d = mainDate(ctx.doc) || new Date();
      var y = d.getFullYear();
      var m = d.getMonth();
      var first = (new Date(y, m, 1).getDay() + 6) % 7;
      var days = new Date(y, m + 1, 0).getDate();
      var grid = h('div', { class: 'cv-cal-grid' });
      ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].forEach(function (w) {
        grid.appendChild(h('span', { class: 'cv-cal-wd', text: w, style: 'color:' + e.color }));
      });
      for (var i = 0; i < first; i++) grid.appendChild(h('span'));
      for (var day = 1; day <= days; day++) {
        var on = day === d.getDate();
        grid.appendChild(h('span', { class: 'cv-cal-d' + (on ? ' on' : ''), style: on ? 'background:' + e.color : '' }, [String(day)]));
      }
      return h('div', { class: 'cv-cal' }, [h('div', { class: 'cv-cal-title', text: 'Tháng ' + (m + 1) + ' / ' + y }), grid]);
    },
    map: function (e, ctx) {
      var q = encodeURIComponent(e.address || '');
      var top =
        ctx.mode === 'edit' || !e.address
          ? h('div', { class: 'cv-map-ph' }, [h('span', { text: e.address ? '📍 ' + e.address : '📍 Nhập địa chỉ ở bảng bên phải' })])
          : h('iframe', { class: 'cv-map-frame', src: 'https://maps.google.com/maps?q=' + q + '&output=embed&hl=vi', loading: 'lazy', title: 'Bản đồ', referrerpolicy: 'no-referrer-when-downgrade' });
      return h('div', { class: 'cv-map' }, [
        top,
        h('a', { class: 'cv-btn', href: 'https://www.google.com/maps/search/?api=1&query=' + q, target: '_blank', rel: 'noopener', style: 'background:' + e.color, text: e.label || 'Chỉ đường' }),
      ]);
    },
    rsvp: function (e) {
      var form = h('form', { class: 'cv-form', 'data-rsvp': '' }, [
        h('input', { name: 'name', placeholder: 'Họ và tên của bạn *', maxlength: '120', required: true }),
        h('input', { name: 'phone', placeholder: 'Số điện thoại', maxlength: '30', inputmode: 'tel' }),
        h('select', { name: 'attending' }, [h('option', { value: 'yes', text: 'Tôi sẽ tham dự' }), h('option', { value: 'maybe', text: 'Chưa chắc chắn' }), h('option', { value: 'no', text: 'Rất tiếc, tôi không đến được' })]),
        h('div', { class: 'cv-row' }, [
          h('select', { name: 'side' }, [h('option', { value: '', text: 'Khách của…' }), h('option', { value: 'groom', text: 'Nhà trai' }), h('option', { value: 'bride', text: 'Nhà gái' })]),
          h('input', { name: 'guests', type: 'number', min: '1', max: '20', value: '1', 'aria-label': 'Số người' }),
        ]),
        h('textarea', { name: 'message', rows: '2', placeholder: 'Lời nhắn (không bắt buộc)', maxlength: '1000' }),
        h('input', { name: 'website', class: 'cv-hp', tabindex: '-1', autocomplete: 'off' }),
        h('button', { class: 'cv-btn', type: 'submit', style: 'background:' + e.color, text: 'Gửi xác nhận' }),
      ]);
      return h('div', { class: 'cv-card' }, [e.title ? h('div', { class: 'cv-w-title', text: e.title }) : null, form]);
    },
    wishes: function (e, ctx) {
      var list = h('div', { class: 'cv-wish-list', 'data-wish-list': '' });
      (ctx.wishes || []).forEach(function (w) {
        list.appendChild(wishItem(w, e));
      });
      if (!(ctx.wishes || []).length) list.appendChild(h('p', { class: 'cv-empty', text: 'Hãy là người đầu tiên gửi lời chúc nhé!' }));
      var form = h('form', { class: 'cv-form', 'data-wish': '' }, [
        h('input', { name: 'name', placeholder: 'Tên của bạn *', maxlength: '120', required: true }),
        h('textarea', { name: 'message', rows: '2', placeholder: 'Gửi lời chúc tới cô dâu chú rể *', maxlength: '1000', required: true }),
        h('input', { name: 'website', class: 'cv-hp', tabindex: '-1', autocomplete: 'off' }),
        h('button', { class: 'cv-btn', type: 'submit', style: 'background:' + e.color, text: 'Gửi lời chúc' }),
      ]);
      return h('div', { class: 'cv-card cv-wishes' }, [e.title ? h('div', { class: 'cv-w-title', text: e.title }) : null, form, list]);
    },
    gift: function (e, ctx) {
      var accs = e.accounts;
      if (!accs) {
        // Trình thiết kế: dựng tạm từ dữ liệu nhập
        accs = ['groom', 'bride']
          .filter(function (s) {
            return e[s] && e[s].bin && e[s].accountNo;
          })
          .map(function (s) {
            var b = (ctx.banks || []).find(function (x) {
              return x.bin === e[s].bin;
            });
            return { label: s === 'groom' ? 'Mừng cưới chú rể' : 'Mừng cưới cô dâu', bankName: b ? b.name : '', accountNo: e[s].accountNo, accountName: e[s].accountName, qr: 'https://img.vietqr.io/image/' + e[s].bin + '-' + e[s].accountNo + '-compact.png' };
          });
      }
      // Gói miễn phí không có hộp mừng cưới QR
      if (ctx.noGift) return h('div');
      if (!accs.length) {
        if (ctx.mode === 'edit') return h('div', { class: 'cv-card cv-empty', text: 'Nhập tài khoản ngân hàng ở bảng bên phải' });
        if (ctx.demo) accs = demoAccounts(ctx);
        else return h('div');
      }
      return h(
        'div',
        { class: 'cv-gift' },
        accs.map(function (a) {
          return h('div', { class: 'cv-card cv-gift-item' }, [
            h('div', { class: 'cv-w-title', text: a.label, style: 'color:' + e.color }),
            h('img', { src: a.qr, alt: 'Mã QR ' + a.label, loading: 'lazy' }),
            h('div', { class: 'cv-gift-info' }, [h('b', { text: a.bankName }), h('span', { text: a.accountNo }), h('small', { text: a.accountName })]),
            h('button', { class: 'cv-btn cv-btn-sm', type: 'button', 'data-copy': a.accountNo, style: 'background:' + e.color, text: 'Sao chép số TK' }),
          ]);
        })
      );
    },
    album: function (e) {
      var imgs = e.images || [];
      var rows = Math.max(1, Math.ceil(imgs.length / e.cols));
      var grid = h('div', { class: 'cv-album', style: 'grid-template-columns:repeat(' + e.cols + ',1fr);grid-template-rows:repeat(' + rows + ',1fr);gap:' + e.gap + 'px' });
      if (!imgs.length) grid.appendChild(h('div', { class: 'cv-img-empty', style: 'border-radius:' + e.radius + 'px' }, [h('span', { text: '+ Thêm ảnh vào album' })]));
      imgs.forEach(function (src, i) {
        grid.appendChild(h('button', { type: 'button', class: 'cv-album-item', 'data-album': i, style: 'border-radius:' + e.radius + 'px', 'aria-label': 'Xem ảnh ' + (i + 1) }, [h('img', { src: src, alt: '', loading: 'lazy', draggable: 'false' })]));
      });
      return grid;
    },
    call: function (e) {
      return h('a', { class: 'cv-btn cv-call', href: e.phone ? 'tel:' + e.phone : '#', style: 'background:' + e.color, text: '📞 ' + (e.label || 'Gọi điện') });
    },
  };

  /** Tài khoản minh hoạ cho bản xem thử mẫu – QR ảo, không chuyển khoản được */
  function demoAccounts(ctx) {
    var g = (ctx.doc.groom && ctx.doc.groom.name) || 'Chú rể';
    var b = (ctx.doc.bride && ctx.doc.bride.name) || 'Cô dâu';
    var up = function (s) {
      return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase();
    };
    return [
      { label: 'Mừng cưới chú rể', bankName: 'Ngân hàng (mẫu)', accountNo: '0123 456 789', accountName: up(g), qr: '/img/qr-mau.svg', demo: true },
      { label: 'Mừng cưới cô dâu', bankName: 'Ngân hàng (mẫu)', accountNo: '9876 543 210', accountName: up(b), qr: '/img/qr-mau.svg', demo: true },
    ];
  }

  function wishItem(w, e) {
    return h('div', { class: 'cv-wish' }, [h('b', { text: w.name, style: e ? 'color:' + e.color : '' }), h('p', { text: w.message })]);
  }

  function widgetEl(e, ctx) {
    var fn = WIDGETS[e.widget];
    var inner = fn ? fn(e, ctx) : h('div');
    var wrap = h('div', { class: 'cv-widget cv-w-' + e.widget, style: 'font-family:' + font(e.font) + ';color:' + e.textColor + (e.bg ? ';background:' + e.bg : '') }, [inner]);
    return wrap;
  }

  /** Hộp định vị của một phần tử */
  function renderElement(e, ctx) {
    var box = h('div', {
      class: 'cv-el cv-' + e.type + (ctx.mode === 'view' && e.anim !== 'none' ? ' cv-anim cv-anim-' + e.anim : ''),
      'data-id': e.id,
      style:
        'left:' + e.x + 'px;top:' + e.y + 'px;width:' + e.w + 'px;height:' + e.h + 'px;opacity:' + e.o + ';' +
        (e.r ? 'transform:rotate(' + e.r + 'deg);' : '') +
        (ctx.mode === 'view' && e.delay ? 'transition-delay:' + e.delay + 's;' : ''),
    });
    var inner = e.type === 'text' ? textEl(e, ctx) : e.type === 'image' ? imageEl(e) : e.type === 'shape' ? shapeEl(e) : widgetEl(e, ctx);
    box.appendChild(inner);
    return box;
  }

  function renderSection(sec, ctx) {
    var el = h('section', {
      class: 'cv-sec',
      'data-sec': sec.id,
      style: 'width:' + W + 'px;height:' + sec.h + 'px;background-color:' + sec.bg + (sec.bgImage ? ';background-image:url("' + sec.bgImage.replace(/"/g, '') + '")' : ''),
    });
    sec.els.forEach(function (e) {
      el.appendChild(renderElement(e, ctx));
    });
    return el;
  }

  /** Cập nhật mọi đồng hồ đếm ngược trong root */
  function tickCountdowns(root) {
    var now = Date.now();
    root.querySelectorAll('.cv-cd').forEach(function (cd) {
      var t = Date.parse(cd.getAttribute('data-target') || '');
      var diff = isNaN(t) ? 0 : Math.max(0, t - now);
      var v = { d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60 };
      cd.querySelectorAll('[data-cd]').forEach(function (b) {
        b.textContent = pad(v[b.getAttribute('data-cd')]);
      });
    });
  }

  window.SobaCV = { W: W, h: h, fill: fill, font: font, mainDate: mainDate, pad: pad, renderElement: renderElement, renderSection: renderSection, tickCountdowns: tickCountdowns, wishItem: wishItem, demoAccounts: demoAccounts };
})();
