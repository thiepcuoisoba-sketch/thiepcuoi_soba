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

  // ===== Âm lịch Việt Nam (múi giờ +7) – theo thuật toán thiên văn công bố rộng rãi của Hồ Ngọc Đức =====
  var LUNAR_TZ = 7;
  function jdFromDate(dd, mm, yy) {
    var a = Math.floor((14 - mm) / 12);
    var y = yy + 4800 - a;
    var m = mm + 12 * a - 3;
    var jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    if (jd < 2299161) jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
    return jd;
  }
  function newMoonDay(k) {
    var T = k / 1236.85;
    var T2 = T * T;
    var T3 = T2 * T;
    var dr = Math.PI / 180;
    var jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    var M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    var Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    var F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    var c = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    c = c - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr) - 0.0004 * Math.sin(dr * 3 * Mpr);
    c = c + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr)) - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    c = c - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr)) + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    var dt = T < -11 ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3 : -0.000278 + 0.000265 * T + 0.000262 * T2;
    return Math.floor(jd1 + c - dt + 0.5 + LUNAR_TZ / 24);
  }
  function sunLongitude(jdn) {
    var T = (jdn - 2451545.5 - LUNAR_TZ / 24) / 36525;
    var T2 = T * T;
    var dr = Math.PI / 180;
    var M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    var L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    var DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M) + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
    var L = (L0 + DL) * dr;
    L = L - Math.PI * 2 * Math.floor(L / (Math.PI * 2));
    return Math.floor((L / Math.PI) * 6);
  }
  function lunarMonth11(yy) {
    var k = Math.floor((jdFromDate(31, 12, yy) - 2415021) / 29.530588853);
    var nm = newMoonDay(k);
    return sunLongitude(nm) >= 9 ? newMoonDay(k - 1) : nm;
  }
  function leapMonthOffset(a11) {
    var k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    var last;
    var i = 1;
    var arc = sunLongitude(newMoonDay(k + i));
    do {
      last = arc;
      i++;
      arc = sunLongitude(newMoonDay(k + i));
    } while (arc !== last && i < 14);
    return i - 1;
  }
  /** Dương lịch → [ngày, tháng, năm, nhuận] âm lịch */
  function toLunar(dd, mm, yy) {
    var day = jdFromDate(dd, mm, yy);
    var k = Math.floor((day - 2415021.076998695) / 29.530588853);
    var start = newMoonDay(k + 1);
    if (start > day) start = newMoonDay(k);
    var a11 = lunarMonth11(yy);
    var b11 = a11;
    var ly;
    if (a11 >= start) {
      ly = yy;
      a11 = lunarMonth11(yy - 1);
    } else {
      ly = yy + 1;
      b11 = lunarMonth11(yy + 1);
    }
    var diff = Math.floor((start - a11) / 29);
    var leap = false;
    var lm = diff + 11;
    if (b11 - a11 > 365) {
      var lo = leapMonthOffset(a11);
      if (diff >= lo) {
        lm = diff + 10;
        leap = diff === lo;
      }
    }
    if (lm > 12) lm -= 12;
    if (lm >= 11 && diff < 4) ly -= 1;
    return [day - start + 1, lm, ly, leap];
  }
  var CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
  var CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];
  /** "20 tháng 11 năm Bính Ngọ" */
  function lunarText(d) {
    if (!d) return '';
    var l = toLunar(d.getDate(), d.getMonth() + 1, d.getFullYear());
    return l[0] + ' tháng ' + l[1] + (l[3] ? ' nhuận' : '') + ' năm ' + CAN[l[2] % 10] + ' ' + CHI[l[2] % 12];
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
    return String(text || '').replace(/\{(ten_khach|chu_re|co_dau|ngay_so|ngay|gio|thu|thang|nam|am_lich)\}/g, function (_, k) {
      if (k === 'am_lich') return lunarText(d);
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

  var FILTER = { none: '', warm: 'sepia(.25) saturate(1.2) brightness(1.03)', bw: 'grayscale(1) contrast(1.05)', film: 'contrast(1.1) saturate(.85) sepia(.15)', soft: 'brightness(1.08) saturate(.9) contrast(.92)', blur: 'blur(14px) brightness(1.05) saturate(1.1)' };

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
      // Link Google Maps chủ thiệp dán vào (nếu có) được ưu tiên cho nút chỉ đường
      var go = e.link || 'https://www.google.com/maps/search/?api=1&query=' + q;
      // Kiểu "chỉ nút": dùng cho lễ tại tư gia nhà trai / nhà gái
      if (e.style === 'button') return h('a', { class: 'cv-btn cv-map-btn', href: go, target: '_blank', rel: 'noopener', style: 'background:' + e.color, text: '📍 ' + (e.label || 'Xem chỉ đường') });
      var top =
        ctx.mode === 'edit' || !e.address
          ? h('div', { class: 'cv-map-ph' }, [h('span', { text: e.address ? '📍 ' + e.address : '📍 Nhập địa chỉ ở bảng bên phải' })])
          : h('iframe', { class: 'cv-map-frame', src: 'https://maps.google.com/maps?q=' + q + '&output=embed&hl=vi', loading: 'lazy', title: 'Bản đồ', referrerpolicy: 'no-referrer-when-downgrade' });
      return h('div', { class: 'cv-map' }, [
        top,
        h('a', { class: 'cv-btn', href: go, target: '_blank', rel: 'noopener', style: 'background:' + e.color, text: e.label || 'Chỉ đường' }),
      ]);
    },
    rsvp: function (e) {
      var radio = function (v, label, on) {
        return h('label', { class: 'cv-radio' }, [h('input', { type: 'radio', name: 'attending', value: v, checked: on, style: 'accent-color:' + e.color }), h('span', { text: label })]);
      };
      var people = [];
      for (var n = 1; n <= 10; n++) people.push(h('option', { value: String(n), text: n + ' người' }));
      var form = h('form', { class: 'cv-form', 'data-rsvp': '' }, [
        h('input', { name: 'name', placeholder: 'Họ và tên của bạn *', maxlength: '120', required: true }),
        h('div', { class: 'cv-radios', role: 'radiogroup', 'aria-label': 'Bạn sẽ tham dự chứ?' }, [radio('yes', 'Có, tôi sẽ tham dự', true), radio('no', 'Tôi bận, rất tiếc không thể tham dự', false)]),
        h('div', { class: 'cv-row cv-rsvp-more' }, [
          h('select', { name: 'side', 'aria-label': 'Khách của' }, [h('option', { value: '', text: 'Khách của…' }), h('option', { value: 'groom', text: 'Nhà trai' }), h('option', { value: 'bride', text: 'Nhà gái' })]),
          h('select', { name: 'guests', 'aria-label': 'Số lượng người tham dự' }, people),
        ]),
        h('input', { name: 'phone', placeholder: 'Số điện thoại (không bắt buộc)', maxlength: '30', inputmode: 'tel' }),
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
        e.privacy ? h('select', { name: 'visibility', 'aria-label': 'Ai sẽ thấy lời nhắn này?' }, [h('option', { value: 'public', text: 'Ai thấy: Tất cả mọi người' }), h('option', { value: 'private', text: 'Ai thấy: Chỉ cô dâu, chú rể' })]) : null,
        h('div', { class: 'cv-ta' }, [
          h('textarea', { name: 'message', rows: '2', placeholder: 'Gửi lời chúc tới cô dâu chú rể *', maxlength: '1000', required: true }),
          h('button', { type: 'button', class: 'cv-suggest', 'data-suggest': '', title: 'Gợi ý lời chúc', 'aria-label': 'Gợi ý lời chúc', text: '✨' }),
        ]),
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
            return e[s] && e[s].bin && (e[s].accountNo || e[s].qrImg);
          })
          .map(function (s) {
            var b = (ctx.banks || []).find(function (x) {
              return x.bin === e[s].bin;
            });
            return { label: s === 'groom' ? 'Mừng cưới chú rể' : 'Mừng cưới cô dâu', bankName: b ? b.name : '', accountNo: e[s].accountNo, accountName: e[s].accountName, branch: e[s].branch || '', qr: e[s].qrImg || 'https://img.vietqr.io/image/' + e[s].bin + '-' + e[s].accountNo + '-compact.png' };
          });
      }
      // Gói miễn phí không có hộp mừng cưới QR
      if (ctx.noGift) return h('div');
      if (!accs.length) {
        if (ctx.mode === 'edit') return h('div', { class: 'cv-card cv-empty', text: 'Nhập tài khoản ngân hàng ở bảng bên phải' });
        if (ctx.demo) accs = demoAccounts(ctx);
        else return h('div');
      }
      var grid = h(
        'div',
        { class: 'cv-gift' },
        accs.map(function (a) {
          return h('div', { class: 'cv-card cv-gift-item' }, [
            h('div', { class: 'cv-w-title', text: a.label, style: 'color:' + e.color }),
            h('img', { src: a.qr, alt: 'Mã QR ' + a.label, loading: 'lazy' }),
            h('div', { class: 'cv-gift-info' }, [h('b', { text: a.bankName }), a.accountNo ? h('span', { text: a.accountNo }) : null, h('small', { text: a.accountName }), a.branch ? h('small', { text: a.branch }) : null]),
            a.accountNo ? h('button', { class: 'cv-btn cv-btn-sm', type: 'button', 'data-copy': a.accountNo, style: 'background:' + e.color, text: 'Sao chép số TK' }) : null,
          ]);
        })
      );
      if (e.style !== 'box') return grid;
      // Kiểu "hộp quà": chạm để mở ra mã QR (trình thiết kế hiện luôn dạng mở)
      return h('div', { class: 'cv-giftbox' + (ctx.mode === 'edit' ? ' open' : '') }, [
        h('button', { type: 'button', class: 'cv-giftbox-lid', 'data-giftbox': '', style: 'border-color:' + e.color }, [
          h('span', { class: 'cv-giftbox-ic', 'aria-hidden': 'true', text: '🎁' }),
          h('b', { text: 'Chạm để mở hộp mừng cưới', style: 'color:' + e.color }),
          h('small', { text: 'Gửi quà mừng tới cô dâu, chú rể' }),
        ]),
        grid,
      ]);
    },
    /** Ký tên lưu bút: chữ ký của khách hiện nổi trên ảnh, nút ký ở dưới */
    signature: function (e, ctx) {
      var wall = h('div', { class: 'cv-sign-wall', 'data-sign-wall': '' });
      var list = ctx.signatures || [];
      list.slice(0, 18).forEach(function (g, i) {
        wall.appendChild(signItem(g, i));
      });
      if (!list.length) wall.appendChild(h('p', { class: 'cv-sign-empty', text: ctx.mode === 'edit' ? 'Chữ ký của khách sẽ hiện ở đây' : 'Hãy là người đầu tiên ký tên nhé!' }));
      return h('div', { class: 'cv-sign' }, [wall, h('button', { type: 'button', class: 'cv-btn cv-sign-btn', 'data-sign': '', style: 'background:' + e.color, text: '✍ ' + (e.label || 'Ký tên của bạn') })]);
    },
    /** Dresscode: các ô màu trang phục gợi ý */
    dresscode: function (e) {
      var cols = e.colors && e.colors.length ? e.colors : [{ c: '#f3ece4', n: 'Trắng kem' }, { c: '#d8c3a5', n: 'Be cát' }, { c: '#b08d7a', n: 'Nâu nude' }, { c: '#e8b4b8', n: 'Đào phấn' }];
      return h(
        'div',
        { class: 'cv-dress' },
        cols.map(function (c) {
          return h('div', { class: 'cv-dress-item' }, [h('span', { class: 'cv-dress-dot', style: 'background:' + c.c }), h('small', { text: c.n })]);
        })
      );
    },
    /** Thêm vào lịch Google (giờ Việt Nam) */
    addcal: function (e, ctx) {
      var d = mainDate(ctx.doc);
      var href = '#';
      if (d) {
        var t = (e.time || ctx.doc.time || '11:00').split(':').map(Number);
        var s = new Date(d.getFullYear(), d.getMonth(), d.getDate(), t[0] || 0, t[1] || 0);
        var en = new Date(s.getTime() + 3 * 36e5);
        var f = function (x) {
          return x.getFullYear() + pad(x.getMonth() + 1) + pad(x.getDate()) + 'T' + pad(x.getHours()) + pad(x.getMinutes()) + '00';
        };
        var title = e.title || 'Đám cưới ' + ((ctx.doc.groom && ctx.doc.groom.name) || '') + ' & ' + ((ctx.doc.bride && ctx.doc.bride.name) || '');
        href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(fill(title, ctx)) + '&dates=' + f(s) + '/' + f(en) + '&ctz=Asia/Ho_Chi_Minh' + (e.address ? '&location=' + encodeURIComponent(e.address) : '');
      }
      return h('a', { class: 'cv-btn cv-addcal', href: href, target: '_blank', rel: 'noopener', style: 'color:' + e.color + ';border-color:' + e.color, text: '📅 ' + (e.label || 'Thêm vào lịch') });
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

  /** Một chữ ký trên tường lưu bút – vị trí nghiêng nhẹ theo thứ tự */
  function signItem(g, i) {
    var rot = [-6, 4, -2, 7, -5, 3][i % 6];
    return h('figure', { class: 'cv-sign-item', style: 'transform:rotate(' + rot + 'deg)' }, [h('img', { src: g.img, alt: 'Chữ ký của ' + g.name, loading: 'lazy' }), h('figcaption', { text: g.name })]);
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

  window.SobaCV = { W: W, h: h, fill: fill, toLunar: toLunar, lunarText: lunarText, signItem: signItem, font: font, mainDate: mainDate, pad: pad, renderElement: renderElement, renderSection: renderSection, tickCountdowns: tickCountdowns, wishItem: wishItem, demoAccounts: demoAccounts };
})();
