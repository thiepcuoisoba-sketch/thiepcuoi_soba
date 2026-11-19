/* SOBA – trình thiết kế thiệp kéo thả (chữ, ảnh, hình, tiện ích đặt tự do trên từng trang) */
(function () {
  'use strict';
  var CV = window.SobaCV;
  var h = CV.h;
  var W = CV.W;
  var boot = JSON.parse(document.getElementById('dz-boot').textContent);
  var doc = boot.doc;
  var csrf = document.querySelector('meta[name=csrf-token]').content;
  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  var ui = {
    canvas: $('[data-canvas]'),
    work: $('[data-work]'),
    panel: $('[data-panel]'),
    panelTitle: $('[data-panel-title]'),
    panelBody: $('[data-panel-body]'),
    props: $('[data-props]'),
    propsTitle: $('[data-props-title]'),
    propsBody: $('[data-props-body]'),
    status: $('[data-status]'),
    zoom: $('[data-zoom]'),
    quick: $('[data-quick]'),
    quickList: $('[data-quick-list]'),
    quickCount: $('[data-quick-count]'),
    fileImage: $('[data-file-image]'),
    fileAudio: $('[data-file-audio]'),
    publish: $('[data-act=publish]'),
  };
  var S = { sel: null, sec: doc.sections[0].id, z: 1, tool: null, crop: false, editing: null, clip: null, uploads: null, status: boot.status, url: boot.url };
  var isMobile = function () {
    return window.innerWidth <= 760;
  };

  // ===== Tiện ích chung =====
  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }
  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }
  function clamp(v, a, b) {
    return Math.min(Math.max(v, a), b);
  }
  function round(v) {
    return Math.round(v * 10) / 10;
  }
  function secOf(id) {
    return doc.sections.find(function (s) {
      return s.id === id;
    });
  }
  function find(id) {
    for (var i = 0; i < doc.sections.length; i++) {
      var s = doc.sections[i];
      for (var j = 0; j < s.els.length; j++) if (s.els[j].id === id) return { sec: s, el: s.els[j], idx: j };
    }
    return null;
  }
  function ctx() {
    return { doc: doc, mode: 'edit', banks: boot.banks, wishes: [] };
  }
  function toast(msg, ms) {
    var t = h('div', { class: 'dz-toast', role: 'status' });
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () {
      t.remove();
    }, ms || 2600);
  }

  // ===== Lịch sử & tự lưu =====
  var hist = [JSON.stringify(doc)];
  var hi = 0;
  var saveTimer = null;
  var dirty = false;
  var saving = false;
  function updHist() {
    $('[data-act=undo]').disabled = hi <= 0;
    $('[data-act=redo]').disabled = hi >= hist.length - 1;
  }
  function commit() {
    var s = JSON.stringify(doc);
    if (s === hist[hi]) return;
    hist = hist.slice(0, hi + 1);
    hist.push(s);
    if (hist.length > 80) hist.shift();
    hi = hist.length - 1;
    updHist();
    scheduleSave();
  }
  var commitSoon = (function () {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(commit, 450);
    };
  })();
  function restore(i) {
    hi = i;
    doc = JSON.parse(hist[hi]);
    if (S.sel && !find(S.sel)) S.sel = null;
    if (!secOf(S.sec)) S.sec = doc.sections[0].id;
    renderAll();
    updHist();
    scheduleSave();
  }
  function setStatus(text, err) {
    ui.status.textContent = text;
    ui.status.classList.toggle('err', Boolean(err));
  }
  function scheduleSave() {
    dirty = true;
    setStatus('Chưa lưu…');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 1200);
  }
  function api(url, body) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf, Accept: 'application/json' }, body: JSON.stringify(body) }).then(function (r) {
      return r.json().catch(function () {
        return {};
      }).then(function (j) {
        if (!r.ok) throw new Error(j.error || 'Có lỗi xảy ra (' + r.status + ').');
        return j;
      });
    });
  }
  function save() {
    if (saving) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(save, 600);
      return Promise.resolve();
    }
    if (!dirty) return Promise.resolve();
    saving = true;
    dirty = false;
    setStatus('Đang lưu…');
    return api('/api/thiep/' + boot.id + '/thiet-ke', { doc: doc })
      .then(function () {
        setStatus(dirty ? 'Chưa lưu…' : 'Đã lưu');
      })
      .catch(function (e) {
        dirty = true;
        setStatus('Lưu lỗi – thử lại', true);
        toast(e.message);
        clearTimeout(saveTimer);
        saveTimer = setTimeout(save, 5000);
      })
      .finally(function () {
        saving = false;
      });
  }
  window.addEventListener('beforeunload', function (e) {
    if (dirty || saving) {
      save();
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // ===== Vẽ canvas =====
  function fitText(el, node) {
    if (el.type !== 'text' || !node) return;
    var inner = node.firstChild;
    inner.style.minHeight = '0';
    var nh = Math.max(Math.ceil(inner.scrollHeight), Math.ceil(el.size * el.lh * 0.8));
    inner.style.minHeight = '';
    if (Math.abs(nh - el.h) > 1) {
      el.h = nh;
      node.style.height = nh + 'px';
    }
  }
  function nodeOf(id) {
    return ui.canvas.querySelector('.cv-sec .cv-el[data-id="' + id + '"]');
  }
  function wrapOf(secId) {
    return ui.canvas.querySelector('.dz-secwrap[data-wrap="' + secId + '"]');
  }
  function decorate(node, el) {
    if (el.lock) node.classList.add('locked');
    if (S.crop && S.sel === el.id) node.classList.add('crop');
  }

  function buildSection(sec, i) {
    var frag = document.createDocumentFragment();
    frag.appendChild(
      h('div', { class: 'dz-secbar', 'data-bar': sec.id }, [
        h('strong', { text: 'Trang ' + (i + 1) }),
        h('button', { type: 'button', class: 'dz-ib', 'data-sec-act': 'props', title: 'Tuỳ chỉnh trang', 'aria-label': 'Tuỳ chỉnh trang', text: '⚙' }),
        h('button', { type: 'button', class: 'dz-ib', 'data-sec-act': 'up', title: 'Chuyển lên', 'aria-label': 'Chuyển trang lên', text: '↑', disabled: i === 0 }),
        h('button', { type: 'button', class: 'dz-ib', 'data-sec-act': 'down', title: 'Chuyển xuống', 'aria-label': 'Chuyển trang xuống', text: '↓', disabled: i === doc.sections.length - 1 }),
        h('button', { type: 'button', class: 'dz-ib', 'data-sec-act': 'dup', title: 'Nhân bản trang', 'aria-label': 'Nhân bản trang', text: '⧉' }),
        h('button', { type: 'button', class: 'dz-ib', 'data-sec-act': 'add', title: 'Thêm trang trống bên dưới', 'aria-label': 'Thêm trang bên dưới', text: '＋' }),
        h('button', { type: 'button', class: 'dz-ib', 'data-sec-act': 'del', title: 'Xoá trang', 'aria-label': 'Xoá trang', text: '🗑', disabled: doc.sections.length <= 1 }),
      ])
    );
    var wrap = h('div', { class: 'dz-secwrap' + (S.sec === sec.id && !S.sel ? ' on' : ''), 'data-wrap': sec.id });
    fillWrap(wrap, sec);
    frag.appendChild(wrap);
    return frag;
  }
  function fillWrap(wrap, sec) {
    wrap.innerHTML = '';
    wrap.style.cssText = 'width:' + W * S.z + 'px;height:' + sec.h * S.z + 'px;--z:' + S.z;
    var node = CV.renderSection(sec, ctx());
    node.style.transform = 'scale(' + S.z + ')';
    wrap.appendChild(node);
    wrap.appendChild(h('div', { class: 'dz-over', style: 'height:' + sec.h + 'px;transform:scale(' + S.z + ')' }));
    wrap.appendChild(h('div', { class: 'dz-resize-sec', 'data-sec-resize': sec.id, title: 'Kéo để đổi chiều cao trang', text: '⋯' }));
    sec.els.forEach(function (el) {
      var n = node.querySelector('[data-id="' + el.id + '"]');
      decorate(n, el);
      fitText(el, n);
    });
  }
  function renderAll() {
    if (S.editing) stopEdit();
    var y = ui.work.scrollTop;
    ui.canvas.innerHTML = '';
    doc.sections.forEach(function (s, i) {
      ui.canvas.appendChild(buildSection(s, i));
    });
    ui.canvas.appendChild(h('button', { type: 'button', class: 'dz-addsec', 'data-sec-act': 'append', text: '＋ Thêm trang mới' }));
    ui.work.scrollTop = y;
    ui.zoom.textContent = Math.round(S.z * 100) + '%';
    renderSel();
    renderProps();
    renderQuick();
    if (S.tool === 'pages') openTool('pages', true);
  }
  function refreshSec(sec) {
    if (S.editing) stopEdit();
    var wrap = wrapOf(sec.id);
    if (!wrap) return renderAll();
    fillWrap(wrap, sec);
    renderSel();
  }
  function refreshEl(el) {
    if (S.editing && S.editing !== el.id) stopEdit();
    var old = nodeOf(el.id);
    if (!old) return;
    var n = CV.renderElement(el, ctx());
    decorate(n, el);
    old.replaceWith(n);
    fitText(el, n);
    renderSel();
  }
  function applyBox(el) {
    var n = nodeOf(el.id);
    if (!n) return;
    n.style.left = el.x + 'px';
    n.style.top = el.y + 'px';
    n.style.width = el.w + 'px';
    n.style.height = el.h + 'px';
    n.style.transform = el.r ? 'rotate(' + el.r + 'deg)' : '';
    if (el.type === 'text') {
      n.firstChild.style.fontSize = el.size + 'px';
      fitText(el, n);
    }
    var sel = ui.canvas.querySelector('.dz-sel');
    if (sel) placeSel(sel, el);
  }
  function placeSel(box, el) {
    box.style.left = el.x + 'px';
    box.style.top = el.y + 'px';
    box.style.width = el.w + 'px';
    box.style.height = el.h + 'px';
    box.style.transform = el.r ? 'rotate(' + el.r + 'deg)' : '';
  }

  // Khung chọn + thanh thao tác nhanh
  function renderSel() {
    $$('.dz-sel, .dz-guide', ui.canvas).forEach(function (n) {
      n.remove();
    });
    $$('.dz-secwrap', ui.canvas).forEach(function (w) {
      w.classList.toggle('on', !S.sel && w.getAttribute('data-wrap') === S.sec);
    });
    if (!S.sel) return;
    var f = find(S.sel);
    if (!f) return;
    var over = $('.dz-over', wrapOf(f.sec.id));
    if (!over) return;
    var el = f.el;
    var box = h('div', { class: 'dz-sel' + (el.lock ? ' locked' : '') });
    placeSel(box, el);
    if (!el.lock && !S.crop) {
      var hs = el.type === 'text' ? ['nw', 'ne', 'e', 'se', 'sw', 'w'] : ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
      hs.forEach(function (d) {
        box.appendChild(h('span', { class: 'dz-h', 'data-h': d }));
      });
      box.appendChild(h('span', { class: 'dz-h', 'data-h': 'rot', title: 'Xoay', text: '⟳' }));
    }
    var bar = h('div', { class: 'dz-fbar' });
    var b = function (act, icon, title) {
      bar.appendChild(h('button', { type: 'button', class: 'dz-ib', 'data-el-act': act, title: title, 'aria-label': title, text: icon }));
    };
    if (S.crop) b('crop-done', '✓', 'Xong cắt ảnh');
    else {
      if (el.type === 'text') b('edit', '✎', 'Sửa chữ');
      if (el.type === 'image') b('replace', '🖼', 'Thay ảnh');
      b('props', '⚙', 'Tuỳ chỉnh');
      b('dup', '⧉', 'Nhân bản (Ctrl+D)');
      b('front', '⬆', 'Đưa lên trên');
      b('back', '⬇', 'Đưa xuống dưới');
      b('lock', el.lock ? '🔒' : '🔓', el.lock ? 'Mở khoá' : 'Khoá vị trí');
      b('del', '🗑', 'Xoá (Delete)');
    }
    box.appendChild(bar);
    over.appendChild(box);
  }

  function select(id, secId) {
    if (S.editing && S.editing !== id) stopEdit();
    if (S.crop && S.sel !== id) setCrop(false);
    S.sel = id;
    if (secId) S.sec = secId;
    renderSel();
    renderProps();
    markQuick();
  }

  // ===== Thêm / xoá phần tử =====
  function visibleY(sec, hgt) {
    var wrap = wrapOf(sec.id);
    if (!wrap) return 40;
    var wr = wrap.getBoundingClientRect();
    var kr = ui.work.getBoundingClientRect();
    var mid = (Math.max(wr.top, kr.top) + Math.min(wr.bottom, kr.bottom)) / 2;
    return clamp(round((mid - wr.top) / S.z - hgt / 2), 0, Math.max(0, sec.h - hgt));
  }
  function currentSec() {
    // Trang đang chọn; nếu nó không nằm trong khung nhìn thì lấy trang đang hiển thị nhiều nhất
    var kr = ui.work.getBoundingClientRect();
    var best = null;
    var bestV = -1;
    doc.sections.forEach(function (s) {
      var w = wrapOf(s.id);
      if (!w) return;
      var r = w.getBoundingClientRect();
      var v = Math.min(r.bottom, kr.bottom) - Math.max(r.top, kr.top);
      if (s.id === S.sec && v > 60) v += 10000;
      if (v > bestV) {
        bestV = v;
        best = s;
      }
    });
    return best || doc.sections[0];
  }
  function addEl(el) {
    var sec = currentSec();
    el.id = uid();
    el.x = el.x == null ? round((W - el.w) / 2) : el.x;
    el.y = visibleY(sec, el.h);
    el.r = el.r || 0;
    el.o = el.o == null ? 1 : el.o;
    el.anim = el.anim || 'none';
    el.delay = 0;
    sec.els.push(el);
    S.sec = sec.id;
    S.sel = el.id;
    refreshSec(sec);
    renderProps();
    renderQuick();
    commit();
    if (isMobile()) closePanel();
    return el;
  }
  function delEl(id) {
    var f = find(id);
    if (!f) return;
    f.sec.els.splice(f.idx, 1);
    S.sel = null;
    refreshSec(f.sec);
    renderProps();
    renderQuick();
    commit();
  }
  function dupEl(id) {
    var f = find(id);
    if (!f) return;
    var c = clone(f.el);
    c.id = uid();
    c.x = round(c.x + 14);
    c.y = round(c.y + 14);
    c.lock = false;
    f.sec.els.splice(f.idx + 1, 0, c);
    S.sel = c.id;
    refreshSec(f.sec);
    renderProps();
    renderQuick();
    commit();
  }
  function layer(id, dir) {
    var f = find(id);
    if (!f) return;
    var to = clamp(f.idx + dir, 0, f.sec.els.length - 1);
    if (to === f.idx) return toast(dir > 0 ? 'Đã ở trên cùng' : 'Đã ở dưới cùng');
    f.sec.els.splice(f.idx, 1);
    f.sec.els.splice(to, 0, f.el);
    refreshSec(f.sec);
    commit();
  }

  // ===== Sửa chữ trực tiếp =====
  function startEdit(id) {
    var f = find(id);
    if (!f || f.el.type !== 'text') return;
    if (S.sel !== id) select(id, f.sec.id);
    var node = nodeOf(id);
    var inner = node.firstChild;
    S.editing = id;
    inner.textContent = f.el.text;
    try {
      inner.contentEditable = 'plaintext-only';
    } catch (e) {
      inner.contentEditable = 'true';
    }
    if (inner.contentEditable !== 'plaintext-only') inner.contentEditable = 'true';
    inner.focus();
    var r = document.createRange();
    r.selectNodeContents(inner);
    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
    inner.addEventListener('input', function () {
      fitText(f.el, node);
      var sel = ui.canvas.querySelector('.dz-sel');
      if (sel) placeSel(sel, f.el);
    });
    inner.addEventListener('paste', function (e) {
      e.preventDefault();
      var t = (e.clipboardData || window.clipboardData).getData('text');
      document.execCommand('insertText', false, t);
    });
    inner.addEventListener('blur', stopEdit, { once: true });
    inner.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') inner.blur();
    });
  }
  function stopEdit() {
    var id = S.editing;
    if (!id) return;
    S.editing = null;
    var f = find(id);
    var node = nodeOf(id);
    if (!f || !node) return;
    var t = node.firstChild.innerText.replace(/\n$/, '');
    f.el.text = t.slice(0, 2000);
    refreshEl(f.el);
    renderProps();
    commit();
  }

  // ===== Cắt ảnh =====
  function setCrop(on) {
    S.crop = on;
    document.body.classList.toggle('dz-crop-on', on);
    var f = S.sel && find(S.sel);
    if (f) refreshEl(f.el);
    renderSel();
    if (on) toast('Kéo trên ảnh để chọn vùng hiển thị, dùng thanh “Phóng to” để cắt sát hơn.', 3500);
  }

  // ===== Kéo thả, đổi cỡ, xoay =====
  var drag = null;
  function guides(sec, xs, ys) {
    var over = $('.dz-over', wrapOf(sec.id));
    $$('.dz-guide', over).forEach(function (g) {
      g.remove();
    });
    xs.forEach(function (x) {
      over.appendChild(h('div', { class: 'dz-guide v', style: 'left:' + x + 'px' }));
    });
    ys.forEach(function (y) {
      over.appendChild(h('div', { class: 'dz-guide h', style: 'top:' + y + 'px' }));
    });
  }
  function snapMove(el, sec, nx, ny) {
    var th = 5 / S.z;
    var gx = [];
    var gy = [];
    var tx = [0, W / 2, W];
    var ty = [0, sec.h / 2, sec.h];
    sec.els.forEach(function (o) {
      if (o.id === el.id) return;
      tx.push(o.x, o.x + o.w / 2, o.x + o.w);
      ty.push(o.y, o.y + o.h / 2, o.y + o.h);
    });
    var bestX = null;
    [0, el.w / 2, el.w].forEach(function (off) {
      tx.forEach(function (t) {
        var d = Math.abs(nx + off - t);
        if (d < th && (!bestX || d < bestX.d)) bestX = { d: d, v: t - off, g: t };
      });
    });
    var bestY = null;
    [0, el.h / 2, el.h].forEach(function (off) {
      ty.forEach(function (t) {
        var d = Math.abs(ny + off - t);
        if (d < th && (!bestY || d < bestY.d)) bestY = { d: d, v: t - off, g: t };
      });
    });
    if (bestX) {
      nx = bestX.v;
      gx.push(bestX.g);
    }
    if (bestY) {
      ny = bestY.v;
      gy.push(bestY.g);
    }
    guides(sec, gx, gy);
    return [round(nx), round(ny)];
  }

  ui.canvas.addEventListener('pointerdown', function (e) {
    if (e.button && e.button !== 0) return;
    var t = e.target;
    if (t.closest('.dz-fbar') || t.closest('.dz-secbar') || t.closest('.dz-addsec')) return;
    var rs = t.closest('[data-sec-resize]');
    if (rs) {
      var sec0 = secOf(rs.getAttribute('data-sec-resize'));
      drag = { kind: 'sec', sec: sec0, sy: e.clientY, h0: sec0.h };
      rs.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }
    var hd = t.closest('.dz-h');
    if (hd && S.sel) {
      var f0 = find(S.sel);
      var node0 = nodeOf(S.sel);
      var r0 = node0.getBoundingClientRect();
      drag = { kind: hd.getAttribute('data-h') === 'rot' ? 'rot' : 'resize', dir: hd.getAttribute('data-h'), el: f0.el, sec: f0.sec, sx: e.clientX, sy: e.clientY, b0: clone(f0.el), cx: r0.left + r0.width / 2, cy: r0.top + r0.height / 2 };
      hd.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }
    var en = t.closest('.cv-el');
    var wrap = t.closest('.dz-secwrap');
    if (en && wrap) {
      var id = en.getAttribute('data-id');
      if (S.editing === id) return; // đang gõ chữ: cho phép bôi đen
      var f = find(id);
      if (!f) return;
      if (S.sel !== id) select(id, f.sec.id);
      e.preventDefault();
      if (S.crop && f.el.type === 'image') {
        drag = { kind: 'crop', el: f.el, sec: f.sec, sx: e.clientX, sy: e.clientY, b0: clone(f.el) };
      } else if (!f.el.lock) {
        drag = { kind: 'move', el: f.el, sec: f.sec, sx: e.clientX, sy: e.clientY, b0: clone(f.el), moved: false };
      }
      if (drag) en.setPointerCapture(e.pointerId);
      return;
    }
    if (wrap) {
      if (S.editing) stopEdit();
      if (S.crop) setCrop(false);
      S.sel = null;
      S.sec = wrap.getAttribute('data-wrap');
      renderSel();
      renderProps();
      markQuick();
    }
  });

  window.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = (e.clientX - drag.sx) / S.z;
    var dy = (e.clientY - drag.sy) / S.z;
    var el = drag.el;
    var b = drag.b0;
    if (drag.kind === 'sec') {
      drag.sec.h = Math.round(clamp(drag.h0 + dy, 80, 4000));
      var wrap = wrapOf(drag.sec.id);
      wrap.style.height = drag.sec.h * S.z + 'px';
      wrap.firstChild.style.height = drag.sec.h + 'px';
      wrap.children[1].style.height = drag.sec.h + 'px';
      return;
    }
    if (drag.kind === 'move') {
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 2 / S.z) return;
      drag.moved = true;
      var p = e.altKey ? [round(b.x + dx), round(b.y + dy)] : snapMove(el, drag.sec, b.x + dx, b.y + dy);
      el.x = p[0];
      el.y = p[1];
      applyBox(el);
      return;
    }
    if (drag.kind === 'crop') {
      el.ox = round(clamp(b.ox - (dx / el.w) * 100, 0, 100));
      el.oy = round(clamp(b.oy - (dy / el.h) * 100, 0, 100));
      var img = $('img', nodeOf(el.id));
      if (img) {
        img.style.objectPosition = el.ox + '% ' + el.oy + '%';
        img.style.transformOrigin = el.ox + '% ' + el.oy + '%';
      }
      return;
    }
    if (drag.kind === 'rot') {
      var ang = (Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx) * 180) / Math.PI - 90;
      if (ang < -180) ang += 360;
      if (e.shiftKey) ang = Math.round(ang / 15) * 15;
      else
        [-180, -135, -90, -45, 0, 45, 90, 135, 180].forEach(function (s) {
          if (Math.abs(ang - s) < 4) ang = s;
        });
      el.r = Math.round(ang);
      applyBox(el);
      return;
    }
    // Đổi kích thước
    var d = drag.dir;
    var x = b.x;
    var y = b.y;
    var w = b.w;
    var hh = b.h;
    if (d.indexOf('e') >= 0) w = b.w + dx;
    if (d.indexOf('w') >= 0) w = b.w - dx;
    if (d.indexOf('s') >= 0) hh = b.h + dy;
    if (d.indexOf('n') >= 0) hh = b.h - dy;
    w = Math.max(w, 12);
    hh = Math.max(hh, 6);
    var corner = d.length === 2;
    if (el.type === 'text') {
      if (corner) {
        var f = w / b.w;
        el.size = round(clamp(b.size * f, 6, 200));
      }
      hh = b.h;
    } else if (corner && !e.shiftKey) {
      var ratio = b.w / b.h;
      if (Math.abs(dx) * (1 / ratio) > Math.abs(dy)) hh = w / ratio;
      else w = hh * ratio;
    }
    if (d.indexOf('w') >= 0) x = b.x + (b.w - w);
    if (d.indexOf('n') >= 0) y = b.y + (b.h - hh);
    el.x = round(x);
    el.y = round(y);
    el.w = round(w);
    el.h = round(hh);
    applyBox(el);
  });

  function endDrag(e) {
    if (!drag) return;
    var d = drag;
    drag = null;
    if (d.sec) guides(d.sec, [], []);
    if (d.kind === 'move' && !d.moved) return;
    if (d.kind === 'move') {
      // Thả sang trang khác
      var target = null;
      $$('.dz-secwrap', ui.canvas).forEach(function (w) {
        var r = w.getBoundingClientRect();
        if (e.clientY >= r.top && e.clientY <= r.bottom) target = w;
      });
      var tid = target && target.getAttribute('data-wrap');
      if (tid && tid !== d.sec.id) {
        var fromTop = wrapOf(d.sec.id).getBoundingClientRect().top;
        var toTop = target.getBoundingClientRect().top;
        var to = secOf(tid);
        d.el.y = round(d.el.y + (fromTop - toTop) / S.z);
        d.sec.els.splice(d.sec.els.indexOf(d.el), 1);
        to.els.push(d.el);
        S.sec = tid;
        refreshSec(d.sec);
        refreshSec(to);
      }
    }
    if (d.kind === 'sec') refreshSec(d.sec);
    if (d.kind === 'resize' && d.el.type !== 'text') refreshEl(d.el);
    renderProps();
    commit();
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  ui.canvas.addEventListener('dblclick', function (e) {
    var en = e.target.closest('.cv-el');
    if (!en) return;
    var f = find(en.getAttribute('data-id'));
    if (!f) return;
    if (f.el.type === 'text') startEdit(f.el.id);
    else if (f.el.type === 'image') replaceImage(f.el);
  });

  // Nút trên thanh trang & thanh thao tác nhanh
  ui.canvas.addEventListener('click', function (e) {
    var a = e.target.closest('[data-el-act]');
    if (a && S.sel) {
      var act = a.getAttribute('data-el-act');
      var f = find(S.sel);
      if (!f) return;
      if (act === 'del') delEl(S.sel);
      if (act === 'dup') dupEl(S.sel);
      if (act === 'front') layer(S.sel, 1);
      if (act === 'back') layer(S.sel, -1);
      if (act === 'edit') startEdit(S.sel);
      if (act === 'replace') replaceImage(f.el);
      if (act === 'props') openProps();
      if (act === 'crop-done') setCrop(false);
      if (act === 'lock') {
        f.el.lock = !f.el.lock;
        refreshEl(f.el);
        renderProps();
        commit();
      }
      return;
    }
    var s = e.target.closest('[data-sec-act]');
    if (!s) return;
    var act2 = s.getAttribute('data-sec-act');
    if (act2 === 'append') return addSection(doc.sections.length);
    var bar = s.closest('[data-bar]');
    var id = bar.getAttribute('data-bar');
    var i = doc.sections.findIndex(function (x) {
      return x.id === id;
    });
    sectionAction(act2, i);
  });

  function blankSection() {
    var prev = secOf(S.sec) || doc.sections[doc.sections.length - 1];
    return { id: uid(), h: 700, bg: prev ? prev.bg : '#ffffff', bgImage: '', els: [] };
  }
  function addSection(at) {
    if (doc.sections.length >= 20) return toast('Thiệp tối đa 20 trang.');
    var s = blankSection();
    doc.sections.splice(at, 0, s);
    S.sec = s.id;
    S.sel = null;
    renderAll();
    commit();
    var w = wrapOf(s.id);
    if (w) w.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function sectionAction(act, i) {
    var sec = doc.sections[i];
    if (!sec) return;
    if (act === 'props') {
      S.sel = null;
      S.sec = sec.id;
      renderSel();
      renderProps();
      return openProps();
    }
    if (act === 'up' && i > 0) doc.sections.splice(i - 1, 0, doc.sections.splice(i, 1)[0]);
    else if (act === 'down' && i < doc.sections.length - 1) doc.sections.splice(i + 1, 0, doc.sections.splice(i, 1)[0]);
    else if (act === 'dup') {
      if (doc.sections.length >= 20) return toast('Thiệp tối đa 20 trang.');
      var c = clone(sec);
      c.id = uid();
      c.els.forEach(function (el) {
        el.id = uid();
      });
      doc.sections.splice(i + 1, 0, c);
      S.sec = c.id;
    } else if (act === 'add') return addSection(i + 1);
    else if (act === 'del') {
      if (doc.sections.length <= 1) return;
      if (sec.els.length && !window.confirm('Xoá trang ' + (i + 1) + ' cùng ' + sec.els.length + ' phần tử trên đó?')) return;
      doc.sections.splice(i, 1);
      if (S.sec === sec.id) S.sec = doc.sections[Math.max(0, i - 1)].id;
      S.sel = null;
    } else return;
    renderAll();
    commit();
  }

  // ===== Bàn phím =====
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    var typing = t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
    var mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'z' && !typing) {
      e.preventDefault();
      if (e.shiftKey) {
        if (hi < hist.length - 1) restore(hi + 1);
      } else if (hi > 0) restore(hi - 1);
      return;
    }
    if (mod && e.key.toLowerCase() === 'y' && !typing) {
      e.preventDefault();
      if (hi < hist.length - 1) restore(hi + 1);
      return;
    }
    if (mod && e.key.toLowerCase() === 's') {
      e.preventDefault();
      dirty = true;
      save();
      return;
    }
    if (typing) return;
    var f = S.sel && find(S.sel);
    if (mod && e.key.toLowerCase() === 'v' && S.clip) {
      e.preventDefault();
      var c = clone(S.clip);
      c.x = round(c.x + 14);
      c.lock = false;
      addEl(c);
      return;
    }
    if (!f) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      delEl(f.el.id);
    } else if (mod && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      dupEl(f.el.id);
    } else if (mod && e.key.toLowerCase() === 'c') {
      S.clip = clone(f.el);
      toast('Đã sao chép phần tử – Ctrl+V để dán');
    } else if (e.key === 'Escape') {
      if (S.crop) setCrop(false);
      else select(null);
    } else if (e.key === 'Enter' && f.el.type === 'text') {
      e.preventDefault();
      startEdit(f.el.id);
    } else if (/^Arrow/.test(e.key) && !f.el.lock) {
      e.preventDefault();
      var st = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') f.el.x -= st;
      if (e.key === 'ArrowRight') f.el.x += st;
      if (e.key === 'ArrowUp') f.el.y -= st;
      if (e.key === 'ArrowDown') f.el.y += st;
      applyBox(f.el);
      commitSoon();
    }
  });

  // ===== Tải ảnh / nhạc =====
  function compress(file) {
    if (!/^image\/(jpeg|webp)$/.test(file.type) || !window.createImageBitmap) return Promise.resolve(file);
    return createImageBitmap(file)
      .then(function (bmp) {
        var max = 2000;
        var s = Math.min(1, max / Math.max(bmp.width, bmp.height));
        if (s === 1 && file.size < 1.5e6) return file;
        var c = document.createElement('canvas');
        c.width = Math.round(bmp.width * s);
        c.height = Math.round(bmp.height * s);
        c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
        return new Promise(function (res) {
          c.toBlob(
            function (b) {
              res(b && b.size < file.size ? new File([b], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file);
            },
            'image/jpeg',
            0.86
          );
        });
      })
      .catch(function () {
        return file;
      });
  }
  function upload(files) {
    var list = Array.prototype.slice.call(files || []);
    if (!list.length) return Promise.resolve([]);
    setStatus('Đang tải ' + list.length + ' tệp…');
    return Promise.all(list.map(compress))
      .then(function (ready) {
        var fd = new FormData();
        ready.forEach(function (f) {
          fd.append('files', f);
        });
        return fetch('/api/thiep/' + boot.id + '/tai-len', { method: 'POST', headers: { 'x-csrf-token': csrf, Accept: 'application/json' }, body: fd });
      })
      .then(function (r) {
        return r.json().then(function (j) {
          if (!r.ok) throw new Error(j.error || 'Tải lên thất bại.');
          return j;
        });
      })
      .then(function (j) {
        setStatus(dirty ? 'Chưa lưu…' : 'Đã lưu');
        if (j.warning) toast(j.warning, 4000);
        var urls = j.files.map(function (f) {
          return f.url;
        });
        if (S.uploads)
          S.uploads = urls
            .filter(function (u) {
              return /\.(jpe?g|png|webp|gif)$/i.test(u);
            })
            .concat(S.uploads);
        if (S.tool === 'image') openTool('image', true);
        return urls;
      })
      .catch(function (e) {
        setStatus('Đã lưu');
        toast(e.message, 4000);
        return [];
      });
  }
  var pickCb = null;
  function pickImages(multi, cb) {
    pickCb = cb;
    ui.fileImage.multiple = Boolean(multi);
    ui.fileImage.value = '';
    ui.fileImage.click();
  }
  ui.fileImage.addEventListener('change', function () {
    var cb = pickCb;
    pickCb = null;
    upload(ui.fileImage.files).then(function (urls) {
      if (urls.length && cb) cb(urls);
    });
  });
  function replaceImage(el) {
    pickImages(false, function (urls) {
      el.src = urls[0];
      el.ox = 50;
      el.oy = 50;
      el.zoom = 1;
      refreshEl(el);
      renderQuick();
      renderProps();
      commit();
    });
  }
  function loadUploads() {
    if (S.uploads) return Promise.resolve(S.uploads);
    return fetch('/api/thiep/' + boot.id + '/anh', { headers: { Accept: 'application/json' } })
      .then(function (r) {
        return r.json();
      })
      .then(function (j) {
        S.uploads = j.files || [];
        return S.uploads;
      })
      .catch(function () {
        S.uploads = [];
        return [];
      });
  }
  /** Dùng ảnh từ thư viện: thay ảnh đang chọn, thêm vào album, hoặc tạo ảnh mới */
  function useImage(src) {
    var f = S.sel && find(S.sel);
    if (f && f.el.type === 'image') {
      f.el.src = src;
      refreshEl(f.el);
      renderQuick();
      renderProps();
      return commit();
    }
    if (f && f.el.type === 'widget' && f.el.widget === 'album') {
      if (f.el.images.length >= ALBUM_MAX) return toast('Album tối đa ' + ALBUM_MAX + ' ảnh.');
      f.el.images.push(src);
      if (f.el.collection) {
        growCollection(f);
        refreshSec(f.sec);
      }
      refreshEl(f.el);
      renderProps();
      return commit();
    }
    addEl(imageDefaults(src));
  }
  /**
   * Album "Bộ sưu tập" gần cuối thiệp: ảnh khách tải thêm (không chọn ảnh/album nào) được đưa vào đây.
   * Chưa có thì tạo trang mới ngay trước trang xác nhận tham dự. Album tự cao thêm theo số ảnh.
   */
  var ALBUM_MAX = 100;
  var COLL_ROW = 128;
  var rowH = function (cols) {
    return cols >= 4 ? 100 : COLL_ROW;
  };
  function collectionAlbum() {
    var hit = null;
    doc.sections.forEach(function (s) {
      s.els.forEach(function (e) {
        if (!hit && e.type === 'widget' && e.widget === 'album' && e.collection && e.images.length < ALBUM_MAX) hit = { sec: s, el: e };
      });
    });
    if (hit) return hit;
    if (doc.sections.length >= 20) return null;
    var at = doc.sections.findIndex(function (s) {
      return s.els.some(function (e) {
        return e.type === 'widget' && e.widget === 'rsvp';
      });
    });
    if (at < 1) at = Math.max(1, doc.sections.length - 1);
    var prev = doc.sections[at - 1];
    var ink = '#333333';
    var title = Object.assign(textDefaults({ text: 'Bộ sưu tập', font: 'Great Vibes', size: 42, color: ink, w: 360, h: 60 }), { id: uid(), x: 30, y: 50, r: 0, o: 1, anim: 'fade', delay: 0 });
    var album = { id: uid(), type: 'widget', widget: 'album', x: 24, y: 130, w: 372, h: COLL_ROW, r: 0, o: 1, anim: 'up', delay: 0, color: '#d6456c', textColor: ink, bg: '', font: 'Be Vietnam Pro', images: [], cols: 3, gap: 6, radius: 6, collection: true };
    var sec = { id: uid(), h: 130 + COLL_ROW + 50, bg: prev ? prev.bg : '#ffffff', bgImage: '', els: [title, album] };
    doc.sections.splice(at, 0, sec);
    renderAll();
    return { sec: sec, el: album };
  }
  /** Album bộ sưu tập: tăng chiều cao album (và trang) cho đủ hàng ảnh */
  function growCollection(f) {
    if (f.el.images.length > 36 && f.el.cols < 4) f.el.cols = 4;
    var rows = Math.max(1, Math.ceil(f.el.images.length / (f.el.cols || 3)));
    var nh = rows * rowH(f.el.cols);
    if (nh > f.el.h) {
      var d = nh - f.el.h;
      f.el.h = nh;
      f.sec.els.forEach(function (e) {
        if (e !== f.el && e.y >= f.el.y + f.el.h - d) e.y += d;
      });
      f.sec.h = Math.min(4000, f.sec.h + d);
    }
  }
  function addToCollection(urls) {
    var added = 0;
    urls.forEach(function (u) {
      var f = collectionAlbum();
      if (!f) return;
      f.el.images.push(u);
      growCollection(f);
      added++;
    });
    if (!added) return toast('Thiệp đã đủ 20 trang – hãy chọn một album để thêm ảnh.');
    renderAll();
    commit();
    toast('Đã thêm ' + added + ' ảnh vào “Bộ sưu tập” gần cuối thiệp.');
  }
  function imageDefaults(src) {
    return { type: 'image', w: 260, h: 340, src: src, zoom: 1, ox: 50, oy: 50, radius: 0, mask: 'rect', border: 0, borderColor: '#ffffff', shadow: false, filter: 'none' };
  }

  // ===== Bảng công cụ bên trái =====
  var TEXT_PRESETS = [
    { label: 'Thêm tiêu đề viết tay', small: 'Great Vibes', el: { text: 'Save the Date', font: 'Great Vibes', size: 44, w: 340 } },
    { label: 'Thêm tiêu đề', small: 'Playfair Display', el: { text: 'Tiêu đề thiệp', font: 'Playfair Display', size: 28, bold: true, w: 320 } },
    { label: 'Thêm chữ in hoa giãn', small: 'Montserrat', el: { text: 'WE ARE GETTING MARRIED', font: 'Montserrat', size: 12, ls: 4, w: 320 } },
    { label: 'Thêm đoạn văn', small: 'Be Vietnam Pro', el: { text: 'Trân trọng kính mời bạn tới dự buổi tiệc chung vui cùng gia đình chúng tôi.', font: 'Be Vietnam Pro', size: 15, lh: 1.55, w: 320 } },
  ];
  var TOKENS = [
    ['{ten_khach}', 'Tên khách mời'],
    ['{chu_re}', 'Tên chú rể'],
    ['{co_dau}', 'Tên cô dâu'],
    ['{ngay}', 'Ngày cưới'],
    ['{gio}', 'Giờ'],
    ['{thu}', 'Thứ'],
    ['{ngay_so}', 'Ngày (số)'],
    ['{thang}', 'Tháng'],
    ['{nam}', 'Năm'],
    ['{am_lich}', 'Ngày âm lịch'],
  ];
  function textDefaults(o) {
    return Object.assign({ type: 'text', text: '', font: 'Be Vietnam Pro', size: 18, color: '#333333', bg: '', align: 'center', bold: false, italic: false, underline: false, upper: false, lh: 1.35, ls: 0, shadow: false, w: 320, h: 30 }, o);
  }
  var SHAPES = [
    ['rect', { fill: '#f4b6c8', radius: 0 }, 'Chữ nhật'],
    ['rect', { fill: '#f4b6c8', radius: 24 }, 'Bo góc'],
    ['circle', { fill: '#f4b6c8' }, 'Hình tròn'],
    ['ring', { stroke: '#d6456c', sw: 2 }, 'Vòng tròn'],
    ['line', { fill: '#c9a46a' }, 'Đường kẻ'],
    ['heart', { fill: '#d6456c' }, 'Trái tim'],
    ['star', { fill: '#e3b04b' }, 'Ngôi sao'],
    ['rect', { stroke: '#c9a46a', sw: 2, radius: 0 }, 'Khung viền'],
    ['rect', { stroke: '#c9a46a', sw: 2, radius: 200 }, 'Khung vòm'],
    ['tri', { fill: '#e8d9c5' }, 'Tam giác (nắp phong bì)'],
    ['rect', { fill: '#000000aa', grad: 'down' }, 'Lớp phủ mờ dần'],
  ];
  var WIDGET_LIST = [
    ['countdown', 'Đồng hồ đếm ngược', 'Đếm ngày, giờ, phút tới ngày cưới', { w: 340, h: 96 }],
    ['calendar', 'Lịch tháng cưới', 'Lịch tháng có đánh dấu ngày cưới', { w: 340, h: 300 }],
    ['map', 'Bản đồ chỉ đường', 'Google Maps + nút chỉ đường', { w: 340, h: 220, address: '', label: 'Chỉ đường', style: 'full' }],
    ['map', 'Nút xem chỉ đường', 'Chỉ một nút mở Google Maps (lễ tư gia…)', { w: 200, h: 44, address: '', label: 'Xem chỉ đường', style: 'button' }],
    ['rsvp', 'Xác nhận tham dự', 'Khách xác nhận đến dự, số người', { w: 360, h: 420, title: '' }],
    ['wishes', 'Sổ lời chúc', 'Khách gửi lời chúc, hiện ngay trên thiệp', { w: 360, h: 440, title: '' }],
    ['gift', 'Hộp mừng cưới QR', 'Mã QR chuyển khoản ngân hàng', { w: 360, h: 300, groom: { bin: '', accountNo: '', accountName: '' }, bride: { bin: '', accountNo: '', accountName: '' } }],
    ['album', 'Album ảnh', 'Lưới ảnh, bấm để xem phóng to', { w: 360, h: 480, images: [], cols: 2, gap: 6, radius: 6 }],
    ['call', 'Nút gọi điện', 'Khách bấm để gọi cho cô dâu chú rể', { w: 220, h: 48, phone: '', label: 'Gọi điện' }],
    ['signature', 'Ký tên lưu bút', 'Khách ký tay lên thiệp – đặt nổi trên một ảnh', { w: 360, h: 420, label: 'Ký tên của bạn' }],
    ['dresscode', 'Dresscode', 'Các màu trang phục gợi ý cho khách', { w: 360, h: 100, colors: [{ c: '#f3ece4', n: 'Trắng kem' }, { c: '#d8c3a5', n: 'Be cát' }, { c: '#b08d7a', n: 'Nâu nude' }, { c: '#e8b4b8', n: 'Đào phấn' }] }],
    ['addcal', 'Thêm vào lịch', 'Nút lưu ngày cưới vào Google Calendar', { w: 200, h: 42, label: 'Thêm vào lịch', title: '', address: '', time: '' }],
  ];
  var SWATCHES = ['#ffffff', '#fffaf7', '#fff1f3', '#ffe9ee', '#f6dfe5', '#fbf6ef', '#f4ece1', '#efe7dc', '#e9efe6', '#dfe7ef', '#d6456c', '#b3203f', '#6e1a22', '#3b2f25', '#2b2226', '#1c1220'];

  function openTool(name, keep) {
    if (S.tool === name && !keep) return closePanel();
    if (name !== 'music') stopPreview();
    S.tool = name;
    $$('.dz-rail button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-tool') === name);
    });
    ui.panel.hidden = false;
    var body = ui.panelBody;
    body.innerHTML = '';
    var titles = { text: 'Văn bản', image: 'Hình ảnh', shape: 'Hình dạng', widget: 'Tiện ích', bg: 'Nền', music: 'Âm nhạc', pages: 'Trang', info: 'Thông tin thiệp' };
    ui.panelTitle.textContent = titles[name];
    PANELS[name](body);
  }
  function stopPreview() {
    if (S.preview) S.preview.player.pause();
    S.preview = null;
  }
  function closePanel() {
    stopPreview();
    S.tool = null;
    ui.panel.hidden = true;
    $$('.dz-rail button').forEach(function (b) {
      b.classList.remove('on');
    });
  }
  function group(title, kids) {
    return h('div', { class: 'dz-group' }, [title ? h('h4', { text: title }) : null].concat(kids));
  }

  var PANELS = {
    text: function (body) {
      body.appendChild(
        group('Thêm chữ', [
          h(
            'div',
            { class: 'dz-addlist' },
            TEXT_PRESETS.map(function (p) {
              var b = h('button', { type: 'button', class: 'dz-add' }, [h('strong', { text: p.label, style: 'font-family:' + CV.font(p.el.font) + ';font-size:' + Math.min(p.el.size, 22) + 'px' }), h('small', { text: p.small })]);
              b.addEventListener('click', function () {
                addEl(textDefaults(clone(p.el)));
              });
              return b;
            })
          ),
        ])
      );
      var chips = h('div', { class: 'dz-chips' });
      TOKENS.forEach(function (t) {
        var c = h('button', { type: 'button', class: 'dz-chip', text: t[1] });
        c.addEventListener('click', function () {
          var f = S.sel && find(S.sel);
          if (f && f.el.type === 'text') {
            f.el.text += (f.el.text ? ' ' : '') + t[0];
            refreshEl(f.el);
            renderProps();
            return commit();
          }
          addEl(textDefaults({ text: t[0], font: 'Great Vibes', size: 34, w: 340 }));
        });
        chips.appendChild(c);
      });
      body.appendChild(group('Chữ tự động', [h('p', { class: 'dz-hint', text: 'Tự thay bằng thông tin thật: tên từng khách mời theo link, tên cô dâu chú rể, ngày giờ cưới (sửa ở mục Thông tin).' }), chips]));
    },
    image: function (body) {
      var up = h('button', { type: 'button', class: 'dz-btn dz-btn-primary dz-btn-block', text: '⬆ Tải ảnh lên' });
      up.addEventListener('click', function () {
        pickImages(true, function (urls) {
          var f = S.sel && find(S.sel);
          if (f && f.el.type === 'image') return useImage(urls[0]);
          if (f && f.el.type === 'widget' && f.el.widget === 'album')
            return urls.forEach(function (u) {
              useImage(u);
            });
          // Không chọn gì: ảnh vào album "Bộ sưu tập" gần cuối thiệp
          addToCollection(urls);
        });
      });
      body.appendChild(group('', [up, h('p', { class: 'dz-hint', style: 'margin-top:8px', text: 'Gói ' + boot.plan.name + ': tối đa ' + boot.plan.photos + ' ảnh. Ảnh lớn được tự động nén cho thiệp tải nhanh. Đang chọn một ảnh trên thiệp thì bấm ảnh bên dưới để thay; đang chọn album thì ảnh được thêm vào album; không chọn gì thì ảnh tải lên được đưa vào mục “Bộ sưu tập” gần cuối thiệp.' })]));
      var lib = h('div', { class: 'dz-lib' }, [h('p', { class: 'dz-hint', text: 'Đang tải…' })]);
      body.appendChild(group('Ảnh đã tải lên', [lib]));
      var samples = h('div', { class: 'dz-lib' });
      [1, 2, 3].forEach(function (n) {
        var src = '/img/canvas/anh-mau-' + n + '.svg';
        var b = h('button', { type: 'button', 'aria-label': 'Ảnh giữ chỗ ' + n }, [h('img', { src: src, alt: '' })]);
        b.addEventListener('click', function () {
          useImage(src);
        });
        samples.appendChild(b);
      });
      body.appendChild(group('Ảnh giữ chỗ', [samples]));
      loadUploads().then(function (files) {
        lib.innerHTML = '';
        if (!files.length) lib.appendChild(h('p', { class: 'dz-hint', text: 'Chưa có ảnh nào.', style: 'grid-column:1/-1' }));
        files.forEach(function (src) {
          var b = h('button', { type: 'button', 'aria-label': 'Dùng ảnh này' }, [h('img', { src: src, alt: '', loading: 'lazy' })]);
          b.addEventListener('click', function () {
            useImage(src);
          });
          lib.appendChild(b);
        });
      });
    },
    shape: function (body) {
      var grid = h('div', { class: 'dz-shapes' });
      SHAPES.forEach(function (s) {
        var el = Object.assign({ type: 'shape', shape: s[0], fill: '', stroke: '', sw: 0, radius: 0 }, s[1]);
        var preview = CV.renderElement(Object.assign({ id: 'p', x: 0, y: 0, w: 40, h: s[0] === 'line' ? 3 : 40, r: 0, o: 1, anim: 'none' }, el), ctx()).firstChild;
        var b = h('button', { type: 'button', title: s[2], 'aria-label': s[2] }, [preview]);
        b.addEventListener('click', function () {
          var line = s[0] === 'line';
          addEl(Object.assign(clone(el), { w: line ? 160 : 120, h: line ? 2 : s[2] === 'Khung vòm' ? 160 : 120 }));
        });
        grid.appendChild(b);
      });
      body.appendChild(group('', [grid]));
    },
    widget: function (body) {
      body.appendChild(
        group('', [
          h(
            'div',
            { class: 'dz-addlist' },
            WIDGET_LIST.map(function (w) {
              // Gói Miễn phí không có sổ lời chúc
              var locked = w[0] === 'wishes' && !boot.plan.wishes;
              var b = h('button', { type: 'button', class: 'dz-add' }, [h('strong', { text: w[1] + (locked ? ' 🔒' : '') }), h('small', { text: locked ? 'Có từ gói Basic – nâng cấp để khách gửi lời chúc' : w[2] })]);
              b.addEventListener('click', function () {
                if (locked) return toast('Sổ lời chúc có từ gói Basic trở lên.');
                addEl(Object.assign({ type: 'widget', widget: w[0], color: '#d6456c', textColor: '#333333', bg: '', font: 'Be Vietnam Pro' }, clone(w[3])));
              });
              return b;
            })
          ),
        ])
      );
    },
    bg: function (body) {
      var sec = secOf(S.sec) || doc.sections[0];
      body.appendChild(h('p', { class: 'dz-hint', text: 'Đang chỉnh nền của Trang ' + (doc.sections.indexOf(sec) + 1) + '. Bấm vào vùng trống của trang khác để đổi trang.' }));
      var sw = h('div', { class: 'dz-swatches' });
      SWATCHES.forEach(function (c) {
        var b = h('button', { type: 'button', style: 'background:' + c, 'aria-label': 'Màu ' + c });
        b.addEventListener('click', function () {
          sec.bg = c;
          refreshSec(sec);
          renderProps();
          commit();
        });
        sw.appendChild(b);
      });
      body.appendChild(group('Màu nền trang', [sw, field('Màu khác', colorInput(sec, 'bg', false, function () {
        refreshSec(sec);
      }))]));
      var pick = h('button', { type: 'button', class: 'dz-btn dz-btn-soft dz-btn-block', text: sec.bgImage ? 'Đổi ảnh nền' : 'Chọn ảnh nền' });
      pick.addEventListener('click', function () {
        pickImages(false, function (urls) {
          sec.bgImage = urls[0];
          refreshSec(sec);
          commit();
          openTool('bg', true);
        });
      });
      var kids = [pick];
      if (sec.bgImage) {
        var rm = h('button', { type: 'button', class: 'dz-btn dz-btn-ghost dz-btn-block', style: 'margin-top:6px', text: 'Bỏ ảnh nền' });
        rm.addEventListener('click', function () {
          sec.bgImage = '';
          refreshSec(sec);
          commit();
          openTool('bg', true);
        });
        kids.push(rm);
      }
      body.appendChild(group('Ảnh nền trang', kids));
      body.appendChild(group('Nền ngoài thiệp (máy tính)', [field('Màu', colorInput(doc, 'pageBg', false, function () {}))]));
    },
    music: function (body) {
      var m = doc.music;
      var SM = window.SobaMusic;
      var cur = SM && SM.keyOf(m.url);
      // Thư viện nhạc cưới (tệp trong /music) – mọi gói đều dùng được
      var song = (boot.songs || []).find(function (s) {
        return s.url === m.url;
      });
      var slist = h('div', { class: 'dz-pages' });
      (boot.songs || []).forEach(function (s) {
        var on = song && song.key === s.key;
        var pk = h('button', { type: 'button', text: (on ? '✓ ' : '') + s.name });
        pk.addEventListener('click', function () {
          m.url = s.url;
          commit();
          openTool('music', true);
        });
        var pid = 'song:' + s.key;
        var ls = h('button', { type: 'button', class: 'dz-ib', title: 'Nghe thử', 'aria-label': 'Nghe thử ' + s.name, text: S.preview && S.preview.key === pid ? '⏸' : '▶' });
        ls.addEventListener('click', function () {
          var playing = S.preview && S.preview.key === pid;
          if (S.preview) S.preview.player.pause();
          S.preview = null;
          if (!playing) {
            S.preview = { key: pid, player: new Audio(s.url) };
            S.preview.player.play();
          }
          openTool('music', true);
        });
        slist.appendChild(h('div', { class: 'dz-page' + (on ? ' on' : '') }, [pk, ls]));
      });
      if (slist.children.length) body.appendChild(group('Nhạc cưới', [h('p', { class: 'dz-hint', text: 'Chọn một bài làm nhạc nền, bấm ▶ để nghe thử.' }), slist]));
      if (song) cur = song.key;
      var list = h('div', { class: 'dz-pages' });
      (SM ? SM.list : []).forEach(function (s) {
        var pick = h('button', { type: 'button', text: (cur === s.key ? '✓ ' : '') + s.name });
        pick.addEventListener('click', function () {
          m.url = 'builtin:' + s.key;
          commit();
          openTool('music', true);
        });
        var listen = h('button', { type: 'button', class: 'dz-ib', title: 'Nghe thử', 'aria-label': 'Nghe thử ' + s.name, text: S.preview && S.preview.key === s.key ? '⏸' : '▶' });
        listen.addEventListener('click', function () {
          var playing = S.preview && S.preview.key === s.key;
          if (S.preview) S.preview.player.pause();
          S.preview = null;
          if (!playing) {
            S.preview = { key: s.key, player: SM.create(s.key) };
            S.preview.player.play();
          }
          openTool('music', true);
        });
        list.appendChild(h('div', { class: 'dz-page' + (cur === s.key ? ' on' : '') }, [pick, listen]));
      });
      body.appendChild(group('Giai điệu SOBA (miễn phí bản quyền)', [h('p', { class: 'dz-hint', text: 'Giai điệu hộp nhạc nhẹ nhàng do SOBA sáng tác, phát ngay trên thiệp.' }), list]));
      var custom = { url: cur ? '' : m.url };
      body.appendChild(group('Hoặc nhạc của bạn', [
        h('p', { class: 'dz-hint', text: 'Dán link nhạc https (mp3) hoặc tải tệp mp3/m4a. Hãy dùng bản nhạc bạn có quyền sử dụng.' }),
        field('Link nhạc', textInput(custom, 'url', { placeholder: 'https://…/bai-hat.mp3', max: 500 }, function () {
          m.url = custom.url;
        })),
        checkbox('Tự phát khi khách chạm vào thiệp', m, 'autoplay', function () {}),
      ]));
      if (m.url) {
        var off = h('button', { type: 'button', class: 'dz-btn dz-btn-ghost dz-btn-sm', text: 'Tắt nhạc nền' });
        off.addEventListener('click', function () {
          m.url = '';
          commit();
          openTool('music', true);
        });
        body.appendChild(group('', [off]));
      }
      if (boot.plan.customMusic) {
        var up = h('button', { type: 'button', class: 'dz-btn dz-btn-soft dz-btn-block', text: '⬆ Tải tệp nhạc' });
        up.addEventListener('click', function () {
          ui.fileAudio.value = '';
          ui.fileAudio.click();
        });
        body.appendChild(group('', [up]));
      } else body.appendChild(group('', [h('p', { class: 'dz-hint', text: 'Tải nhạc riêng có ở gói Basic trở lên.' })]));
      if (m.url && !cur) body.appendChild(group('Nghe thử', [h('audio', { controls: true, src: m.url, style: 'width:100%' })]));
    },
    pages: function (body) {
      var list = h('div', { class: 'dz-pages' });
      doc.sections.forEach(function (s, i) {
        var go = h('button', { type: 'button', text: 'Trang ' + (i + 1) + ' · ' + s.els.length + ' phần tử' });
        go.addEventListener('click', function () {
          S.sec = s.id;
          S.sel = null;
          renderSel();
          renderProps();
          var w = wrapOf(s.id);
          if (w) w.scrollIntoView({ behavior: 'smooth', block: 'start' });
          openTool('pages', true);
        });
        var row = h('div', { class: 'dz-page' + (S.sec === s.id ? ' on' : '') }, [go]);
        [
          ['up', '↑', 'Chuyển lên'],
          ['down', '↓', 'Chuyển xuống'],
          ['dup', '⧉', 'Nhân bản'],
          ['del', '🗑', 'Xoá'],
        ].forEach(function (a) {
          var b = h('button', { type: 'button', class: 'dz-ib', title: a[2], 'aria-label': a[2] + ' trang ' + (i + 1), text: a[1] });
          b.addEventListener('click', function () {
            sectionAction(a[0], i);
          });
          row.appendChild(b);
        });
        list.appendChild(row);
      });
      var add = h('button', { type: 'button', class: 'dz-btn dz-btn-soft dz-btn-block', style: 'margin-top:10px', text: '＋ Thêm trang trống' });
      add.addEventListener('click', function () {
        addSection(doc.sections.length);
      });
      body.appendChild(group('', [list, add]));
    },
    info: function (body) {
      var all = function () {
        renderAll();
      };
      body.appendChild(group('Cô dâu & chú rể', [
        h('p', { class: 'dz-hint', text: 'Dùng cho tiêu đề khi chia sẻ link và các chữ tự động {chu_re}, {co_dau}.' }),
        field('Tên chú rể', textInput(doc.groom, 'name', { max: 60 }, all)),
        field('Tên cô dâu', textInput(doc.bride, 'name', { max: 60 }, all)),
      ]));
      body.appendChild(group('Ngày giờ cưới', [
        h('p', { class: 'dz-hint', text: 'Dùng cho đồng hồ đếm ngược, lịch và chữ {ngay}, {gio}.' }),
        h('div', { class: 'dz-grid2' }, [field('Ngày', dateInput(doc, 'date', 'date', all)), field('Giờ', dateInput(doc, 'time', 'time', all))]),
      ]));
      var FALL_NAMES = { petals: 'Cánh hoa', leaves: 'Lá bay', hearts: 'Trái tim', sparkle: 'Lấp lánh', snow: 'Tuyết' };
      body.appendChild(group('Hiệu ứng', [
        checkbox('Hiệu ứng rơi (gói Basic trở lên)', doc.effects, 'petals', function () {}),
        field('Kiểu rơi', selectInput(doc.effects, 'fall', (boot.falls || ['petals']).map(function (k) {
          return [k, FALL_NAMES[k] || k];
        }), function () {})),
        checkbox('Nút tự cuộn thiệp (khách bấm để thiệp tự chạy xuống)', doc.effects, 'autoscroll', function () {}),
        checkbox('Tự cuộn ngay khi khách mở thiệp', doc.effects, 'autostart', function () {}),
      ]));
      // Màn mở thiệp + thanh tiện ích nổi (gói Basic trở lên)
      var paid = boot.plan.effects;
      var op = doc.opener;
      body.appendChild(group('Mở thiệp & tiện ích', [
        h('p', { class: 'dz-hint', text: paid ? 'Khách chạm để mở thiệp, nhạc nền phát ngay sau khi mở. Bấm “Xem trước” để thử.' : 'Màn mở thiệp, thanh tiện ích (lời chúc bay, bắn tim, hộp quà QR) có ở gói Basic trở lên – khách sẽ chưa thấy với gói hiện tại.' }),
        field('Kiểu mở thiệp', selectInput(op, 'style', (boot.openers || []).map(function (o) {
          return [o.key, o.name];
        }), function () {})),
        h('div', { class: 'dz-grid2' }, [field('Màu chính', colorInput(op, 'color', false, function () {})), field('Màu nền', colorInput(op, 'paper', false, function () {}))]),
        field('Ảnh màn mở thiệp (để trống = ảnh bìa)', textInput(op, 'photo', { max: 500, placeholder: '/img/mau/... hoặc link ảnh' }, function () {})),
        field('Phông tên', selectInput(op, 'font', boot.fonts.map(function (f) {
          return [f, f, 'font-family:' + CV.font(f)];
        }), function () {})),
        checkbox('Thanh tiện ích: gửi lời chúc, bắn tim, hộp quà, thả tim', doc.effects, 'toolbar', function () {}),
      ]));
    },
  };
  ui.fileAudio.addEventListener('change', function () {
    upload(ui.fileAudio.files).then(function (urls) {
      if (!urls.length) return;
      doc.music.url = urls[0];
      commit();
      openTool('music', true);
      toast('Đã tải nhạc nền.');
    });
  });
  $$('.dz-rail button').forEach(function (b) {
    b.addEventListener('click', function () {
      openTool(b.getAttribute('data-tool'));
    });
  });

  // ===== Ô nhập liên kết dữ liệu =====
  function field(label, input) {
    return h('div', { class: 'dz-field' }, [h('label', { text: label }), input]);
  }
  function bind(input, obj, key, parse, after) {
    input.addEventListener('input', function () {
      obj[key] = parse(input);
      after();
      commitSoon();
    });
    input.addEventListener('change', function () {
      obj[key] = parse(input);
      after();
      commit();
    });
    return input;
  }
  function textInput(obj, key, o, after) {
    var tag = o.multi ? 'textarea' : 'input';
    var i = h(tag, { type: o.multi ? null : 'text', maxlength: String(o.max || 200), placeholder: o.placeholder || '', rows: o.multi ? '4' : null });
    i.value = obj[key] || '';
    return bind(i, obj, key, function (x) {
      return x.value;
    }, after);
  }
  function dateInput(obj, key, type, after) {
    var i = h('input', { type: type });
    i.value = obj[key] || '';
    return bind(i, obj, key, function (x) {
      return x.value;
    }, after);
  }
  function numInput(obj, key, min, max, step, after) {
    var i = h('input', { type: 'number', min: String(min), max: String(max), step: String(step || 1) });
    i.value = obj[key];
    return bind(i, obj, key, function (x) {
      var v = parseFloat(x.value);
      return isNaN(v) ? obj[key] : clamp(v, min, max);
    }, after);
  }
  function range(label, obj, key, min, max, step, fmt, after) {
    var out = h('output', { text: fmt(obj[key]) });
    var i = h('input', { type: 'range', min: String(min), max: String(max), step: String(step) });
    i.value = obj[key];
    bind(i, obj, key, function (x) {
      out.textContent = fmt(parseFloat(x.value));
      return parseFloat(x.value);
    }, after);
    return h('div', { class: 'dz-field' }, [h('label', { text: label }), h('div', { class: 'dz-range' }, [i, out])]);
  }
  function colorInput(obj, key, allowNone, after) {
    var i = h('input', { type: 'color', 'aria-label': 'Chọn màu' });
    i.value = (obj[key] || '#ffffff').slice(0, 7);
    bind(i, obj, key, function (x) {
      return x.value;
    }, after);
    var kids = [i];
    if (allowNone) {
      var none = h('button', { type: 'button', class: 'dz-ib' + (obj[key] ? '' : ' on'), title: 'Không màu', 'aria-label': 'Không màu', text: '⊘' });
      none.addEventListener('click', function () {
        obj[key] = '';
        after();
        commit();
        none.classList.add('on');
      });
      i.addEventListener('input', function () {
        none.classList.remove('on');
      });
      kids.push(none);
    }
    return h('div', { class: 'dz-color' }, kids);
  }
  function selectInput(obj, key, options, after) {
    var s = h(
      'select',
      null,
      options.map(function (o) {
        return h('option', { value: o[0], text: o[1], style: o[2] || null });
      })
    );
    s.value = obj[key];
    return bind(s, obj, key, function (x) {
      return x.value;
    }, after);
  }
  function checkbox(label, obj, key, after) {
    var i = h('input', { type: 'checkbox' });
    i.checked = Boolean(obj[key]);
    i.addEventListener('change', function () {
      obj[key] = i.checked;
      after();
      commit();
    });
    return h('label', { class: 'dz-check' }, [i, label]);
  }
  function seg(obj, key, options, after) {
    var wrap = h('div', { class: 'dz-seg' });
    options.forEach(function (o) {
      var b = h('button', { type: 'button', class: obj[key] === o[0] ? 'on' : '', title: o[2] || o[1], text: o[1] });
      b.addEventListener('click', function () {
        obj[key] = o[0];
        $$('button', wrap).forEach(function (x) {
          x.classList.remove('on');
        });
        b.classList.add('on');
        after();
        commit();
      });
      wrap.appendChild(b);
    });
    return wrap;
  }
  function toggles(obj, list, after) {
    var wrap = h('div', { class: 'dz-seg' });
    list.forEach(function (o) {
      var b = h('button', { type: 'button', class: obj[o[0]] ? 'on' : '', title: o[2], 'aria-label': o[2], 'aria-pressed': String(Boolean(obj[o[0]])), html: null });
      b.innerHTML = o[1];
      b.addEventListener('click', function () {
        obj[o[0]] = !obj[o[0]];
        b.classList.toggle('on', obj[o[0]]);
        b.setAttribute('aria-pressed', String(obj[o[0]]));
        after();
        commit();
      });
      wrap.appendChild(b);
    });
    return wrap;
  }

  // ===== Bảng thuộc tính bên phải =====
  function openProps() {
    ui.props.classList.add('open');
  }
  function renderProps() {
    var body = ui.propsBody;
    body.innerHTML = '';
    var f = S.sel && find(S.sel);
    if (!f) {
      var sec = secOf(S.sec) || doc.sections[0];
      var i = doc.sections.indexOf(sec);
      ui.propsTitle.textContent = 'Trang ' + (i + 1);
      var rs = function () {
        refreshSec(sec);
      };
      body.appendChild(h('p', { class: 'dz-hint', text: 'Bấm vào chữ, ảnh hoặc tiện ích trên thiệp để chỉnh. Nhấp đúp vào chữ để sửa nội dung, nhấp đúp vào ảnh để thay ảnh.' }));
      body.appendChild(group('Trang', [field('Chiều cao (px)', numInput(sec, 'h', 80, 4000, 10, rs)), field('Màu nền', colorInput(sec, 'bg', false, rs))]));
      var bgb = h('button', { type: 'button', class: 'dz-btn dz-btn-soft dz-btn-block', text: 'Nền & ảnh nền…' });
      bgb.addEventListener('click', function () {
        openTool('bg', true);
      });
      body.appendChild(group('', [bgb]));
      return;
    }
    var el = f.el;
    var re = function () {
      refreshEl(el);
    };
    var names = { text: 'Văn bản', image: 'Hình ảnh', shape: 'Hình dạng', widget: 'Tiện ích' };
    var wnames = { countdown: 'Đếm ngược', calendar: 'Lịch', map: 'Bản đồ', rsvp: 'Xác nhận tham dự', wishes: 'Sổ lời chúc', gift: 'Mừng cưới', album: 'Album ảnh', call: 'Nút gọi' };
    ui.propsTitle.textContent = el.type === 'widget' ? wnames[el.widget] : names[el.type];

    if (el.type === 'text') {
      body.appendChild(group('Nội dung', [field('Chữ (có thể dùng {ten_khach}, {chu_re}…)', textInput(el, 'text', { multi: true, max: 2000 }, re))]));
      var fonts = boot.fonts.map(function (n) {
        return [n, n, 'font-family:' + CV.font(n)];
      });
      body.appendChild(
        group('Kiểu chữ', [
          field('Phông chữ', selectInput(el, 'font', fonts, re)),
          h('div', { class: 'dz-grid2' }, [field('Cỡ chữ', numInput(el, 'size', 6, 200, 1, re)), field('Màu chữ', colorInput(el, 'color', false, re))]),
          field('', toggles(el, [['bold', '<b>B</b>', 'In đậm'], ['italic', '<i>I</i>', 'In nghiêng'], ['underline', '<u>U</u>', 'Gạch chân'], ['upper', 'Aa', 'Chữ in hoa'], ['shadow', 'S', 'Đổ bóng chữ']], re)),
          field('Căn lề', seg(el, 'align', [['left', '⇤', 'Căn trái'], ['center', '↔', 'Căn giữa'], ['right', '⇥', 'Căn phải'], ['justify', '☰', 'Căn đều']], re)),
          range('Giãn dòng', el, 'lh', 0.8, 3, 0.05, function (v) {
            return v.toFixed(2);
          }, re),
          range('Giãn chữ', el, 'ls', -5, 30, 0.5, function (v) {
            return v + 'px';
          }, re),
          field('Màu nền chữ', colorInput(el, 'bg', true, re)),
        ])
      );
    }
    if (el.type === 'image') {
      var rep = h('button', { type: 'button', class: 'dz-btn dz-btn-primary', text: 'Đổi ảnh' });
      rep.addEventListener('click', function () {
        replaceImage(el);
      });
      var crop = h('button', { type: 'button', class: 'dz-btn dz-btn-soft', text: S.crop ? 'Xong cắt' : 'Cắt ảnh' });
      crop.addEventListener('click', function () {
        setCrop(!S.crop);
        renderProps();
      });
      body.appendChild(group('Ảnh', [h('div', { class: 'dz-grid2' }, [rep, crop])]));
      body.appendChild(
        group('Cắt & căn ảnh', [
          range('Phóng to', el, 'zoom', 1, 4, 0.05, function (v) {
            return Math.round(v * 100) + '%';
          }, re),
          range('Vị trí ngang', el, 'ox', 0, 100, 1, function (v) {
            return Math.round(v) + '%';
          }, re),
          range('Vị trí dọc', el, 'oy', 0, 100, 1, function (v) {
            return Math.round(v) + '%';
          }, re),
        ])
      );
      body.appendChild(
        group('Khung ảnh', [
          field('Hình khung', seg(el, 'mask', [['rect', 'Vuông'], ['circle', 'Tròn'], ['arch', 'Vòm']], re)),
          range('Bo góc', el, 'radius', 0, 300, 1, function (v) {
            return v + 'px';
          }, re),
          h('div', { class: 'dz-grid2' }, [field('Viền (px)', numInput(el, 'border', 0, 30, 1, re)), field('Màu viền', colorInput(el, 'borderColor', false, re))]),
          checkbox('Đổ bóng', el, 'shadow', re),
          field('Bộ lọc màu', seg(el, 'filter', [['none', 'Gốc'], ['warm', 'Ấm'], ['film', 'Phim'], ['soft', 'Dịu'], ['bw', 'Đen trắng'], ['blur', 'Làm mờ']], re)),
        ])
      );
    }
    if (el.type === 'shape') {
      body.appendChild(
        group('Hình dạng', [
          field('Kiểu', selectInput(el, 'shape', [['rect', 'Chữ nhật'], ['circle', 'Hình tròn'], ['ring', 'Vòng tròn'], ['line', 'Đường kẻ'], ['heart', 'Trái tim'], ['star', 'Ngôi sao'], ['tri', 'Tam giác']], re)),
          field('Màu nền chuyển dần', seg(el, 'grad', [['', 'Đều'], ['down', 'Đậm trên'], ['up', 'Đậm dưới']], re)),
          checkbox('Đổ bóng', el, 'shadow', re),
          field('Màu nền', colorInput(el, 'fill', true, re)),
          h('div', { class: 'dz-grid2' }, [field('Màu viền', colorInput(el, 'stroke', true, re)), field('Độ dày viền', numInput(el, 'sw', 0, 30, 1, re))]),
          range('Bo góc', el, 'radius', 0, 300, 1, function (v) {
            return v + 'px';
          }, re),
        ])
      );
    }
    if (el.type === 'widget') widgetProps(body, el, re);

    // Chung: vị trí, hiệu ứng
    body.appendChild(
      group('Vị trí & kích thước', [
        h('div', { class: 'dz-grid2' }, [field('X', numInput(el, 'x', -2000, 4000, 1, re)), field('Y', numInput(el, 'y', -2000, 8000, 1, re)), field('Rộng', numInput(el, 'w', 4, 4000, 1, re)), field('Cao', numInput(el, 'h', 1, 8000, 1, re))]),
        range('Xoay', el, 'r', -180, 180, 1, function (v) {
          return v + '°';
        }, re),
        range('Độ hiển thị', el, 'o', 0, 1, 0.05, function (v) {
          return Math.round(v * 100) + '%';
        }, re),
        (function () {
          var c = h('button', { type: 'button', class: 'dz-btn dz-btn-ghost dz-btn-sm', text: '↔ Căn giữa trang' });
          c.addEventListener('click', function () {
            el.x = round((W - el.w) / 2);
            re();
            renderProps();
            commit();
          });
          return c;
        })(),
      ])
    );
    body.appendChild(
      group('Hiệu ứng xuất hiện', [
        field('Kiểu', selectInput(el, 'anim', [['none', 'Không'], ['fade', 'Hiện dần'], ['up', 'Trượt lên'], ['down', 'Trượt xuống'], ['left', 'Từ trái sang'], ['right', 'Từ phải sang'], ['zoom', 'Phóng to dần'], ['rise', 'Trồi lên từ phong bì'], ['spin', 'Xoay đĩa nhạc (khi phát nhạc)']], function () {})),
        range('Trễ', el, 'delay', 0, 3, 0.1, function (v) {
          return v.toFixed(1) + 's';
        }, function () {}),
      ])
    );
    var del = h('button', { type: 'button', class: 'dz-btn dz-btn-ghost dz-btn-danger dz-btn-block', text: 'Xoá phần tử' });
    del.addEventListener('click', function () {
      delEl(el.id);
    });
    body.appendChild(group('', [del]));
  }

  function widgetProps(body, el, re) {
    var fonts = boot.fonts.map(function (n) {
      return [n, n];
    });
    if (el.widget === 'map') body.appendChild(group('Địa điểm', [field('Địa chỉ', textInput(el, 'address', { max: 200, placeholder: 'Số nhà, đường, quận, thành phố' }, re)), field('Chữ trên nút', textInput(el, 'label', { max: 40 }, re)), field('Kiểu', selectInput(el, 'style', [['full', 'Bản đồ + nút'], ['button', 'Chỉ nút chỉ đường']], re))]));
    if (el.widget === 'rsvp' || el.widget === 'wishes') body.appendChild(group('Nội dung', [field('Tiêu đề trong khung (không bắt buộc)', textInput(el, 'title', { max: 80 }, re))]));
    if (el.widget === 'wishes') body.appendChild(group('', [checkbox('Cho khách chọn “Chỉ cô dâu, chú rể xem”', el, 'privacy', re)]));
    if (el.widget === 'signature') body.appendChild(group('Ký tên lưu bút', [h('p', { class: 'dz-hint', text: 'Đặt khung này đè lên một ảnh. Chữ ký của khách hiện nổi trên ảnh, nút ký ở phía dưới khung.' }), field('Chữ trên nút', textInput(el, 'label', { max: 40 }, re))]));
    if (el.widget === 'addcal') body.appendChild(group('Thêm vào lịch', [field('Chữ trên nút', textInput(el, 'label', { max: 40 }, re)), field('Giờ (để trống = giờ cưới)', textInput(el, 'time', { max: 5, placeholder: '10:00' }, re)), field('Địa điểm', textInput(el, 'address', { max: 200 }, re))]));
    if (el.widget === 'dresscode') {
      if (!el.colors) el.colors = [];
      var dcs = [];
      for (var di = 0; di < 6; di++) {
        if (!el.colors[di]) el.colors[di] = { c: '', n: '' };
        dcs.push(h('div', { class: 'dz-row2' }, [colorInput(el.colors[di], 'c', true, re), textInput(el.colors[di], 'n', { max: 24, placeholder: 'Tên màu ' + (di + 1) }, re)]));
      }
      body.appendChild(group('Màu trang phục (tối đa 6)', dcs));
    }
    if (el.widget === 'call') body.appendChild(group('Nút gọi', [field('Số điện thoại', textInput(el, 'phone', { max: 20, placeholder: '09xx xxx xxx' }, re)), field('Chữ trên nút', textInput(el, 'label', { max: 40 }, re))]));
    if (el.widget === 'countdown' || el.widget === 'calendar') {
      var go = h('button', { type: 'button', class: 'dz-btn dz-btn-soft dz-btn-block', text: 'Sửa ngày giờ cưới…' });
      go.addEventListener('click', function () {
        openTool('info', true);
      });
      body.appendChild(group('Ngày cưới', [h('p', { class: 'dz-hint', text: 'Lấy theo ngày giờ cưới ở mục Thông tin: ' + (doc.date || 'chưa đặt') + ' ' + doc.time }), go]));
    }
    if (el.widget === 'gift') body.appendChild(group('Kiểu hiển thị', [selectInput(el, 'style', [['cards', 'Hiện sẵn mã QR'], ['box', 'Hộp quà – chạm để mở']], re)]));
    if (el.widget === 'gift') {
      var banks = [['', '— Chọn ngân hàng —']].concat(
        boot.banks.map(function (b) {
          return [b.bin, b.name];
        })
      );
      ['groom', 'bride'].forEach(function (side) {
        var acc = el[side];
        body.appendChild(
          group(side === 'groom' ? 'Tài khoản chú rể' : 'Tài khoản cô dâu', [
            field('Ngân hàng', selectInput(acc, 'bin', banks, re)),
            field('Số tài khoản', textInput(acc, 'accountNo', { max: 30 }, re)),
            field('Tên chủ tài khoản', textInput(acc, 'accountName', { max: 60, placeholder: 'NGUYEN VAN A' }, re)),
          ])
        );
      });
    }
    if (el.widget === 'album') {
      var list = h('div', { class: 'dz-albumlist' });
      el.images.forEach(function (src, i) {
        var x = h('button', { type: 'button', class: 'dz-mini x', 'aria-label': 'Bỏ ảnh', text: '×' });
        x.addEventListener('click', function () {
          el.images.splice(i, 1);
          re();
          renderProps();
          commit();
        });
        var l = h('button', { type: 'button', class: 'dz-mini l', 'aria-label': 'Đưa ảnh lên trước', text: '‹' });
        l.addEventListener('click', function () {
          if (i === 0) return;
          el.images.splice(i - 1, 0, el.images.splice(i, 1)[0]);
          re();
          renderProps();
          commit();
        });
        list.appendChild(h('div', null, [h('img', { src: src, alt: '' }), i ? l : null, x]));
      });
      var add = h('button', { type: 'button', class: 'dz-btn dz-btn-primary dz-btn-block', text: '＋ Thêm ảnh vào album' });
      add.addEventListener('click', function () {
        pickImages(true, function (urls) {
          urls.forEach(function (u) {
            if (el.images.length < ALBUM_MAX) el.images.push(u);
          });
          var fc = el.collection && find(el.id);
          if (fc) {
            growCollection(fc);
            refreshSec(fc.sec);
          }
          re();
          renderProps();
          commit();
        });
      });
      body.appendChild(
        group('Ảnh trong album (' + el.images.length + '/' + ALBUM_MAX + ')', [
          list,
          add,
          h('div', { class: 'dz-grid2', style: 'margin-top:10px' }, [field('Số cột', numInput(el, 'cols', 1, 4, 1, re)), field('Khoảng cách', numInput(el, 'gap', 0, 24, 1, re))]),
          range('Bo góc ảnh', el, 'radius', 0, 40, 1, function (v) {
            return v + 'px';
          }, re),
        ])
      );
    }
    body.appendChild(
      group('Màu sắc', [
        h('div', { class: 'dz-grid2' }, [field('Màu nhấn', colorInput(el, 'color', false, re)), field('Màu chữ', colorInput(el, 'textColor', false, re))]),
        field('Nền khung', colorInput(el, 'bg', true, re)),
        field('Phông chữ', selectInput(el, 'font', fonts, re)),
      ])
    );
  }

  // ===== Thay ảnh nhanh =====
  function images() {
    var out = [];
    doc.sections.forEach(function (s) {
      s.els.forEach(function (e) {
        if (e.type === 'image') out.push({ el: e, sec: s });
      });
    });
    return out;
  }
  function renderQuick() {
    var list = images();
    ui.quickCount.textContent = '(' + list.length + ' ảnh)';
    ui.quickList.innerHTML = '';
    list.forEach(function (it) {
      var b = h('button', { type: 'button', 'data-q': it.el.id, title: 'Bấm để thay ảnh này', 'aria-label': 'Thay ảnh' }, [it.el.src ? h('img', { src: it.el.src, alt: '', loading: 'lazy' }) : h('span', { text: '+' })]);
      b.addEventListener('click', function () {
        select(it.el.id, it.sec.id);
        var n = nodeOf(it.el.id);
        if (n) n.scrollIntoView({ behavior: 'smooth', block: 'center' });
        replaceImage(it.el);
      });
      ui.quickList.appendChild(b);
    });
    markQuick();
    document.documentElement.style.setProperty('--dz-quick', ui.quick.offsetHeight + 'px');
  }
  function markQuick() {
    $$('[data-q]', ui.quickList).forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-q') === S.sel);
    });
  }

  // ===== Thanh trên: hoàn tác, thu phóng, xuất bản =====
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]');
    if (!a) return;
    var act = a.getAttribute('data-act');
    if (act === 'undo' && hi > 0) restore(hi - 1);
    if (act === 'redo' && hi < hist.length - 1) restore(hi + 1);
    if (act === 'zoom-in') setZoom(S.z + 0.1);
    if (act === 'zoom-out') setZoom(S.z - 0.1);
    if (act === 'close-panel') closePanel();
    if (act === 'close-props') ui.props.classList.remove('open');
    if (act === 'toggle-quick') {
      ui.quick.classList.toggle('closed');
      document.documentElement.style.setProperty('--dz-quick', ui.quick.offsetHeight + 'px');
    }
    if (act === 'publish') publishDialog();
  });
  $('[data-preview]').addEventListener('click', function () {
    dirty = true;
    save();
  });
  function setZoom(z) {
    S.z = Math.round(clamp(z, 0.4, 2) * 100) / 100;
    renderAll();
  }
  function fitZoom() {
    var avail = ui.work.clientWidth - (isMobile() ? 24 : 48);
    S.z = Math.round(clamp(avail / W, 0.5, isMobile() ? 1.5 : 1.1) * 100) / 100;
  }
  function updPublish() {
    ui.publish.textContent = S.status === 'published' ? 'Chia sẻ' : 'Xuất bản';
  }
  function publish(on) {
    return save().then(function () {
      return api('/api/thiep/' + boot.id + '/xuat-ban', { publish: on }).then(function (j) {
        S.status = j.status;
        S.url = j.url;
        updPublish();
        return j;
      });
    });
  }
  function publishDialog() {
    var run = S.status === 'published' ? Promise.resolve() : publish(true);
    run
      .then(function () {
        var input = h('input', { readonly: true, value: S.url, 'aria-label': 'Link thiệp' });
        var copy = h('button', { type: 'button', class: 'dz-btn dz-btn-primary dz-btn-sm', text: 'Sao chép' });
        var hide = h('button', { type: 'button', class: 'dz-btn dz-btn-ghost dz-btn-sm', text: 'Ẩn thiệp' });
        var close = h('button', { type: 'button', class: 'dz-btn dz-btn-ghost dz-btn-sm', text: 'Đóng' });
        var m = h('div', { class: 'dz-modal', role: 'dialog', 'aria-modal': 'true' }, [
          h('div', null, [
            h('h3', { text: 'Thiệp đã được xuất bản 🎉' }),
            h('p', { class: 'dz-hint', text: 'Gửi link này cho khách. Mọi thay đổi sau khi lưu sẽ hiện ngay trên thiệp. Tạo link có tên riêng từng khách ở trang Khách mời.' }),
            h('div', { class: 'dz-share' }, [input, copy]),
            h('div', { class: 'dz-row', style: 'justify-content:flex-end;gap:8px' }, [h('a', { class: 'dz-btn dz-btn-soft dz-btn-sm', href: S.url, target: '_blank', rel: 'noopener', text: 'Mở thiệp' }), h('a', { class: 'dz-btn dz-btn-soft dz-btn-sm', href: '/thiep/' + boot.id + '/khach-moi', text: 'Khách mời' }), hide, close]),
          ]),
        ]);
        document.body.appendChild(m);
        copy.addEventListener('click', function () {
          input.select();
          (navigator.clipboard ? navigator.clipboard.writeText(S.url) : Promise.reject()).then(
            function () {
              copy.textContent = 'Đã chép ✓';
            },
            function () {
              document.execCommand('copy');
              copy.textContent = 'Đã chép ✓';
            }
          );
        });
        close.addEventListener('click', function () {
          m.remove();
        });
        m.addEventListener('click', function (e) {
          if (e.target === m) m.remove();
        });
        hide.addEventListener('click', function () {
          publish(false).then(function () {
            m.remove();
            toast('Đã ẩn thiệp – khách sẽ không mở được link cho tới khi bạn xuất bản lại.', 4000);
          });
        });
      })
      .catch(function (e) {
        toast(e.message, 4000);
      });
  }

  // ===== Khởi động =====
  if (isMobile()) ui.quick.classList.add('closed');
  fitZoom();
  updPublish();
  updHist();
  renderAll();
  if (!isMobile()) openTool('text');
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(function () {
      var changed = false;
      doc.sections.forEach(function (s) {
        s.els.forEach(function (el) {
          if (el.type !== 'text') return;
          var before = el.h;
          fitText(el, nodeOf(el.id));
          if (before !== el.h) changed = true;
        });
      });
      if (changed) {
        renderSel();
        hist[hi] = JSON.stringify(doc);
      }
    });
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (Math.abs(window.innerWidth - lastW) < 40) return;
    lastW = window.innerWidth;
    fitZoom();
    renderAll();
  });
})();
