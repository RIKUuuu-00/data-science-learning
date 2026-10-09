/* 共通処理：ヘッダー、進捗、目次、クイズ、図のフレームとウィジェット起動 */
(function () {
  const DS = window.DS;
  const NS = 'http://www.w3.org/2000/svg';
  DS.widgets = {};
  DS.register = (name, fn) => { DS.widgets[name] = fn; };
  DS.reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  DS.icon = (n, c) => window.DSIcon(n, c);
  DS.root = (document.querySelector('meta[name="ds-root"]') || {}).content || '';
  DS.page = (document.querySelector('meta[name="ds-page"]') || {}).content || '';

  /* ---------- DOM / SVG helpers ---------- */
  DS.h = function (tag, attrs, html) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (attrs[k] === undefined || attrs[k] === null || attrs[k] === false) continue;
      if (k === 'on') { for (const ev in attrs.on) e.addEventListener(ev, attrs.on[ev]); }
      else e.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
    if (html !== undefined) e.innerHTML = html;
    return e;
  };
  DS.svg = function (tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v === undefined || v === null) continue;
      if (k === 'text') e.textContent = v;
      else if (k === 'fill' && tag === 'text') e.style.fill = v; /* クラスの色指定より優先させる */
      else e.setAttribute(k, v);
    }
    if (parent) parent.appendChild(e);
    return e;
  };
  DS.clear = el => { while (el.firstChild) el.removeChild(el.firstChild); return el; };
  DS.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };
  DS.randn = function (r) {
    let u = 0, v = 0;
    while (u === 0) u = r();
    while (v === 0) v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  DS.lin = (d0, d1, r0, r1) => v => r0 + (v - d0) / (d1 - d0) * (r1 - r0);
  DS.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  DS.fmt = (n, d) => Number(n).toLocaleString('ja-JP', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  DS.pct = (n, d) => DS.fmt(n * 100, d === undefined ? 0 : d) + '%';
  DS.move = (node, x, y) => { node.style.transform = 'translate(' + x + 'px,' + y + 'px)'; };
  DS.sleep = ms => new Promise(r => setTimeout(r, DS.reduced ? 0 : ms));

  /* 図のフレーム：タイトル・操作部・描画面・補足を統一した形で作る */
  DS.frame = function (el, opts) {
    opts = opts || {};
    const title = el.dataset.title || opts.title || '';
    const icon = el.dataset.icon || opts.icon || 'chart-line';
    DS.clear(el);
    if (title) el.setAttribute('aria-label', title);
    const head = DS.h('div', { class: 'fig__head' }, '<div class="fig__title">' + DS.icon(icon) + '<span>' + title + '</span></div>');
    const controls = DS.h('div', { class: 'fig__controls' });
    head.appendChild(controls);
    const stage = DS.h('div', { class: 'fig__stage' });
    el.append(head, stage);
    return {
      el, head, controls, stage,
      add(cls, html) { const d = DS.h('div', { class: cls }, html || ''); el.appendChild(d); return d; }
    };
  };
  DS.stageSvg = function (stage, w, h, opts) {
    opts = opts || {};
    let host = stage;
    if (opts.scroll) { host = DS.h('div', { class: 'fig__scroll' }); stage.appendChild(host); }
    const s = DS.svg('svg', { viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': opts.label || '' }, host);
    s.style.maxWidth = Math.round(w * 1.3) + 'px';
    if (opts.minWidth) s.style.minWidth = opts.minWidth + 'px';
    return s;
  };
  DS.button = function (label, icon, onClick, cls) {
    const b = DS.h('button', { type: 'button', class: 'btn btn--small' + (cls ? ' ' + cls : '') }, (icon ? DS.icon(icon) : '') + '<span>' + label + '</span>');
    b.addEventListener('click', onClick);
    return b;
  };
  DS.setLabel = (btn, label, icon) => { btn.innerHTML = (icon ? DS.icon(icon) : '') + '<span>' + label + '</span>'; };
  DS.seg = function (options, current, onChange, label) {
    const wrap = DS.h('div', { class: 'seg', role: 'group', 'aria-label': label || '' });
    const btns = options.map(o => {
      const b = DS.h('button', { type: 'button', 'aria-pressed': String(o.value === current) }, o.label);
      b.addEventListener('click', () => { set(o.value); onChange(o.value); });
      wrap.appendChild(b);
      return b;
    });
    function set(v) { btns.forEach((b, i) => b.setAttribute('aria-pressed', String(options[i].value === v))); }
    wrap.set = set;
    return wrap;
  };
  let sliderId = 0;
  DS.slider = function (o) {
    const id = 'sl-' + (o.id || ++sliderId);
    const wrap = DS.h('div', { class: 'slider' });
    wrap.innerHTML = '<label for="' + id + '"><span>' + o.label + '</span><output for="' + id + '"></output></label>';
    const input = DS.h('input', { type: 'range', id: id, min: o.min, max: o.max, step: o.step || 1, value: o.value });
    wrap.appendChild(input);
    const out = wrap.querySelector('output');
    const fmt = o.fmt || (v => v);
    const upd = () => { out.textContent = fmt(+input.value); };
    input.addEventListener('input', () => { upd(); o.onInput && o.onInput(+input.value); });
    upd();
    wrap.input = input;
    wrap.setValue = v => { input.value = v; upd(); };
    return wrap;
  };
  DS.onVisible = function (el, fn, threshold) {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, { threshold: threshold || 0.35 });
    io.observe(el);
  };

  /* ---------- 保存（閲覧者のブラウザ内のみ） ---------- */
  const KEY = 'dsnote:v1';
  DS.store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } },
    set(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* 保存できない環境でも表示は続ける */ } },
    update(fn) { const s = this.get(); fn(s); this.set(s); return s; }
  };
  DS.isDone = id => !!((DS.store.get().done || {})[id]);
  DS.setDone = function (id, v) {
    DS.store.update(s => { s.done = s.done || {}; if (v) s.done[id] = true; else delete s.done[id]; });
    document.dispatchEvent(new CustomEvent('ds:progress'));
  };
  DS.progress = function () {
    const ids = DS.allLessonIds();
    const done = DS.store.get().done || {};
    return { total: ids.length, done: ids.filter(i => done[i]).length };
  };

  /* ---------- テーマ ---------- */
  function effectiveTheme() {
    const t = document.documentElement.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  (function applySavedTheme() {
    const t = DS.store.get().theme;
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
  })();

  /* ---------- ヘッダー / フッター ---------- */
  const brandMark = '<svg class="brand__mark" viewBox="0 0 30 30" aria-hidden="true">' +
    '<rect x="1" y="1" width="28" height="28" rx="5" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.5"/>' +
    '<path d="M8 1v28M15 1v28M22 1v28M1 8h28M1 15h28M1 22h28" stroke="var(--grid)" stroke-width="1"/>' +
    '<path d="M6 23L13 16l4 3 7-10" fill="none" stroke="var(--ai)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle cx="6" cy="23" r="2.2" fill="var(--ai)"/><circle cx="13" cy="16" r="2.2" fill="var(--ai)"/><circle cx="17" cy="19" r="2.2" fill="var(--ai)"/><circle cx="24" cy="9" r="2.8" fill="var(--yamabuki)"/></svg>';

  function ring(p) {
    const r = 9, c = 2 * Math.PI * r, f = p.total ? p.done / p.total : 0;
    return '<svg viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="' + r + '" fill="none" stroke="var(--grid)" stroke-width="3"/>' +
      '<circle cx="11" cy="11" r="' + r + '" fill="none" stroke="var(--wakatake)" stroke-width="3" stroke-linecap="' + (f ? 'round' : 'butt') + '" stroke-dasharray="' + (c * f) + ' ' + c + '" transform="rotate(-90 11 11)"/></svg>';
  }

  function renderHeader() {
    const host = document.querySelector('[data-site-header]');
    if (!host) return;
    const p = DS.progress();
    const links = DS.PAGES.map(pg => '<a href="' + DS.root + pg.href + '"' + (DS.page === pg.key ? ' aria-current="page"' : '') + '>' + pg.label + '</a>').join('');
    host.outerHTML = '<a class="skip" href="#main">本文へスキップ</a>' +
      '<header class="site-header"><div class="site-header__inner">' +
      '<a class="brand" href="' + DS.root + 'index.html">' + brandMark + '<span>データサイエンス方眼帳<small>AI時代のコンサルタントのために</small></span></a>' +
      '<nav class="nav" id="site-nav" aria-label="サイト内">' + links + '</nav>' +
      '<div class="header-tools">' +
      '<a class="progress-pill" href="' + DS.root + 'index.html#roadmap" title="完了したレッスン数"><span data-ring>' + ring(p) + '</span><span class="progress-pill__label">進捗</span><span class="num" data-count>' + p.done + '/' + p.total + '</span></a>' +
      '<button class="icon-btn" type="button" data-theme-btn aria-label="明るさを切り替える"></button>' +
      '<button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="メニューを開く">' + DS.icon('menu') + '</button>' +
      '</div></div></header>';
    const themeBtn = document.querySelector('[data-theme-btn]');
    const paintTheme = () => { themeBtn.innerHTML = DS.icon(effectiveTheme() === 'dark' ? 'sun' : 'moon'); };
    paintTheme();
    themeBtn.addEventListener('click', () => {
      const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      DS.store.update(s => { s.theme = next; });
      paintTheme();
    });
    const menuBtn = document.querySelector('.menu-btn');
    const nav = document.getElementById('site-nav');
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.innerHTML = DS.icon(open ? 'close' : 'menu');
    });
    document.addEventListener('ds:progress', () => {
      const q = DS.progress();
      document.querySelector('[data-ring]').innerHTML = ring(q);
      document.querySelector('[data-count]').textContent = q.done + '/' + q.total;
    });
  }

  function renderFooter() {
    const host = document.querySelector('[data-site-footer]');
    if (!host) return;
    host.outerHTML = '<footer class="site-footer"><div class="wrap site-footer__inner">' +
      '<div><strong>データサイエンス方眼帳</strong><br>コンサルタントのためのデータサイエンス入門。進捗はこのブラウザの中だけに保存されます。<br>' +
      '<button class="reset-btn" type="button" data-reset>進捗をリセットする</button></div>' +
      '<nav aria-label="フッター">' + DS.PAGES.map(pg => '<a href="' + DS.root + pg.href + '">' + pg.label + '</a>').join('') + '</nav>' +
      '</div></footer>';
    const r = document.querySelector('[data-reset]');
    let armed = false;
    r.addEventListener('click', () => {
      if (!armed) { armed = true; r.textContent = 'もう一度押すとすべての進捗を消去します'; setTimeout(() => { armed = false; r.textContent = '進捗をリセットする'; }, 4000); return; }
      DS.store.update(s => { delete s.done; delete s.quiz; delete s.checks; delete s.diag; });
      r.textContent = '進捗をリセットしました';
      armed = false;
      document.dispatchEvent(new CustomEvent('ds:progress'));
      document.querySelectorAll('.done-btn').forEach(b => syncDone(b));
    });
  }

  /* ---------- レッスン ---------- */
  function syncDone(btn) {
    const on = DS.isDone(btn.dataset.done);
    btn.setAttribute('aria-pressed', String(on));
    btn.innerHTML = DS.icon('check') + '<span>' + (on ? '完了しました' : 'このレッスンを完了にする') + '</span>';
  }
  function enhanceLessons() {
    document.querySelectorAll('.lesson').forEach(sec => {
      const id = sec.dataset.lesson;
      const lv = +sec.dataset.level || 1;
      const head = sec.querySelector('.lesson__head');
      if (head && !head.querySelector('.level')) {
        const badge = DS.h('span', { class: 'level level--' + lv, title: DS.LEVELS[lv].long }, '<i><b></b><b></b><b></b></i>' + DS.LEVELS[lv].label);
        head.appendChild(badge);
      }
      const foot = DS.h('div', { class: 'lesson__foot' });
      const btn = DS.h('button', { type: 'button', class: 'done-btn', 'data-done': id });
      btn.addEventListener('click', () => { DS.setDone(id, !DS.isDone(id)); syncDone(btn); });
      syncDone(btn);
      foot.appendChild(btn);
      sec.appendChild(foot);
    });
  }
  function buildToc() {
    const toc = document.querySelector('[data-toc]');
    if (!toc) return;
    const secs = Array.from(document.querySelectorAll('.lesson, [data-toc-extra]'));
    const items = secs.map(s => {
      const no = s.dataset.lesson || '';
      const title = s.dataset.tocTitle || (s.querySelector('h2') || {}).textContent || '';
      return '<li><a href="#' + s.id + '" data-for="' + (no || s.id) + '"><span class="toc__no">' + (no || '') + '</span><span>' + title + '</span>' + DS.icon('check', 'toc__check') + '</a></li>';
    }).join('');
    toc.innerHTML = '<details open><summary>' + DS.icon('book') + 'このモジュールの目次</summary><h2>このモジュールの目次</h2><ol>' + items + '</ol></details>';
    if (window.matchMedia && matchMedia('(max-width: 1000px)').matches) toc.querySelector('details').removeAttribute('open');
    const links = Array.from(toc.querySelectorAll('a'));
    const sync = () => links.forEach(a => a.classList.toggle('is-done', DS.isDone(a.dataset.for)));
    sync();
    document.addEventListener('ds:progress', sync);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => {
        es.forEach(e => {
          if (e.isIntersecting) links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
        });
      }, { rootMargin: '-30% 0px -60% 0px' });
      secs.forEach(s => io.observe(s));
    }
  }
  function buildPager() {
    const host = document.querySelector('[data-pager]');
    if (!host) return;
    const i = DS.MODULES.findIndex(m => m.id === host.dataset.pager);
    const prev = DS.MODULES[i - 1], next = DS.MODULES[i + 1];
    let html = '';
    html += prev ? '<a href="m' + prev.no + '.html"><small>' + DS.icon('arrow-left') + '前のモジュール</small><strong>' + prev.no + '　' + prev.title + '</strong></a>'
      : '<a href="' + DS.root + 'insight.html"><small>' + DS.icon('arrow-left') + '学ぶ前に</small><strong>どこまで必要か（調査と考察）</strong></a>';
    html += next ? '<a class="next" href="m' + next.no + '.html"><small>次のモジュール' + DS.icon('arrow-right') + '</small><strong>' + next.no + '　' + next.title + '</strong></a>'
      : '<a class="next" href="' + DS.root + 'case.html"><small>仕上げ' + DS.icon('arrow-right') + '</small><strong>ケーススタディに挑戦する</strong></a>';
    host.innerHTML = html;
  }

  /* ---------- ホームのロードマップ ---------- */
  function buildRoadmap() {
    const host = document.querySelector('[data-roadmap]');
    if (!host) return;
    function render() {
      const done = DS.store.get().done || {};
      const quiz = DS.store.get().quiz || {};
      host.innerHTML = DS.MODULES.map(m => {
        const n = m.lessons.filter(l => done[l[0]]).length;
        const q = quiz[m.id];
        return '<a class="station" href="' + DS.root + 'modules/' + m.id + '.html">' +
          '<div class="station__top"><span class="station__no">' + m.no + '</span>' + DS.icon(m.icon, 'station__icon') + '</div>' +
          '<h3>' + m.title + '</h3><p>' + m.desc + '</p>' +
          '<div class="station__foot"><span>' + m.lessons.length + 'レッスン・約' + m.minutes + '分</span><span class="station__bar" aria-hidden="true"><span style="width:' + (n / m.lessons.length * 100) + '%"></span></span><span class="num">' + n + '/' + m.lessons.length + (q ? '・テスト' + q.score + '/' + q.total : '') + '</span></div></a>';
      }).join('') +
        '<a class="station station--case" href="' + DS.root + 'case.html"><div class="station__top"><span class="station__no">★</span>' + DS.icon('flask', 'station__icon') + '</div>' +
        '<h3>ケーススタディ：退会を減らせ</h3><p>架空のフィットネスチェーンを舞台に、問いの再定義から予測モデル、A/Bテスト、効果試算までを一気通貫で体験する。</p>' +
        '<div class="station__foot"><span>7ステップ・約30分</span><span class="station__bar" aria-hidden="true"><span style="width:' + (done.case ? 100 : 0) + '%"></span></span><span class="num">' + (done.case ? '完了' : '未完了') + '</span></div></a>';
    }
    render();
    document.addEventListener('ds:progress', render);
  }

  /* ---------- クイズ ---------- */
  function buildQuiz(host) {
    const data = JSON.parse(host.querySelector('script[type="application/json"]').textContent);
    const key = host.dataset.quiz;
    const answers = new Array(data.length).fill(null);
    DS.clear(host);
    const score = DS.h('div', { class: 'quiz__score', hidden: true });
    data.forEach((q, qi) => {
      const box = DS.h('div', { class: 'quiz__q' });
      box.innerHTML = '<h3><span>Q' + (qi + 1) + '</span><span>' + q.q + '</span></h3>';
      const opts = DS.h('div', { class: 'quiz__opts' });
      const exp = DS.h('p', { class: 'quiz__exp', hidden: true }, q.exp);
      q.o.forEach((text, oi) => {
        const b = DS.h('button', { type: 'button', class: 'quiz__opt' }, '<span>' + text + '</span>');
        b.addEventListener('click', () => {
          answers[qi] = oi === q.a;
          opts.querySelectorAll('button').forEach((x, xi) => {
            x.disabled = true;
            if (xi === q.a) { x.classList.add('is-correct'); x.insertAdjacentHTML('beforeend', DS.icon('check-circle')); }
            else if (xi === oi) { x.classList.add('is-wrong'); x.insertAdjacentHTML('beforeend', DS.icon('x-circle')); }
          });
          exp.hidden = false;
          exp.insertAdjacentHTML('afterbegin', '<strong>' + (oi === q.a ? '正解。' : '不正解。') + '</strong>');
          if (answers.every(a => a !== null)) finish();
        });
        opts.appendChild(b);
      });
      box.append(opts, exp);
      host.appendChild(box);
    });
    host.appendChild(score);
    function finish() {
      const n = answers.filter(Boolean).length;
      DS.store.update(s => { s.quiz = s.quiz || {}; s.quiz[key] = { score: n, total: data.length }; });
      score.hidden = false;
      score.innerHTML = '<b>' + n + ' / ' + data.length + '</b><span>' + (n === data.length ? '全問正解。次のモジュールへ進みましょう。' : '解説を読み、間違えた問題のレッスンに戻って図をもう一度動かしてみましょう。') + '</span>';
      const again = DS.button('もう一度解く', 'replay', () => { host.innerHTML = ''; host.appendChild(DS.h('script', { type: 'application/json' }, JSON.stringify(data))); buildQuiz(host); });
      score.appendChild(again);
    }
  }

  /* ---------- 起動 ---------- */
  function initWidgets(root) {
    (root || document).querySelectorAll('[data-widget]').forEach(el => {
      const fn = DS.widgets[el.dataset.widget];
      if (!fn) { console.warn('widget not found:', el.dataset.widget); return; }
      try {
        const api = fn(el) || {};
        if (api.play && !DS.reduced) DS.onVisible(el, api.play);
      } catch (err) { console.error('widget failed:', el.dataset.widget, err); }
    });
  }
  DS.initWidgets = initWidgets;

  function boot() {
    renderHeader();
    renderFooter();
    enhanceLessons();
    buildToc();
    buildPager();
    buildRoadmap();
    document.querySelectorAll('[data-quiz]').forEach(buildQuiz);
    initWidgets();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
