/* Theo dõi trạng thái thanh toán – tự chuyển trang khi gói được kích hoạt */
(function () {
  'use strict';
  var box = document.querySelector('[data-checkout]');
  if (!box || box.dataset.status === 'paid') return;
  var code = box.dataset.code;
  var statusEl = document.querySelector('[data-pay-status]');
  var tries = 0;
  function check() {
    if (document.hidden) return schedule();
    fetch('/api/don-hang/' + encodeURIComponent(code), { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j.status === 'paid') {
          statusEl.innerHTML = '<svg class="ic" style="color:var(--success)"><use href="#i-check-circle"/></svg>Thanh toán thành công! Đang chuyển trang…';
          setTimeout(function () { location.href = '/tai-khoan'; }, 1800);
        } else schedule();
      })
      .catch(schedule);
  }
  function schedule() {
    tries++;
    if (tries > 240) return; // ~20 phút
    setTimeout(check, 5000);
  }
  schedule();
})();
