/* ホームのヒーローと、モジュール1〜3（全体像・データ・統計）の図 */
(function () {
  const { svg, h } = DS;
  let uid = 0;
  const nid = p => p + (++uid);

  DS.svgIcon = function (parent, name, x, y, size, cls) {
    return svg('use', { href: '#i-' + name, x: x, y: y, width: size, height: size, class: 'si ' + (cls || '') }, parent);
  };
  DS.arrow = function (s, cls) {
    const id = nid('ar');
    const defs = s.querySelector('defs') || svg('defs', {}, s);
    const m = svg('marker', { id: id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    svg('path', { d: 'M0 0L10 5L0 10z', class: cls || 's-ink3' }, m);
    return 'url(#' + id + ')';
  };
  /* 経路に沿って流れる点（動きを減らす設定では描かない） */
  DS.flow = function (parent, d, o) {
    o = o || {};
    if (DS.reduced) return;
    const n = o.n || 3, dur = o.dur || 3;
    for (let i = 0; i < n; i++) {
      const c = svg('circle', { r: o.r || 3.5, class: o.cls || 's-ai' }, parent);
      svg('animateMotion', { dur: dur + 's', repeatCount: 'indefinite', begin: (-(i * dur) / n).toFixed(2) + 's', path: d }, c);
    }
  };
  /* 点の配置：初回は瞬時に、以後はトランジションで移動 */
  DS.place = function (nodes, pos, instant) {
    nodes.forEach((n, i) => {
      if (instant) n.style.transition = 'none';
      DS.move(n, pos[i][0], pos[i][1]);
    });
    if (instant) { nodes[0] && nodes[0].getBoundingClientRect(); nodes.forEach(n => { n.style.transition = ''; }); }
  };
  DS.erf = function (x) {
    const s = Math.sign(x); x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  };
  DS.ncdf = (x, m, sd) => 0.5 * (1 + DS.erf((x - m) / (sd * Math.SQRT2)));
  DS.explain = function (box, html) { box.innerHTML = html; };
  /* クリック可能なノード（キーボード操作にも対応） */
  DS.node = function (parent, onSelect, label) {
    const g = svg('g', { class: 'node clickable', tabindex: 0, role: 'button', 'aria-label': label || '' }, parent);
    g.addEventListener('click', onSelect);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } });
    return g;
  };

  /* =========================================================
     HERO：散らばった点が、整理→関係→予測→意思決定へ変わる
     ========================================================= */
  DS.register('hero', function (el) {
    const W = 600, H = 360, X0 = 52, X1 = 580, Y0 = 18, Y1 = 318;
    const stage = el.querySelector('.hero-viz__stage');
    const cap = el.querySelector('.hero-viz__caption');
    const stepper = el.querySelector('.stepper');
    const s = DS.stageSvg(stage, W, H, { label: 'データが意思決定に変わるまでの5段階を点の動きで示した図' });
    const r = DS.rng(7);
    const N = 54;
    const data = [];
    for (let i = 0; i < N; i++) {
      const x = 0.04 + r() * 0.92;
      data.push({ x: x, y: DS.clamp(0.1 + 0.7 * x + DS.randn(r) * 0.07, 0.03, 0.97), rx: r(), ry: r() });
    }
    // 最小二乗
    const mx = data.reduce((a, d) => a + d.x, 0) / N, my = data.reduce((a, d) => a + d.y, 0) / N;
    const b = data.reduce((a, d) => a + (d.x - mx) * (d.y - my), 0) / data.reduce((a, d) => a + (d.x - mx) ** 2, 0);
    const a0 = my - b * mx;

    const axis = svg('g', { class: 'axis fade' }, s);
    svg('line', { x1: X0, y1: Y1, x2: X1, y2: Y1 }, axis);
    svg('line', { x1: X0, y1: Y0, x2: X0, y2: Y1 }, axis);
    const ax = svg('text', { x: X1, y: Y1 + 26, 'text-anchor': 'end', class: 't-sm' }, s);
    const ay = svg('text', { x: X0 - 8, y: Y0 + 4, 'text-anchor': 'end', class: 't-sm', transform: 'rotate(-90 ' + (X0 - 30) + ' ' + (Y0 + 40) + ')' }, s);
    ay.setAttribute('x', X0 - 30); ay.setAttribute('y', Y0 + 40);

    const fx = (x, k) => X0 + x * (X1 - X0) * k;
    const fy = (y, top) => Y1 - y / top * (Y1 - Y0);

    // 予測帯・回帰線・意思決定の重ね描き
    const band = svg('path', { class: 's-aisoft fade', opacity: 0 }, s);
    const line3 = svg('line', { class: 'st-wk fade', 'stroke-width': 2.5, opacity: 0 }, s);
    const today = svg('g', { class: 'fade', opacity: 0 }, s);
    const tx = fx(1, 0.6);
    svg('line', { x1: tx, y1: Y0, x2: tx, y2: Y1, class: 'st-ink3', 'stroke-dasharray': '4 4' }, today);
    svg('text', { x: tx - 6, y: Y0 + 14, 'text-anchor': 'end', class: 'hand', text: 'これまで' }, today);
    svg('text', { x: tx + 6, y: Y0 + 14, class: 'hand', text: 'これから' }, today);
    const fore = svg('path', { class: 'st-ai nofill fade', 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: 0 }, s);
    const decide = svg('g', { class: 'fade', opacity: 0 }, s);
    const top45 = 1.45, yT = 1.0;
    const xCross = (yT - a0) / b;
    svg('line', { x1: X0, x2: X1, y1: fy(yT, top45), y2: fy(yT, top45), class: 'st-ym', 'stroke-width': 2 }, decide);
    svg('text', { x: X0 + 8, y: fy(yT, top45) - 8, class: 'hand', text: '目標売上' }, decide);
    const fxC = fx(xCross, 0.6), fyC = fy(yT, top45);
    svg('line', { x1: fxC, y1: fyC, x2: fxC, y2: Y1, class: 'st-ym', 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }, decide);
    svg('circle', { cx: fxC, cy: fyC, r: 7, class: 's-ym' }, decide);
    DS.svgIcon(decide, 'flag', fxC - 4, fyC - 46, 34, 'si-bn');
    svg('text', { x: fxC - 12, y: fyC - 54, 'text-anchor': 'end', class: 'hand', text: '広告費をここまで増やす' }, decide);

    const histLabel = svg('text', { x: X0 + 8, y: Y0 + 16, class: 'hand fade', opacity: 0, text: '売上が多い月ほど右へ' }, s);

    const dots = data.map(() => svg('circle', { r: 5.5, class: 'dot s-ink3', cx: 0, cy: 0 }, s));

    // 各段階の座標
    const P = [];
    P.push(data.map(d => [X0 + 10 + d.rx * (X1 - X0 - 20), Y0 + 10 + d.ry * (Y1 - Y0 - 20)]));
    const bins = 10, cnt = new Array(bins).fill(0);
    P.push(data.map(d => { const bi = Math.min(bins - 1, Math.floor(d.y * bins)); const k = cnt[bi]++; return [X0 + (bi + 0.5) * (X1 - X0) / bins, Y1 - 9 - k * 13]; }));
    P.push(data.map(d => [fx(d.x, 0.96), fy(d.y, 1.05)]));
    P.push(data.map(d => [fx(d.x, 0.6), fy(d.y, top45)]));
    P.push(P[3]);

    const steps = [
      ['集める', 'バラバラの数字。このままでは何も語らない。', '', ''],
      ['整える', '並べ直すと「どの売上が多いか」という分布が見えてくる。', '売上の大きさ', '月の数'],
      ['関係を見る', '広告費と売上を並べると、右上がりの関係が浮かぶ。', '広告費', '売上'],
      ['予測する', '関係を延ばして、まだ起きていない未来を見積もる。幅も一緒に。', '広告費', '売上'],
      ['決める', '予測をもとに、目標へ届く打ち手を人が決める。', '広告費', '売上']
    ];
    const btns = steps.map((st, i) => {
      const bt = h('button', { type: 'button' }, '<b>' + (i + 1) + '</b>' + st[0]);
      bt.addEventListener('click', () => { stopAuto(); go(i); });
      stepper.appendChild(bt);
      return bt;
    });
    function show(n, v) { n.setAttribute('opacity', v ? 1 : 0); }
    let cur = -1;
    function go(i, instant) {
      cur = i;
      btns.forEach((bt, j) => bt.toggleAttribute('aria-current', j === i) || bt.setAttribute('aria-current', j === i ? 'step' : ''));
      btns.forEach((bt, j) => { if (j === i) bt.setAttribute('aria-current', 'step'); else bt.removeAttribute('aria-current'); });
      DS.place(dots, P[i], instant);
      dots.forEach((d, j) => {
        let cls = 'dot ';
        if (i === 0) cls += 's-ink3';
        else if (i === 4) cls += 's-ai';
        else cls += 's-ai';
        d.setAttribute('class', cls);
        d.style.opacity = i >= 3 ? 0.55 : 1;
      });
      show(axis, i >= 1); show(histLabel, i === 1);
      ax.textContent = steps[i][2] ? steps[i][2] + ' →' : '';
      ay.textContent = steps[i][3] ? steps[i][3] + ' →' : '';
      // 回帰線
      if (i === 2) {
        line3.setAttribute('x1', fx(0, 0.96)); line3.setAttribute('y1', fy(a0, 1.05));
        line3.setAttribute('x2', fx(1, 0.96)); line3.setAttribute('y2', fy(a0 + b, 1.05));
      }
      show(line3, i === 2);
      const xs = [0, 1, 1.6];
      fore.setAttribute('d', 'M' + xs.map(x => fx(x, 0.6) + ' ' + fy(a0 + b * x, top45)).join('L'));
      const up = [], dn = [];
      for (let x = 1; x <= 1.6001; x += 0.05) { const w = 0.03 + (x - 1) * 0.28; up.push(fx(x, 0.6) + ' ' + fy(a0 + b * x + w, top45)); dn.unshift(fx(x, 0.6) + ' ' + fy(a0 + b * x - w, top45)); }
      band.setAttribute('d', 'M' + up.join('L') + 'L' + dn.join('L') + 'Z');
      show(fore, i >= 3); show(band, i >= 3); show(today, i >= 3); show(decide, i === 4);
      cap.textContent = steps[i][1];
    }
    go(DS.reduced ? 2 : 0, true);
    let timer = null;
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
    return {
      play() {
        if (DS.reduced) return;
        timer = setInterval(() => go((cur + 1) % steps.length), 3200);
      }
    };
  });

  /* =========================================================
     1-1 データ → 情報 → 洞察 → 行動
     ========================================================= */
  DS.register('pipeline', function (el) {
    const f = DS.frame(el);
    const W = 660, H = 260;
    const s = DS.stageSvg(f.stage, W, H, { scroll: true, label: 'データが情報、洞察、行動へと変わる流れ' });
    const ex = f.add('fig__explain');
    const st = [
      { k: 'データ', icon: 'database', sub: 'POSの売上明細|120万行', d: '<strong>データ</strong>は、記録されたままの事実。レジの明細、Webのアクセスログ、センサーの値。量は多くても、それだけでは判断に使えない。' },
      { k: '情報', icon: 'chart-bar', sub: '店舗別・週別の|売上推移', d: '<strong>情報</strong>は、目的に合わせて集計・整理されたデータ。「どの店で、いつ、どれだけ売れたか」が読める状態。BIダッシュボードの多くはここまでを担う。' },
      { k: '洞察', icon: 'bulb', sub: '雨の週末に|郊外店の客数が落ちる', d: '<strong>洞察</strong>は、情報から読み取った「意味」。原因や傾向、機会の発見。仮説を立て、比較し、検証してはじめて得られる。データサイエンスの手法が最も効くところ。' },
      { k: '行動', icon: 'flag', sub: '雨の日だけ|配送料を無料にする', d: '<strong>行動</strong>は、洞察をもとにした意思決定と実行。ここまで届かない分析は、どれだけ高度でも価値を生まない。コンサルの仕事は、この最後の一歩までを設計すること。' }
    ];
    const xs = [80, 250, 420, 590], cy = 92;
    const marker = DS.arrow(s);
    const flows = svg('g', {}, s);
    const trans = [['集計・整理', 'AIが得意'], ['分析・解釈', 'AIと協働'], ['判断・実行', '人が担う']];
    for (let i = 0; i < 3; i++) {
      const x1 = xs[i] + 46, x2 = xs[i + 1] - 50;
      const d = 'M' + x1 + ' ' + cy + 'L' + x2 + ' ' + cy;
      svg('path', { d: d, class: 'st-ink3', 'stroke-width': 1.5, 'marker-end': marker, fill: 'none' }, s);
      DS.flow(flows, d, { n: [5, 3, 1][i], r: [2.5, 3.5, 5][i], dur: 2.4, cls: ['s-ink3', 's-ai', 's-ym'][i] });
      svg('text', { x: (x1 + x2) / 2, y: cy - 16, 'text-anchor': 'middle', class: 't-sm', text: trans[i][0] }, s);
      svg('text', { x: (x1 + x2) / 2, y: cy + 30, 'text-anchor': 'middle', class: 'hand ' + (i === 2 ? 't-bn' : 't-ai'), 'font-size': 14, text: trans[i][1] }, s);
    }
    const nodes = st.map((o, i) => {
      const g = DS.node(s, () => sel(i), o.k);
      svg('circle', { cx: xs[i], cy: cy, r: 42, class: 'hit s-surface st-ink', 'stroke-width': 1.5 }, g);
      DS.svgIcon(g, o.icon, xs[i] - 18, cy - 18, 36, i === 3 ? 'si-bn' : 'si-ai');
      svg('text', { x: xs[i], y: cy + 68, 'text-anchor': 'middle', class: 't-lg', text: o.k }, g);
      o.sub.split('|').forEach((t, k) => svg('text', { x: xs[i], y: cy + 90 + k * 17, 'text-anchor': 'middle', class: 't-sm', text: t }, g));
      return g;
    });
    svg('text', { x: 20, y: H - 14, class: 't-xs', text: '例：小売チェーンの売上データ。円をクリックすると各段階の説明が出ます。' }, s);
    function sel(i) { nodes.forEach((n, j) => n.classList.toggle('is-on', i === j)); DS.explain(ex, st[i].d); }
    sel(0);
  });

  /* =========================================================
     1-2 AI ⊃ 機械学習 ⊃ 深層学習 ⊃ 生成AI
     ========================================================= */
  DS.register('ai-nested', function (el) {
    const f = DS.frame(el);
    const W = 560, H = 370;
    const s = DS.stageSvg(f.stage, W, H, { label: 'AI、機械学習、深層学習、生成AIの包含関係' });
    const ex = f.add('fig__explain');
    const rings = [
      { k: 'AI（人工知能）', r: 170, cls: 's-surface', t: 1956, d: '<strong>AI</strong>は「人間の知的なふるまいを機械で実現する技術」全体の呼び名。人が書いたルールで動くシステム（例：条件分岐の与信審査ルール）も含む、いちばん広い概念。' },
      { k: '機械学習', r: 126, cls: 's-aisoft', t: 1990, d: '<strong>機械学習</strong>は、ルールを人が書く代わりに<strong>データからパターンを学ばせる</strong>AI。需要予測、離反予測、不正検知など、企業で実用化されているAIの大半はこれ。' },
      { k: '深層学習', r: 84, cls: 's-wksoft', t: 2012, d: '<strong>深層学習（ディープラーニング）</strong>は、多層のニューラルネットワークを使う機械学習。画像認識・音声認識の精度を大きく引き上げた。大量のデータと計算資源が必要で、判断の根拠は説明しにくい。' },
      { k: '生成AI', r: 46, cls: 's-ymsoft', t: 2022, d: '<strong>生成AI</strong>は、深層学習のうち文章・画像・コードなどを<strong>新しく生成する</strong>もの。ChatGPTやClaudeなどの大規模言語モデル（LLM）が代表例。「予測・分類するAI」とは得意分野が違う点に注意。' }
    ];
    const cx = 200, base = 352;
    const gs = rings.map((o, i) => {
      const g = DS.node(s, () => sel(i), o.k);
      svg('circle', { cx: cx, cy: base - o.r, r: o.r, class: 'hit ' + o.cls + ' st-ink', 'stroke-width': 1.5 }, g);
      svg('text', { x: cx, y: base - 2 * o.r + (i === 3 ? 52 : 26), 'text-anchor': 'middle', class: i === 3 ? 't-lg' : 't-lg', 'font-size': i === 3 ? 14 : 16, text: o.k }, g);
      return g;
    });
    // 年表
    const tl = svg('g', {}, s);
    const tx0 = 400, tx1 = 545;
    svg('line', { x1: tx0, y1: 40, x2: tx0, y2: 330, class: 'st-ink3' }, tl);
    const ev = [[1956, 'ダートマス会議で「AI」の名前が生まれる'], [1990, '統計的な機械学習が実用へ'], [2012, '深層学習が画像認識で圧勝'], [2017, 'Transformer 論文'], [2022, 'ChatGPT 公開、生成AIが一般へ']];
    ev.forEach((e, i) => {
      const y = 50 + i * 66;
      svg('circle', { cx: tx0, cy: y, r: 5, class: i === 4 ? 's-ym' : 's-ai' }, tl);
      svg('text', { x: tx0 + 14, y: y + 5, class: 't-lg', 'font-size': 15, text: String(e[0]) }, tl);
      const words = e[1];
      svg('text', { x: tx0 + 14, y: y + 25, class: 't-xs', text: words.length > 12 ? words.slice(0, 12) : words }, tl);
      if (words.length > 12) svg('text', { x: tx0 + 14, y: y + 40, class: 't-xs', text: words.slice(12) }, tl);
    });
    void tx1;
    function sel(i) { gs.forEach((g, j) => g.classList.toggle('is-on', i === j)); DS.explain(ex, rings[i].d); }
    sel(1);
    return {
      play() {
        let i = 0;
        const t = setInterval(() => { sel(i); i++; if (i > 3) { clearInterval(t); setTimeout(() => sel(1), 1600); } }, 900);
      }
    };
  });

  /* =========================================================
     1-3 分析の4段階（階段）
     ========================================================= */
  DS.register('analytics-stairs', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 350;
    const s = DS.stageSvg(f.stage, W, H, { label: '記述・診断・予測・処方の4段階の階段' });
    const ex = f.add('fig__explain');
    const st = [
      { k: '記述', q: '何が起きた？', tool: 'BI・ダッシュボード', d: '<strong>記述的分析</strong>：先月の売上は前年比8%減。どの店舗・商品で減ったかを集計して見える化する。多くの企業がここで止まっている。' },
      { k: '診断', q: 'なぜ起きた？', tool: '深掘り・統計', d: '<strong>診断的分析</strong>：減少の7割は郊外店の30代女性客。競合出店の時期と一致。要因を分解し、仮説を検証する。コンサルの得意技がそのまま活きる段階。' },
      { k: '予測', q: '何が起きる？', tool: '機械学習', d: '<strong>予測的分析</strong>：来月も5%前後の減少が続く見込み（予測幅つき）。過去のパターンから未来を見積もる。精度と「外れたときの影響」をセットで考える。' },
      { k: '処方', q: '何をすべき？', tool: '最適化', d: '<strong>処方的分析</strong>：どの客層に、いくらのクーポンを配れば利益が最大になるか。予測に「打ち手の選択」を組み合わせる。価値は最大だが、業務への組み込みも最も難しい。' }
    ];
    const X0 = 60, Y1 = 290, sw = 118, sh = 58;
    const marker = DS.arrow(s, 's-ink3');
    svg('line', { x1: X0 - 10, y1: Y1 + 10, x2: W - 20, y2: Y1 + 10, class: 'st-ink3', 'marker-end': marker }, s);
    svg('line', { x1: X0 - 10, y1: Y1 + 10, x2: X0 - 10, y2: 20, class: 'st-ink3', 'marker-end': marker }, s);
    svg('text', { x: W - 20, y: Y1 + 52, 'text-anchor': 'end', class: 't-sm', text: '難しさ →' }, s);
    svg('text', { x: X0 - 4, y: Y1 + 52, class: 't-xs', text: '使う道具' }, s);
    svg('text', { x: X0 - 4, y: 26, class: 't-sm', text: 'ビジネス価値' }, s);
    const gs = st.map((o, i) => {
      const g = DS.node(s, () => sel(i), o.k);
      const x = X0 + i * sw, y = Y1 - (i + 1) * sh;
      svg('rect', { x: x, y: y, width: sw - 6, height: (i + 1) * sh, rx: 4, class: 'hit st-ink ' + ['s-surface', 's-aisoft', 's-wksoft', 's-ymsoft'][i], 'stroke-width': 1.5 }, g);
      svg('text', { x: x + 12, y: y + 26, class: 't-lg', text: o.k }, g);
      svg('text', { x: x + 12, y: y + 46, class: 'hand', 'font-size': 14, text: o.q }, g);
      svg('text', { x: x + (sw - 6) / 2, y: Y1 + 30, 'text-anchor': 'middle', class: 't-xs', text: o.tool }, g);
      return g;
    });
    const walker = svg('g', { class: 'dot' }, s);
    svg('circle', { r: 9, class: 's-bn' }, walker);
    const pos = st.map((o, i) => [X0 + i * sw + sw - 26, Y1 - (i + 1) * sh - 12]);
    function sel(i) { gs.forEach((g, j) => g.classList.toggle('is-on', i === j)); DS.explain(ex, st[i].d); DS.move(walker, pos[i][0], pos[i][1]); }
    walker.style.transition = 'none'; sel(0); walker.getBoundingClientRect(); walker.style.transition = '';
    return { play() { let i = 1; const t = setInterval(() => { sel(i); if (++i > 3) clearInterval(t); }, 1300); } };
  });

  /* =========================================================
     1-4 CRISP-DM の循環
     ========================================================= */
  DS.register('crisp', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 470, cx = 290, cy = 205, R = 150;
    const s = DS.stageSvg(f.stage, W, H, { label: 'CRISP-DMの6つのフェーズの循環図' });
    const ex = f.add('fig__explain');
    const ph = [
      { k: 'ビジネス理解', c: 3, d: '<strong>ビジネス理解</strong>：何を決めるための分析か、成功の基準は何かを定める。<br>成果物：目的・KPI・制約の合意。<strong>コンサルが主導するフェーズ。</strong>ここが曖昧だと、後工程がすべて無駄になる。' },
      { k: 'データ理解', c: 2, d: '<strong>データ理解</strong>：使えるデータの所在・量・質・意味を確かめる。<br>成果物：データ棚卸し、初期集計。業務部門への聞き取りが鍵で、コンサルが伴走する。' },
      { k: 'データ準備', c: 1, d: '<strong>データ準備</strong>：欠損・表記ゆれの処理、結合、特徴量づくり。<br>工数が最もかかる工程。コンサルは進捗と「業務上の意味」を確認する役。' },
      { k: 'モデリング', c: 1, d: '<strong>モデリング</strong>：手法を選び、モデルを学習させる。<br>データサイエンティストの主戦場。コンサルは「何を予測させるか」がぶれていないかを見る。' },
      { k: '評価', c: 3, d: '<strong>評価</strong>：精度だけでなく、ビジネス目標を満たすかで判断する。<br>「正解率90%」が業務で役に立つかは別問題。<strong>コンサルが主導して判断する。</strong>' },
      { k: '展開', c: 2, d: '<strong>展開</strong>：業務に組み込み、運用し、効果を測る。<br>現場の使い方、責任分担、モニタリングを設計する。ここで止まる案件が非常に多い。' }
    ];
    svg('circle', { cx: cx, cy: cy, r: R, class: 'st-rule nofill', 'stroke-width': 10 }, s);
    const orbit = 'M' + (cx) + ' ' + (cy - R) + 'A' + R + ' ' + R + ' 0 1 1 ' + (cx - 0.01) + ' ' + (cy - R);
    svg('path', { d: orbit, class: 'st-ai nofill', 'stroke-width': 2, 'stroke-dasharray': '2 8', opacity: 0.6 }, s);
    DS.flow(s, orbit, { n: 2, r: 6, dur: 9, cls: 's-ym' });
    // 中央
    svg('circle', { cx: cx, cy: cy, r: 50, class: 's-aisoft' }, s);
    DS.svgIcon(s, 'database', cx - 16, cy - 30, 32, 'si-ai');
    svg('text', { x: cx, y: cy + 22, 'text-anchor': 'middle', class: 't-sm', text: 'データ' }, s);
    // 戻り矢印
    const back = DS.arrow(s, 's-bn');
    const gs = ph.map((o, i) => {
      const ang = (-90 + i * 60) * Math.PI / 180;
      const x = cx + R * Math.cos(ang), y = cy + R * Math.sin(ang);
      const g = DS.node(s, () => sel(i), o.k);
      svg('rect', { x: x - 62, y: y - 24, width: 124, height: 48, rx: 24, class: 'hit s-surface st-ink', 'stroke-width': 1.5 }, g);
      svg('text', { x: x, y: y + 1, 'text-anchor': 'middle', class: 't-lg', 'font-size': 14.5, text: o.k }, g);
      for (let k = 0; k < 3; k++) svg('circle', { cx: x - 10 + k * 10, cy: y + 13, r: 3, class: k < o.c ? 's-ai' : 's-grid' }, g);
      o.x = x; o.y = y;
      return g;
    });
    const p = (a, b2, bend) => {
      const mx = (a.x + b2.x) / 2, my = (a.y + b2.y) / 2;
      const qx = mx + (cx - mx) * bend, qy = my + (cy - my) * bend;
      return 'M' + a.x + ' ' + a.y + 'Q' + qx + ' ' + qy + ' ' + b2.x + ' ' + b2.y;
    };
    const bpath = (a, b2) => {
      const k = 0.36;
      const A = { x: a.x + (cx - a.x) * k, y: a.y + (cy - a.y) * k }, B = { x: b2.x + (cx - b2.x) * k, y: b2.y + (cy - b2.y) * k };
      return p(A, B, 0.15);
    };
    svg('path', { d: bpath(ph[1], ph[0]), class: 'st-bn nofill', 'stroke-width': 1.5, 'stroke-dasharray': '4 3', 'marker-end': back }, s);
    svg('path', { d: bpath(ph[3], ph[2]), class: 'st-bn nofill', 'stroke-width': 1.5, 'stroke-dasharray': '4 3', 'marker-end': back }, s);
    svg('path', { d: bpath(ph[4], ph[0]), class: 'st-bn nofill', 'stroke-width': 1.5, 'stroke-dasharray': '4 3', 'marker-end': back }, s);
    svg('text', { x: 16, y: H - 30, class: 'hand t-bn', 'font-size': 14, text: '点線の矢印＝前の工程に戻る（よくある）' }, s);
    svg('text', { x: 16, y: H - 10, class: 't-xs', text: '●の数＝コンサルの関与度（3：主導、2：伴走、1：確認）' }, s);
    function sel(i) { gs.forEach((g, j) => g.classList.toggle('is-on', i === j)); DS.explain(ex, ph[i].d); }
    sel(0);
  });

  /* =========================================================
     1-5 3つのスキル（ベン図）
     ========================================================= */
  DS.register('venn', function (el) {
    const f = DS.frame(el);
    const W = 560, H = 360;
    const s = DS.stageSvg(f.stage, W, H, { label: 'ビジネス力、データサイエンス力、データエンジニアリング力の3つのスキル' });
    const ex = f.add('fig__explain');
    const C = [
      { k: 'ビジネス力', sub: '課題を整理し、解決に導く', x: 210, y: 140, cls: 's-ym' },
      { k: 'データサイエンス力', sub: '統計・機械学習を使いこなす', x: 350, y: 140, cls: 's-ai' },
      { k: 'データエンジニアリング力', sub: 'データを集め、使える形にする', x: 280, y: 250, cls: 's-wk' }
    ];
    const circles = C.map(c => svg('circle', { cx: c.x, cy: c.y, r: 105, class: c.cls + ' st-ink', 'stroke-width': 1.2, 'fill-opacity': 0.3, style: 'transition: fill-opacity .6s ease' }, s));
    const lab = [[168, 116], [392, 116], [280, 318]];
    C.forEach((c, i) => {
      svg('text', { x: lab[i][0], y: lab[i][1], 'text-anchor': 'middle', class: 't-lg', 'font-size': 15, text: c.k }, s);
      svg('text', { x: lab[i][0], y: lab[i][1] + 20, 'text-anchor': 'middle', class: 't-sm', text: c.sub }, s);
    });
    const modes = {
      all: { v: [0.12, 0.08, 0.06], d: '<strong>全コンサル（L1）</strong>：ビジネス力を土台に、データサイエンスとエンジニアリングは「用語と考え方がわかる」水準。AIの出力を鵜呑みにせず、問いと結果の妥当性を確認できればよい。' },
      lead: { v: [0.55, 0.3, 0.14], d: '<strong>推進役（L2）</strong>：ビジネス力を武器に、データサイエンスは「手法の向き不向きと評価を判断できる」水準、エンジニアリングは「基盤や運用の論点を理解している」水準。両者をつなぐ<strong>翻訳者</strong>になる。' },
      ds: { v: [0.35, 0.55, 0.45], d: '<strong>データサイエンティスト（L3）</strong>：3つすべてを一定以上の水準で持つ。ただし一人で全部を極める人は少なく、実務はチームで補い合う。コンサルはこの人たちと対等に議論できる相手になる。' }
    };
    function set(m) { circles.forEach((c, i) => c.setAttribute('fill-opacity', modes[m].v[i])); DS.explain(ex, modes[m].d); }
    f.controls.appendChild(DS.seg([{ value: 'all', label: '全コンサル' }, { value: 'lead', label: '推進役' }, { value: 'ds', label: 'データサイエンティスト' }], 'lead', set, '比べる人物像'));
    set('lead');
    f.add('fig__note', '出典：一般社団法人データサイエンティスト協会「データサイエンティストのスキルチェックリスト」の3つのスキルセットをもとに作図。塗りの濃さは本サイトによる目安。');
  });

  /* =========================================================
     2-1 データの種類を仕分ける
     ========================================================= */
  DS.register('data-types', function (el) {
    const f = DS.frame(el);
    const items = [
      ['売上明細', 'table', 's'], ['顧客マスタ', 'table', 's'], ['アンケート選択式', 'clipboard', 's'],
      ['Webアクセスログ', 'code', 'm'], ['センサーのJSON', 'sensor', 'm'], ['問い合わせメール', 'mail', 'u'],
      ['契約書PDF', 'doc', 'u'], ['店内カメラ映像', 'video', 'u'], ['コールセンター音声', 'mic', 'u'],
      ['SNSの投稿', 'chat', 'u'], ['商品画像', 'image', 'u'], ['アンケート自由記述', 'pen', 'u']
    ];
    const board = h('div', { class: 'sort-board' });
    const pool = h('div', { class: 'sort-pool' });
    const binsWrap = h('div', { class: 'sort-bins' });
    const binDef = {
      s: ['構造化データ', '行と列の表。集計・機械学習にそのまま使いやすい。'],
      m: ['半構造化データ', 'タグや項目名つき。少し加工すれば表にできる。'],
      u: ['非構造化データ', '文章・画像・音声。企業データの大半を占めるとされ、生成AIで扱いやすくなった。']
    };
    const bins = {};
    Object.keys(binDef).forEach(k => {
      const b = h('div', { class: 'sort-bin' }, '<h4>' + binDef[k][0] + '</h4><p>' + binDef[k][1] + '</p>');
      bins[k] = h('div', { class: 'sort-pool' });
      b.appendChild(bins[k]);
      binsWrap.appendChild(b);
    });
    const order = [5, 0, 9, 3, 7, 1, 11, 4, 8, 2, 10, 6];
    const tiles = items.map(it => h('span', { class: 'tile', 'data-k': it[2] }, DS.icon(it[1]) + it[0]));
    order.forEach(i => pool.appendChild(tiles[i]));
    board.append(pool, binsWrap);
    f.stage.appendChild(board);
    let sorted = false;
    function flip(apply) {
      const first = tiles.map(t => t.getBoundingClientRect());
      apply();
      tiles.forEach((t, i) => {
        const last = t.getBoundingClientRect();
        const dx = first[i].left - last.left, dy = first[i].top - last.top;
        if (DS.reduced || (!dx && !dy)) return;
        t.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 700, delay: i * 40, easing: 'cubic-bezier(.6,.05,.25,1)', fill: 'backwards' });
      });
    }
    const btn = DS.button('仕分ける', 'layers', () => {
      sorted = !sorted;
      flip(() => {
        if (sorted) tiles.forEach(t => { t.classList.add('k-' + t.dataset.k); bins[t.dataset.k].appendChild(t); });
        else { tiles.forEach(t => t.classList.remove('k-s', 'k-m', 'k-u')); order.forEach(i => pool.appendChild(tiles[i])); }
      });
      pool.hidden = sorted;
      DS.setLabel(btn, sorted ? '混ぜ直す' : '仕分ける', sorted ? 'replay' : 'layers');
    });
    f.controls.appendChild(btn);
    return { play() { if (!sorted) setTimeout(() => btn.click(), 600); } };
  });

  /* =========================================================
     2-2 尺度（名義・順序・間隔・比例）
     ========================================================= */
  DS.register('scales', function (el) {
    const f = DS.frame(el);
    const rows = [
      ['名義尺度', '質的', '性別、都道府県、商品カテゴリ', ['○', '×', '×', '×'], '最頻値'],
      ['順序尺度', '質的', '満足度（5段階）、会員ランク', ['○', '○', '×', '×'], '中央値'],
      ['間隔尺度', '量的', '気温（℃）、西暦', ['○', '○', '○', '×'], '平均'],
      ['比例尺度', '量的', '売上金額、年齢、来店回数', ['○', '○', '○', '○'], '平均・比率']
    ];
    const t = h('div', { class: 'tbl-wrap' });
    t.innerHTML = '<table class="tbl"><thead><tr><th>尺度</th><th>種類</th><th>例</th><th class="c">同じ/違う</th><th class="c">大小・順番</th><th class="c">差（足し引き）</th><th class="c">比（何倍）</th><th>代表値</th></tr></thead><tbody>' +
      rows.map((r, i) => '<tr data-i="' + i + '"><td><strong>' + r[0] + '</strong></td><td><span class="tag ' + (r[1] === '量的' ? 'tag--wk' : '') + '">' + r[1] + '</span></td><td>' + r[2] + '</td>' + r[3].map(x => '<td class="c">' + (x === '○' ? DS.icon('check') : '<span style="color:var(--ink-3)">—</span>') + '</td>').join('') + '<td>' + r[4] + '</td></tr>').join('') + '</tbody></table>';
    f.stage.appendChild(t);
    const qs = [
      ['満足度「5」は「1」の5倍満足？', 1, '満足度は<strong>順序尺度</strong>。順番には意味があるが、差や比には意味がない。「平均満足度3.8」は便利だが、5段階の間隔が等しいという仮定を置いていることを意識する。'],
      ['気温20℃は10℃の2倍暑い？', 2, '気温（℃）は<strong>間隔尺度</strong>。0℃は「熱がない」わけではないので、比（何倍）は意味を持たない。差（10℃上がった）には意味がある。'],
      ['顧客IDの平均を出す？', 0, '顧客IDや郵便番号は数字でも<strong>名義尺度</strong>。平均を取っても意味がない。データ項目が数字かどうかではなく、何を表すかで扱いを決める。'],
      ['売上が前年の1.2倍？', 3, '売上金額は<strong>比例尺度</strong>。0が「売上なし」を意味するので、差も比も計算できる。']
    ];
    const chips = h('div', { class: 'chips', style: 'margin-top:14px' });
    const ex = f.add('fig__explain');
    const trs = t.querySelectorAll('tbody tr');
    qs.forEach((q, i) => {
      const c = h('button', { type: 'button', class: 'chip', 'aria-pressed': 'false' }, q[0]);
      c.addEventListener('click', () => {
        chips.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', String(x === c)));
        trs.forEach((tr, j) => { tr.style.background = j === q[1] ? 'var(--ai-soft)' : ''; });
        DS.explain(ex, q[2]);
      });
      chips.appendChild(c);
    });
    f.stage.appendChild(chips);
    chips.firstChild.click();
  });

  /* =========================================================
     2-3 汚れたデータを見つけて直す
     ========================================================= */
  DS.register('dirty-data', function (el) {
    const f = DS.frame(el);
    const rows = [
      ['1001', '山田 太郎', '東京都', '34', '12,800'],
      ['1002', '佐藤 花子', '東京', '29', '8,400'],
      ['1003', '鈴木 一郎', '大阪府', '', '15,200'],
      ['1002', '佐藤 花子', '東京', '29', '8,400'],
      ['1004', '田中 美咲', 'Tokyo', '41', '9,900'],
      ['1005', '高橋 健', '神奈川県', '250', '11,300'],
      ['1006', '伊藤 優', '大阪府', '38', '13']
    ];
    const issues = [
      { r: 1, c: 2, tag: '表記ゆれ', fix: '東京都' },
      { r: 4, c: 2, tag: '表記ゆれ', fix: '東京都' },
      { r: 2, c: 3, tag: '欠損', fix: '空欄のまま区別' },
      { r: 3, c: -1, tag: '重複', fix: '' },
      { r: 5, c: 3, tag: '異常値', fix: '要確認（25？）' },
      { r: 6, c: 4, tag: '単位違い', fix: '13,000' }
    ];
    const wrap = h('div', { class: 'tbl-wrap' });
    wrap.innerHTML = '<table class="tbl dirty"><thead><tr><th>顧客ID</th><th>氏名</th><th>都道府県</th><th class="num">年齢</th><th class="num">購入額（円）</th></tr></thead><tbody>' +
      rows.map(r => '<tr>' + r.map((v, i) => '<td' + (i >= 3 ? ' class="num"' : '') + '>' + (v || '&nbsp;') + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
    f.stage.appendChild(wrap);
    const trs = wrap.querySelectorAll('tbody tr');
    const ex = f.add('fig__explain', 'このデータで「都道府県別の平均購入額」を出すと、東京が3つに分かれ、佐藤さんは2回数えられ、伊藤さんの13円が平均を押し下げます。まず「問題を探す」を押してください。');
    let state = 0;
    const cell = (is) => is.c >= 0 ? trs[is.r].children[is.c] : null;
    const b1 = DS.button('問題を探す', 'search', () => {
      if (state !== 0) return;
      state = 1;
      issues.forEach((is, k) => setTimeout(() => {
        if (is.c < 0) trs[is.r].querySelectorAll('td').forEach(td => td.classList.add('bad'));
        else cell(is).classList.add('bad');
        const target = is.c < 0 ? trs[is.r].children[1] : cell(is);
        target.insertAdjacentHTML('beforeend', '<span class="note">' + is.tag + '</span>');
      }, DS.reduced ? 0 : k * 350));
      DS.explain(ex, '見つかった問題：<strong>表記ゆれ</strong>（東京／東京都／Tokyo）、<strong>欠損</strong>（年齢が空）、<strong>重複</strong>（同じ行が2回）、<strong>異常値</strong>（年齢250歳）、<strong>単位違い</strong>（千円単位で入力された13）。次に「きれいにする」を押してください。');
      b1.disabled = true; b2.disabled = false;
    });
    const b2 = DS.button('きれいにする', 'wrench', () => {
      if (state !== 1) return;
      state = 2;
      issues.forEach(is => {
        if (is.c < 0) { trs[is.r].classList.add('is-gone'); trs[is.r].querySelectorAll('td').forEach(td => td.classList.remove('bad')); return; }
        const td = cell(is);
        td.classList.remove('bad'); td.classList.add('fixed');
        td.innerHTML = is.fix + '<span class="note">' + is.tag + 'を修正</span>';
      });
      DS.explain(ex, 'ポイントは、<strong>直し方そのものが判断</strong>だということ。欠損を平均で埋めるか、空欄のまま扱うか。250歳は25歳の誤入力か、削除か。どれも業務を知る人と決める必要があり、その判断を記録に残すことがコンサルの仕事になる。');
      b2.disabled = true;
    });
    b2.disabled = true;
    const b3 = DS.button('元に戻す', 'replay', () => { state = 0; f.el.dataset.widget && DS.widgets['dirty-data'](el); });
    f.controls.append(b1, b2, b3);
    const tb = f.add('', '<p class="fig__note" style="margin-top:16px">データサイエンティストの作業時間の内訳（Anaconda「State of Data Science 2020」）</p><div class="timebar" role="img" aria-label="データの読み込み19%、クレンジング26%、その他55%">' +
      '<span style="width:19%;background:var(--beni);color:var(--on-accent)">読込 19%</span><span style="width:26%;background:var(--yamabuki);color:var(--ink)">クレンジング 26%</span><span style="width:55%;background:var(--grid);color:var(--ink-2)">可視化・モデル構築・報告など 55%</span></div>');
    void tb;
  });

  /* =========================================================
     2-4 データ基盤の流れ
     ========================================================= */
  DS.register('platform', function (el) {
    const f = DS.frame(el);
    const W = 700, H = 360;
    const s = DS.stageSvg(f.stage, W, H, { scroll: true, label: 'データの発生源から活用までの流れ' });
    const ex = f.add('fig__explain');
    const cols = [
      { x: 70, title: '発生源', items: [['POS・販売', 'store'], ['ECサイト', 'cart'], ['CRM・会員', 'users'], ['IoTセンサー', 'sensor'], ['外部データ', 'globe']] },
      { x: 250, title: '収集・加工', items: [['ETL / ELT', 'gear']] },
      { x: 420, title: '蓄積', items: [['データレイク', 'layers'], ['DWH', 'database']] },
      { x: 610, title: '活用', items: [['BI・可視化', 'chart-bar'], ['機械学習', 'network'], ['生成AI・RAG', 'sparkle']] }
    ];
    const desc = {
      '発生源': '<strong>発生源</strong>：業務システムや外部サービスに散らばった状態。部門ごとに別システムで、顧客IDがつながらないことが多い（サイロ化）。',
      'ETL / ELT': '<strong>ETL / ELT</strong>：抽出（Extract）・変換（Transform）・格納（Load）の処理。データを定期的に集め、形をそろえる。地味だが、ここが壊れると分析もAIも止まる。',
      'データレイク': '<strong>データレイク</strong>：生のデータを形式を問わずそのまま貯める場所。画像やログも入る。何でも入る代わりに、整理しないと「データの沼」になる。',
      'DWH': '<strong>DWH（データウェアハウス）</strong>：分析しやすいように整理・統合された表を貯める倉庫。売上や顧客の「正しい数字」の拠り所になる。',
      'BI・可視化': '<strong>BI</strong>：ダッシュボードで現状を見える化する。記述・診断の分析を担う。',
      '機械学習': '<strong>機械学習</strong>：DWHのデータから予測モデルをつくり、業務システムに予測結果を戻す。',
      '生成AI・RAG': '<strong>生成AI・RAG</strong>：社内文書やデータを検索してLLMに渡し、回答させる。非構造化データの出番。',
      'ガバナンス': '<strong>データガバナンス</strong>：誰がどのデータを使ってよいか、定義は何か、品質は保たれているか。全体を横断するルールと体制。'
    };
    const pos = {};
    cols.forEach(c => {
      svg('text', { x: c.x, y: 22, 'text-anchor': 'middle', class: 't-sm', 'font-weight': 700, text: c.title }, s);
      const n = c.items.length, gap = 52, top = 150 - (n - 1) * gap / 2;
      c.items.forEach((it, i) => { pos[it[0]] = { x: c.x, y: top + i * gap, icon: it[1] }; });
    });
    const links = [];
    cols[0].items.forEach(it => links.push([it[0], 'ETL / ELT']));
    links.push(['ETL / ELT', 'データレイク'], ['ETL / ELT', 'DWH'], ['データレイク', 'DWH'], ['DWH', 'BI・可視化'], ['DWH', '機械学習'], ['データレイク', '生成AI・RAG'], ['DWH', '生成AI・RAG']);
    const lg = svg('g', {}, s);
    links.forEach(l => {
      const a = pos[l[0]], b = pos[l[1]];
      const x1 = a.x + 62, x2 = b.x - 62;
      const d = a.x === b.x ? 'M' + a.x + ' ' + (a.y + 18) + 'L' + b.x + ' ' + (b.y - 18) : 'M' + x1 + ' ' + a.y + 'C' + (x1 + 40) + ' ' + a.y + ' ' + (x2 - 40) + ' ' + b.y + ' ' + x2 + ' ' + b.y;
      svg('path', { d: d, class: 'st-rule nofill', 'stroke-width': 1.5 }, lg);
      DS.flow(lg, d, { n: 2, r: 3, dur: 2.8, cls: 's-ai' });
    });
    const nodes = {};
    Object.keys(pos).forEach(k => {
      const p = pos[k];
      const g = DS.node(s, () => sel(k), k);
      svg('rect', { x: p.x - 62, y: p.y - 18, width: 124, height: 36, rx: 6, class: 'hit s-surface st-ink', 'stroke-width': 1.2 }, g);
      DS.svgIcon(g, p.icon, p.x - 54, p.y - 10, 20, 'si-ai');
      svg('text', { x: p.x - 28, y: p.y + 5, class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: k }, g);
      nodes[k] = g;
    });
    const gov = DS.node(s, () => sel('ガバナンス'), 'ガバナンス');
    svg('rect', { x: 10, y: 300, width: W - 20, height: 40, rx: 6, class: 'hit s-ymsoft st-ink', 'stroke-width': 1.2 }, gov);
    DS.svgIcon(gov, 'shield', 24, 309, 22, '');
    svg('text', { x: 54, y: 326, class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: 'データガバナンス：定義・権限・品質・セキュリティを全体で管理する' }, gov);
    nodes['ガバナンス'] = gov;
    function sel(k) { Object.keys(nodes).forEach(n => nodes[n].classList.toggle('is-on', n === k)); DS.explain(ex, desc[k] || desc['発生源']); }
    sel('DWH');
    ['POS・販売', 'ECサイト', 'CRM・会員', 'IoTセンサー', '外部データ'].forEach(k => nodes[k].addEventListener('click', () => DS.explain(ex, desc['発生源'])));
  });

  /* =========================================================
     2-5 目的別のグラフ選び
     ========================================================= */
  DS.register('chart-chooser', function (el) {
    const f = DS.frame(el);
    const W = 540, H = 290, X0 = 56, X1 = 520, Y0 = 20, Y1 = 250;
    const s = DS.stageSvg(f.stage, W, H, { label: '目的に応じたグラフの例' });
    const ex = f.add('fig__explain');
    const r = DS.rng(11);
    const purposes = {
      comp: { label: '比較', chart: '棒グラフ（並べ替える）', d: '<strong>比較</strong>なら棒グラフ。大きい順に並べ替え、軸は0から始める。3D表現や色の使いすぎは避け、伝えたい1本だけを強調する。' },
      trend: { label: '推移', chart: '折れ線グラフ', d: '<strong>推移</strong>なら折れ線グラフ。時間を横軸に。系列は多くても4本程度まで。季節性があるなら前年同月と比べる。' },
      comp2: { label: '構成', chart: '100%積み上げ棒', d: '<strong>構成比</strong>なら100%積み上げ棒。2時点以上の比較に強い。円グラフは項目が3つ程度までなら可。項目が多い円グラフは読めない。' },
      dist: { label: '分布', chart: 'ヒストグラム', d: '<strong>分布</strong>ならヒストグラム。平均だけでは見えない偏りや山の数がわかる。購入額のように右に長く裾を引く分布はビジネスでよく現れる。' },
      rel: { label: '関係', chart: '散布図', d: '<strong>2つの量の関係</strong>なら散布図。右上がりなら正の相関。ただし相関は因果ではない（モジュール3で扱う）。' }
    };
    const g = svg('g', {}, s);
    const axis = svg('g', { class: 'axis' }, s);
    svg('line', { x1: X0, y1: Y1, x2: X1, y2: Y1 }, axis);
    svg('line', { x1: X0, y1: Y0, x2: X0, y2: Y1 }, axis);
    function grow(node, i) { if (DS.reduced) return; node.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 450, delay: i * 30, fill: 'backwards', easing: 'ease-out' }); }
    function draw(k) {
      DS.clear(g);
      const sy = DS.lin(0, 100, Y1, Y0);
      if (k === 'comp') {
        const d = [['新宿', 92], ['渋谷', 78], ['池袋', 64], ['横浜', 51], ['大宮', 38]];
        const bw = (X1 - X0) / d.length;
        d.forEach((v, i) => {
          const rc = svg('rect', { x: X0 + i * bw + 12, y: sy(v[1]), width: bw - 24, height: Y1 - sy(v[1]), class: i === 0 ? 's-ai' : 's-grid', rx: 2 }, g);
          svg('text', { x: X0 + i * bw + bw / 2, y: Y1 + 18, 'text-anchor': 'middle', class: 't-sm', text: v[0] }, g);
          svg('text', { x: X0 + i * bw + bw / 2, y: sy(v[1]) - 6, 'text-anchor': 'middle', class: 't-sm', text: v[1] }, g);
          grow(rc, i);
        });
        svg('text', { x: X0, y: Y0 - 6, class: 't-xs', text: '店舗別売上（百万円）' }, g);
      } else if (k === 'trend') {
        const a = [52, 48, 55, 61, 58, 66, 72, 70, 64, 68, 75, 88], b = [45, 44, 49, 52, 54, 57, 60, 61, 58, 60, 66, 79];
        const sx = DS.lin(0, 11, X0 + 14, X1 - 10);
        [[b, 'st-ink3', '前年'], [a, 'st-ai', '今年']].forEach((sr, si) => {
          const p = svg('path', { d: 'M' + sr[0].map((v, i) => sx(i) + ' ' + sy(v)).join('L'), class: sr[1] + ' nofill', 'stroke-width': si ? 3 : 2 }, g);
          svg('text', { x: X1 - 4, y: sy(sr[0][11]) - 8, 'text-anchor': 'end', class: 't-sm', text: sr[2] }, g);
          if (!DS.reduced) { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 900, easing: 'ease-out' }); }
        });
        for (let i = 0; i < 12; i += 2) svg('text', { x: sx(i), y: Y1 + 18, 'text-anchor': 'middle', class: 't-xs', text: (i + 1) + '月' }, g);
      } else if (k === 'comp2') {
        const yrs = [['2024年', [58, 30, 12]], ['2026年', [41, 38, 21]]];
        const names = ['店舗', 'EC', 'アプリ'], cls = ['s-ink3', 's-ai', 's-ym'];
        yrs.forEach((yy, i) => {
          const y = Y0 + 30 + i * 90; let x = X0 + 10;
          svg('text', { x: X0 - 6, y: y + 30, 'text-anchor': 'end', class: 't-sm', text: yy[0] }, g);
          yy[1].forEach((v, j) => {
            const w = (X1 - X0 - 20) * v / 100;
            const rc = svg('rect', { x: x, y: y, width: w - 2, height: 48, class: cls[j] }, g);
            svg('text', { x: x + 8, y: y + 29, class: j === 0 ? 't-sm t-on' : 't-sm', 'font-weight': 700, fill: j === 2 ? 'var(--ink)' : 'var(--on-accent)', text: names[j] + ' ' + v + '%' }, g);
            grow(rc, j); x += w;
          });
        });
        svg('text', { x: X0, y: Y0 - 6, class: 't-xs', text: '販売チャネル別の売上構成比' }, g);
      } else if (k === 'dist') {
        const bins = [4, 11, 19, 22, 17, 12, 8, 5, 3, 2, 1, 1];
        const bw = (X1 - X0) / bins.length;
        const sy2 = DS.lin(0, 25, Y1, Y0);
        bins.forEach((v, i) => { const rc = svg('rect', { x: X0 + i * bw + 1, y: sy2(v), width: bw - 2, height: Y1 - sy2(v), class: 's-ai' }, g); grow(rc, i); });
        ['0', '1万', '2万', '3万'].forEach((t, i) => svg('text', { x: X0 + i * bw * 4, y: Y1 + 18, 'text-anchor': 'middle', class: 't-xs', text: t }, g));
        svg('text', { x: X0 + bw * 7, y: sy2(14), class: 'hand', text: '右に長い裾＝一部の大口客' }, g);
        svg('text', { x: X0, y: Y0 - 6, class: 't-xs', text: '1回あたり購入額の分布（人数）' }, g);
      } else {
        const sx = DS.lin(0, 100, X0 + 10, X1 - 10);
        for (let i = 0; i < 40; i++) {
          const x = r() * 100, y = DS.clamp(15 + 0.65 * x + DS.randn(r) * 9, 2, 98);
          const c = svg('circle', { cx: sx(x), cy: sy(y), r: 5, class: 's-ai', opacity: 0.8 }, g); grow(c, i % 10);
        }
        svg('text', { x: X1, y: Y1 + 18, 'text-anchor': 'end', class: 't-xs', text: '広告費 →' }, g);
        svg('text', { x: X0, y: Y0 - 6, class: 't-xs', text: '売上 ↑' }, g);
      }
      DS.explain(ex, purposes[k].d);
    }
    f.controls.appendChild(DS.seg(Object.keys(purposes).map(k => ({ value: k, label: purposes[k].label })), 'comp', draw, '伝えたいこと'));
    draw('comp');
  });

  /* =========================================================
     3-1 平均と中央値
     ========================================================= */
  DS.register('mean-median', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 210, X0 = 30, X1 = 520, Y = 120;
    const s = DS.stageSvg(f.stage, W, H, { label: '社員の年収の分布と平均・中央値' });
    const base = [380, 420, 450, 480, 500, 520, 560, 610, 680];
    const sx = DS.lin(300, 900, X0, X1);
    const axis = svg('g', { class: 'axis' }, s);
    svg('line', { x1: X0, y1: Y, x2: X1, y2: Y }, axis);
    [300, 400, 500, 600, 700, 800, 900].forEach(v => { svg('line', { x1: sx(v), x2: sx(v), y1: Y, y2: Y + 5 }, axis); svg('text', { x: sx(v), y: Y + 20, 'text-anchor': 'middle', class: 't-xs', text: v }, s); });
    svg('text', { x: X1, y: Y + 40, 'text-anchor': 'end', class: 't-xs', text: '年収（万円）' }, s);
    // 省略記号
    svg('path', { d: 'M' + (X1 + 8) + ' ' + (Y - 6) + 'l6 12M' + (X1 + 14) + ' ' + (Y - 6) + 'l6 12', class: 'st-ink3', 'stroke-width': 1.5 }, s);
    base.forEach(v => { svg('circle', { cx: sx(v), cy: Y - 14, r: 8, class: 's-ai' }, s); });
    const ceo = svg('g', { class: 'dot', opacity: 0 }, s);
    svg('circle', { cx: 0, cy: 0, r: 10, class: 's-bn' }, ceo);
    const ceoLabel = svg('text', { x: 12, y: -18, 'text-anchor': 'end', class: 'hand t-bn', 'font-size': 14 }, ceo);
    DS.move(ceo, X1 + 40, Y - 14);
    const meanG = svg('g', { class: 'dot' }, s), medG = svg('g', { class: 'dot' }, s);
    svg('line', { x1: 0, x2: 0, y1: 26, y2: Y - 2, class: 'st-bn', 'stroke-width': 2.5 }, meanG);
    svg('text', { x: 0, y: 20, 'text-anchor': 'middle', class: 't-sm t-bn', 'font-weight': 700, text: '平均' }, meanG);
    svg('line', { x1: 0, x2: 0, y1: 50, y2: Y - 2, class: 'st-wk', 'stroke-width': 2.5, 'stroke-dasharray': '5 3' }, medG);
    svg('text', { x: 0, y: 44, 'text-anchor': 'middle', class: 't-sm t-wk', 'font-weight': 700, text: '中央値' }, medG);
    const out = f.add('fig__out');
    let withCeo = false, ceoVal = 3000;
    function upd(first) {
      const arr = base.concat(withCeo ? [ceoVal] : []).sort((a, b) => a - b);
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      const n = arr.length;
      const med = n % 2 ? arr[(n - 1) / 2] : (arr[n / 2 - 1] + arr[n / 2]) / 2;
      const below = arr.filter(v => v < mean).length;
      if (first) { meanG.style.transition = medG.style.transition = 'none'; }
      DS.move(meanG, Math.min(sx(mean), X1 + 4), 0); DS.move(medG, sx(med), 0);
      if (first) { meanG.getBoundingClientRect(); meanG.style.transition = medG.style.transition = ''; }
      ceo.setAttribute('opacity', withCeo ? 1 : 0);
      ceoLabel.textContent = '社長 ' + DS.fmt(ceoVal) + '万円';
      out.innerHTML = '<span>平均 <b>' + DS.fmt(mean) + '</b> 万円</span><span>中央値 <b>' + DS.fmt(med) + '</b> 万円</span><span>平均より下の人 <b>' + below + '</b> / ' + n + ' 人</span>';
    }
    const tgl = DS.button('社長を加える', 'user', () => { withCeo = !withCeo; DS.setLabel(tgl, withCeo ? '社長を外す' : '社長を加える', 'user'); tgl.setAttribute('aria-pressed', String(withCeo)); upd(); });
    const sl = DS.slider({ label: '社長の年収', min: 800, max: 6000, step: 100, value: 3000, fmt: v => DS.fmt(v) + '万円', onInput: v => { ceoVal = v; if (!withCeo) { withCeo = true; tgl.setAttribute('aria-pressed', 'true'); DS.setLabel(tgl, '社長を外す', 'user'); } upd(); } });
    f.controls.append(tgl, sl);
    upd(true);
    return { play() { setTimeout(() => { if (!withCeo) tgl.click(); }, 700); } };
  });

  /* =========================================================
     3-2 ばらつき（標準偏差）
     ========================================================= */
  DS.register('spread', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 270, X0 = 30, X1 = 560, Y0 = 20, Y1 = 220;
    const s = DS.stageSvg(f.stage, W, H, { label: '平均が同じでばらつきが異なる2つの配送日数の分布' });
    const sx = DS.lin(0, 8, X0, X1);
    const axis = svg('g', { class: 'axis' }, s);
    svg('line', { x1: X0, y1: Y1, x2: X1, y2: Y1 }, axis);
    for (let d = 0; d <= 8; d++) svg('text', { x: sx(d), y: Y1 + 18, 'text-anchor': 'middle', class: 't-xs', text: d + '日' }, s);
    const late = svg('path', { class: 's-bnsoft' }, s);
    const band2 = svg('path', { class: 's-aisoft', opacity: 0.5 }, s);
    const band1 = svg('path', { class: 's-aisoft' }, s);
    const curA = svg('path', { class: 'st-ink3 nofill', 'stroke-width': 2, 'stroke-dasharray': '6 4' }, s);
    const curB = svg('path', { class: 'st-ai nofill', 'stroke-width': 3 }, s);
    svg('line', { x1: sx(3), x2: sx(3), y1: Y0, y2: Y1, class: 'st-ink', 'stroke-width': 1 }, s);
    svg('text', { x: sx(3) + 6, y: Y0 + 10, class: 't-sm', text: '平均 3日' }, s);
    svg('line', { x1: sx(5), x2: sx(5), y1: Y0 + 30, y2: Y1, class: 'st-bn', 'stroke-dasharray': '3 3' }, s);
    svg('text', { x: sx(5) + 6, y: Y0 + 40, class: 'hand t-bn', 'font-size': 14, text: '5日を超えると苦情' }, s);
    const lb1 = svg('text', { class: 't-xs', 'text-anchor': 'middle' }, s);
    const lb2 = svg('text', { class: 't-xs', 'text-anchor': 'middle' }, s);
    const pdf = (x, m, sd) => Math.exp(-0.5 * ((x - m) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
    const out = f.add('fig__out');
    function curve(sd, from, to) {
      const sy = DS.lin(0, 0.85, Y1, Y0); const pts = [];
      for (let x = from; x <= to + 1e-9; x += 0.04) pts.push(sx(x).toFixed(1) + ' ' + sy(Math.min(pdf(x, 3, sd), 0.85)).toFixed(1));
      return pts;
    }
    function area(sd, a, b) { const p = curve(sd, Math.max(0, a), Math.min(8, b)); return 'M' + sx(Math.max(0, a)) + ' ' + Y1 + 'L' + p.join('L') + 'L' + sx(Math.min(8, b)) + ' ' + Y1 + 'Z'; }
    function upd(sd) {
      curA.setAttribute('d', 'M' + curve(0.5, 0, 8).join('L'));
      curB.setAttribute('d', 'M' + curve(sd, 0, 8).join('L'));
      band1.setAttribute('d', area(sd, 3 - sd, 3 + sd));
      band2.setAttribute('d', area(sd, 3 - 2 * sd, 3 + 2 * sd));
      late.setAttribute('d', area(sd, 5, 8));
      lb1.setAttribute('x', sx(3)); lb1.setAttribute('y', Y1 - 8); lb1.textContent = '±1σ に約68%';
      lb2.setAttribute('x', sx(Math.max(0.4, 3 - 1.5 * sd))); lb2.setAttribute('y', Y1 - 8); lb2.textContent = sd > 0.6 ? '±2σ に約95%' : '';
      const pA = 1 - DS.ncdf(5, 3, 0.5), pB = 1 - DS.ncdf(5, 3, sd);
      out.innerHTML = '<span>A社（点線）で5日超 <b>' + DS.pct(pA, 1) + '</b></span><span>B社（実線）で5日超 <b>' + DS.pct(pB, 1) + '</b></span><span>B社の標準偏差 <b>' + sd.toFixed(1) + '</b> 日</span>';
    }
    const sl = DS.slider({ label: 'B社のばらつき（標準偏差）', min: 0.3, max: 2.2, step: 0.1, value: 1.2, fmt: v => v.toFixed(1) + '日', onInput: upd });
    f.controls.appendChild(sl);
    upd(1.2);
    f.add('fig__note', '正規分布を仮定した説明用の図です。実際の配送日数は右に裾が長い分布になりやすく、平均±σの目安がずれることがあります。');
  });

  /* =========================================================
     3-3 標本と信頼区間
     ========================================================= */
  DS.register('sampling', function (el) {
    const f = DS.frame(el);
    const W = 640, H = 330;
    const s = DS.stageSvg(f.stage, W, H, { scroll: true, label: '母集団からサンプルを取り、満足度の割合を推定する' });
    const r = DS.rng(3);
    const G = 30, cell = 9.3, ox = 14, oy = 34, TRUE = 0.3;
    svg('text', { x: ox, y: 20, class: 't-sm', 'font-weight': 700, text: '顧客900人（本当の満足率 30%）' }, s);
    const pop = [];
    const idx = Array.from({ length: G * G }, (_, i) => i);
    const sat = new Set();
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    idx.slice(0, Math.round(G * G * TRUE)).forEach(i => sat.add(i));
    for (let i = 0; i < G * G; i++) {
      const c = svg('circle', { cx: ox + (i % G) * cell + 4, cy: oy + Math.floor(i / G) * cell + 4, r: 3, class: sat.has(i) ? 's-ai' : 's-grid', opacity: 0.5 }, s);
      pop.push(c);
    }
    // 推定の履歴
    const CX0 = 330, CX1 = 620, CY0 = 34, CY1 = 300;
    const sx = DS.lin(0, 0.7, CX0, CX1);
    svg('text', { x: CX0, y: 20, class: 't-sm', 'font-weight': 700, text: '推定値と95%信頼区間（新しい順に上から）' }, s);
    const axis = svg('g', { class: 'axis' }, s);
    svg('line', { x1: CX0, x2: CX1, y1: CY1, y2: CY1 }, axis);
    [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7].forEach(v => svg('text', { x: sx(v), y: CY1 + 16, 'text-anchor': 'middle', class: 't-xs', text: (v * 100) + '%' }, s));
    svg('line', { x1: sx(TRUE), x2: sx(TRUE), y1: CY0, y2: CY1, class: 'st-wk', 'stroke-width': 2 }, s);
    const hist = svg('g', {}, s);
    let draws = [];
    let n = 30;
    const out = f.add('fig__out');
    function sample() {
      pop.forEach((c, i) => { c.setAttribute('r', 3); c.setAttribute('opacity', 0.5); });
      const pick = []; const used = new Set();
      while (pick.length < n) { const i = Math.floor(r() * G * G); if (!used.has(i)) { used.add(i); pick.push(i); } }
      let k = 0;
      pick.forEach(i => { pop[i].setAttribute('r', 4.4); pop[i].setAttribute('opacity', 1); if (sat.has(i)) k++; });
      const p = k / n, se = Math.sqrt(Math.max(p * (1 - p), 1e-4) / n);
      draws.unshift({ p: p, lo: Math.max(0, p - 1.96 * se), hi: Math.min(1, p + 1.96 * se), n: n });
      draws = draws.slice(0, 20);
      render();
    }
    function render() {
      DS.clear(hist);
      draws.forEach((d, i) => {
        const y = CY0 + 8 + i * 13;
        const miss = d.hi < TRUE || d.lo > TRUE;
        svg('line', { x1: sx(Math.min(d.lo, 0.7)), x2: sx(Math.min(d.hi, 0.7)), y1: y, y2: y, class: miss ? 'st-bn' : 'st-ai', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: i ? 0.55 : 1 }, hist);
        svg('circle', { cx: sx(Math.min(d.p, 0.7)), cy: y, r: 3.5, class: miss ? 's-bn' : 's-ink' }, hist);
      });
      const d = draws[0];
      const misses = draws.filter(x => x.hi < TRUE || x.lo > TRUE).length;
      out.innerHTML = d ? '<span>今回の推定 <b>' + DS.pct(d.p) + '</b></span><span>95%信頼区間 <b>' + DS.pct(d.lo) + '〜' + DS.pct(d.hi) + '</b></span><span>真の値を外した区間 <b>' + misses + '</b> / ' + draws.length + '</span>' : '';
    }
    f.controls.appendChild(DS.seg([10, 30, 100, 300].map(v => ({ value: v, label: v + '人' })), 30, v => { n = v; draws = []; sample(); }, 'サンプルの人数'));
    f.controls.appendChild(DS.button('サンプルを取る', 'dice', sample));
    f.controls.appendChild(DS.button('20回まとめて', 'replay', () => { for (let i = 0; i < 20; i++) sample(); }));
    sample();
    return { play() { let i = 0; const t = setInterval(() => { sample(); if (++i >= 6) clearInterval(t); }, 500); } };
  });

  /* =========================================================
     3-4 相関と因果
     ========================================================= */
  DS.register('correlation', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 300, X0 = 50, X1 = 330, Y0 = 20, Y1 = 260;
    const s = DS.stageSvg(f.stage, W, H, { label: '相関の強さと、隠れた要因（交絡）の例' });
    const ex = f.add('fig__explain');
    const r = DS.rng(5);
    const N = 60;
    const base = Array.from({ length: N }, () => [DS.randn(r), DS.randn(r)]);
    const axis = svg('g', { class: 'axis' }, s);
    svg('line', { x1: X0, y1: Y1, x2: X1, y2: Y1 }, axis);
    svg('line', { x1: X0, y1: Y0, x2: X0, y2: Y1 }, axis);
    const xl = svg('text', { x: X1, y: Y1 + 20, 'text-anchor': 'end', class: 't-sm' }, s);
    const yl = svg('text', { x: X0 + 6, y: Y0 + 4, class: 't-sm' }, s);
    const dots = base.map(() => svg('circle', { r: 5, class: 'dot s-ai', cx: 0, cy: 0, opacity: 0.85 }, s));
    // 右側：因果の図
    const dag = svg('g', { class: 'fade', opacity: 0 }, s);
    const nodeAt = (x, y, label, icon, cls) => {
      svg('rect', { x: x - 58, y: y - 20, width: 116, height: 40, rx: 20, class: 's-surface st-ink', 'stroke-width': 1.2 }, dag);
      DS.svgIcon(dag, icon, x - 50, y - 10, 20, cls);
      svg('text', { x: x - 24, y: y + 5, class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: label }, dag);
    };
    const mk = DS.arrow(s, 's-ink');
    svg('path', { d: 'M440 92L392 168', class: 'st-ink', 'stroke-width': 1.5, 'marker-end': mk }, dag);
    svg('path', { d: 'M480 92L528 168', class: 'st-ink', 'stroke-width': 1.5, 'marker-end': mk }, dag);
    svg('path', { d: 'M418 196L502 196', class: 'st-bn', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, dag);
    svg('text', { x: 460, y: 190, 'text-anchor': 'middle', class: 'hand t-bn', 'font-size': 18, text: '×' }, dag);
    nodeAt(460, 70, '気温', 'thermo', 'si-bn');
    nodeAt(380, 196, 'アイス', 'icecream', 'si-ai');
    nodeAt(540, 196, '水難事故', 'wave', 'si-ai');
    svg('text', { x: 460, y: 250, 'text-anchor': 'middle', class: 'hand', 'font-size': 14, text: '本当の原因は「暑さ」' }, dag);
    const rnote = svg('text', { x: 360, y: 140, class: 't-xl', 'font-size': 40 }, s);
    const rsub = svg('text', { x: 360, y: 168, class: 't-sm' }, s);
    const sx = DS.lin(-3, 3, X0 + 6, X1 - 6), sy = DS.lin(-3, 3, Y1 - 6, Y0 + 6);
    let mode = 'r', rv = 0.7;
    const temps = [5, 6, 9, 14, 19, 22, 26, 27, 23, 18, 13, 8];
    function draw(instant) {
      if (mode === 'r') {
        const pos = base.map(b => [sx(b[0]), sy(DS.clamp(rv * b[0] + Math.sqrt(1 - rv * rv) * b[1], -3, 3))]);
        DS.place(dots, pos, instant);
        dots.forEach(d => { d.setAttribute('class', 'dot s-ai'); d.style.opacity = 0.85; });
        xl.textContent = '項目X →'; yl.textContent = '項目Y ↑';
        rnote.textContent = 'r = ' + rv.toFixed(2);
        rsub.textContent = Math.abs(rv) >= 0.7 ? '強い相関' : Math.abs(rv) >= 0.4 ? '中程度の相関' : Math.abs(rv) >= 0.2 ? '弱い相関' : 'ほぼ相関なし';
        dag.setAttribute('opacity', 0);
        DS.explain(ex, '<strong>相関係数 r</strong> は −1〜1 の値。1に近いほど「一方が大きいと他方も大きい」。0付近は直線的な関係がないことを示す。スライダーを動かして、点の散らばり方と r の関係をつかもう。');
      } else {
        const pos = base.map((b, i) => {
          const t = temps[i % 12] + b[0] * 1.2;
          const ice = 20 + 4 * t + b[1] * 9, dr = 2 + 0.9 * t + (base[(i + 7) % N][1]) * 3;
          return [DS.lin(20, 150, X0 + 6, X1 - 6)(ice), DS.lin(0, 32, Y1 - 6, Y0 + 6)(dr), t];
        });
        DS.place(dots, pos, instant);
        dots.forEach((d, i) => { const t = pos[i][2]; d.setAttribute('class', 'dot ' + (colored ? (t > 20 ? 's-bn' : t > 11 ? 's-ym' : 's-ai') : 's-ai')); });
        xl.textContent = 'アイスの売上 →'; yl.textContent = '水難事故の件数 ↑';
        rnote.textContent = ''; rsub.textContent = '';
        dag.setAttribute('opacity', colored ? 1 : 0);
        DS.explain(ex, colored ? '色は月の気温（青：寒い、黄：中間、赤：暑い）。<strong>暑い月ほど、アイスも売れ、海や川に行く人も増える。</strong>アイスと水難事故には相関があるが、因果関係はない。このように両方に影響する隠れた要因を<strong>交絡因子</strong>と呼ぶ。' : 'アイスが売れる月ほど、水難事故が多い。では「アイスの販売を止めれば事故が減る」のか？「隠れた要因を見る」を押してみよう。');
      }
    }
    let colored = false;
    const sl = DS.slider({ label: '相関の強さ', min: -1, max: 1, step: 0.05, value: 0.7, fmt: v => v.toFixed(2), onInput: v => { rv = v; if (mode === 'r') draw(); } });
    const hid = DS.button('隠れた要因を見る', 'eye', () => { colored = !colored; hid.setAttribute('aria-pressed', String(colored)); draw(); });
    const seg = DS.seg([{ value: 'r', label: '相関の強さ' }, { value: 'ice', label: 'アイスと水難事故' }], 'r', v => { mode = v; sl.hidden = v !== 'r'; hid.hidden = v === 'r'; draw(); }, '例の切り替え');
    hid.hidden = true;
    f.controls.append(seg, sl, hid);
    draw(true);
  });

  /* =========================================================
     3-5 A/Bテスト
     ========================================================= */
  DS.register('abtest', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 220, X0 = 110, X1 = 560;
    const s = DS.stageSvg(f.stage, W, H, { label: 'A/Bテストの購入率と95%信頼区間' });
    const r = DS.rng(21);
    const sx = DS.lin(0.04, 0.18, X0, X1);
    const axis = svg('g', { class: 'axis' }, s);
    svg('line', { x1: X0, x2: X1, y1: 180, y2: 180 }, axis);
    [0.04, 0.06, 0.08, 0.10, 0.12, 0.14, 0.16, 0.18].forEach(v => { svg('line', { x1: sx(v), x2: sx(v), y1: 20, y2: 180, class: 'st-grid' }, s); svg('text', { x: sx(v), y: 198, 'text-anchor': 'middle', class: 't-xs', text: Math.round(v * 100) + '%' }, s); });
    const rows = [{ k: 'A：今のページ', y: 70, cls: 'st-ink3', dc: 's-ink3' }, { k: 'B：新しいページ', y: 130, cls: 'st-ai', dc: 's-ai' }];
    rows.forEach(rw => {
      svg('text', { x: X0 - 12, y: rw.y + 5, 'text-anchor': 'end', class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: rw.k }, s);
      rw.line = svg('line', { y1: rw.y, y2: rw.y, class: rw.cls + ' fade', 'stroke-width': 6, 'stroke-linecap': 'round', style: 'transition: all .5s ease' }, s);
      rw.dot = svg('circle', { cy: rw.y, r: 7, class: rw.dc, style: 'transition: cx .5s ease' }, s);
    });
    const out = f.add('fig__out');
    const ex = f.add('fig__explain');
    let truth = 'diff';
    const st = { A: { n: 0, c: 0 }, B: { n: 0, c: 0 } };
    function add(n) {
      const pa = 0.10, pb = truth === 'diff' ? 0.12 : 0.10;
      for (let i = 0; i < n; i++) { st.A.n++; if (r() < pa) st.A.c++; st.B.n++; if (r() < pb) st.B.c++; }
      render();
    }
    function render() {
      const A = st.A, B = st.B;
      if (!A.n) { rows.forEach(rw => { rw.line.setAttribute('opacity', 0); rw.dot.setAttribute('cx', sx(0.11)); }); out.innerHTML = ''; DS.explain(ex, '「訪問者を追加」を押して実験を始めよう。'); return; }
      [A, B].forEach((g, i) => {
        const p = g.c / g.n, se = Math.sqrt(Math.max(p * (1 - p), 1e-4) / g.n);
        const rw = rows[i];
        rw.dot.setAttribute('cx', sx(DS.clamp(p, 0.04, 0.18)));
        rw.line.setAttribute('x1', sx(DS.clamp(p - 1.96 * se, 0.04, 0.18)));
        rw.line.setAttribute('x2', sx(DS.clamp(p + 1.96 * se, 0.04, 0.18)));
        rw.line.setAttribute('opacity', 1);
      });
      const pa = A.c / A.n, pb = B.c / B.n, pp = (A.c + B.c) / (A.n + B.n);
      const z = (pb - pa) / Math.sqrt(Math.max(pp * (1 - pp), 1e-6) * (1 / A.n + 1 / B.n));
      const pv = 2 * (1 - DS.ncdf(Math.abs(z), 0, 1));
      const sig = pv < 0.05;
      out.innerHTML = '<span>各グループの訪問者 <b>' + DS.fmt(A.n) + '</b> 人</span><span>購入率 A <b>' + DS.pct(pa, 1) + '</b> / B <b>' + DS.pct(pb, 1) + '</b></span><span>p値 <b>' + (pv < 0.001 ? '0.001未満' : pv.toFixed(3)) + '</b></span>';
      DS.explain(ex, sig
        ? '<strong>有意差あり（p &lt; 0.05）。</strong>「本当は差がないのに、偶然これだけの差が出る」確率が5%未満という意味。' + (truth === 'same' ? '<br>ただし今は「本当の差：なし」の設定。それでも有意になることがある。これが<strong>偽陽性</strong>で、何度も検定を繰り返すほど起きやすい。' : '<br>次に確認すべきは<strong>差の大きさが事業的に意味があるか</strong>。0.1ポイントの改善でも、訪問者が十分多ければ有意になる。')
        : '<strong>まだ偶然の範囲（p ≥ 0.05）。</strong>線（95%信頼区間）が大きく重なっている間は、差があるとは言い切れない。訪問者を増やすと線が短くなる。' + (A.n < 2000 ? '<br>人数が少ないうちに「Bが勝っている」と判断するのは危険。' : ''));
    }
    f.controls.append(
      DS.seg([{ value: 'diff', label: '本当の差：あり（+2pt）' }, { value: 'same', label: '本当の差：なし' }], 'diff', v => { truth = v; st.A = { n: 0, c: 0 }; st.B = { n: 0, c: 0 }; render(); }, '真の設定'),
      DS.button('訪問者を100人追加', 'users', () => add(100)),
      DS.button('1,000人追加', 'users', () => add(1000)),
      DS.button('リセット', 'replay', () => { st.A = { n: 0, c: 0 }; st.B = { n: 0, c: 0 }; render(); })
    );
    add(200);
  });
})();
