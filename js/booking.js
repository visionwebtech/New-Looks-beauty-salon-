/* New Looks Beauty Salon — appointment request flow (WhatsApp) */
(function () {
  'use strict';
  var root = document.getElementById('bookingApp');
  if (!root) { return; }

  var WA = root.getAttribute('data-wa');
  var bizName = 'New Looks Beauty Salon';
  var CATS = JSON.parse(document.getElementById('svcData').textContent);

  var state = { mode: '', cat: '', services: [], date: '', time: '', name: '', phone: '', note: '' };
  var step = 1;

  var el = {
    steps: root.querySelectorAll('.step'),
    panels: root.querySelectorAll('.panel'),
    modeChoices: root.querySelectorAll('.choice[data-mode]'),
    singleBox: document.getElementById('singleBox'),
    multiBox: document.getElementById('multiBox'),
    catSelect: document.getElementById('catSelect'),
    singleCatList: document.getElementById('singleCatList'),
    singlePick: document.getElementById('singlePick'),
    catTabs: document.getElementById('catTabs'),
    multiList: document.getElementById('multiList'),
    picked: document.getElementById('picked'),
    pickedEmpty: document.getElementById('pickedEmpty'),
    pickedCount: document.getElementById('pickedCount'),
    date: document.getElementById('bkDate'),
    slots: document.getElementById('bkSlots'),
    name: document.getElementById('bkName'),
    phone: document.getElementById('bkPhone'),
    note: document.getElementById('bkNote'),
    summary: document.getElementById('bkSummary'),
    waBtn: document.getElementById('waSend')
  };

  /* ---------------------------------------------------------- time slots */
  function slotsList() {
    var out = [];
    for (var h = 10; h <= 20; h++) {
      for (var m = 0; m < 60; m += 30) {
        if (h === 20 && m > 0) { continue; }
        var h24 = h, ap = h24 >= 12 ? 'PM' : 'AM';
        var h12 = h24 % 12; if (h12 === 0) { h12 = 12; }
        out.push({
          value: h12 + ':' + (m === 0 ? '00' : '30') + ' ' + ap,
          label: h12 + ':' + (m === 0 ? '00' : '30') + ' ' + ap
        });
      }
    }
    return out;
  }

  function renderSlots() {
    var sv = state.time;
    el.slots.innerHTML = '';
    slotsList().forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot' + (sv === s.value ? ' is-on' : '');
      b.textContent = s.label;
      b.setAttribute('aria-pressed', sv === s.value ? 'true' : 'false');
      b.addEventListener('click', function () {
        state.time = s.value;
        renderSlots();
      });
      el.slots.appendChild(b);
    });
  }

  /* ------------------------------------------------------------ step nav */
  function go(n) {
    step = n;
    Array.prototype.forEach.call(el.panels, function (p) {
      p.hidden = Number(p.getAttribute('data-step')) !== n;
    });
    Array.prototype.forEach.call(el.steps, function (s) {
      var i = Number(s.getAttribute('data-step'));
      s.classList.toggle('is-active', i === n);
      s.classList.toggle('is-done', i < n);
    });
    var panel = root.querySelector('.panel[data-step="' + n + '"]');
    if (panel) {
      var top = panel.getBoundingClientRect().top + window.pageYOffset - 110;
      window.scrollTo({ top: top, behavior: 'smooth' });
      var firstField = panel.querySelector('input,select,button');
      if (firstField && n > 1) { firstField.focus({ preventScroll: true }); }
    }
    if (n === 4) { buildSummary(); }
  }

  /* -------------------------------------------------------- mode choose */
  Array.prototype.forEach.call(el.modeChoices, function (c) {
    c.addEventListener('click', function () {
      Array.prototype.forEach.call(el.modeChoices, function (x) {
        x.classList.remove('is-on'); x.setAttribute('aria-pressed', 'false');
      });
      c.classList.add('is-on');
      c.setAttribute('aria-pressed', 'true');
      state.mode = c.getAttribute('data-mode');
      state.services = [];
      el.singleBox.hidden = state.mode !== 'single';
      el.multiBox.hidden = state.mode !== 'multiple';
      renderPicked();
      renderSingleServices();
      renderMultiCheckboxes();
      var next = document.getElementById('toStep2');
      if (next) { next.disabled = false; }
    });
  });

  /* ------------------------------------------------------ single service */
  function renderSingleServices() {
    el.singlePick.innerHTML = '';
    var cat = CATS.filter(function (c) { return c.slug === state.cat; })[0];
    if (!cat) {
      el.singlePick.innerHTML = '<p class="picked__empty">Choose a category above to see its services.</p>';
      return;
    }
    var label = document.createElement('label');
    label.className = 'field';
    label.innerHTML = '<span>' + cat.name + ' \u2014 select one service</span>';
    var sel = document.createElement('select');
    sel.id = 'singleServiceSelect';
    var o0 = document.createElement('option');
    o0.value = ''; o0.textContent = 'Select a service';
    sel.appendChild(o0);
    cat.items.forEach(function (it) {
      var o = document.createElement('option');
      o.value = it; o.textContent = it;
      if (state.services[0] === it) { o.selected = true; }
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () {
      state.services = sel.value ? [sel.value] : [];
      renderPicked();
      syncNext();
    });
    label.appendChild(sel);
    el.singlePick.appendChild(label);
    syncNext();
  }

  if (el.catSelect) {
    el.catSelect.addEventListener('change', function () {
      state.cat = el.catSelect.value;
      state.services = [];
      renderSingleServices();
    });
  }

  /* ---------------------------------------------------- multi selection */
  function renderMultiCheckboxes() {
    if (!el.catTabs || !el.multiList) { return; }
    var first = state.cat && CATS.filter(function (c) { return c.slug === state.cat; })[0] ? state.cat : CATS[0].slug;
    renderMultiForCat(first);
    el.catTabs.innerHTML = '';
    CATS.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = c.name;
      if (c.slug === first) { b.className = 'is-on'; }
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(el.catTabs.children, function (x) { x.classList.remove('is-on'); });
        b.classList.add('is-on');
        renderMultiForCat(c.slug);
      });
      el.catTabs.appendChild(b);
    });
  }

  function renderMultiForCat(slug) {
    var cat = CATS.filter(function (c) { return c.slug === slug; })[0];
    if (!cat) { return; }
    el.multiList.innerHTML = '';
    var grid = document.createElement('div');
    grid.className = 'check-grid';
    cat.items.forEach(function (it) {
      var lab = document.createElement('label');
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = it;
      cb.checked = state.services.indexOf(it) > -1;
      cb.addEventListener('change', function () {
        var i = state.services.indexOf(it);
        if (cb.checked) { if (i === -1) { state.services.push(it); } }
        else { if (i > -1) { state.services.splice(i, 1); } }
        renderPicked();
      });
      var sp = document.createElement('span');
      sp.textContent = it;
      lab.appendChild(cb);
      lab.appendChild(sp);
      grid.appendChild(lab);
    });
    el.multiList.appendChild(grid);
  }

  function renderPicked() {
    if (!el.picked) { return; }
    el.picked.innerHTML = '';
    if (!state.services.length) {
      el.pickedEmpty.hidden = false;
      if (el.pickedCount) { el.pickedCount.textContent = '0 services selected'; }
    } else {
      el.pickedEmpty.hidden = true;
      if (el.pickedCount) { el.pickedCount.textContent = state.services.length + (state.services.length === 1 ? ' service selected' : ' services selected'); }
      state.services.forEach(function (sv) {
        var li = document.createElement('li');
        var sp = document.createElement('span');
        sp.textContent = sv;
        var rm = document.createElement('button');
        rm.type = 'button';
        rm.setAttribute('aria-label', 'Remove ' + sv);
        rm.textContent = '\u00d7';
        rm.addEventListener('click', function () {
          state.services.splice(state.services.indexOf(sv), 1);
          renderPicked();
          renderMultiCheckboxes();
          renderSingleServices();
        });
        li.appendChild(sp);
        li.appendChild(rm);
        el.picked.appendChild(li);
      });
    }
    syncNext();
  }

  function syncNext() {
    var n = document.getElementById('toStep2');
    if (n) { n.disabled = state.services.length === 0; }
  }

  var toStep2 = document.getElementById('toStep2');
  if (toStep2) {
    toStep2.addEventListener('click', function () {
      if (state.services.length) { go(2); }
    });
  }

  /* ---------------------------------------------------------- validation */
  function setError(input, on) {
    var f = input.closest('.field');
    if (!f) { return; }
    f.classList.toggle('has-error', on);
  }
  function validPhone(v) { return /^[6-9][0-9]{9}$/.test(v); }

  var toStep3 = document.getElementById('toStep3');
  if (toStep3) {
    toStep3.addEventListener('click', function () {
      var ok = true;
      if (!state.date) { ok = false; el.date.closest('.field').classList.add('has-error'); }
      else { el.date.closest('.field').classList.remove('has-error'); }
      if (!state.time) { ok = false; el.slots.closest('.field').classList.add('has-error'); }
      else { el.slots.closest('.field').classList.remove('has-error'); }
      if (ok) { go(3); } else {
        var f = root.querySelector('.panel[data-step="2"] .field.has-error');
        if (f) { f.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      }
    });
  }

  var toStep4 = document.getElementById('toStep4');
  if (toStep4) {
    toStep4.addEventListener('click', function () {
      var ok = true;
      state.name = el.name.value.trim();
      state.phone = el.phone.value.replace(/\D/g, '').slice(-10);
      state.note = el.note ? el.note.value.trim() : '';
      if (state.name.length < 2) { setError(el.name, true); ok = false; } else { setError(el.name, false); }
      if (!validPhone(state.phone)) { setError(el.phone, true); ok = false; } else { setError(el.phone, false); }
      if (ok) { go(4); } else {
        var bad = root.querySelector('.panel[data-step="3"] .field.has-error input');
        if (bad) { bad.focus(); }
      }
    });
  }

  [el.name, el.phone].forEach(function (i) {
    if (i) { i.addEventListener('input', function () { setError(i, false); }); }
  });
  if (el.phone) {
    el.phone.addEventListener('input', function () {
      el.phone.value = el.phone.value.replace(/[^0-9]/g, '').slice(0, 10);
    });
  }

  /* ------------------------------------------------------------- summary */
  function prettyDate(iso) {
    if (!iso) { return ''; }
    var p = iso.split('-');
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function buildSummary() {
    if (!el.summary) { return; }
    var rows = [
      ['Name', state.name],
      ['Phone', '+91 ' + state.phone],
      ['Service(s)', state.services.join(', ')],
      ['Date', prettyDate(state.date)],
      ['Preferred Time', state.time],
      ['Message', state.note || '\u2014']
    ];
    el.summary.innerHTML = '<dl>' + rows.map(function (r) {
      return '<dt>' + r[0] + '</dt><dd>' + r[1].replace(/[<>&]/g, '') + '</dd>';
    }).join('') + '</dl>' +
      '<p class="summary__note">Please review your appointment details before sending. ' +
      'Your request opens in WhatsApp so you can send it directly to ' + bizName + '.</p>';
  }

  /* -------------------------------------------------------- whatsapp send */
  if (el.waBtn) {
    el.waBtn.addEventListener('click', function () {
      var msg = 'Hello ' + bizName + ',\n\n' +
        'I would like to request an appointment.\n\n' +
        'Name:\n' + state.name + '\n\n' +
        'Phone:\n+91 ' + state.phone + '\n\n' +
        'Service(s):\n' + state.services.join(', ') + '\n\n' +
        'Preferred Date:\n' + prettyDate(state.date) + '\n\n' +
        'Preferred Time:\n' + state.time + '\n\n' +
        'Additional Request:\n' + (state.note || '\u2014') + '\n\n' +
        'Thank you.';
      var url = WA + '?text=' + encodeURIComponent(msg);
      var win = window.open(url, '_blank', 'noopener');
      if (!win) { window.location.href = url; }
    });
  }

  /* -------------------------------------------- back links + open accordion */
  var backs = root.querySelectorAll('[data-back]');
  Array.prototype.forEach.call(backs, function (b) {
    b.addEventListener('click', function () { go(Number(b.getAttribute('data-back'))); });
  });

  /* ------------------------------------------------------------- init */
  var params = new URLSearchParams(window.location.search);
  var pre = params.get('service');
  var preCat = params.get('cat');

  var today = new Date();
  var iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  if (el.date) { el.date.min = iso; el.date.addEventListener('change', function () { state.date = el.date.value; el.date.closest('.field').classList.remove('has-error'); }); }

  renderSlots();

  if (pre || preCat) {
    var found = null;
    if (pre) {
      CATS.forEach(function (c) { if (c.items.indexOf(pre) > -1) { found = c; } });
    }
    if (!found && preCat) { found = CATS.filter(function (c) { return c.slug === preCat; })[0]; }
    if (found) {
      state.mode = 'single';
      state.cat = found.slug;
      if (pre) { state.services = [pre]; }
      var choice = root.querySelector('.choice[data-mode="single"]');
      if (choice) { choice.classList.add('is-on'); choice.setAttribute('aria-pressed', 'true'); }
      el.singleBox.hidden = false;
      el.multiBox.hidden = true;
      if (el.catSelect) { el.catSelect.value = found.slug; }
      renderSingleServices();
      renderPicked();
      if (state.services.length) { syncNext(); }
    }
  }
  renderPicked();
  go(1);
})();
