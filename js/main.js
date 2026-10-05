/* New Looks Beauty Salon — interactions */
(function () {
  'use strict';
  var doc = document;

  /* ---------------------------------------------------- brand intro reveal */
  var intro = doc.getElementById('intro');
  if (intro) {
    doc.body.classList.add('is-intro');
    var done = function () {
      intro.classList.add('is-done');
      doc.body.classList.remove('is-intro');
      if (intro.parentNode) { intro.parentNode.removeChild(intro); }
    };
    window.setTimeout(done, 2600);
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') { done(); } }, { once: true });
  }

  /* ------------------------------------------------------------ sticky bar */
  var header = doc.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 24) { header.classList.add('is-stuck'); }
      else { header.classList.remove('is-stuck'); }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --------------------------------------------------------- mobile drawer */
  var burger = doc.getElementById('hamburger');
  var drawer = doc.getElementById('mobileDrawer');
  var drawerClose = doc.getElementById('drawerClose');
  if (burger && drawer) {
    var open = function () {
      drawer.hidden = false;
      void drawer.offsetWidth;
      drawer.classList.add('is-open');
      burger.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      doc.body.style.overflow = 'hidden';
      if (drawerClose) { drawerClose.focus(); }
    };
    var close = function () {
      drawer.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      doc.body.style.overflow = '';
      window.setTimeout(function () { drawer.hidden = true; }, 340);
      burger.focus();
    };
    burger.addEventListener('click', function () {
      if (drawer.classList.contains('is-open')) { close(); } else { open(); }
    });
    if (drawerClose) { drawerClose.addEventListener('click', close); }
    drawer.addEventListener('click', function (e) { if (e.target === drawer) { close(); } });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('is-open')) { close(); } });
  }

  /* ----------------------------------------------------- scroll reveal */
  var reveals = doc.querySelectorAll('.reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
    } else {
      Array.prototype.forEach.call(reveals, function (el) { el.classList.add('in'); });
    }
  }

  /* -------------------------------------------------------- accordions */
  var accBtns = doc.querySelectorAll('.acc__btn');
  Array.prototype.forEach.call(accBtns, function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc__item');
      var panel = item.querySelector('.acc__panel');
      var isOpen = item.classList.contains('is-open');
      if (isOpen) {
        panel.style.maxHeight = '0px';
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 40 + 'px';
      }
    });
  });
  function openAcc(item) {
    var panel = item.querySelector('.acc__panel');
    var btn = item.querySelector('.acc__btn');
    item.classList.add('is-open');
    if (btn) { btn.setAttribute('aria-expanded', 'true'); }
    panel.style.maxHeight = panel.scrollHeight + 40 + 'px';
  }
  window.nlOpenAccordion = openAcc;

  /* -------------------------------------------- services search + filters */
  var svcSearch = doc.getElementById('svcSearch');
  var chips = doc.querySelectorAll('.chip[data-cat]');
  var accItems = doc.querySelectorAll('.acc__item[data-cat]');
  var noRes = doc.getElementById('noResults');
  var activeCat = 'all';

  function applyFilter() {
    var q = svcSearch ? svcSearch.value.trim().toLowerCase() : '';
    var shown = 0;
    Array.prototype.forEach.call(accItems, function (item) {
      var catOk = (activeCat === 'all' || item.getAttribute('data-cat') === activeCat);
      var lis = item.querySelectorAll('.svc-list li');
      var hits = 0;
      Array.prototype.forEach.call(lis, function (li) {
        var match = (!q || li.getAttribute('data-name').indexOf(q) > -1);
        li.hidden = !match;
        if (match) { hits++; }
      });
      var subs = item.querySelectorAll('.subgroup');
      Array.prototype.forEach.call(subs, function (sg) {
        var sgHits = sg.querySelectorAll('.svc-list li:not([hidden])').length;
        sg.hidden = sgHits === 0;
      });
      var visible = catOk && hits > 0;
      item.hidden = !visible;
      if (visible) { shown++; }
      if (q && visible) { openAcc(item); }
    });
    if (noRes) { noRes.hidden = shown > 0; }
  }
  if (svcSearch) {
    svcSearch.addEventListener('input', applyFilter);
    svcSearch.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { svcSearch.value = ''; applyFilter(); }
    });
  }
  Array.prototype.forEach.call(chips, function (chip) {
    chip.addEventListener('click', function () {
      Array.prototype.forEach.call(chips, function (c) { c.classList.remove('is-on'); c.setAttribute('aria-pressed', 'false'); });
      chip.classList.add('is-on');
      chip.setAttribute('aria-pressed', 'true');
      activeCat = chip.getAttribute('data-cat');
      applyFilter();
    });
  });

  /* ----------------------------------------------------- deep-linked open */
  var catAnchors = doc.querySelectorAll('.cat-tabs button[data-jump]');
  Array.prototype.forEach.call(catAnchors, function (b) { b.addEventListener('click', function () { b.blur(); }); });

  /* ------------------------------------------------------------ gallery */
  var filters = doc.querySelectorAll('.filter[data-filter]');
  var galItems = doc.querySelectorAll('.gal__item');
  Array.prototype.forEach.call(filters, function (f) {
    f.addEventListener('click', function () {
      Array.prototype.forEach.call(filters, function (x) { x.classList.remove('is-on'); x.setAttribute('aria-pressed', 'false'); });
      f.classList.add('is-on');
      f.setAttribute('aria-pressed', 'true');
      var want = f.getAttribute('data-filter');
      Array.prototype.forEach.call(galItems, function (it) {
        it.hidden = !(want === 'all' || it.getAttribute('data-cat') === want);
      });
    });
  });

  /* ----------------------------------------------------------- lightbox */
  var lb = doc.getElementById('lightbox');
  if (lb && galItems.length) {
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('.lightbox__cap');
    var idx = 0;
    function list() { return Array.prototype.filter.call(galItems, function (i) { return !i.hidden; }); }
    function show(i) {
      var items = list();
      if (!items.length) { return; }
      idx = (i + items.length) % items.length;
      var it = items[idx];
      var img = it.querySelector('img');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = img.alt;
    }
    function openLb(it) {
      var items = list();
      var i = items.indexOf(it);
      lb.classList.add('is-open');
      doc.body.style.overflow = 'hidden';
      show(i < 0 ? 0 : i);
      lb.querySelector('.lightbox__close').focus();
    }
    function closeLb() {
      lb.classList.remove('is-open');
      doc.body.style.overflow = '';
    }
    Array.prototype.forEach.call(galItems, function (it) {
      it.addEventListener('click', function () { openLb(it); });
    });
    lb.querySelector('.lightbox__close').addEventListener('click', closeLb);
    lb.querySelector('.lightbox__prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lightbox__next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) { closeLb(); } });
    doc.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) { return; }
      if (e.key === 'Escape') { closeLb(); }
      if (e.key === 'ArrowLeft') { show(idx - 1); }
      if (e.key === 'ArrowRight') { show(idx + 1); }
    });
  }

  /* ------------------------------------------------------------- year */
  var y = doc.getElementById('year');
  if (y) { y.textContent = String(new Date().getFullYear()); }
})();
