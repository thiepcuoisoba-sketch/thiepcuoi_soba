/* SOBA – trình chỉnh sửa thiệp: tự lưu + xem trước trực tiếp */
(function () {
  'use strict';
  var root = document.querySelector('[data-editor]');
  if (!root) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var toast = function (m) { if (window.sobaToast) window.sobaToast(m); };

  var cardId = root.dataset.cardId;
  var csrf = root.dataset.csrf;
  var state = JSON.parse($('#card-data').textContent);
  var template = ($('input[name=template]:checked') || {}).value;
  var status = root.dataset.status;
  var form = $('[data-form]', root);
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  // ===== Đọc / ghi theo đường dẫn "a.b.c" =====
  function getPath(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }
  function setPath(obj, path, val) {
    var keys = path.split('.');
    var last = keys.pop();
    var tgt = keys.reduce(function (o, k) { if (o[k] == null || typeof o[k] !== 'object') o[k] = {}; return o[k]; }, obj);
    tgt[last] = val;
  }

  // ===== Lưu tự động =====
  var saveEl = $('[data-save-state]');
  var timer = null;
  var saving = false;
  var pending = false;
  function setSaveState(cls, text) {
    saveEl.className = 'save-state ' + cls;
    saveEl.textContent = text;
  }
  function scheduleSave() {
    setSaveState('saving', 'Đang chỉnh sửa…');
    clearTimeout(timer);
    timer = setTimeout(save, 800);
  }
  function api(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf, Accept: 'application/json' },
      body: JSON.stringify(body),
      credentials: 'same-origin',
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error(j.error || 'Có lỗi xảy ra'); e.data = j; throw e; }
        return j;
      });
    });
  }
  function save() {
    if (saving) { pending = true; return Promise.resolve(); }
    saving = true;
    setSaveState('saving', 'Đang lưu…');
    return api('/api/thiep/' + cardId, { data: state, template: template })
      .then(function () {
        setSaveState('saved', 'Đã lưu');
        refreshPreview();
      })
      .catch(function (err) {
        setSaveState('error', err.message);
        if (err.data && err.data.upgrade) toast(err.message);
      })
      .finally(function () {
        saving = false;
        if (pending) { pending = false; save(); }
      });
  }
  window.addEventListener('beforeunload', function (e) {
    if (saving || timer && saveEl.classList.contains('saving')) { e.preventDefault(); e.returnValue = ''; }
  });

  // ===== Xem trước =====
  var frame = $('[data-preview-frame]');
  var lastScroll = 0;
  function refreshPreview() {
    try { lastScroll = frame.contentWindow.scrollY || 0; } catch (e) { lastScroll = 0; }
    var u = '/thiep/' + cardId + '/xem-truoc?mo=1&t=' + Date.now();
    frame.src = u;
  }
  frame.addEventListener('load', function () {
    try { if (lastScroll) frame.contentWindow.scrollTo(0, lastScroll); } catch (e) {}
  });
  var preview = $('[data-preview]');
  $$('[data-preview-open]').forEach(function (b) { b.addEventListener('click', function () { preview.classList.add('is-open'); }); });
  $$('[data-preview-close]').forEach(function (b) { b.addEventListener('click', function () { preview.classList.remove('is-open'); }); });

  // ===== Trường đơn =====
  $$('[data-path]', form).forEach(function (el) {
    var path = el.dataset.path;
    var evt = el.type === 'checkbox' || el.type === 'radio' || el.tagName === 'SELECT' || el.type === 'date' || el.type === 'time' ? 'change' : 'input';
    el.addEventListener(evt, function () {
      if (el.type === 'radio' && !el.checked) return;
      setPath(state, path, el.type === 'checkbox' ? el.checked : el.value);
      scheduleSave();
    });
  });

  // ===== Đổi mẫu =====
  $$('input[name=template]', form).forEach(function (r) {
    r.addEventListener('change', function () {
      if (r.dataset.locked === '1') {
        toast('Mẫu này cần gói ' + (r.dataset.tier === 'premium' ? 'Premium' : 'Basic') + '. Nâng cấp để sử dụng.');
        var prev = $('input[name=template][value="' + template + '"]', form);
        if (prev) prev.checked = true;
        return;
      }
      template = r.value;
      scheduleSave();
    });
  });

  // ===== Tải tệp =====
  function upload(files) {
    var fd = new FormData();
    Array.prototype.forEach.call(files, function (f) { fd.append('files', f); });
    setSaveState('saving', 'Đang tải lên…');
    return fetch('/api/thiep/' + cardId + '/tai-len', { method: 'POST', body: fd, headers: { 'x-csrf-token': csrf, Accept: 'application/json' }, credentials: 'same-origin' })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Tải lên thất bại'); return j; }); })
      .then(function (j) {
        if (j.warning) toast(j.warning);
        updatePhotoCount(j.photos, j.limit);
        setSaveState('saved', 'Đã tải lên');
        return j.files;
      })
      .catch(function (e) { setSaveState('error', e.message); toast(e.message); return []; });
  }
  var fileImage = $('[data-file-image]');
  var fileAlbum = $('[data-file-album]');
  var fileAudio = $('[data-file-audio]');
  var photoTarget = null;

  function renderSlot(slot) {
    var url = getPath(state, slot.dataset.photo);
    slot.innerHTML = '';
    if (url) {
      var img = document.createElement('img');
      img.src = url;
      img.alt = '';
      slot.appendChild(img);
      var x = document.createElement('button');
      x.type = 'button';
      x.className = 'clear';
      x.setAttribute('aria-label', 'Xoá ảnh');
      x.innerHTML = '<svg class="ic"><use href="#i-x"/></svg>';
      x.addEventListener('click', function (e) {
        e.stopPropagation();
        setPath(state, slot.dataset.photo, '');
        renderSlot(slot);
        scheduleSave();
      });
      slot.appendChild(x);
    } else {
      slot.innerHTML = '<span><svg class="ic"><use href="#i-upload"/></svg>Chọn ảnh</span>';
    }
  }
  $$('[data-photo]', form).forEach(function (slot) {
    renderSlot(slot);
    var pick = function () { photoTarget = slot; fileImage.value = ''; fileImage.click(); };
    slot.addEventListener('click', pick);
    slot.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });
  fileImage.addEventListener('change', function () {
    if (!fileImage.files.length || !photoTarget) return;
    var slot = photoTarget;
    upload(fileImage.files).then(function (files) {
      if (!files.length) return;
      setPath(state, slot.dataset.photo, files[0].url);
      renderSlot(slot);
      save();
    });
  });

  // Album
  var albumEl = $('[data-album]');
  var countEl = $('[data-photo-count]');
  function updatePhotoCount(used, limit) { if (countEl && used != null) countEl.textContent = '(' + used + '/' + limit + ' ảnh của gói)'; }
  function renderAlbum() {
    albumEl.innerHTML = '';
    (state.album || []).forEach(function (url, i) {
      var s = document.createElement('div');
      s.className = 'photo-slot';
      s.innerHTML = '<img alt="" src="">';
      s.querySelector('img').src = url;
      var x = document.createElement('button');
      x.type = 'button';
      x.className = 'clear';
      x.setAttribute('aria-label', 'Xoá ảnh ' + (i + 1));
      x.innerHTML = '<svg class="ic"><use href="#i-x"/></svg>';
      x.addEventListener('click', function () { state.album.splice(i, 1); renderAlbum(); scheduleSave(); });
      s.appendChild(x);
      albumEl.appendChild(s);
    });
  }
  renderAlbum();
  $('[data-album-add]').addEventListener('click', function () { fileAlbum.value = ''; fileAlbum.click(); });
  fileAlbum.addEventListener('change', function () {
    if (!fileAlbum.files.length) return;
    upload(fileAlbum.files).then(function (files) {
      if (!files.length) return;
      state.album = (state.album || []).concat(files.map(function (f) { return f.url; }));
      renderAlbum();
      save();
    });
  });

  // Nhạc
  var musicBtn = $('[data-music-upload]');
  if (musicBtn) {
    musicBtn.addEventListener('click', function () { fileAudio.value = ''; fileAudio.click(); });
    fileAudio.addEventListener('change', function () {
      if (!fileAudio.files.length) return;
      upload(fileAudio.files).then(function (files) {
        var a = files.filter(function (f) { return f.kind === 'audio'; })[0];
        if (!a) return;
        state.music = state.music || {};
        state.music.url = a.url;
        $('#f-music').value = a.url;
        save();
      });
    });
  }

  // ===== Danh sách lặp (sự kiện, chuyện tình) =====
  var SCHEMA = {
    events: {
      blank: function () { return { title: 'Tiệc Cưới', date: state.date || '', time: '11:00', venue: '', address: '', mapUrl: '' }; },
      fields: [
        { k: 'title', label: 'Tên sự kiện', ph: 'Lễ Vu Quy / Lễ Thành Hôn / Tiệc Cưới' },
        { row: [{ k: 'date', label: 'Ngày', type: 'date' }, { k: 'time', label: 'Giờ', type: 'time' }] },
        { k: 'venue', label: 'Địa điểm', ph: 'Nhà hàng / Tư gia' },
        { k: 'address', label: 'Địa chỉ', ph: 'Số nhà, đường, quận, thành phố' },
        { k: 'mapUrl', label: 'Link Google Maps (tuỳ chọn)', ph: 'https://maps.app.goo.gl/...' },
      ],
      max: 4,
      label: 'Sự kiện',
    },
    story: {
      blank: function () { return { year: '', title: '', text: '' }; },
      fields: [
        { row: [{ k: 'year', label: 'Năm / mốc', ph: '2020' }, { k: 'title', label: 'Tiêu đề', ph: 'Lần đầu gặp gỡ' }] },
        { k: 'text', label: 'Câu chuyện', type: 'textarea' },
      ],
      max: 8,
      label: 'Cột mốc',
    },
  };
  var uid = 0;
  function fieldHtml(f, item) {
    var id = 'rp-' + (uid++);
    var wrap = document.createElement('div');
    wrap.className = 'field';
    var lab = document.createElement('label');
    lab.htmlFor = id;
    lab.textContent = f.label;
    var input = document.createElement(f.type === 'textarea' ? 'textarea' : 'input');
    input.className = f.type === 'textarea' ? 'textarea' : 'input';
    if (f.type && f.type !== 'textarea') input.type = f.type;
    if (f.type === 'textarea') input.rows = 2;
    input.id = id;
    input.placeholder = f.ph || '';
    input.value = item[f.k] || '';
    input.addEventListener(f.type === 'date' || f.type === 'time' ? 'change' : 'input', function () { item[f.k] = input.value; scheduleSave(); });
    wrap.appendChild(lab);
    wrap.appendChild(input);
    return wrap;
  }
  function renderRepeat(name) {
    var box = $('[data-repeat="' + name + '"]', form);
    var sc = SCHEMA[name];
    var list = state[name] = state[name] || [];
    box.innerHTML = '';
    list.forEach(function (item, i) {
      var g = document.createElement('div');
      g.className = 'ed-group';
      var head = document.createElement('strong');
      head.textContent = sc.label + ' ' + (i + 1);
      g.appendChild(head);
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'btn btn-ghost btn-icon btn-sm remove';
      rm.setAttribute('aria-label', 'Xoá ' + sc.label.toLowerCase() + ' ' + (i + 1));
      rm.innerHTML = '<svg class="ic"><use href="#i-trash"/></svg>';
      rm.addEventListener('click', function () { list.splice(i, 1); renderRepeat(name); scheduleSave(); });
      g.appendChild(rm);
      sc.fields.forEach(function (f) {
        if (f.row) {
          var row = document.createElement('div');
          row.className = 'row-2';
          f.row.forEach(function (ff) { row.appendChild(fieldHtml(ff, item)); });
          g.appendChild(row);
        } else g.appendChild(fieldHtml(f, item));
      });
      box.appendChild(g);
    });
    var addBtn = $('[data-add="' + name + '"]', form);
    addBtn.hidden = list.length >= sc.max;
  }
  Object.keys(SCHEMA).forEach(function (name) {
    renderRepeat(name);
    $('[data-add="' + name + '"]', form).addEventListener('click', function () {
      state[name].push(SCHEMA[name].blank());
      renderRepeat(name);
      scheduleSave();
      var groups = $$('[data-repeat="' + name + '"] .ed-group', form);
      var last = groups[groups.length - 1];
      if (last) last.querySelector('input,textarea').focus();
    });
  });

  // ===== Xuất bản =====
  var modal = $('[data-publish-modal]');
  var pubBtn = $('[data-publish]');
  function openModal() { modal.classList.add('is-open'); modal.querySelector('input').select(); }
  function closeModal() { modal.classList.remove('is-open'); pubBtn.focus(); }
  pubBtn.addEventListener('click', function () {
    pubBtn.classList.add('is-loading');
    clearTimeout(timer);
    save()
      .then(function () { return api('/api/thiep/' + cardId + '/xuat-ban', { publish: true }); })
      .then(function (j) {
        status = 'published';
        pubBtn.textContent = 'Chia sẻ';
        if (j && j.url) {
          modal.querySelector('input').value = j.url;
          $$('[data-copy]', modal).forEach(function (b) { b.dataset.copy = j.url; });
          $$('a[target=_blank]', modal).forEach(function (a) { a.href = j.url; });
        }
        openModal();
      })
      .catch(function (e) { toast(e.message); })
      .finally(function () { pubBtn.classList.remove('is-loading'); });
  });
  $('[data-modal-close]').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
  $('[data-unpublish]').addEventListener('click', function () {
    api('/api/thiep/' + cardId + '/xuat-ban', { publish: false }).then(function () {
      status = 'draft';
      pubBtn.textContent = 'Xuất bản';
      closeModal();
      toast('Đã ẩn thiệp – khách sẽ không xem được cho tới khi xuất bản lại.');
    });
  });
})();
