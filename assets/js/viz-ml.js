/* モジュール4（機械学習）とモジュール5（生成AI）の図 */
(function () {
  const { svg, h } = DS;

  function box(parent, x, y, w, hh, label, icon, cls) {
    const g = svg('g', {}, parent);
    svg('rect', { x: x - w / 2, y: y - hh / 2, width: w, height: hh, rx: 8, class: (cls || 's-surface') + ' st-ink', 'stroke-width': 1.3 }, g);
    if (icon) DS.svgIcon(g, icon, x - w / 2 + 10, y - 11, 22, 'si-ai');
    svg('text', { x: icon ? x - w / 2 + 40 : x, y: y + 5, 'text-anchor': icon ? 'start' : 'middle', class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: label }, g);
    return g;
  }

  /* =========================================================
     4-1 ルールベースと機械学習
     ========================================================= */
  DS.register('rules-vs-ml', function (el) {
    const f = DS.frame(el);
    const W = 620, H = 330;
    const s = DS.stageSvg(f.stage, W, H, { scroll: true, label: '従来のプログラムと機械学習の違い' });
    const mk = DS.arrow(s, 's-ink3');
    const rows = [
      { y: 90, title: '従来のプログラム', inA: ['データ', 'mail'], inB: ['ルール（人が書く）', 'pen'], mid: 'プログラム', out: ['答え', 'check-circle'], note: '「当選」「無料」があれば迷惑メール…と人がルールを足し続ける' },
      { y: 240, title: '機械学習', inA: ['データ', 'mail'], inB: ['答え（正解）', 'check-circle'], mid: '学習', out: ['ルール（モデル）', 'network'], note: '過去のメール1万通と「迷惑／正常」の正解から、判定のしかたを学ぶ' }
    ];
    rows.forEach((r, i) => {
      svg('text', { x: 14, y: r.y - 60, class: 't-lg', 'font-size': 15, text: r.title }, s);
      box(s, 100, r.y - 26, 170, 38, r.inA[0], r.inA[1]);
      box(s, 100, r.y + 26, 170, 38, r.inB[0], r.inB[1], i === 1 ? 's-ymsoft' : 's-surface');
      box(s, 320, r.y, 110, 50, r.mid, i ? 'gear' : 'code', i ? 's-aisoft' : 's-surface');
      box(s, 520, r.y, 170, 46, r.out[0], r.out[1], i === 1 ? 's-wksoft' : 's-surface');
      const d1 = 'M187 ' + (r.y - 26) + 'C230 ' + (r.y - 26) + ' 230 ' + r.y + ' 263 ' + r.y;
      const d2 = 'M187 ' + (r.y + 26) + 'C230 ' + (r.y + 26) + ' 230 ' + r.y + ' 263 ' + r.y;
      const d3 = 'M377 ' + r.y + 'L433 ' + r.y;
      [d1, d2, d3].forEach(d => { svg('path', { d: d, class: 'st-ink3 nofill', 'stroke-width': 1.5, 'marker-end': mk }, s); DS.flow(s, d, { n: 2, r: 3, dur: 2, cls: i ? 's-ai' : 's-ink3' }); });
      svg('text', { x: 14, y: r.y + 66, class: 'hand', 'font-size': 14, text: r.note }, s);
    });
    f.add('fig__explain', '機械学習では、<strong>答え（正解）のついたデータ</strong>が材料になります。だから「正解データがあるか」「その正解は信頼できるか」が、プロジェクトの成否を左右します。ルールを人が書き切れない、あるいは状況が変わり続ける問題ほど、機械学習が向いています。');
  });

  /* =========================================================
     4-2 3つの学び方
     ========================================================= */
  DS.register('learning-types', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 290;
    const s = DS.stageSvg(f.stage, W, H, { label: '教師あり学習、教師なし学習、強化学習のイメージ' });
    const ex = f.add('fig__explain');
    const g = svg('g', {}, s);
    const r0 = DS.rng(9);
    const pts = [];
    for (let i = 0; i < 40; i++) {
      const c = i % 2;
      pts.push({ x: (c ? 340 : 160) + DS.randn(r0) * 55, y: (c ? 110 : 180) + DS.randn(r0) * 38, c: c });
    }
    const blobs = [[140, 90], [420, 100], [260, 210]];
    const upts = [];
    for (let i = 0; i < 45; i++) { const b = blobs[i % 3]; upts.push({ x: b[0] + DS.randn(r0) * 34, y: b[1] + DS.randn(r0) * 26, c: i % 3 }); }
    let timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, DS.reduced ? 0 : ms));
    const texts = {
      sup: '<strong>教師あり学習</strong>：正解ラベル付きのデータから、入力と正解の関係を学ぶ。新しいデータ（？の点）の正解を予測する。<br>例：需要予測、解約予測、不正検知、与信審査、画像の不良品判定。<strong>企業のAI活用の中心。</strong>',
      unsup: '<strong>教師なし学習</strong>：正解がないデータから、似たもの同士のまとまりや、普通と違う点を見つける。<br>例：顧客セグメンテーション、異常検知、商品の併売パターン。結果の「意味づけ」は人が行う。',
      rl: '<strong>強化学習</strong>：試行錯誤しながら、報酬が最大になる行動のしかたを学ぶ。<br>例：ロボット制御、広告入札、ゲームAI。生成AIを人の好みに合わせる調整（RLHF）にも使われる。ビジネスでの適用はまだ限定的。'
    };
    function draw(m) {
      timers.forEach(clearTimeout); timers = [];
      DS.clear(g);
      DS.explain(ex, texts[m]);
      if (m === 'sup') {
        pts.forEach(p => svg('circle', { cx: p.x, cy: p.y, r: 6, class: p.c ? 's-ai' : 's-bn', opacity: 0.85 }, g));
        svg('text', { x: 20, y: 24, class: 'hand', 'font-size': 14, text: '赤＝解約した客、青＝続けている客（正解つき）' }, g);
        const ln = svg('line', { x1: 140, y1: 270, x2: 360, y2: 20, class: 'st-ink fade', 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: 0 }, g);
        const q = svg('g', { class: 'fade', opacity: 0 }, g);
        const qc = svg('circle', { cx: 470, cy: 200, r: 10, class: 's-ink3' }, q);
        const qt = svg('text', { x: 470, y: 205, 'text-anchor': 'middle', class: 't-sm t-on', 'font-weight': 700, text: '?' }, q);
        svg('text', { x: 488, y: 205, class: 'hand', 'font-size': 14, text: '新しい客' }, q);
        later(() => ln.setAttribute('opacity', 1), 500);
        later(() => q.setAttribute('opacity', 1), 1100);
        later(() => { qc.setAttribute('class', 's-ai'); qt.textContent = '続'; svg('text', { x: 420, y: 240, class: 'hand t-ai', 'font-size': 14, text: '→ 続けそう（予測）' }, g); }, 1900);
      } else if (m === 'unsup') {
        const cs = upts.map(p => svg('circle', { cx: p.x, cy: p.y, r: 6, class: 's-ink3', style: 'transition: fill .5s ease' }, g));
        svg('text', { x: 20, y: 24, class: 'hand', 'font-size': 14, text: '正解ラベルなし。似ている客を自動でまとめる' }, g);
        const cls = ['s-bn', 's-ai', 's-wk'];
        later(() => {
          cs.forEach((c, i) => c.setAttribute('class', cls[upts[i].c]));
          blobs.forEach((b, i) => {
            svg('circle', { cx: b[0], cy: b[1], r: 66, class: 'nofill ' + ['st-bn', 'st-ai', 'st-wk'][i], 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }, g);
            svg('text', { x: b[0], y: b[1] - 72, 'text-anchor': 'middle', class: 'hand', 'font-size': 14, text: ['グループA', 'グループB', 'グループC'][i] }, g);
          });
        }, 900);
      } else {
        const cols = 6, rows = 4, cs = 52, ox = 130, oy = 40;
        const walls = new Set(['1,1', '2,1', '3,2', '4,0', '4,1', '1,3']);
        for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) {
          const wall = walls.has(x + ',' + y);
          svg('rect', { x: ox + x * cs, y: oy + y * cs, width: cs - 4, height: cs - 4, rx: 4, class: wall ? 's-ink3' : 's-paper', opacity: wall ? 0.5 : 1 }, g);
        }
        DS.svgIcon(g, 'star', ox + 5 * cs + 12, oy + 0 * cs + 12, 24, 'si-wk');
        svg('text', { x: ox + 5 * cs + 24, y: oy - 8, 'text-anchor': 'middle', class: 'hand t-wk', 'font-size': 13, text: '報酬' }, g);
        const agent = svg('g', { class: 'dot' }, g);
        svg('circle', { r: 13, class: 's-ai' }, agent);
        DS.svgIcon(agent, 'robot', -9, -9, 18, 'si-on');
        const at = (x, y) => [ox + x * cs + cs / 2 - 2, oy + y * cs + cs / 2 - 2];
        const tries = [
          { path: [[0, 3], [0, 2], [1, 2], [2, 2], [3, 2]], fail: true, label: '1回目：壁にぶつかる（報酬なし）' },
          { path: [[0, 3], [0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0], [3, 1]], fail: true, label: '2回目：遠回りして行き止まり' },
          { path: [[0, 3], [0, 2], [1, 2], [2, 2], [2, 3], [3, 3], [4, 3], [5, 3], [5, 2], [5, 1], [5, 0]], fail: false, label: '3回目：報酬に到達。この行動を強化' }
        ];
        const lab = svg('text', { x: 20, y: H - 14, class: 'hand', 'font-size': 14 }, g);
        let t = 300;
        DS.move(agent, ...at(0, 3)); agent.style.transition = 'transform .3s ease';
        tries.forEach(tr => {
          later(() => { DS.move(agent, ...at(0, 3)); lab.textContent = tr.label; }, t);
          t += 400;
          tr.path.forEach(pnt => { later(() => DS.move(agent, ...at(pnt[0], pnt[1])), t); t += 330; });
          later(() => { if (tr.fail) agent.firstChild.setAttribute('class', 's-bn'); else agent.firstChild.setAttribute('class', 's-wk'); }, t);
          t += 600;
          later(() => agent.firstChild.setAttribute('class', 's-ai'), t);
        });
        later(() => agent.firstChild.setAttribute('class', 's-wk'), t + 10);
      }
    }
    const seg = DS.seg([{ value: 'sup', label: '教師あり' }, { value: 'unsup', label: '教師なし' }, { value: 'rl', label: '強化学習' }], 'sup', draw, '学習の種類');
    f.controls.append(seg, DS.button('もう一度', 'replay', () => { const cur = seg.querySelector('[aria-pressed="true"]'); cur && cur.click(); }));
    draw('sup');
  });

  /* =========================================================
     4-3 回帰と分類
     ========================================================= */
  DS.register('reg-class', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 300, X0 = 50, X1 = 560, Y0 = 20, Y1 = 260;
    const s = DS.stageSvg(f.stage, W, H, { label: '回帰と分類の例' });
    const out = f.add('fig__out');
    const ex = f.add('fig__explain');
    const g = svg('g', {}, s);
    const r = DS.rng(31);
    const reg = Array.from({ length: 28 }, () => { const x = 5 + r() * 30; return { x: x, y: 40 + 6 * x + DS.randn(r) * 22 }; });
    const cls = [];
    for (let i = 0; i < 50; i++) { const c = i % 2; cls.push({ x: DS.clamp((c ? 0.3 : 0.68) + DS.randn(r) * 0.14, 0.03, 0.97), y: DS.clamp((c ? 0.62 : 0.32) + DS.randn(r) * 0.15, 0.03, 0.97), c: c }); }
    let raf = 0, mode = 'reg', xv = 20;
    const n = reg.length, mx = reg.reduce((a, p) => a + p.x, 0) / n, my = reg.reduce((a, p) => a + p.y, 0) / n;
    const bb = reg.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0) / reg.reduce((a, p) => a + (p.x - mx) ** 2, 0), aa = my - bb * mx;
    const sx = DS.lin(0, 40, X0, X1), sy = DS.lin(0, 320, Y1, Y0);
    function axes(xl, yl) {
      const a = svg('g', { class: 'axis' }, g);
      svg('line', { x1: X0, y1: Y1, x2: X1, y2: Y1 }, a); svg('line', { x1: X0, y1: Y0, x2: X0, y2: Y1 }, a);
      svg('text', { x: X1, y: Y1 + 22, 'text-anchor': 'end', class: 't-sm', text: xl }, g);
      svg('text', { x: X0 + 6, y: Y0 + 6, class: 't-sm', text: yl }, g);
    }
    function drawReg() {
      DS.clear(g); cancelAnimationFrame(raf);
      axes('最高気温（℃） →', 'ビールの販売数（本）');
      const res = svg('g', {}, g);
      reg.forEach(p => svg('circle', { cx: sx(p.x), cy: sy(p.y), r: 5, class: 's-ai', opacity: 0.85 }, g));
      const line = svg('line', { class: 'st-wk', 'stroke-width': 3 }, g);
      const pd = svg('circle', { r: 8, class: 's-ym st-ink', 'stroke-width': 1.5 }, g);
      const guide = svg('path', { class: 'st-ym nofill', 'stroke-dasharray': '4 3', 'stroke-width': 1.5 }, g);
      const t0 = performance.now(), dur = DS.reduced ? 1 : 1400;
      function frame(t) {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        const b = bb * e, a2 = my - b * mx;
        line.setAttribute('x1', sx(0)); line.setAttribute('y1', sy(a2)); line.setAttribute('x2', sx(40)); line.setAttribute('y2', sy(a2 + b * 40));
        DS.clear(res);
        reg.forEach(p => svg('line', { x1: sx(p.x), x2: sx(p.x), y1: sy(p.y), y2: sy(a2 + b * p.x), class: 'st-bn', 'stroke-width': 1, opacity: 0.6 }, res));
        if (k < 1) raf = requestAnimationFrame(frame); else upd();
      }
      function upd() {
        const yp = aa + bb * xv;
        pd.setAttribute('cx', sx(xv)); pd.setAttribute('cy', sy(yp));
        guide.setAttribute('d', 'M' + sx(xv) + ' ' + Y1 + 'L' + sx(xv) + ' ' + sy(yp) + 'L' + X0 + ' ' + sy(yp));
        out.innerHTML = '<span>予測式 <b>販売数 ＝ ' + bb.toFixed(1) + ' × 気温 ＋ ' + aa.toFixed(0) + '</b></span><span>気温 ' + xv + '℃ の予測 <b>' + DS.fmt(yp) + '</b> 本</span>';
      }
      drawReg.upd = upd;
      raf = requestAnimationFrame(frame);
      DS.explain(ex, '<strong>回帰</strong>は「数値」を予測する。点との縦のずれ（赤い線）の合計が最も小さくなる線を探すのが、学習の中身。<br>スライダーで気温を変えると予測値が読める。ただし学習データの範囲（5〜35℃）の外側を予測するのは危険（外挿）。');
    }
    function drawCls() {
      DS.clear(g); cancelAnimationFrame(raf);
      const cx = DS.lin(0, 1, X0, X1), cy = DS.lin(0, 1, Y1, Y0);
      const shadeA = svg('path', { class: 's-aisoft', opacity: 0.6 }, g);
      const shadeB = svg('path', { class: 's-bnsoft', opacity: 0.6 }, g);
      axes('直近30日の利用回数 →', '1回あたりの不満の問い合わせ');
      cls.forEach(p => svg('circle', { cx: cx(p.x), cy: cy(p.y), r: 5.5, class: p.c ? 's-bn' : 's-ai', opacity: 0.9 }, g));
      const line = svg('line', { class: 'st-ink', 'stroke-width': 2.5 }, g);
      const t0 = performance.now(), dur = DS.reduced ? 1 : 1600;
      const ang0 = 0.2, ang1 = 1.05;
      function frame(t) {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        const ang = ang0 + (ang1 - ang0) * e;
        const px = 0.5, py = 0.47, dx = Math.cos(ang), dy = Math.sin(ang);
        const p1 = [px - dx * 2, py - dy * 2], p2 = [px + dx * 2, py + dy * 2];
        line.setAttribute('x1', cx(p1[0])); line.setAttribute('y1', cy(p1[1])); line.setAttribute('x2', cx(p2[0])); line.setAttribute('y2', cy(p2[1]));
        const big = 'M' + cx(p1[0]) + ' ' + cy(p1[1]) + 'L' + cx(p2[0]) + ' ' + cy(p2[1]);
        shadeA.setAttribute('d', big + 'L' + cx(2) + ' ' + cy(-1) + 'L' + cx(-1) + ' ' + cy(-1) + 'Z');
        shadeB.setAttribute('d', big + 'L' + cx(-1) + ' ' + cy(2) + 'L' + cx(2) + ' ' + cy(2) + 'Z');
        if (k < 1) raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
      const clip = svg('clipPath', { id: 'cl-rc' }, svg('defs', {}, g));
      svg('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0 }, clip);
      shadeA.setAttribute('clip-path', 'url(#cl-rc)'); shadeB.setAttribute('clip-path', 'url(#cl-rc)'); line.setAttribute('clip-path', 'url(#cl-rc)');
      svg('text', { x: cx(0.06), y: cy(0.92), class: 'hand t-bn', 'font-size': 15, text: '解約しそう' }, g);
      svg('text', { x: cx(0.72), y: cy(0.08), class: 'hand t-ai', 'font-size': 15, text: '続けそう' }, g);
      out.innerHTML = '<span>出力 <b>解約する／しない</b>（または解約確率 0〜100%）</span>';
      DS.explain(ex, '<strong>分類</strong>は「どのグループに入るか」を予測する。赤（解約した客）と青（続けている客）を最もよく分ける境界線を探すのが学習。実務では「解約確率72%」のような確率で出し、どこから対策するかの<strong>しきい値</strong>は、施策のコストとの兼ね合いで人が決める（4-6で扱う）。');
    }
    const sl = DS.slider({ label: '気温', min: 5, max: 35, value: 20, fmt: v => v + '℃', onInput: v => { xv = v; drawReg.upd && drawReg.upd(); } });
    f.controls.append(DS.seg([{ value: 'reg', label: '回帰（数値を予測）' }, { value: 'cls', label: '分類（グループを予測）' }], 'reg', v => { mode = v; sl.hidden = v !== 'reg'; if (v === 'reg') drawReg(); else drawCls(); }, '予測の型'), sl);
    drawReg();
    void mode;
  });

  /* =========================================================
     4-4 k-means クラスタリング
     ========================================================= */
  DS.register('kmeans', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 320, X0 = 50, X1 = 560, Y0 = 20, Y1 = 280;
    const s = DS.stageSvg(f.stage, W, H, { label: '顧客をk-means法で3つのグループに分ける' });
    const out = f.add('fig__out');
    const ex = f.add('fig__explain', '「初期化」で中心（★）をランダムに置き、「1ステップ」で ①各客を一番近い★に割り当て ②★をグループの重心に動かす、を繰り返します。★が動かなくなったら完了です。');
    const a = svg('g', { class: 'axis' }, s);
    svg('line', { x1: X0, y1: Y1, x2: X1, y2: Y1 }, a); svg('line', { x1: X0, y1: Y0, x2: X0, y2: Y1 }, a);
    svg('text', { x: X1, y: Y1 + 22, 'text-anchor': 'end', class: 't-sm', text: '来店頻度（回／月） →' }, s);
    svg('text', { x: X0 + 6, y: Y0 + 6, class: 't-sm', text: '1回あたりの購入額' }, s);
    const r = DS.rng(4);
    const blobs = [{ x: 0.76, y: 0.72, name: '常連の優良客' }, { x: 0.72, y: 0.24, name: '日常の少額客' }, { x: 0.22, y: 0.58, name: 'たまのまとめ買い客' }];
    const P = [];
    for (let i = 0; i < 90; i++) { const b = blobs[i % 3]; P.push({ x: DS.clamp(b.x + DS.randn(r) * 0.09, 0.02, 0.98), y: DS.clamp(b.y + DS.randn(r) * 0.09, 0.02, 0.98) }); }
    const sx = DS.lin(0, 1, X0 + 6, X1 - 6), sy = DS.lin(0, 1, Y1 - 6, Y0 + 6);
    const dots = P.map(p => svg('circle', { cx: sx(p.x), cy: sy(p.y), r: 5.5, class: 's-ink3', style: 'transition: fill .4s ease' }, s));
    const ccls = ['s-bn', 's-ai', 's-wk'];
    const labels = svg('g', {}, s);
    const stars = [0, 1, 2].map(i => { const g = svg('g', { class: 'dot' }, s); svg('circle', { r: 13, class: ccls[i] + ' st-ink', 'stroke-width': 2 }, g); DS.svgIcon(g, 'star', -8, -8, 16, 'si-on'); return g; });
    let C = [], assign = new Array(P.length).fill(-1), iter = 0, done = false, timer = null;
    function init() {
      clearInterval(timer); timer = null;
      C = [0, 1, 2].map(() => ({ x: 0.15 + r() * 0.7, y: 0.15 + r() * 0.7 }));
      assign.fill(-1); iter = 0; done = false;
      dots.forEach(d => d.setAttribute('class', 's-ink3'));
      DS.clear(labels);
      C.forEach((c, i) => DS.move(stars[i], sx(c.x), sy(c.y)));
      report();
    }
    function step() {
      if (done) return;
      let changed = false;
      P.forEach((p, i) => {
        let best = 0, bd = 1e9;
        C.forEach((c, k) => { const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2; if (d < bd) { bd = d; best = k; } });
        if (assign[i] !== best) { changed = true; assign[i] = best; }
        dots[i].setAttribute('class', ccls[best]);
      });
      C = C.map((c, k) => {
        const m = P.filter((_, i) => assign[i] === k);
        return m.length ? { x: m.reduce((a2, p) => a2 + p.x, 0) / m.length, y: m.reduce((a2, p) => a2 + p.y, 0) / m.length } : c;
      });
      C.forEach((c, i) => DS.move(stars[i], sx(c.x), sy(c.y)));
      iter++;
      if (!changed) {
        done = true; clearInterval(timer); timer = null;
        DS.clear(labels);
        C.forEach(c => {
          const b = blobs.slice().sort((p, q) => ((p.x - c.x) ** 2 + (p.y - c.y) ** 2) - ((q.x - c.x) ** 2 + (q.y - c.y) ** 2))[0];
          svg('text', { x: sx(c.x), y: sy(c.y) - 22, 'text-anchor': 'middle', class: 'hand', 'font-size': 15, fill: 'var(--ink)', text: b.name }, labels);
        });
        DS.explain(ex, '<strong>収束しました（' + iter + '回）。</strong>グループの名前は手書き、つまり<strong>人がつけたもの</strong>です。アルゴリズムは「似ている」まとまりを見つけるだけで、そのまとまりが施策として意味を持つかは、業務を知る人が判断します。グループ数（k）を決めるのも人です。');
      }
      report();
    }
    function report() { out.innerHTML = '<span>繰り返し <b>' + iter + '</b> 回</span><span>状態 <b>' + (done ? '収束' : iter ? '計算中' : '初期化済み') + '</b></span>'; }
    f.controls.append(
      DS.button('初期化', 'dice', () => { init(); DS.explain(ex, '★をランダムな位置に置きました。「1ステップ」か「自動で進める」を押してください。'); }),
      DS.button('1ステップ', 'step', step),
      DS.button('自動で進める', 'play', () => { if (done) init(); clearInterval(timer); timer = setInterval(step, DS.reduced ? 50 : 900); })
    );
    init();
    stars.forEach(st => { st.style.transition = 'none'; });
    stars[0].getBoundingClientRect();
    stars.forEach(st => { st.style.transition = ''; });
    return { play() { if (!iter) { clearInterval(timer); timer = setInterval(step, 900); } } };
  });

  /* =========================================================
     4-5 過学習（多項式の次数）
     ========================================================= */
  DS.register('overfit', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 300, X0 = 40, X1 = 400, Y0 = 20, Y1 = 270;
    const s = DS.stageSvg(f.stage, W, H, { label: 'モデルの複雑さと学習誤差・テスト誤差' });
    const out = f.add('fig__out');
    const ex = f.add('fig__explain');
    const r = DS.rng(12);
    const truth = x => Math.sin(2.6 * x) * 0.8 + 0.25 * x;
    const tr = [], te = [];
    for (let i = 0; i < 14; i++) { const x = -0.95 + 1.9 * (i + r() * 0.6) / 14; tr.push({ x: x, y: truth(x) + DS.randn(r) * 0.18 }); }
    for (let i = 0; i < 14; i++) { const x = -0.95 + 1.9 * (i + 0.3 + r() * 0.5) / 14; te.push({ x: x, y: truth(x) + DS.randn(r) * 0.18 }); }
    const sx = DS.lin(-1, 1, X0, X1), sy = DS.lin(-1.8, 1.8, Y1, Y0);
    const defs = svg('defs', {}, s);
    const clip = svg('clipPath', { id: 'cl-of' }, defs);
    svg('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0 }, clip);
    svg('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, class: 's-surface st-rule' }, s);
    const curve = svg('path', { class: 'st-wk nofill', 'stroke-width': 3, 'clip-path': 'url(#cl-of)' }, s);
    tr.forEach(p => svg('circle', { cx: sx(p.x), cy: sy(p.y), r: 5, class: 's-ai' }, s));
    const teG = svg('g', {}, s);
    te.forEach(p => svg('circle', { cx: sx(p.x), cy: sy(p.y), r: 5, class: 's-surface st-bn', 'stroke-width': 2 }, teG));
    const BX = 450, BW = 50, BY1 = 250, BY0 = 40;
    svg('text', { x: BX - 10, y: 24, class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: '誤差（小さいほど良い）' }, s);
    const bars = [['学習', 's-ai'], ['テスト', 's-bn']].map((b, i) => {
      const x = BX + i * (BW + 14);
      svg('text', { x: x + BW / 2, y: BY1 + 18, 'text-anchor': 'middle', class: 't-sm', text: b[0] }, s);
      return svg('rect', { x: x, width: BW, class: b[1], y: BY1, height: 0, style: 'transition: y .4s ease, height .4s ease' }, s);
    });
    svg('line', { x1: BX - 6, x2: BX + 2 * BW + 20, y1: BY1, y2: BY1, class: 'st-ink3' }, s);
    const tag = svg('text', { x: X0 + 8, y: Y0 + 22, class: 'hand', 'font-size': 16 }, s);
    function fit(deg) {
      const m = deg + 1, A = [], b = [];
      for (let i = 0; i < m; i++) { A.push(new Array(m).fill(0)); b.push(0); }
      tr.forEach(p => { const pw = []; for (let k = 0; k < m; k++) pw.push(Math.pow(p.x, k)); for (let i = 0; i < m; i++) { b[i] += pw[i] * p.y; for (let j = 0; j < m; j++) A[i][j] += pw[i] * pw[j]; } });
      for (let i = 0; i < m; i++) A[i][i] += 1e-9;
      for (let c = 0; c < m; c++) {
        let piv = c; for (let rr = c + 1; rr < m; rr++) if (Math.abs(A[rr][c]) > Math.abs(A[piv][c])) piv = rr;
        [A[c], A[piv]] = [A[piv], A[c]]; [b[c], b[piv]] = [b[piv], b[c]];
        for (let rr = c + 1; rr < m; rr++) { const k = A[rr][c] / A[c][c]; for (let j = c; j < m; j++) A[rr][j] -= k * A[c][j]; b[rr] -= k * b[c]; }
      }
      const w = new Array(m).fill(0);
      for (let i = m - 1; i >= 0; i--) { let t = b[i]; for (let j = i + 1; j < m; j++) t -= A[i][j] * w[j]; w[i] = t / A[i][i]; }
      return x => w.reduce((a, c, k) => a + c * Math.pow(x, k), 0);
    }
    const rmse = (fn, arr) => Math.sqrt(arr.reduce((a, p) => a + (fn(p.x) - p.y) ** 2, 0) / arr.length);
    function upd(deg) {
      const fn = fit(deg);
      const pts = [];
      for (let x = -1; x <= 1.0001; x += 0.01) pts.push(sx(x).toFixed(1) + ' ' + sy(DS.clamp(fn(x), -3, 3)).toFixed(1));
      curve.setAttribute('d', 'M' + pts.join('L'));
      const e1 = rmse(fn, tr), e2 = rmse(fn, te);
      const sc = DS.lin(0, 0.8, 0, BY1 - BY0);
      [e1, e2].forEach((e, i) => { const hh = Math.min(sc(e), BY1 - BY0); bars[i].setAttribute('y', BY1 - hh); bars[i].setAttribute('height', hh); });
      const st = deg <= 2 ? ['学習不足（単純すぎる）', 'bn'] : deg <= 6 ? ['ちょうどよい', 'wk'] : ['過学習（覚えすぎ）', 'bn'];
      tag.textContent = st[0]; tag.setAttribute('class', 'hand t-' + st[1]);
      out.innerHTML = '<span>複雑さ（次数） <b>' + deg + '</b></span><span>学習誤差 <b>' + e1.toFixed(2) + '</b></span><span>テスト誤差 <b>' + Math.min(e2, 9.99).toFixed(2) + '</b></span>';
      DS.explain(ex, deg <= 2 ? 'モデルが単純すぎて、データの傾向をつかめていない（<strong>学習不足</strong>）。学習誤差もテスト誤差も大きい。'
        : deg <= 6 ? '学習データ（青）の傾向をつかみ、見たことのないテストデータ（赤い輪）にもよく当てはまる。<strong>本番で使えるのはこの状態。</strong>'
          : '学習データにはほぼぴったりだが、テストデータからは大きく外れる（<strong>過学習</strong>）。試験の過去問を丸暗記した状態。「学習データでの精度99%」という報告を見たら、<strong>テストデータでの精度を聞く</strong>。');
    }
    f.controls.appendChild(DS.slider({ label: 'モデルの複雑さ（多項式の次数）', min: 1, max: 12, value: 4, onInput: upd }));
    upd(4);
    svg('text', { x: X0, y: H - 4, class: 't-xs', text: '● 学習データ　○ テストデータ（学習に使っていない）' }, s);
  });

  /* =========================================================
     4-6 混同行列（不正検知）
     ========================================================= */
  DS.register('confusion', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 216, X0 = 30, X1 = 560;
    const s = DS.stageSvg(f.stage, W, H, { label: '不正検知モデルのスコアとしきい値' });
    const r = DS.rng(8);
    const T = [];
    for (let i = 0; i < 190; i++) T.push({ s: DS.clamp(0.26 + DS.randn(r) * 0.14, 0.01, 0.99), f: 0 });
    for (let i = 0; i < 10; i++) T.push({ s: DS.clamp(0.68 + DS.randn(r) * 0.16, 0.01, 0.99), f: 1 });
    const sx = DS.lin(0, 1, X0, X1);
    svg('text', { x: X0, y: 18, class: 't-sm', text: '正常な取引（190件）' }, s);
    svg('text', { x: X0, y: 128, class: 't-sm t-bn', text: '不正な取引（10件）' }, s);
    const axis = svg('g', { class: 'axis' }, s);
    svg('line', { x1: X0, x2: X1, y1: 172, y2: 172 }, axis);
    [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(v => svg('text', { x: sx(v), y: 190, 'text-anchor': 'middle', class: 't-xs', text: v.toFixed(1) }, s));
    svg('text', { x: X1, y: 210, 'text-anchor': 'end', class: 't-xs', text: 'モデルが出した不正スコア →' }, s);
    const shade = svg('rect', { y: 24, height: 148, class: 's-ymsoft', opacity: 0.7 }, s);
    const dots = T.map(t => svg('circle', { cx: sx(t.s), cy: t.f ? 146 + (r() - 0.5) * 20 : 30 + r() * 78, r: t.f ? 6 : 4, class: t.f ? 's-bn' : 's-ink3', opacity: t.f ? 1 : 0.6 }, s));
    const th = svg('line', { y1: 22, y2: 174, class: 'st-ym', 'stroke-width': 3 }, s);
    const thl = svg('text', { y: 20, class: 'hand', 'font-size': 14, fill: 'var(--ink)' }, s);
    void dots;
    const mtx = h('div', { class: 'tbl-wrap', style: 'margin-top:12px' });
    f.el.appendChild(mtx);
    const out = f.add('fig__out');
    const ex = f.add('fig__explain');
    function upd(t) {
      shade.setAttribute('x', sx(t)); shade.setAttribute('width', X1 - sx(t));
      th.setAttribute('x1', sx(t)); th.setAttribute('x2', sx(t));
      thl.setAttribute('x', sx(t) + 6); thl.textContent = 'ここから右を「不正の疑い」として調査';
      if (sx(t) > 330) { thl.setAttribute('x', sx(t) - 6); thl.setAttribute('text-anchor', 'end'); } else thl.setAttribute('text-anchor', 'start');
      let TP = 0, FP = 0, FN = 0, TN = 0;
      T.forEach(x => { const p = x.s >= t; if (p && x.f) TP++; else if (p) FP++; else if (x.f) FN++; else TN++; });
      const acc = (TP + TN) / T.length, prec = TP + FP ? TP / (TP + FP) : 0, rec = TP / (TP + FN);
      mtx.innerHTML = '<table class="tbl"><thead><tr><th></th><th class="c">モデル：不正の疑い</th><th class="c">モデル：正常</th></tr></thead><tbody>' +
        '<tr><th>実際：不正</th><td class="c" style="background:var(--wakatake-soft)"><strong>' + TP + '</strong> 件 見つけた</td><td class="c" style="background:var(--beni-soft)"><strong>' + FN + '</strong> 件 見逃し</td></tr>' +
        '<tr><th>実際：正常</th><td class="c" style="background:var(--yamabuki-soft)"><strong>' + FP + '</strong> 件 空振り（誤検知）</td><td class="c"><strong>' + TN + '</strong> 件</td></tr></tbody></table>';
      out.innerHTML = '<span>正解率 <b>' + DS.pct(acc) + '</b></span><span>適合率 <b>' + DS.pct(prec) + '</b><br>疑った中で本当に不正だった割合</span><span>再現率 <b>' + DS.pct(rec) + '</b><br>不正のうち見つけられた割合</span><span>調査する件数 <b>' + (TP + FP) + '</b> 件</span>';
      DS.explain(ex, 'しきい値を下げると見逃し（再現率）は減るが、空振りの調査が増える。上げると調査は楽になるが、不正を見逃す。<strong>どちらを重く見るかはビジネスの判断</strong>です。<br>なお、すべて「正常」と答えるだけでも正解率は95%。<strong>不正のような珍しい事象では、正解率はあてにならない。</strong>');
    }
    f.controls.appendChild(DS.slider({ label: 'しきい値', min: 0.05, max: 0.95, step: 0.01, value: 0.5, fmt: v => v.toFixed(2), onInput: upd }));
    upd(0.5);
  });

  /* =========================================================
     4-7 代表的な手法の地図
     ========================================================= */
  DS.register('algos', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 320, X0 = 60, X1 = 560, Y0 = 20, Y1 = 280;
    const s = DS.stageSvg(f.stage, W, H, { label: '代表的な機械学習手法の説明しやすさと精度の出やすさ' });
    const ex = f.add('fig__explain');
    const A = [
      { k: '線形回帰・ロジスティック回帰', x: 0.88, y: 0.26, lab: 'L', icon: 'chart-line', d: '<strong>線形回帰・ロジスティック回帰</strong>：最も基本的な手法。「気温が1℃上がると販売数が12本増える」のように、各要因の効き方を係数で説明できる。精度は控えめでも、説明責任が重い場面（与信、医療、公共）で今も第一候補。' },
      { k: '決定木', x: 0.76, y: 0.5, lab: 'R', icon: 'tree', d: '<strong>決定木</strong>：「利用回数が月2回未満？→はい→契約1年未満？」のような質問の分岐で予測する。木の形をそのまま見せられるので、現場への説明に強い。単体だと精度はそこそこ。' },
      { k: 'ランダムフォレスト', x: 0.48, y: 0.64, lab: 'R', icon: 'layers', d: '<strong>ランダムフォレスト</strong>：たくさんの決定木の多数決。安定して精度が出る。個々の判断の理由は木ほど単純には見えないが、どの要因が効いているか（重要度）は出せる。' },
      { k: '勾配ブースティング', x: 0.3, y: 0.92, lab: 'R', icon: 'trend-up', d: '<strong>勾配ブースティング（XGBoost、LightGBMなど）</strong>：前の木の間違いを次の木が補う方式。<strong>表形式データの予測では実務の定番</strong>で、コンペでも強い。説明には SHAP などの補助ツールを使う（モジュール8）。' },
      { k: 'ニューラルネットワーク', x: 0.08, y: 0.76, lab: 'R', icon: 'network', d: '<strong>ニューラルネットワーク（深層学習）</strong>：画像・音声・文章では圧倒的。表形式データでは勾配ブースティングに及ばないことも多い。大量のデータが必要で、判断の根拠は最も説明しにくい。' },
      { k: 'k近傍法', x: 0.58, y: 0.4, lab: 'R', icon: 'cluster', d: '<strong>k近傍法</strong>：「似ている過去の事例k件の多数決」で予測する。直感的だが、データが多いと遅く、項目の単位に影響されやすい。レコメンドの考え方の基礎。' }
    ];
    const a = svg('g', { class: 'axis' }, s);
    svg('line', { x1: X0, y1: Y1, x2: X1, y2: Y1 }, a); svg('line', { x1: X0, y1: Y0, x2: X0, y2: Y1 }, a);
    svg('text', { x: X1, y: Y1 + 24, 'text-anchor': 'end', class: 't-sm', text: '説明しやすさ →' }, s);
    svg('text', { x: X0 + 8, y: Y0 + 6, class: 't-sm', text: '精度の出やすさ（表形式データ）↑' }, s);

    const sx = DS.lin(0, 1, X0 + 20, X1 - 20), sy = DS.lin(0, 1, Y1 - 20, Y0 + 30);
    svg('text', { x: X1 - 10, y: sy(0.84), 'text-anchor': 'end', class: 'hand', 'font-size': 14, text: '右上は空白' }, s);
    svg('text', { x: X1 - 10, y: sy(0.84) + 20, 'text-anchor': 'end', class: 'hand', 'font-size': 14, text: '＝トレードオフ' }, s);
    const gs = A.map((o, i) => {
      const g = DS.node(s, () => sel(i), o.k);
      svg('circle', { cx: sx(o.x), cy: sy(o.y), r: 20, class: 'hit s-surface st-ink', 'stroke-width': 1.3 }, g);
      DS.svgIcon(g, o.icon, sx(o.x) - 11, sy(o.y) - 11, 22, 'si-ai');
      const left = o.lab === 'L';
      svg('text', { x: sx(o.x) + (left ? -26 : 26), y: sy(o.y) + 5, 'text-anchor': left ? 'end' : 'start', class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: o.k }, g);
      return g;
    });
    function sel(i) { gs.forEach((g, j) => g.classList.toggle('is-on', i === j)); DS.explain(ex, A[i].d); }
    sel(3);
    f.add('fig__note', '位置は一般的な傾向を示す目安です。データの量や性質によって入れ替わります。');
  });

  /* 4-7 補助：決定木で1人の客をたどる */
  DS.register('dtree', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 290;
    const s = DS.stageSvg(f.stage, W, H, { label: '退会リスクを予測する決定木の例' });
    const N = {
      root: { x: 290, y: 40, t: '直近30日の来館 2回未満？' },
      a: { x: 150, y: 135, t: '入会して12か月未満？' },
      b: { x: 430, y: 135, t: '低リスク 8%', leaf: 'wk' },
      a1: { x: 70, y: 235, t: '高リスク 72%', leaf: 'bn' },
      a2: { x: 240, y: 235, t: '中リスク 35%', leaf: 'ym' }
    };
    const E = [['root', 'a', 'はい'], ['root', 'b', 'いいえ'], ['a', 'a1', 'はい'], ['a', 'a2', 'いいえ']];
    const el2 = {};
    E.forEach(e => {
      const p = N[e[0]], c = N[e[1]];
      el2[e[1]] = svg('path', { d: 'M' + p.x + ' ' + (p.y + 18) + 'C' + p.x + ' ' + (p.y + 55) + ' ' + c.x + ' ' + (c.y - 55) + ' ' + c.x + ' ' + (c.y - 18), class: 'st-rule nofill', 'stroke-width': 3, style: 'transition: stroke .4s ease' }, s);
      svg('text', { x: (p.x + c.x) / 2 + (c.x < p.x ? -10 : 10), y: (p.y + c.y) / 2 + 4, 'text-anchor': c.x < p.x ? 'end' : 'start', class: 't-xs', text: e[2] }, s);
    });
    const nodes = {};
    Object.keys(N).forEach(k => {
      const n = N[k], w = n.leaf ? 120 : 200;
      const g = svg('g', {}, s);
      nodes[k] = svg('rect', { x: n.x - w / 2, y: n.y - 18, width: w, height: 36, rx: n.leaf ? 18 : 6, class: (n.leaf ? 's-' + n.leaf + 'soft' : 's-surface') + ' st-ink', 'stroke-width': 1.2, style: 'transition: stroke-width .3s ease' }, g);
      svg('text', { x: n.x, y: n.y + 5, 'text-anchor': 'middle', class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: n.t }, g);
    });
    const people = [
      { name: 'Aさん：月1回・入会5か月', path: ['root', 'a', 'a1'] },
      { name: 'Bさん：月1回・入会3年', path: ['root', 'a', 'a2'] },
      { name: 'Cさん：月8回・入会2年', path: ['root', 'b'] }
    ];
    const ex = f.add('fig__explain');
    let timers = [];
    function trace(i) {
      timers.forEach(clearTimeout); timers = [];
      Object.values(el2).forEach(p => p.setAttribute('class', 'st-rule nofill'));
      Object.values(nodes).forEach(n => n.setAttribute('stroke-width', 1.2));
      const pth = people[i].path;
      pth.forEach((k, j) => timers.push(setTimeout(() => { nodes[k].setAttribute('stroke-width', 3); if (j) el2[k].setAttribute('class', 'st-ai nofill'); }, DS.reduced ? 0 : j * 600)));
      DS.explain(ex, '<strong>' + people[i].name + '</strong> → 「' + N[pth[pth.length - 1]].t + '」。質問をたどるだけなので、予測の理由を現場にそのまま説明できる。これが決定木の強み。');
    }
    f.controls.appendChild(DS.seg(people.map((p, i) => ({ value: i, label: p.name.split('：')[0] })), 0, trace, '会員を選ぶ'));
    trace(0);
  });

  /* =========================================================
     5-1 次の言葉の予測
     ========================================================= */
  DS.register('next-token', function (el) {
    const f = DS.frame(el);
    const prompt = 'データ分析で最も大切なのは';
    const steps = [
      [['問い', 0.42], ['目的', 0.24], ['データの質', 0.16], ['可視化', 0.1], ['統計', 0.05], ['勇気', 0.03]],
      [['を立てること', 0.46], ['の質', 0.27], ['です', 0.15], ['に答えること', 0.08], ['のおもしろさ', 0.04]],
      [['です。', 0.6], ['だと思います。', 0.21], ['。', 0.13], ['かもしれません。', 0.06]]
    ];
    const text = h('p', { style: 'font-size:1.25rem;font-weight:700;line-height:1.7;min-height:2.2em' });
    const bars = h('div', { style: 'display:grid;gap:6px;margin-top:12px' });
    f.stage.append(text, bars);
    const out = f.add('fig__explain');
    let k = 0, chosen = [], T = 0.7;
    const r = DS.rng(Date.now() % 1000);
    function dist() { const ps = steps[k].map(c => Math.pow(c[1], 1 / T)); const z = ps.reduce((a, b) => a + b, 0); return steps[k].map((c, i) => [c[0], ps[i] / z]); }
    function render(pick) {
      text.innerHTML = prompt + chosen.map((c, i) => '<span style="background:var(--ai-soft);border-radius:4px;padding:0 3px;margin-left:2px">' + c + '</span>').join('') + (k < steps.length ? '<span style="color:var(--ink-3)">▍</span>' : '');
      if (k >= steps.length) { bars.innerHTML = '<p class="hand" style="color:var(--ink-2)">文が完成しました。「最初から」で何度か試すと、温度が高いほど毎回違う文になります。</p>'; return; }
      const d = dist();
      bars.innerHTML = d.map((c, i) => '<div style="display:grid;grid-template-columns:7.5em minmax(0,1fr) 3.5em;gap:8px;align-items:center;font-size:.875rem"><span style="text-align:right;font-weight:' + (pick === i ? 900 : 500) + '">' + c[0] + '</span><span style="height:16px;background:var(--grid);border-radius:3px;overflow:hidden"><span style="display:block;height:100%;width:' + (c[1] * 100).toFixed(1) + '%;background:' + (pick === i ? 'var(--yamabuki)' : 'var(--ai)') + ';transition:width .4s ease"></span></span><span class="num" style="color:var(--ink-2)">' + DS.pct(c[1]) + '</span></div>').join('');
    }
    function next() {
      if (k >= steps.length) return;
      const d = dist();
      let u = r(), i = 0;
      while (i < d.length - 1 && u > d[i][1]) { u -= d[i][1]; i++; }
      render(i);
      setTimeout(() => { chosen.push(d[i][0]); k++; render(); }, DS.reduced ? 0 : 700);
    }
    f.controls.append(
      DS.button('次の1語を選ぶ', 'step', next),
      DS.button('最初から', 'replay', () => { k = 0; chosen = []; render(); }),
      DS.slider({ label: '温度（ばらつき）', min: 0.2, max: 2, step: 0.1, value: 0.7, fmt: v => v.toFixed(1), onInput: v => { T = v; render(); } })
    );
    DS.explain(out, 'LLMは、それまでの文章から<strong>次に来る言葉の確率</strong>を計算し、1つ選ぶことを繰り返して文章をつくります。<strong>温度</strong>を下げると最も確率の高い言葉ばかり選び、上げると意外な言葉も選ぶようになります。「事実かどうか」ではなく「ありそうかどうか」で言葉を選んでいる点が、ハルシネーションの根本原因です。');
    render();
    return { play() { next(); setTimeout(next, 1500); } };
  });

  /* 5-2 ハルシネーションを見抜く */
  DS.register('hallucination', function (el) {
    const f = DS.frame(el);
    const parts = [
      ['国内の小売業では、需要予測にAIを使う企業が増えています。', 'ok', '一般的な傾向としては妥当。ただし「増えている」の根拠は示されていない。'],
      ['経済産業省の2024年調査によると、導入企業の73%が在庫を2割以上削減しました。', 'ng', 'もっともらしい数字と出典だが、このような調査は確認できない。<strong>具体的な数字と出典の組み合わせは、最も疑うべき箇所。</strong>'],
      ['山田一郎『需要予測経営』（東洋出版、2021年）でも、', 'ng', '実在しない書籍の可能性が高い。著者名・書名・出版社がそれらしく組み合わされる。必ず原典を検索する。'],
      ['予測の精度より、予測をどう発注業務に組み込むかが成果を左右すると指摘されています。', 'ok', '内容は実務の通説と一致する。ただし「指摘されています」の主語は曖昧。引用するなら自分で出典を探す。']
    ];
    const box = h('div', { style: 'background:var(--surface-2);border-radius:8px;padding:14px 16px;line-height:2;font-size:.9688rem' });
    box.innerHTML = '<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;font-weight:700;font-size:.8125rem;color:var(--ink-2)">' + DS.icon('sparkle') + 'AIの回答（例）</div>' + parts.map((p, i) => '<span data-i="' + i + '" style="transition:background .4s ease;border-radius:3px;padding:0 2px">' + p[0] + '</span>').join('');
    f.stage.appendChild(box);
    const ex = f.add('fig__explain', 'もっともらしい文章ですが、確認が必要な箇所があります。「検証する」を押してください。');
    const btn = DS.button('検証する', 'search', () => {
      box.querySelectorAll('[data-i]').forEach((sp, i) => setTimeout(() => {
        const ok = parts[i][1] === 'ok';
        sp.style.background = ok ? 'var(--wakatake-soft)' : 'var(--beni-soft)';
        sp.style.textDecoration = ok ? 'none' : 'underline wavy var(--beni)';
      }, DS.reduced ? 0 : i * 400));
      DS.explain(ex, '<ul style="display:grid;gap:6px;padding-left:1.1em">' + parts.map(p => '<li><strong>' + (p[1] === 'ok' ? '概ね妥当' : '要注意') + '：</strong>' + p[2] + '</li>').join('') + '</ul>');
    });
    f.controls.appendChild(btn);
  });

  /* =========================================================
     5-3 プロンプトの組み立て
     ========================================================= */
  DS.register('prompt-builder', function (el) {
    const f = DS.frame(el);
    const E = [
      ['役割', 'あなたは小売業界に詳しい戦略コンサルタントです。', 10],
      ['目的', '経営会議で、EC強化の是非を判断するための材料をつくります。', 25],
      ['背景', '当社は首都圏に40店舗を持つ食品スーパーで、EC売上比率は3%です。競合は宅配を強化しています。', 20],
      ['入力', '以下の顧客アンケート結果（300件）をもとにしてください。［アンケート結果を貼り付け］', 15],
      ['制約', '推測と事実を分けて書き、数字には必ず根拠を添えてください。わからない点は「不明」と書いてください。', 15],
      ['出力形式', '結論を3行で示し、その後に論点ごとの表（論点／示唆／根拠）を付けてください。', 15]
    ];
    const on = E.map((_, i) => i < 1);
    const wrap = h('div', { style: 'display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:16px' });
    const list = h('div', { style: 'display:grid;gap:6px;align-content:start' });
    const pv = h('div', { style: 'background:var(--surface-2);border-radius:8px;padding:14px;font-size:.875rem;line-height:1.8;min-height:200px' });
    wrap.append(list, pv);
    f.stage.appendChild(wrap);
    const meter = f.add('fig__out');
    const ex = f.add('fig__explain');
    E.forEach((e, i) => {
      const b = h('button', { type: 'button', class: 'chip', 'aria-pressed': String(on[i]), style: 'justify-content:flex-start' }, DS.icon('check') + e[0]);
      b.addEventListener('click', () => { on[i] = !on[i]; b.setAttribute('aria-pressed', String(on[i])); upd(); });
      list.appendChild(b);
    });
    if (window.matchMedia && matchMedia('(max-width: 640px)').matches) wrap.style.gridTemplateColumns = 'minmax(0,1fr)';
    function upd() {
      const score = E.reduce((a, e, i) => a + (on[i] ? e[2] : 0), 0);
      const base = '競合の動向とEC強化について教えてください。';
      const sel = E.filter((_, i) => on[i]);
      pv.innerHTML = '<div style="font-weight:700;color:var(--ink-2);font-size:.75rem;margin-bottom:4px">プロンプト</div>' + (sel.length ? sel.map(e => '<p style="margin-bottom:.4em"><span class="tag">' + e[0] + '</span> ' + e[1] + '</p>').join('') : '') + '<p>' + base + '</p>';
      meter.innerHTML = '<span>具体性 <b>' + score + '</b> / 100</span><span style="flex:1;min-width:140px;align-self:center"><span style="display:block;height:10px;background:var(--grid);border-radius:5px;overflow:hidden"><span style="display:block;height:100%;width:' + score + '%;background:' + (score < 40 ? 'var(--beni)' : score < 75 ? 'var(--yamabuki)' : 'var(--wakatake)') + ';transition:width .4s ease"></span></span></span>';
      DS.explain(ex, score < 40 ? '<strong>返ってくる回答のイメージ：</strong>どの会社にも当てはまる一般論。「EC市場は拡大しています。競合分析が重要です…」' : score < 75 ? '<strong>返ってくる回答のイメージ：</strong>業界と目的に沿った論点は出るが、根拠や形式がばらばらで、そのまま会議資料には使えない。' : '<strong>返ってくる回答のイメージ：</strong>判断に必要な論点が表で整理され、推測と事実が分けて書かれる。<strong>それでも数字と出典は自分で確認する。</strong>');
    }
    upd();
  });

  /* =========================================================
     5-4 RAG の流れ
     ========================================================= */
  DS.register('rag', function (el) {
    const f = DS.frame(el);
    const W = 640, H = 290;
    const s = DS.stageSvg(f.stage, W, H, { scroll: true, label: 'RAGで社内文書を検索してから回答する流れ' });
    const ex = f.add('fig__explain');
    const mk = DS.arrow(s, 's-ink3');
    const N = [
      { k: 'q', x: 80, y: 70, w: 130, label: '質問', icon: 'user', sub: '男性の育休の取得条件は？' },
      { k: 'search', x: 260, y: 70, w: 130, label: '検索', icon: 'search', sub: '関連する文書を探す' },
      { k: 'docs', x: 260, y: 200, w: 150, label: '社内文書', icon: 'doc', sub: '就業規則・FAQ・通達' },
      { k: 'llm', x: 440, y: 70, w: 130, label: 'LLM', icon: 'sparkle', sub: '質問＋資料で回答' },
      { k: 'ans', x: 580, y: 160, w: 110, label: '回答', icon: 'chat', sub: '出典つき' }
    ];
    const P = {};
    const nodes = {};
    const links = [['q', 'search'], ['search', 'docs'], ['docs', 'llm'], ['llm', 'ans']];
    N.forEach(n => { P[n.k] = n; });
    const lg = {};
    links.forEach(l => {
      const a = P[l[0]], b = P[l[1]];
      let d;
      if (l[0] === 'search') d = 'M' + a.x + ' ' + (a.y + 24) + 'L' + b.x + ' ' + (b.y - 30);
      else if (l[0] === 'docs') d = 'M' + (a.x + 75) + ' ' + a.y + 'C' + (a.x + 140) + ' ' + a.y + ' ' + (b.x - 40) + ' ' + (b.y + 60) + ' ' + b.x + ' ' + (b.y + 24);
      else if (l[0] === 'llm') d = 'M' + (a.x + 65) + ' ' + a.y + 'C' + (b.x) + ' ' + a.y + ' ' + b.x + ' ' + a.y + ' ' + b.x + ' ' + (b.y - 30);
      else d = 'M' + (a.x + 65) + ' ' + a.y + 'L' + (b.x - 65) + ' ' + b.y;
      lg[l.join('-')] = svg('path', { d: d, class: 'st-rule nofill', 'stroke-width': 2, 'marker-end': mk, style: 'transition: stroke .3s ease' }, s);
    });
    const noRag = svg('path', { d: 'M145 70C250 10 380 10 440 46', class: 'st-bn nofill', 'stroke-width': 2, 'stroke-dasharray': '5 4', 'marker-end': DS.arrow(s, 's-bn'), opacity: 0 }, s);
    N.forEach(n => {
      const g = svg('g', { class: 'node' }, s);
      svg('rect', { x: n.x - n.w / 2, y: n.y - 26, width: n.w, height: 52, rx: 8, class: 'hit s-surface st-ink', 'stroke-width': 1.3 }, g);
      DS.svgIcon(g, n.icon, n.x - n.w / 2 + 10, n.y - 18, 20, 'si-ai');
      svg('text', { x: n.x - n.w / 2 + 36, y: n.y - 3, class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: n.label }, g);
      svg('text', { x: n.x - n.w / 2 + 10, y: n.y + 17, class: 't-xs', text: n.sub }, g);
      nodes[n.k] = g;
    });
    // 文書チャンク
    const chunks = [];
    for (let i = 0; i < 6; i++) chunks.push(svg('rect', { x: 200 + (i % 3) * 42, y: 236 + Math.floor(i / 3) * 18, width: 36, height: 12, rx: 2, class: 's-grid', style: 'transition: fill .3s ease' }, s));
    const steps = [
      ['q', null, '<strong>①質問</strong>：社員が「男性の育休の取得条件は？」と質問する。'],
      ['search', 'q-search', '<strong>②検索</strong>：質問に意味の近い文書の断片を、社内文書から探す（ベクトル検索など）。'],
      ['docs', 'search-docs', '<strong>③取り出し</strong>：就業規則の第32条、人事FAQ、2025年の通達など、関連する断片を数件取り出す。'],
      ['llm', 'docs-llm', '<strong>④生成</strong>：「質問」と「取り出した資料」を一緒にLLMへ渡し、「資料に基づいて答えて」と指示する。'],
      ['ans', 'llm-ans', '<strong>⑤回答</strong>：資料に沿った回答を、出典（第32条など）つきで返す。社員は原文を確かめられる。']
    ];
    let timers = [];
    function reset() { timers.forEach(clearTimeout); timers = []; Object.values(nodes).forEach(n => n.classList.remove('is-on')); Object.values(lg).forEach(p => p.setAttribute('class', 'st-rule nofill')); chunks.forEach(c => c.setAttribute('class', 's-grid')); noRag.setAttribute('opacity', 0); }
    function show(i) {
      Object.values(nodes).forEach(n => n.classList.remove('is-on'));
      nodes[steps[i][0]].classList.add('is-on');
      if (steps[i][1]) lg[steps[i][1]].setAttribute('class', 'st-ai nofill');
      if (i === 2) [0, 2, 4].forEach(c => chunks[c].setAttribute('class', 's-ym'));
      DS.explain(ex, steps[i][2]);
    }
    function play() { reset(); steps.forEach((_, i) => timers.push(setTimeout(() => show(i), DS.reduced ? 0 : i * 1300))); }
    function without() {
      reset();
      nodes.q.classList.add('is-on'); nodes.llm.classList.add('is-on'); nodes.ans.classList.add('is-on');
      noRag.setAttribute('opacity', 1);
      DS.explain(ex, '<strong>RAGなし</strong>：LLMは学習した一般知識だけで答える。「一般的には子が1歳になるまで…」と、<strong>自社の規程とずれた内容をもっともらしく</strong>答えるおそれがある。社内の質問応答にLLMをそのまま使ってはいけない理由。');
    }
    f.controls.append(DS.button('RAGの流れを再生', 'play', play), DS.button('RAGなしの場合', 'alert', without));
    show(0); for (let i = 1; i < 5; i++) show(i);
    return { play: play };
  });

  /* =========================================================
     5-5 AIエージェントのループ
     ========================================================= */
  DS.register('agent-loop', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 300, cx = 170, cy = 150, R = 105;
    const wrap = h('div', { style: 'display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:16px;align-items:start' });
    const stage = h('div');
    const log = h('ol', { style: 'list-style:none;padding:0;display:grid;gap:6px;font-size:.8438rem;max-height:300px;overflow:auto' });
    wrap.append(stage, log);
    f.stage.appendChild(wrap);
    if (window.matchMedia && matchMedia('(max-width: 700px)').matches) wrap.style.gridTemplateColumns = 'minmax(0,1fr)';
    const s = DS.stageSvg(stage, 340, H, { label: 'AIエージェントの計画・実行・観察のループ' });
    void W;
    const ph = [['計画', 'pen'], ['行動', 'wrench'], ['観察', 'eye'], ['振り返り', 'refresh']];
    svg('circle', { cx: cx, cy: cy, r: R, class: 'st-rule nofill', 'stroke-width': 8 }, s);
    const orbit = 'M' + cx + ' ' + (cy - R) + 'A' + R + ' ' + R + ' 0 1 1 ' + (cx - 0.01) + ' ' + (cy - R);
    DS.flow(s, orbit, { n: 1, r: 7, dur: 6, cls: 's-ym' });
    svg('circle', { cx: cx, cy: cy, r: 42, class: 's-aisoft' }, s);
    DS.svgIcon(s, 'robot', cx - 16, cy - 26, 32, 'si-ai');
    svg('text', { x: cx, y: cy + 22, 'text-anchor': 'middle', class: 't-xs', text: 'エージェント' }, s);
    const nodes = ph.map((p, i) => {
      const a = (-90 + i * 90) * Math.PI / 180, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      const g = svg('g', { class: 'node' }, s);
      svg('rect', { x: x - 48, y: y - 18, width: 96, height: 36, rx: 18, class: 'hit s-surface st-ink', 'stroke-width': 1.3 }, g);
      DS.svgIcon(g, p[1], x - 38, y - 9, 18, 'si-ai');
      svg('text', { x: x - 14, y: y + 5, class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: p[0] }, g);
      return g;
    });
    svg('text', { x: 300, y: 30, 'text-anchor': 'end', class: 'hand t-bn', 'font-size': 13, text: '人の承認' }, s);
    DS.svgIcon(s, 'user', 306, 14, 22, 'si-bn');
    const run = [
      [0, '目標を受け取る：「競合3社の主力プランの価格を比較表にする」'],
      [0, '計画：①各社サイトを検索 ②価格表を読む ③表にまとめる'],
      [1, '行動：Web検索ツールで「A社 料金プラン」を検索'],
      [2, '観察：A社の料金ページを取得。月額プランが3種類ある'],
      [1, '行動：B社、C社も同様に検索して取得'],
      [2, '観察：C社は価格が「要問い合わせ」で取得できない'],
      [3, '振り返り：C社は推定せず「非公開」と明記する方針に変更'],
      [1, '行動：表計算ツールで比較表を作成'],
      [3, '振り返り：表と出典URLを確認。完了として人に提出'],
    ];
    let i = 0, timer = null;
    function stepOne() {
      if (i >= run.length) { clearInterval(timer); timer = null; return; }
      const r = run[i];
      nodes.forEach((n, j) => n.classList.toggle('is-on', j === r[0]));
      const li = h('li', { style: 'display:grid;grid-template-columns:22px minmax(0,1fr);gap:6px;padding:6px 8px;border-radius:6px;background:var(--surface-2)' }, DS.icon(ph[r[0]][1]) + '<span>' + r[1] + '</span>');
      log.appendChild(li); log.scrollTop = log.scrollHeight;
      i++;
    }
    function restart() { clearInterval(timer); log.innerHTML = ''; i = 0; timer = setInterval(stepOne, DS.reduced ? 30 : 1100); }
    f.controls.append(DS.button('再生', 'play', restart), DS.button('1ステップ', 'step', () => { clearInterval(timer); timer = null; stepOne(); }));
    f.add('fig__explain', '<strong>AIエージェント</strong>は、目標を与えられると自分で計画を立て、検索や表計算などの<strong>ツールを使って行動</strong>し、結果を見て計画を直すことを繰り返します。便利な反面、途中の判断を誤ると誤りが積み重なります。<strong>どこで人が承認するか</strong>（送信・発注・公開の前など）を設計するのが、導入時の要点です。');
    for (let k = 0; k < 3; k++) stepOne();
    return { play() { clearInterval(timer); timer = setInterval(stepOne, 1100); } };
  });

  /* =========================================================
     5-6 ギザギザの境界
     ========================================================= */
  DS.register('jagged', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 330, X0 = 30, X1 = 560, Y0 = 34, Y1 = 290;
    const s = DS.stageSvg(f.stage, W, H, { label: 'AIが得意な仕事と苦手な仕事のギザギザの境界' });
    const T = [
      { k: '市場調査の要約', icon: 'doc', x: 0.05, y: 0.28, in: 1, d: '大量の資料を読んで要点をまとめるのは得意。ただし元資料の取捨選択は人が確認する。' },
      { k: '桁の多い計算の検算', icon: 'sigma', x: 0.14, y: 0.36, in: 0, d: 'やさしそうな仕事なのに枠の外。コード実行なしの暗算は誤りやすい。境界がギザギザである典型例。' },
      { k: '新商品のアイデア出し', icon: 'bulb', x: 0.27, y: 0.42, in: 1, d: 'BCGの実験でも、枠の内側に入る代表的な仕事。量と多様性で人を上回る。' },
      { k: '数表とインタビューを突き合わせた原因特定', icon: 'scatter', x: 0.4, y: 0.88, in: 0, d: 'BCGの実験で「枠の外」とされた種類の仕事。AIを使ったグループは、使わないグループより正答率が低かった（もっともらしい誤答を採用してしまう）。' },
      { k: 'プレゼンの構成案', icon: 'deck', x: 0.49, y: 0.24, in: 1, d: '型に沿った構成案づくりは得意。何を一番言うべきかは人が決める。' },
      { k: '分析コードの作成', icon: 'code', x: 0.58, y: 0.48, in: 1, d: '集計や可視化のコードは高速に書ける。結果の数字が正しいかは必ず検算する。' },
      { k: '出典つきの事実確認', icon: 'search', x: 0.67, y: 0.6, in: 0, d: '簡単そうに見えて苦手。存在しない出典や数字を自信ありげに出すことがある。' },
      { k: '議事録の整理', icon: 'chat', x: 0.83, y: 0.22, in: 1, d: '発言の整理と要約は得意。決定事項と宿題は人が確定させる。' },
      { k: '顧客固有の事情を踏まえた判断', icon: 'users', x: 0.93, y: 0.84, in: 0, d: '社内の力学や暗黙の前提は、教えない限りAIは知らない。最終判断は人が担う。' }
    ];
    const sx = DS.lin(0, 1, X0 + 18, X1 - 18), sy = DS.lin(0, 1, Y1 - 6, Y0 + 10);
    const bx = [0, 0.08, 0.14, 0.2, 0.3, 0.4, 0.48, 0.56, 0.66, 0.74, 0.84, 0.92, 1];
    const by = [0.55, 0.5, 0.15, 0.62, 0.72, 0.66, 0.5, 0.74, 0.36, 0.6, 0.48, 0.58, 0.52];
    const pts = bx.map((x, i) => sx(x).toFixed(1) + ' ' + sy(by[i]).toFixed(1));
    svg('path', { d: 'M' + sx(0) + ' ' + sy(0) + 'L' + pts.join('L') + 'L' + sx(1) + ' ' + sy(0) + 'Z', class: 's-wksoft' }, s);
    const ln = svg('path', { d: 'M' + pts.join('L'), class: 'st-wk nofill', 'stroke-width': 2.5 }, s);
    if (!DS.reduced) { const L = 1400; ln.style.strokeDasharray = L; ln.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 1600, easing: 'ease-out' }); }
    svg('text', { x: sx(0.5), y: Y1 + 26, 'text-anchor': 'middle', class: 'hand t-wk', 'font-size': 15, text: '境界の内側：AIで速く・質も上がる' }, s);
    svg('text', { x: sx(0.5), y: Y0 - 12, 'text-anchor': 'middle', class: 'hand t-bn', 'font-size': 15, text: '境界の外側：AIを使うと、かえって誤りやすい' }, s);
    svg('text', { x: X0, y: Y1 + 26, class: 't-xs', text: '↑見た目の難しさ' }, s);
    const legend = h('div', { class: 'chips', style: 'margin-top:12px', role: 'group', 'aria-label': '仕事を選ぶ' });
    f.el.appendChild(legend);
    const ex = f.add('fig__explain');
    const rings = [], chips = [];
    T.forEach((t, i) => {
      const g = DS.node(s, () => sel(i), t.k);
      rings.push(svg('circle', { cx: sx(t.x), cy: sy(t.y), r: 22, class: 'nofill st-ai', 'stroke-width': 3, opacity: 0 }, g));
      svg('circle', { cx: sx(t.x), cy: sy(t.y), r: 16, class: (t.in ? 's-wk' : 's-bn') + ' st-ink', 'stroke-width': 1 }, g);
      DS.svgIcon(g, t.icon, sx(t.x) - 9, sy(t.y) - 9, 18, 'si-on');
      const c = h('button', { type: 'button', class: 'chip', 'aria-pressed': 'false' }, DS.icon(t.icon) + t.k);
      c.style.borderColor = t.in ? 'var(--wakatake)' : 'var(--beni)';
      c.addEventListener('click', () => sel(i));
      legend.appendChild(c); chips.push(c);
    });
    function sel(i) {
      rings.forEach((r, j) => r.setAttribute('opacity', i === j ? 1 : 0));
      chips.forEach((c, j) => c.setAttribute('aria-pressed', String(i === j)));
      DS.explain(ex, '<strong>' + T[i].k + '</strong>（' + (T[i].in ? '境界の内側' : '境界の外側') + '）：' + T[i].d);
    }
    sel(3);
    f.add('fig__note', '緑の点は境界の内側、赤の点は外側の仕事です。境界の形と点の位置は、BCGとハーバード大学などの研究（2023年）の考え方を説明するための模式図です。境界はモデルの進化とともに外へ広がりますが、ギザギザであることは変わりません。');
  });
})();
