/* モジュール6〜8、ケーススタディ、考察ページの図 */
(function () {
  const { svg, h } = DS;

  /* =========================================================
     6-1 バリューチェーンの活用マップ
     ========================================================= */
  DS.register('value-chain', function (el) {
    const f = DS.frame(el);
    const V = [
      { k: '調達', icon: 'cart', u: [['発注量の最適化', '予測＋最適化', '販売実績・在庫・天候・販促予定'], ['仕入先リスクの検知', '分類', '取引履歴・財務情報・ニュース'], ['契約書のレビュー支援', '生成AI', '契約書・社内の審査基準']] },
      { k: '製造', icon: 'factory', u: [['設備の予知保全', '予測', 'センサーデータ・故障履歴'], ['外観検査の自動化', '画像認識', '製品画像・良品/不良のラベル'], ['歩留まりの要因分析', '診断', '工程ごとの条件と品質データ']] },
      { k: '物流', icon: 'truck', u: [['配送ルートの最適化', '最適化', '配送先・時間指定・道路情報'], ['倉庫の人員計画', '予測', '出荷予定・過去の作業実績']] },
      { k: '販売・マーケ', icon: 'megaphone', u: [['価格の最適化', '予測＋最適化', '価格と販売数の履歴・競合価格'], ['レコメンド', '推薦', '購買履歴・閲覧履歴'], ['顧客セグメンテーション', 'クラスタリング', '会員属性・購買行動'], ['広告文・商品説明の生成', '生成AI', '商品情報・ブランドの表現ルール']] },
      { k: '顧客対応', icon: 'headset', u: [['解約予測とフォロー', '分類', '利用履歴・契約・問い合わせ'], ['問い合わせの自動応答', '生成AI＋RAG', 'FAQ・マニュアル・過去の回答'], ['通話の要約と分析', '生成AI', '通話音声・応対記録']] },
      { k: '管理部門', icon: 'building', u: [['経費の不正検知', '異常検知', '経費精算データ'], ['請求書・帳票の読み取り', '画像＋生成AI', '帳票画像'], ['離職予測', '分類', '人事データ（扱いに特に配慮）']] }
    ];
    const W = 680, H = 92;
    const s = DS.stageSvg(f.stage, W, H, { scroll: true, label: 'バリューチェーンの各段階' });
    const cw = W / V.length;
    const cards = h('div', { class: 'grid-cards', style: 'margin-top:14px' });
    f.stage.appendChild(cards);
    const gs = V.map((v, i) => {
      const g = DS.node(s, () => sel(i), v.k);
      const x = i * cw, tip = 14;
      const d = 'M' + (x + 2) + ' 6L' + (x + cw - tip) + ' 6L' + (x + cw + 2) + ' 46L' + (x + cw - tip) + ' 86L' + (x + 2) + ' 86' + (i ? 'L' + (x + tip + 2) + ' 46Z' : 'Z');
      svg('path', { d: d, class: 'hit s-surface st-ink', 'stroke-width': 1.3 }, g);
      DS.svgIcon(g, v.icon, x + cw / 2 - 12, 14, 24, 'si-ai');
      svg('text', { x: x + cw / 2, y: 64, 'text-anchor': 'middle', class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: v.k }, g);
      return g;
    });
    function sel(i) {
      gs.forEach((g, j) => g.classList.toggle('is-on', i === j));
      cards.innerHTML = V[i].u.map(u => '<div class="mini"><h4>' + DS.icon(u[1].indexOf('生成') >= 0 ? 'sparkle' : u[1].indexOf('画像') >= 0 ? 'image' : u[1].indexOf('最適') >= 0 ? 'route' : u[1] === '異常検知' ? 'alert' : u[1] === 'クラスタリング' ? 'cluster' : 'trend-up') + u[0] + '</h4><p><span class="tag">' + u[1] + '</span></p><p>必要なデータ：' + u[2] + '</p></div>').join('');
      if (!DS.reduced) Array.from(cards.children).forEach((c, k) => c.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 350, delay: k * 60, fill: 'backwards' }));
    }
    sel(3);
  });

  /* =========================================================
     6-2 業界別ユースケース
     ========================================================= */
  DS.register('industry', function (el) {
    const f = DS.frame(el);
    const I = {
      retail: ['小売', 'store', [['需要予測と自動発注', '欠品率・廃棄率', '天候や販促の影響をどう入れるか。店舗の発注担当が予測を信頼するまでの移行設計。'], ['ID-POSによる顧客分析', '客数・客単価・リピート率', '会員IDで紐づく購買は全体の一部。非会員の行動は見えない。'], ['商品説明文・販促物の生成', '制作時間・CVR', 'ブランド表現と景品表示法などのルール確認。']]],
      mfg: ['製造', 'factory', [['設備の予知保全', '稼働率・保全コスト', '故障データは少ない（めったに壊れない）。異常検知との組み合わせが現実的。'], ['外観検査の自動化', '検出率・検査工数', '不良品の画像が集まらない。見逃しと過検出のどちらを許すかを品質部門と決める。'], ['技能伝承の生成AI化', '問い合わせ対応時間', '熟練者の暗黙知は文書になっていない。まず言語化の仕組みが要る。']]],
      fin: ['金融', 'bank', [['不正取引の検知', '検知率・誤検知の顧客対応コスト', '正常取引を止めると顧客体験が悪化する。しきい値の設計が経営判断になる。'], ['与信スコアリング', 'デフォルト率・承認率', '判断理由の説明責任と公平性。EUでは高リスクAIに分類される用途。'], ['稟議書・報告書の作成支援', '作成時間', '機密情報の入力ルールと、数字の検証プロセス。']]],
      logi: ['物流', 'truck', [['配送ルートの最適化', '走行距離・積載率', 'ドライバーの労働時間規制（2024年問題）を制約として組み込む。'], ['物量予測による人員計画', '人件費・残業時間', '大口荷主の出荷計画の共有が精度を大きく左右する。']]],
      health: ['ヘルスケア', 'health', [['画像診断の支援', '見落とし率・読影時間', '医療機器としての承認が必要な場合がある。最終判断は医師。'], ['医療文書の要約', '文書作成時間', '要配慮個人情報の扱い。誤りが患者に直結する。']]],
      public: ['公共', 'building', [['住民からの問い合わせ対応', '応答率・職員の対応時間', '回答の正確性と公平性。誤回答時の責任の所在。'], ['インフラの劣化予測', '点検コスト・事故件数', '点検記録が紙やPDFで散在。データ化が先。']]]
    };
    const body = h('div', { class: 'grid-cards' });
    f.stage.appendChild(body);
    function show(k) {
      body.innerHTML = I[k][2].map(u => '<div class="mini"><h4>' + DS.icon(I[k][1]) + u[0] + '</h4><p><span class="tag tag--wk">KPI</span> ' + u[1] + '</p><p><span class="tag tag--bn">落とし穴</span> ' + u[2] + '</p></div>').join('');
    }
    f.controls.appendChild(DS.seg(Object.keys(I).map(k => ({ value: k, label: I[k][0] })), 'retail', show, '業界'));
    show('retail');
  });

  /* =========================================================
     6-3 価値を金額で語る（需要予測）
     ========================================================= */
  DS.register('roi', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 250, X0 = 60, X1 = 560, Y0 = 20, Y1 = 210;
    const st = { sales: 200, loss: 3, cut: 20, init: 8000, run: 2000 };
    const sl = [
      DS.slider({ label: '年間売上', min: 50, max: 500, step: 10, value: st.sales, fmt: v => v + '億円', onInput: v => { st.sales = v; upd(); } }),
      DS.slider({ label: '廃棄・欠品によるロス率', min: 1, max: 6, step: 0.5, value: st.loss, fmt: v => v + '%', onInput: v => { st.loss = v; upd(); } }),
      DS.slider({ label: 'ロスの削減率（予測改善の効果）', min: 5, max: 40, step: 5, value: st.cut, fmt: v => v + '%', onInput: v => { st.cut = v; upd(); } }),
      DS.slider({ label: '初期投資', min: 2000, max: 30000, step: 1000, value: st.init, fmt: v => DS.fmt(v) + '万円', onInput: v => { st.init = v; upd(); } }),
      DS.slider({ label: '年間運用費', min: 500, max: 8000, step: 500, value: st.run, fmt: v => DS.fmt(v) + '万円', onInput: v => { st.run = v; upd(); } })
    ];
    const grid = h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px 20px;margin-bottom:14px' });
    sl.forEach(x => grid.appendChild(x));
    f.stage.appendChild(grid);
    const s = DS.stageSvg(f.stage, W, H, { label: '5年間の累積損益' });
    const out = f.add('fig__out');
    f.add('fig__explain', '式：<strong>年間効果 ＝ 売上 × ロス率 × 削減率</strong>。前提はすべて仮置きです。大事なのは数字の精度より、<strong>どの前提が結論を左右するか（感度）</strong>をクライアントと共有すること。削減率を半分にしても投資を回収できるなら、提案は強くなります。');
    const g = svg('g', {}, s);
    function upd() {
      DS.clear(g);
      const eff = st.sales * 1e4 * st.loss / 100 * st.cut / 100;
      const cum = [];
      let c = -st.init;
      for (let y = 1; y <= 5; y++) { c += eff - st.run; cum.push(c); }
      const mn = Math.min(-st.init, ...cum), mxv = Math.max(0, ...cum);
      const sy = DS.lin(mn, mxv || 1, Y1, Y0);
      const bw = (X1 - X0) / 6;
      svg('line', { x1: X0, x2: X1, y1: sy(0), y2: sy(0), class: 'st-ink', 'stroke-width': 1.2 }, g);
      const vals = [-st.init].concat(cum);
      vals.forEach((v, i) => {
        const x = X0 + i * bw + 10, y = Math.min(sy(v), sy(0)), hh = Math.abs(sy(v) - sy(0));
        svg('rect', { x: x, y: y, width: bw - 20, height: Math.max(hh, 1), rx: 2, class: v >= 0 ? 's-wk' : 's-bn', opacity: 0.85 }, g);
        svg('text', { x: x + (bw - 20) / 2, y: v >= 0 ? y - 6 : y + hh + 14, 'text-anchor': 'middle', class: 't-xs', text: (v >= 0 ? '+' : '') + DS.fmt(v / 10000, 1) + '億' }, g);
        svg('text', { x: x + (bw - 20) / 2, y: H - 8, 'text-anchor': 'middle', class: 't-sm', text: i ? i + '年目' : '投資時' }, g);
      });
      let pay = '回収できない';
      if (eff > st.run) { const yrs = st.init / (eff - st.run); pay = yrs <= 5 ? '約' + yrs.toFixed(1) + '年' : yrs.toFixed(1) + '年（5年超）'; }
      out.innerHTML = '<span>年間効果 <b>' + DS.fmt(eff / 10000, 2) + '</b> 億円</span><span>回収期間 <b>' + pay + '</b></span><span>5年累計 <b>' + DS.fmt(cum[4] / 10000, 2) + '</b> 億円</span>';
    }
    upd();
  });

  /* =========================================================
     6-4 価値×実現性マトリクス
     ========================================================= */
  DS.register('matrix', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 380, X0 = 50, X1 = 560, Y0 = 20, Y1 = 340;
    const s = DS.stageSvg(f.stage, W, H, { label: 'AI活用テーマの価値と実現性のマトリクス' });
    const ex = f.add('fig__explain');
    const T = [
      { k: '需要予測による発注最適化', v: 0.84, a: 0.7, b: 0.5, d: 'POSデータは揃っているが、販促計画と天候データが未整備。整備に2〜3か月かかる。' },
      { k: '解約予測とフォロー施策', v: 0.68, a: 0.74, b: 0.7, d: '会員データと利用履歴が揃っている。最初の一手に向く。' },
      { k: '問い合わせ対応の生成AI化', v: 0.56, a: 0.82, b: 0.44, d: 'FAQが5年前のまま。RAGの材料になる文書の整備が先。' },
      { k: '価格の最適化', v: 0.9, a: 0.34, b: 0.24, d: '価格を変えた実験の履歴がほぼない。価値は大きいが、段階的な準備が必要。' },
      { k: '社内文書の検索（RAG）', v: 0.42, a: 0.86, b: 0.6, d: '規程類は整っているが、部署ごとに保存場所がばらばら。' },
      { k: '外観検査の自動化', v: 0.74, a: 0.5, b: 0.28, d: '不良品の画像がほとんど保存されていない。まず撮りためる仕組みから。' },
      { k: '経費の不正検知', v: 0.28, a: 0.72, b: 0.66, d: 'データはあるが、不正の実額が小さく価値は限定的。' },
      { k: '会議資料の自動作成', v: 0.22, a: 0.9, b: 0.9, d: '既製ツールで十分。個別開発の価値は低い。' }
    ];
    const sx = DS.lin(0, 1, X0, X1), sy = DS.lin(0, 1, Y1, Y0);
    svg('rect', { x: sx(0.5), y: Y0, width: X1 - sx(0.5), height: sy(0.5) - Y0, class: 's-wksoft' }, s);
    svg('rect', { x: X0, y: Y0, width: sx(0.5) - X0, height: sy(0.5) - Y0, class: 's-ymsoft' }, s);
    svg('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, class: 'nofill st-ink', 'stroke-width': 1.2 }, s);
    svg('line', { x1: sx(0.5), x2: sx(0.5), y1: Y0, y2: Y1, class: 'st-ink3', 'stroke-dasharray': '4 4' }, s);
    svg('line', { x1: X0, x2: X1, y1: sy(0.5), y2: sy(0.5), class: 'st-ink3', 'stroke-dasharray': '4 4' }, s);
    [['すぐ着手', 0.98, 0.97, 'end', 't-wk'], ['準備して挑む', 0.02, 0.97, 'start', ''], ['小さく試す', 0.98, 0.03, 'end', ''], ['見送り', 0.02, 0.03, 'start', '']].forEach(q => svg('text', { x: sx(q[1]) + (q[3] === 'end' ? -6 : 6), y: sy(q[2]) + (q[2] > 0.5 ? 16 : -6), 'text-anchor': q[3], class: 'hand ' + q[4], 'font-size': 15, text: q[0] }, s));
    svg('text', { x: X1, y: Y1 + 24, 'text-anchor': 'end', class: 't-sm', text: '実現性（データ・技術・組織）→' }, s);
    svg('text', { x: X0 - 8, y: Y0 + 4, 'text-anchor': 'end', class: 't-sm', transform: 'rotate(-90 ' + (X0 - 30) + ' ' + (Y0 + 70) + ')' }, s).setAttribute('x', X0 - 30);
    const vlabel = s.lastChild; vlabel.setAttribute('y', Y0 + 70); vlabel.textContent = 'ビジネス価値 →';
    let useData = false;
    const gs = T.map((t, i) => {
      const g = DS.node(s, () => sel(i), t.k);
      g.classList.add('dot');
      svg('circle', { r: 9, class: 'hit s-ai st-ink', 'stroke-width': 1 }, g);
      const right = t.a < 0.62;
      svg('text', { x: right ? 14 : -14, y: 5, 'text-anchor': right ? 'start' : 'end', class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: t.k }, g);
      return g;
    });
    function place(instant) { T.forEach((t, i) => { if (instant) gs[i].style.transition = 'none'; DS.move(gs[i], sx(useData ? t.b : t.a), sy(t.v)); }); if (instant) { gs[0].getBoundingClientRect(); gs.forEach(g => { g.style.transition = ''; }); } }
    function sel(i) { gs.forEach((g, j) => g.classList.toggle('is-on', i === j)); DS.explain(ex, '<strong>' + T[i].k + '</strong>：' + T[i].d); }
    const tg = DS.button('データの準備状況を反映する', 'database', () => { useData = !useData; tg.setAttribute('aria-pressed', String(useData)); place(); DS.explain(ex, useData ? '<strong>データの実態を反映すると、多くのテーマが左に動きます。</strong>机上では「すぐ着手」に見えたテーマも、データの棚卸しで順位が入れ替わる。テーマ選定の前にデータの棚卸しをする理由です。' : '最初の評価。テーマを選ぶと、その前提が表示されます。'); });
    f.controls.appendChild(tg);
    place(true);
    DS.explain(ex, '最初の評価（ワークショップでの印象）。テーマの点をクリックすると前提が出ます。次に「データの準備状況を反映する」を押してください。');
  });

  /* =========================================================
     6-5 PoCで終わるファネル
     ========================================================= */
  DS.register('poc-funnel', function (el) {
    const f = DS.frame(el);
    const W = 600, H = 300;
    const s = DS.stageSvg(f.stage, W, H, { scroll: true, label: 'AIのアイデアが成果になるまでに減っていく様子' });
    const st = [['アイデア', 20, ''], ['PoC', 10, '価値を金額で試算できない'], ['本番化', 4, '精度は出たが業務に組み込めない／運用する人がいない'], ['効果を実証', 2, '現場が使わない／効果を測っていない']];
    const cx = 170, top = 30, rowH = 62;
    st.forEach((r, i) => {
      const w = 40 + r[1] * 14, y = top + i * rowH;
      const rc = svg('rect', { x: cx - w / 2, y: y, width: w, height: rowH - 12, rx: 6, class: ['s-aisoft', 's-ai', 's-wk', 's-ym'][i], opacity: i ? 1 : 1 }, s);
      svg('text', { x: cx, y: y + 31, 'text-anchor': 'middle', class: 't-sm', 'font-weight': 700, fill: i === 0 ? 'var(--ink)' : i === 3 ? 'var(--ink)' : 'var(--on-accent)', text: r[0] + '　' + r[1] + '件' }, s);
      if (r[2]) {
        svg('path', { d: 'M' + (cx + w / 2 + 8) + ' ' + (y - 2) + 'L340 ' + (y - 2), class: 'st-bn', 'stroke-dasharray': '3 3' }, s);
        DS.svgIcon(s, 'x-circle', 344, y - 13, 22, 'si-bn');
        svg('text', { x: 372, y: y + 3, class: 'hand t-bn', 'font-size': 14, text: r[2].length > 16 ? r[2].slice(0, 15) : r[2] }, s);
        if (r[2].length > 16) svg('text', { x: 372, y: y + 21, class: 'hand t-bn', 'font-size': 14, text: r[2].slice(15) }, s);
      }
      if (!DS.reduced) rc.animate([{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 600, delay: i * 250, fill: 'backwards', easing: 'ease-out' });
      rc.style.transformOrigin = cx + 'px ' + (y + 25) + 'px';
    });
    f.add('fig__note', '件数は説明用のイメージで、調査データではありません。実際の調査値は本文を参照してください。');
  });

  /* =========================================================
     7-1 課題を分析課題に翻訳する
     ========================================================= */
  DS.register('translate', function (el) {
    const f = DS.frame(el);
    const rungs = ['ビジネス課題', '問い', '仮説', '分析課題', '必要なデータ', 'アウトプット', 'アクション'];
    const icons = ['briefcase', 'question', 'bulb', 'target', 'database', 'chart-bar', 'flag'];
    const ex = {
      good: ['会員数は横ばいなのに、売上が落ちている', 'どの会員が、なぜ、いつ離れているのか？', '入会3か月以内に来館が途切れた会員が、退会しやすいのではないか', '30日以内に退会しそうな会員を予測する（分類）＋前兆の特定', '入退館ログ、契約情報、問い合わせ履歴、退会理由アンケート', '毎週、退会リスク上位の会員リストと主な理由', '店舗スタッフが声かけとプラン変更を提案し、効果をA/Bテストで測る'],
      bad: ['AIで何かやりたい', '（決まっていない）', '（立てていない）', '全データで何か予測モデルをつくる', 'あるだけ全部', '精度85%のモデル', '（誰も使わない）']
    };
    const list = h('ol', { style: 'list-style:none;padding:0;display:grid;gap:0' });
    f.stage.appendChild(list);
    let mode = 'good', timers = [];
    function draw() {
      timers.forEach(clearTimeout); timers = [];
      list.innerHTML = rungs.map((r, i) => '<li data-i="' + i + '" style="display:grid;grid-template-columns:28px 8.5em minmax(0,1fr);gap:10px;align-items:start;padding:10px 0;border-bottom:1px dashed var(--rule);transition:opacity .4s ease">' +
        '<span style="color:' + (mode === 'good' ? 'var(--ai)' : 'var(--beni)') + '">' + DS.icon(icons[i]) + '</span><strong style="font-size:.875rem">' + r + '</strong>' +
        '<span class="hand" style="font-size:.9688rem;color:' + (ex[mode][i].startsWith('（') ? 'var(--beni)' : 'var(--ink)') + '">' + ex[mode][i] + '</span></li>').join('');
      if (!DS.reduced) list.querySelectorAll('li').forEach((li, i) => { li.style.opacity = 0.15; timers.push(setTimeout(() => { li.style.opacity = 1; }, 250 + i * 350)); });
    }
    f.controls.append(DS.seg([{ value: 'good', label: '良い翻訳' }, { value: 'bad', label: 'よくある失敗' }], 'good', v => { mode = v; draw(); }, '例'), DS.button('もう一度', 'replay', draw));
    draw();
    f.add('fig__explain', '上から下へ、<strong>一段ずつ具体的にする</strong>のが翻訳です。「アクション」から逆にたどって、各段がつながっているかを確かめるのも有効です。失敗例は上の段が空のまま、いきなり分析課題に飛んでいます。');
  });

  /* =========================================================
     7-2 構想→PoC→本番→運用
     ========================================================= */
  DS.register('timeline', function (el) {
    const f = DS.frame(el);
    const W = 660, H = 170;
    const s = DS.stageSvg(f.stage, W, H, { scroll: true, label: 'AIプロジェクトのフェーズと判断ゲート' });
    const ex = f.add('fig__explain');
    const P = [
      { k: '構想', m: '1〜2か月', w: 100, cls: 's-ymsoft', d: '<strong>構想</strong>：テーマの選定、価値の試算、データの棚卸し、成功基準の合意。<br>成果物：ユースケース一覧と優先順位、PoC計画。<strong>コンサルが主導。</strong>' },
      { k: 'ゲート1', gate: 1, d: '<strong>判断ゲート1（PoCに進むか）</strong>：価値の試算が投資に見合うか。必要なデータが手に入るか。業務側のオーナーがいるか。' },
      { k: 'PoC', m: '2〜3か月', w: 140, cls: 's-aisoft', d: '<strong>PoC（概念実証）</strong>：小さなデータで技術的に可能か、業務で使えそうかを確かめる。<br>成果物：精度の評価と、業務で使った場合の効果見込み。<strong>「精度」だけでなく「業務での使い方」まで検証する。</strong>' },
      { k: 'ゲート2', gate: 1, d: '<strong>判断ゲート2（本番化するか）</strong>：事前に決めた成功基準を満たしたか。運用の体制と費用は確保できるか。満たさなければ止める勇気も必要。' },
      { k: '本番開発', m: '3〜6か月', w: 160, cls: 's-wksoft', d: '<strong>本番開発</strong>：業務システムとの連携、データの自動更新、権限、監視の仕組みをつくる。<br>PoCの数倍の工数がかかるのが普通。予算計画で見落とされやすい。' },
      { k: '運用・改善', m: '継続', w: 140, cls: 's-surface', d: '<strong>運用・改善</strong>：効果を測り、精度を監視し、必要に応じて再学習する。<br>現場の声を集めて使い方を改善する。<strong>ここで価値が生まれる。</strong>' }
    ];
    let x = 12;
    const gs = P.map((p, i) => {
      const g = DS.node(s, () => sel(i), p.k);
      if (p.gate) {
        const cx = x + 18;
        svg('path', { d: 'M' + cx + ' 52L' + (cx + 18) + ' 76L' + cx + ' 100L' + (cx - 18) + ' 76Z', class: 'hit s-ym st-ink', 'stroke-width': 1.3 }, g);
        svg('text', { x: cx, y: 125, 'text-anchor': 'middle', class: 't-xs', text: 'Go/No-Go' }, g);
        x += 40;
      } else {
        svg('rect', { x: x, y: 50, width: p.w, height: 52, rx: 6, class: 'hit ' + p.cls + ' st-ink', 'stroke-width': 1.3 }, g);
        svg('text', { x: x + 12, y: 74, class: 't-lg', 'font-size': 15, text: p.k }, g);
        svg('text', { x: x + 12, y: 93, class: 't-xs', text: p.m }, g);
        x += p.w + 4;
      }
      return g;
    });
    svg('text', { x: 12, y: 30, class: 'hand', 'font-size': 14, text: '左ほど安く、右ほどお金と時間がかかる' }, s);
    svg('text', { x: 12, y: 155, class: 't-xs', text: '期間は中規模の機械学習案件の目安。生成AIの業務適用はもっと短いこともある。' }, s);
    function sel(i) { gs.forEach((g, j) => g.classList.toggle('is-on', i === j)); DS.explain(ex, P[i].d); }
    sel(2);
  });

  /* =========================================================
     7-3 チームと役割
     ========================================================= */
  DS.register('roles', function (el) {
    const f = DS.frame(el);
    const W = 600, H = 350, cx = 300, cy = 172, RX = 205, RY = 130;
    const s = DS.stageSvg(f.stage, W, H, { label: 'データ・AIプロジェクトのチームの役割' });
    const ex = f.add('fig__explain');
    const R0 = [
      { k: 'ビジネスオーナー', icon: 'user', c: 0, d: '<strong>ビジネスオーナー</strong>：目的と予算に責任を持ち、Go/No-Goを決める。不在のプロジェクトは必ず漂流する。' },
      { k: '現場の担当者', icon: 'users', c: 0, d: '<strong>現場の担当者</strong>：業務の知見を提供し、最終的に予測やAIを使う人。企画段階から巻き込むほど定着する。' },
      { k: 'トランスレーター', icon: 'link', c: 1, d: '<strong>トランスレーター／PM</strong>：ビジネス課題を分析課題に翻訳し、関係者をつなぎ、成果まで推進する。<strong>コンサルの主戦場。</strong>' },
      { k: 'データサイエンティスト', icon: 'chart-line', c: 0, d: '<strong>データサイエンティスト</strong>：分析設計、モデル構築、評価。トランスレーターが「何を予測するか」を明確にするほど力を発揮する。' },
      { k: 'データエンジニア', icon: 'database', c: 0, d: '<strong>データエンジニア</strong>：データの収集・加工・基盤。プロジェクトの工数の多くを支える縁の下の力持ち。' },
      { k: 'MLエンジニア', icon: 'gear', c: 0, d: '<strong>MLエンジニア</strong>：モデルを本番システムに載せ、監視・再学習の仕組み（MLOps）をつくる。' },
      { k: '法務・リスク管理', icon: 'scale', c: 0, d: '<strong>法務・リスク管理</strong>：個人情報、著作権、公平性、規制対応。後から入ると手戻りが大きいので、構想段階から関与してもらう。' }
    ];
    svg('ellipse', { cx: cx, cy: cy, rx: RX, ry: RY, class: 'st-rule nofill', 'stroke-dasharray': '4 6', 'stroke-width': 1.5 }, s);
    svg('circle', { cx: cx, cy: cy, r: 48, class: 's-ymsoft st-ink', 'stroke-width': 1.2 }, s);
    svg('text', { x: cx, y: cy - 2, 'text-anchor': 'middle', class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: 'データ・AI' }, s);
    svg('text', { x: cx, y: cy + 16, 'text-anchor': 'middle', class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: 'プロジェクト' }, s);
    const gs = R0.map((r, i) => {
      const a = (-90 + i * 360 / R0.length) * Math.PI / 180, x = cx + RX * Math.cos(a), y = cy + RY * Math.sin(a);
      const g = DS.node(s, () => sel(i), r.k);
      svg('rect', { x: x - 76, y: y - 20, width: 152, height: 40, rx: 20, class: 'hit ' + (r.c ? 's-ymsoft' : 's-surface') + ' st-ink', 'stroke-width': r.c ? 2.2 : 1.2 }, g);
      DS.svgIcon(g, r.icon, x - 66, y - 10, 20, 'si-ai');
      svg('text', { x: x - 40, y: y + 5, class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: r.k }, g);
      if (r.c) svg('text', { x: x, y: y + 38, 'text-anchor': 'middle', class: 'hand', 'font-size': 14, fill: 'var(--ai)', text: 'コンサルの主戦場' }, g);
      return g;
    });
    function sel(i) { gs.forEach((g, j) => g.classList.toggle('is-on', i === j)); DS.explain(ex, R0[i].d); }
    sel(2);
  });

  /* =========================================================
     7-4 モデルの劣化と再学習
     ========================================================= */
  DS.register('drift', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 260, X0 = 50, X1 = 560, Y0 = 20, Y1 = 220;
    const s = DS.stageSvg(f.stage, W, H, { label: 'モデルの精度が時間とともに下がり、再学習で回復する様子' });
    const ex = f.add('fig__explain');
    const sx = DS.lin(0, 24, X0, X1), sy = DS.lin(55, 95, Y1, Y0);
    const a = svg('g', { class: 'axis' }, s);
    svg('line', { x1: X0, y1: Y1, x2: X1, y2: Y1 }, a); svg('line', { x1: X0, y1: Y0, x2: X0, y2: Y1 }, a);
    [60, 70, 80, 90].forEach(v => svg('text', { x: X0 - 8, y: sy(v) + 4, 'text-anchor': 'end', class: 't-xs', text: v + '%' }, s));
    [0, 6, 12, 18, 24].forEach(m => svg('text', { x: sx(m), y: Y1 + 16, 'text-anchor': 'middle', class: 't-xs', text: m + 'か月' }, s));
    svg('line', { x1: X0, x2: X1, y1: sy(75), y2: sy(75), class: 'st-ym', 'stroke-width': 2, 'stroke-dasharray': '6 4' }, s);
    svg('text', { x: X1, y: sy(75) - 6, 'text-anchor': 'end', class: 'hand', 'font-size': 14, text: '再学習の基準（75%）' }, s);
    svg('rect', { x: sx(9), y: Y0, width: sx(10) - sx(9), height: Y1 - Y0, class: 's-bnsoft', opacity: 0.8 }, s);
    svg('text', { x: sx(9) + 4, y: Y0 + 14, class: 'hand t-bn', 'font-size': 13, text: '競合が値下げ' }, s);
    const path = svg('path', { class: 'st-ai nofill', 'stroke-width': 3 }, s);
    const alert = svg('g', { class: 'fade', opacity: 0 }, s);
    const mark = svg('circle', { r: 7, class: 's-bn' }, alert);
    const lab = svg('text', { class: 'hand t-bn', 'font-size': 14 }, alert);
    let mode = 'mon', raf = 0;
    function series(m) {
      const pts = [];
      let retrained = -1;
      for (let t = 0; t <= 24; t += 0.25) {
        let acc;
        if (t < 9) acc = 85 + Math.sin(t * 1.3) * 0.8;
        else acc = 85 - (t - 9) * 2.1 + Math.sin(t * 1.7) * 0.6;
        if (m === 'mon') {
          if (retrained < 0 && acc < 75) retrained = t;
          if (retrained >= 0 && t > retrained + 1) acc = 84 + Math.sin(t * 1.2) * 0.8 - Math.max(0, t - retrained - 8) * 0.3;
          else if (retrained >= 0) acc = 75 - (t - retrained) * 1.5 + (t - retrained) * 10;
        }
        pts.push([t, Math.max(56, Math.min(92, acc))]);
      }
      return { pts: pts, rt: retrained };
    }
    function play() {
      cancelAnimationFrame(raf);
      const sr = series(mode);
      const t0 = performance.now(), dur = DS.reduced ? 1 : 3200;
      alert.setAttribute('opacity', 0);
      function fr(t) {
        const k = Math.min(1, (t - t0) / dur), n = Math.max(2, Math.round(sr.pts.length * k));
        path.setAttribute('d', 'M' + sr.pts.slice(0, n).map(p => sx(p[0]).toFixed(1) + ' ' + sy(p[1]).toFixed(1)).join('L'));
        if (k < 1) raf = requestAnimationFrame(fr);
        else {
          if (mode === 'mon') {
            mark.setAttribute('cx', sx(sr.rt)); mark.setAttribute('cy', sy(75));
            lab.setAttribute('x', sx(sr.rt) + 10); lab.setAttribute('y', sy(75) + 24); lab.textContent = 'アラート→再学習';
            DS.explain(ex, '<strong>監視あり</strong>：精度が基準を下回った時点でアラートが出て、新しいデータで再学習し、精度が戻る。モデルは「つくって終わり」ではなく、<strong>運用し続ける資産</strong>です。');
          } else {
            mark.setAttribute('cx', sx(24)); mark.setAttribute('cy', sy(sr.pts[sr.pts.length - 1][1]));
            lab.setAttribute('x', sx(24) - 10); lab.setAttribute('y', sy(sr.pts[sr.pts.length - 1][1]) - 12); lab.setAttribute('text-anchor', 'end'); lab.textContent = '誰も気づかないまま劣化';
            DS.explain(ex, '<strong>監視なし</strong>：市場や顧客の行動が変わると、過去のデータで学んだモデルは当たらなくなる（<strong>ドリフト</strong>）。誰も精度を見ていなければ、外れた予測で発注や施策が続けられてしまう。');
          }
          if (mode !== 'mon') lab.setAttribute('text-anchor', 'end'); else lab.setAttribute('text-anchor', 'start');
          alert.setAttribute('opacity', 1);
        }
      }
      raf = requestAnimationFrame(fr);
    }
    f.controls.append(DS.seg([{ value: 'mon', label: '監視あり' }, { value: 'none', label: '監視なし' }], 'mon', v => { mode = v; play(); }, '運用の違い'), DS.button('再生', 'play', play));
    play();
  });

  /* =========================================================
     7-5 キックオフで聞くべき質問
     ========================================================= */
  DS.register('checklist', function (el) {
    const f = DS.frame(el);
    const Q = {
      '目的': ['この分析の結果で、誰が何を決めるのか', '成功をどの指標で測るか。その現状値はいくつか', 'やらなかった場合に何を失うか'],
      'データ': ['必要なデータはどこにあり、誰が管理しているか', '何年分あり、途中で定義が変わっていないか', '正解データ（ラベル）はあるか。信頼できるか', '個人情報や機密情報の扱いに制約はあるか'],
      '体制': ['業務側で判断できるオーナーは誰か', '現場の利用者は企画段階から関わるか', 'IT部門・データ部門の協力は得られるか'],
      '運用': ['予測結果は、誰が、どの画面で、いつ使うのか', '予測が外れたときの影響と責任は誰が負うか', 'モデルの監視と再学習は誰が担うか'],
      'リスク': ['公平性や説明責任が問われる用途か', '生成AIに入力してよい情報の範囲は決まっているか']
    };
    const saved = (DS.store.get().checks || {});
    const wrap = h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px' });
    let total = 0;
    Object.keys(Q).forEach(gk => {
      const col = h('div', { style: 'display:grid;gap:6px;align-content:start' }, '<h4 style="font-size:.9375rem">' + gk + '</h4>');
      Q[gk].forEach((q, i) => {
        const id = 'ck-' + gk + '-' + i;
        total++;
        const lab = h('label', { for: id, style: 'display:grid;grid-template-columns:20px minmax(0,1fr);gap:8px;font-size:.875rem;line-height:1.6;cursor:pointer;align-items:start' });
        const cb = h('input', { type: 'checkbox', id: id, style: 'margin-top:4px;accent-color:var(--wakatake)' });
        cb.checked = !!saved[id];
        cb.addEventListener('change', () => { DS.store.update(st => { st.checks = st.checks || {}; if (cb.checked) st.checks[id] = 1; else delete st.checks[id]; }); upd(); });
        lab.append(cb, h('span', {}, q));
        col.appendChild(lab);
      });
      wrap.appendChild(col);
    });
    f.stage.appendChild(wrap);
    const out = f.add('fig__out');
    function upd() {
      const n = wrap.querySelectorAll('input:checked').length;
      out.innerHTML = '<span>答えが確認できた質問 <b>' + n + '</b> / ' + total + '</span><span class="hand" style="align-self:center">' + (n < total * 0.5 ? '空欄が多いうちはPoCに進まない' : n < total ? 'あと少し。空欄は計画のリスクとして明記する' : '準備は整った') + '</span>';
    }
    upd();
  });

  /* =========================================================
     8-1 データの偏り → AIの偏り
     ========================================================= */
  DS.register('bias', function (el) {
    const f = DS.frame(el);
    const W = 620, H = 260;
    const s = DS.stageSvg(f.stage, W, H, { scroll: true, label: '偏った過去の採用データから学んだモデルが偏った推薦をする様子' });
    const ex = f.add('fig__explain');
    const mk = DS.arrow(s, 's-ink3');
    svg('text', { x: 20, y: 24, class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: '過去10年の採用者（学習データ）' }, s);
    for (let i = 0; i < 40; i++) svg('circle', { cx: 32 + (i % 8) * 20, cy: 50 + Math.floor(i / 8) * 20, r: 7, class: i < 32 ? 's-ai' : 's-ym' }, s);
    svg('text', { x: 20, y: 170, class: 'hand', 'font-size': 14, text: '男性32人：女性8人' }, s);
    svg('path', { d: 'M196 100L248 100', class: 'st-ink3', 'stroke-width': 2, 'marker-end': mk }, s);
    svg('rect', { x: 254, y: 70, width: 110, height: 60, rx: 8, class: 's-aisoft st-ink', 'stroke-width': 1.2 }, s);
    DS.svgIcon(s, 'network', 268, 86, 26, 'si-ai');
    svg('text', { x: 300, y: 105, class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: 'モデル' }, s);
    const note = svg('text', { x: 254, y: 156, class: 'hand t-bn', 'font-size': 13 }, s);
    svg('path', { d: 'M370 100L420 100', class: 'st-ink3', 'stroke-width': 2, 'marker-end': mk }, s);
    svg('text', { x: 430, y: 24, class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: '推薦された上位10人' }, s);
    svg('text', { x: 430, y: 44, class: 't-xs', text: '応募者は男女20人ずつ' }, s);
    const picks = [];
    for (let i = 0; i < 10; i++) picks.push(svg('circle', { cx: 446 + (i % 5) * 28, cy: 80 + Math.floor(i / 5) * 30, r: 10, class: 's-ai', style: 'transition: fill .5s ease' }, s));
    const res = svg('text', { x: 430, y: 170, class: 'hand', 'font-size': 14 }, s);
    svg('circle', { cx: 30, cy: 222, r: 6, class: 's-ai' }, s); svg('text', { x: 42, y: 227, class: 't-xs', text: '男性' }, s);
    svg('circle', { cx: 90, cy: 222, r: 6, class: 's-ym' }, s); svg('text', { x: 102, y: 227, class: 't-xs', text: '女性' }, s);
    let fixed = false;
    function upd() {
      const women = fixed ? 5 : 1;
      picks.forEach((p, i) => p.setAttribute('class', i < 10 - women ? 's-ai' : 's-ym'));
      note.textContent = fixed ? '性別と代理変数を除外・重みを補正' : '「男性的な特徴」を高く評価';
      note.setAttribute('class', 'hand ' + (fixed ? 't-wk' : 't-bn'));
      res.textContent = '男性' + (10 - women) + '人：女性' + women + '人';
      DS.explain(ex, fixed ? '<strong>補正後</strong>：性別そのものだけでなく、性別と強く結びつく<strong>代理変数</strong>（出身校、所属サークル、言葉づかいなど）も点検し、学習データの重みを調整した。それでも完全な公平は難しく、<strong>人によるチェックと結果のモニタリング</strong>を続ける。'
        : '<strong>補正前</strong>：モデルは過去の採用の傾向をそのまま学ぶ。過去が偏っていれば、AIはその偏りを<strong>効率よく再生産</strong>する。実際に、ある大手IT企業は採用AIが女性に不利な評価をすることがわかり、開発を中止したと2018年に報じられた。');
    }
    const btn = DS.button('偏りを補正する', 'scale', () => { fixed = !fixed; btn.setAttribute('aria-pressed', String(fixed)); upd(); });
    f.controls.appendChild(btn);
    upd();
  });

  /* =========================================================
     8-2 予測の内訳（SHAPのイメージ）
     ========================================================= */
  DS.register('shap', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 280, X0 = 190, X1 = 560;
    const s = DS.stageSvg(f.stage, W, H, { label: '退会確率の予測を要因ごとに分解した図' });
    const ex = f.add('fig__explain');
    const C = {
      a: { name: 'Aさん', items: [['直近の来館回数が減った', 28], ['入会して4か月', 12], ['割引プランが終了', 9], ['年齢', -2], ['友人と一緒に入会', -7]] },
      b: { name: 'Bさん', items: [['来館回数は安定', -10], ['入会して3年', -6], ['料金改定の対象', 8], ['問い合わせが1件', 3]] }
    };
    const g = svg('g', {}, s);
    const sx = DS.lin(0, 70, X0, X1);
    function draw(k) {
      DS.clear(g);
      const items = C[k].items;
      let v = 20;
      const rows = [['平均的な会員', 20, 'base']].concat(items.map(it => [it[0], it[1], 'd']));
      svg('line', { x1: sx(20), x2: sx(20), y1: 14, y2: 30 + rows.length * 34, class: 'st-ink3', 'stroke-dasharray': '3 3' }, g);
      rows.forEach((r, i) => {
        const y = 22 + i * 34;
        svg('text', { x: X0 - 10, y: y + 15, 'text-anchor': 'end', class: 't-sm', fill: 'var(--ink)', text: r[0] }, g);
        let x1, x2, cls;
        if (r[2] === 'base') { x1 = sx(0); x2 = sx(20); cls = 's-ink3'; }
        else { x1 = sx(Math.min(v, v + r[1])); x2 = sx(Math.max(v, v + r[1])); cls = r[1] > 0 ? 's-bn' : 's-wk'; v += r[1]; }
        const rc = svg('rect', { x: x1, y: y, width: Math.max(2, x2 - x1), height: 22, rx: 3, class: cls }, g);
        svg('text', { x: x2 + 6, y: y + 16, class: 't-xs', text: r[2] === 'base' ? '20%' : (r[1] > 0 ? '+' : '') + r[1] + 'pt' }, g);
        if (!DS.reduced) { rc.style.transformOrigin = (r[1] > 0 || r[2] === 'base' ? x1 : x2) + 'px 0'; rc.animate([{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 400, delay: i * 220, fill: 'backwards', easing: 'ease-out' }); }
      });
      const y = 22 + rows.length * 34 + 6;
      svg('text', { x: X0 - 10, y: y + 16, 'text-anchor': 'end', class: 't-sm', 'font-weight': 900, fill: 'var(--ink)', text: C[k].name + 'の予測' }, g);
      svg('rect', { x: sx(0), y: y, width: sx(v) - sx(0), height: 24, rx: 3, class: v > 40 ? 's-bn' : 's-wk' }, g);
      svg('text', { x: sx(v) + 8, y: y + 17, class: 't-sm', 'font-weight': 900, fill: 'var(--ink)', text: '退会確率 ' + v + '%' }, g);
      DS.explain(ex, k === 'a' ? '<strong>Aさん</strong>は退会確率60%。最大の要因は「来館回数の減少」。だから打ち手は「値引き」より<strong>「来館のきっかけづくり」</strong>が先。予測の内訳が見えると、施策が具体的になります。' : '<strong>Bさん</strong>は退会確率15%で低リスク。ただし「料金改定の対象」がリスクを押し上げている。改定の案内のしかたを工夫する余地がある。');
    }
    f.controls.appendChild(DS.seg([{ value: 'a', label: 'Aさん' }, { value: 'b', label: 'Bさん' }], 'a', draw, '会員'));
    draw('a');
    f.add('fig__note', 'SHAPなどの手法で得られる「要因ごとの寄与」のイメージ図です。寄与は因果関係ではなく、モデルがどの情報を重く見たかを示します。');
  });

  /* =========================================================
     8-3 シンプソンのパラドックス
     ========================================================= */
  DS.register('simpson', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 250, X0 = 130, X1 = 540;
    const s = DS.stageSvg(f.stage, W, H, { label: '全体と顧客タイプ別で成約率の優劣が逆転する例' });
    const ex = f.add('fig__explain');
    const D = { X: { n: [20, 100], e: [360, 400] }, Y: { n: [100, 400], e: [95, 100] } };
    const g = svg('g', {}, s);
    const sx = DS.lin(0, 100, X0, X1);
    function bar(y, label, pct, cls, sub) {
      svg('text', { x: X0 - 10, y: y + 16, 'text-anchor': 'end', class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: label }, g);
      const rc = svg('rect', { x: X0, y: y, width: sx(pct) - X0, height: 24, rx: 3, class: cls }, g);
      svg('text', { x: sx(pct) + 8, y: y + 17, class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: pct.toFixed(0) + '%' }, g);
      if (sub) svg('text', { x: sx(pct) + 50, y: y + 17, class: 't-xs', text: sub }, g);
      if (!DS.reduced) { rc.style.transformOrigin = X0 + 'px 0'; rc.animate([{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 500, easing: 'ease-out' }); }
    }
    function draw(m) {
      DS.clear(g);
      if (m === 'all') {
        const px = (D.X.n[0] + D.X.e[0]) / (D.X.n[1] + D.X.e[1]) * 100, py = (D.Y.n[0] + D.Y.e[0]) / (D.Y.n[1] + D.Y.e[1]) * 100;
        svg('text', { x: 20, y: 30, class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: '全体の成約率' }, g);
        bar(60, '営業チームX', px, 's-ai', '380 / 500件');
        bar(100, '営業チームY', py, 's-ink3', '195 / 500件');
        svg('text', { x: X0, y: 170, class: 'hand', 'font-size': 15, text: '「Xのやり方を全社に広げよう」…本当に？' }, g);
        DS.explain(ex, '全体で見ると、チームXの成約率（76%）はチームY（39%）のほぼ2倍。ここで「顧客タイプ別に見る」を押してください。');
      } else {
        svg('text', { x: 20, y: 24, class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: '新規顧客' }, g);
        bar(36, 'チームX', D.X.n[0] / D.X.n[1] * 100, 's-ai', '20 / 100件');
        bar(66, 'チームY', D.Y.n[0] / D.Y.n[1] * 100, 's-ink3', '100 / 400件');
        svg('text', { x: 20, y: 124, class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: '既存顧客' }, g);
        bar(136, 'チームX', D.X.e[0] / D.X.e[1] * 100, 's-ai', '360 / 400件');
        bar(166, 'チームY', D.Y.e[0] / D.Y.e[1] * 100, 's-ink3', '95 / 100件');
        svg('text', { x: X0, y: 226, class: 'hand t-bn', 'font-size': 15, text: 'どちらのタイプでもYのほうが成約率が高い' }, g);
        DS.explain(ex, '<strong>逆転しました。</strong>Xは成約しやすい既存顧客を多く担当していただけで、新規でも既存でもYのほうが成績が良い。全体と内訳で結論が逆になる現象を<strong>シンプソンのパラドックス</strong>と呼ぶ。比べるときは「中身の構成が同じか」を必ず確かめる。');
      }
    }
    f.controls.appendChild(DS.seg([{ value: 'all', label: '全体で見る' }, { value: 'seg', label: '顧客タイプ別に見る' }], 'all', draw, '集計の切り口'));
    draw('all');
  });

  /* =========================================================
     8-5 EU AI法のリスク区分
     ========================================================= */
  DS.register('eu-pyramid', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 290;
    const s = DS.stageSvg(f.stage, W, H, { label: 'EU AI法のリスクに応じた4区分' });
    const ex = f.add('fig__explain');
    const L = [
      { k: '禁止', cls: 's-bn', ex: '社会的スコアリング、職場や学校での感情推定など', d: '<strong>許容できないリスク（禁止）</strong>：人の行動を操作する、社会的スコアリングをするなど。2025年2月から禁止。' },
      { k: '高リスク', cls: 's-ym', ex: '採用・人事評価、与信、教育、重要インフラなど', d: '<strong>高リスク</strong>：リスク管理、データ品質、記録、人による監督、正確性などの義務。採用や与信など、コンサルが関わりやすい用途が多い。2026年のデジタル・オムニバス改正で、適用は2027年12月（一部は2028年8月）へ延期された。' },
      { k: '透明性', cls: 's-ai', ex: 'チャットボット、生成AIの出力、ディープフェイク', d: '<strong>限定的なリスク（透明性の義務）</strong>：AIと対話していること、AIが生成したコンテンツであることを利用者がわかるようにする。2026年8月から適用。' },
      { k: '最小リスク', cls: 's-wk', ex: '迷惑メールフィルタ、ゲームのAIなど', d: '<strong>最小リスク</strong>：特別な義務はない。多くの業務AIはここに入るが、用途によって区分が変わる点に注意。' }
    ];
    const cx = 175, top = 20, hh = 62;
    const gs = L.map((l, i) => {
      const w1 = 50 + i * 70, w2 = 50 + (i + 1) * 70, y = top + i * hh;
      const g = DS.node(s, () => sel(i), l.k);
      svg('path', { d: 'M' + (cx - w1 / 2) + ' ' + y + 'L' + (cx + w1 / 2) + ' ' + y + 'L' + (cx + w2 / 2) + ' ' + (y + hh - 4) + 'L' + (cx - w2 / 2) + ' ' + (y + hh - 4) + 'Z', class: 'hit ' + l.cls + ' st-ink', 'stroke-width': 1.2, opacity: 0.9 }, g);
      svg('text', { x: cx, y: y + hh / 2 + 4, 'text-anchor': 'middle', class: 't-sm', 'font-weight': 700, fill: i === 1 ? 'var(--ink)' : 'var(--on-accent)', text: l.k }, g);
      svg('text', { x: 356, y: y + hh / 2 + 4, class: 't-xs', text: l.ex.length > 19 ? l.ex.slice(0, 18) + '…' : l.ex }, g);
      svg('line', { x1: cx + (w1 + w2) / 4 + 6, x2: 350, y1: y + hh / 2, y2: y + hh / 2, class: 'st-rule', 'stroke-dasharray': '2 3' }, g);
      return g;
    });
    function sel(i) { gs.forEach((g, j) => g.classList.toggle('is-on', i === j)); DS.explain(ex, L[i].d); }
    sel(1);
    f.add('fig__note', 'EUで事業をする日本企業や、EU市場向けのAIにも適用され得ます。日付は2026年7月に発効したデジタル・オムニバス（Regulation (EU) 2026/1744）を反映。最新の条文で確認してください。');
  });

  /* =========================================================
     汎用：選択肢つきの問い（ケーススタディ）
     ========================================================= */
  DS.register('choice', function (el) {
    const data = JSON.parse(el.querySelector('script[type="application/json"]').textContent);
    DS.clear(el);
    el.appendChild(h('p', {}, DS.icon('question') + '<span>' + data.q + '</span>'));
    const opts = h('div', { class: 'quiz__opts' });
    const fb = h('p', { class: 'quiz__exp', hidden: true });
    data.o.forEach(o => {
      const b = h('button', { type: 'button', class: 'quiz__opt' }, '<span>' + o.t + '</span>');
      b.addEventListener('click', () => {
        opts.querySelectorAll('button').forEach(x => x.classList.remove('is-correct', 'is-wrong'));
        b.classList.add(o.ok ? 'is-correct' : 'is-wrong');
        fb.hidden = false; fb.innerHTML = '<strong>' + (o.ok ? 'よい判断です。' : 'もう一度考えてみましょう。') + '</strong>' + o.fb;
      });
      opts.appendChild(b);
    });
    el.append(opts, fb);
  });

  /* ケース：来館回数別の退会率 */
  DS.register('case-churn', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 250, X0 = 60, X1 = 560, Y0 = 20, Y1 = 200;
    const s = DS.stageSvg(f.stage, W, H, { label: '直近30日の来館回数別の翌月退会率' });
    const D = [['0回', 18.2], ['1回', 10.9], ['2〜3回', 5.1], ['4〜7回', 2.6], ['8回以上', 1.4]];
    const sy = DS.lin(0, 20, Y1, Y0), bw = (X1 - X0) / D.length;
    [0, 5, 10, 15, 20].forEach(v => { svg('line', { x1: X0, x2: X1, y1: sy(v), y2: sy(v), class: 'st-grid' }, s); svg('text', { x: X0 - 8, y: sy(v) + 4, 'text-anchor': 'end', class: 't-xs', text: v + '%' }, s); });
    D.forEach((d, i) => {
      const rc = svg('rect', { x: X0 + i * bw + 14, y: sy(d[1]), width: bw - 28, height: Y1 - sy(d[1]), rx: 3, class: i < 2 ? 's-bn' : 's-ai' }, s);
      svg('text', { x: X0 + i * bw + bw / 2, y: sy(d[1]) - 6, 'text-anchor': 'middle', class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: d[1] + '%' }, s);
      svg('text', { x: X0 + i * bw + bw / 2, y: Y1 + 18, 'text-anchor': 'middle', class: 't-sm', text: d[0] }, s);
      if (!DS.reduced) { rc.style.transformOrigin = '0 ' + Y1 + 'px'; rc.animate([{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: 600, delay: i * 120, fill: 'backwards', easing: 'ease-out' }); }
    });
    svg('text', { x: X1, y: H - 6, 'text-anchor': 'end', class: 't-xs', text: '直近30日の来館回数（会員1万人・架空データ）' }, s);
    svg('text', { x: X0 + bw * 2.2, y: sy(15), class: 'hand', 'font-size': 15, text: '来館が途切れた会員ほど辞めやすい' }, s);
  });

  /* ケース：施策対象の広さと利益 */
  DS.register('case-profit', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 260, X0 = 64, X1 = 560, Y0 = 20, Y1 = 220;
    const s = DS.stageSvg(f.stage, W, H, { label: '声かけの対象を広げたときの利益の変化' });
    const out = f.add('fig__out');
    const ex = f.add('fig__explain');
    let cost = +(el.dataset.cost || 1000), k = 0.2, save = +(el.dataset.save || 0.25);
    const members = 10000, churners = 190, value = 100000;
    const sx = DS.lin(0, 0.6, X0, X1), sy = DS.lin(-160, 100, Y1, Y0);
    const a = svg('g', { class: 'axis' }, s);
    svg('line', { x1: X0, x2: X1, y1: sy(0), y2: sy(0) }, a);
    [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].forEach(v => svg('text', { x: sx(v), y: Y1 + 18, 'text-anchor': 'middle', class: 't-xs', text: Math.round(v * 100) + '%' }, s));
    [-150, -100, -50, 0, 50, 100].forEach(v => { svg('line', { x1: X0, x2: X1, y1: sy(v), y2: sy(v), class: 'st-grid' }, s); svg('text', { x: X0 - 8, y: sy(v) + 4, 'text-anchor': 'end', class: 't-xs', text: v + '万' }, s); });
    svg('text', { x: X1, y: H - 4, 'text-anchor': 'end', class: 't-xs', text: '声かけの対象（退会リスクの高い順に上位何%まで）' }, s);
    svg('text', { x: X0 + 6, y: Y0 + 4, class: 't-xs', text: '月あたりの利益' }, s);
    const curve = svg('path', { class: 'st-ai nofill', 'stroke-width': 3 }, s);
    const best = svg('circle', { r: 7, class: 's-wk' }, s);
    const bestL = svg('text', { class: 'hand t-wk', 'font-size': 14, 'text-anchor': 'middle' }, s);
    const cur = svg('line', { y1: Y0, y2: Y1, class: 'st-ym', 'stroke-width': 2 }, s);
    const recall = kk => 1 - Math.pow(1 - kk, 3.2);
    const profit = kk => (churners * recall(kk) * save * value - members * kk * cost) / 1e4;
    function upd() {
      const pts = []; let bk = 0, bv = -1e9;
      for (let x = 0; x <= 0.6001; x += 0.01) { const v = profit(x); pts.push(sx(x).toFixed(1) + ' ' + sy(DS.clamp(v, -160, 100)).toFixed(1)); if (v > bv) { bv = v; bk = x; } }
      curve.setAttribute('d', 'M' + pts.join('L'));
      best.setAttribute('cx', sx(bk)); best.setAttribute('cy', sy(DS.clamp(bv, -160, 100)));
      bestL.setAttribute('x', DS.clamp(sx(bk), X0 + 90, X1 - 90)); bestL.setAttribute('y', sy(DS.clamp(bv, -160, 100)) - 14);
      bestL.textContent = bv > 0 ? '利益が最大：上位' + Math.round(bk * 100) + '%' : 'どの範囲でも赤字';
      bestL.setAttribute('class', 'hand ' + (bv > 0 ? 't-wk' : 't-bn'));
      cur.setAttribute('x1', sx(k)); cur.setAttribute('x2', sx(k));
      out.innerHTML = '<span>声かけ人数 <b>' + DS.fmt(members * k) + '</b> 人／月</span><span>うち退会予備軍 <b>' + DS.fmt(churners * recall(k)) + '</b> 人</span><span>見込み利益 <b>' + DS.fmt(profit(k)) + '</b> 万円／月</span>';
      DS.explain(ex, '前提：会員1万人のうち毎月190人が退会。声かけで予備軍の' + Math.round(save * 100) + '%を引き止め、引き止めた1人あたりの粗利は10万円（残る期間を考慮）。<strong>対象を広げるほど引き止められる人は増えるが、声かけのコストも増える。</strong>しきい値は精度ではなく<strong>お金で決める</strong>。');
    }
    f.controls.append(
      DS.slider({ label: '声かけの対象', min: 0.05, max: 0.6, step: 0.01, value: k, fmt: v => '上位' + Math.round(v * 100) + '%', onInput: v => { k = v; upd(); } }),
      DS.slider({ label: '声かけ1人あたりのコスト', min: 200, max: 2000, step: 100, value: cost, fmt: v => DS.fmt(v) + '円', onInput: v => { cost = v; upd(); } }),
      DS.seg([{ value: 0.25, label: '引き止め率 25%（想定）' }, { value: 0.18, label: '18%（実験値）' }], save, v => { save = v; upd(); }, '引き止め率')
    );
    upd();
  });

  /* ケース：A/Bテストの結果 */
  DS.register('case-ab', function (el) {
    const f = DS.frame(el);
    const W = 580, H = 190, X0 = 150, X1 = 560;
    const s = DS.stageSvg(f.stage, W, H, { label: '声かけをした群としなかった群の3か月退会率' });
    const G = [['声かけなし（対照群）', 1200, 168, 's-ink3'], ['声かけあり（介入群）', 1200, 138, 's-ai']];
    const sx = DS.lin(6, 20, X0, X1);
    [6, 8, 10, 12, 14, 16, 18, 20].forEach(v => { svg('line', { x1: sx(v), x2: sx(v), y1: 20, y2: 140, class: 'st-grid' }, s); svg('text', { x: sx(v), y: 158, 'text-anchor': 'middle', class: 't-xs', text: v + '%' }, s); });
    G.forEach((g, i) => {
      const p = g[2] / g[1], se = Math.sqrt(p * (1 - p) / g[1]), y = 50 + i * 55;
      svg('text', { x: X0 - 10, y: y + 5, 'text-anchor': 'end', class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: g[0] }, s);
      svg('line', { x1: sx((p - 1.96 * se) * 100), x2: sx((p + 1.96 * se) * 100), y1: y, y2: y, class: g[3] === 's-ai' ? 'st-ai' : 'st-ink3', 'stroke-width': 6, 'stroke-linecap': 'round' }, s);
      svg('circle', { cx: sx(p * 100), cy: y, r: 8, class: g[3] }, s);
      svg('text', { x: sx(p * 100), y: y - 14, 'text-anchor': 'middle', class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: (p * 100).toFixed(1) + '%' }, s);
    });
    const pa = 168 / 1200, pb = 138 / 1200, pp = (168 + 138) / 2400;
    const z = (pa - pb) / Math.sqrt(pp * (1 - pp) * (2 / 1200));
    const pv = 2 * (1 - DS.ncdf(Math.abs(z), 0, 1));
    svg('text', { x: 20, y: H - 6, class: 't-xs', text: '線は95%信頼区間。退会リスク上位の会員2,400人を無作為に2群に分けた（架空データ）' }, s);
    f.add('fig__out', '<span>退会率の差 <b>' + ((pa - pb) * 100).toFixed(1) + '</b> ポイント</span><span>p値 <b>' + pv.toFixed(3) + '</b></span><span>引き止め率（予備軍のうち） <b>約' + Math.round((pa - pb) / pa * 100) + '%</b></span>');
  });

  /* =========================================================
     考察ページ：必要な知識の深さマップ
     ========================================================= */
  DS.DOMAINS = [
    { k: 'データの基本', sub: '種類・質・基盤', icon: 'database', m: 'm2', L: [2, 3, 4] },
    { k: '統計的思考', sub: '分布・相関と因果・検定', icon: 'bell', m: 'm3', L: [2, 3, 4] },
    { k: '機械学習', sub: '種類・評価・限界', icon: 'network', m: 'm4', L: [1, 3, 4] },
    { k: '生成AI', sub: 'しくみ・限界・使いこなし', icon: 'sparkle', m: 'm5', L: [3, 4, 4] },
    { k: '活用の企画', sub: 'ユースケース・価値試算', icon: 'briefcase', m: 'm6', L: [1, 4, 2] },
    { k: 'プロジェクト推進', sub: '翻訳・体制・PoCから運用', icon: 'route', m: 'm7', L: [1, 4, 3] },
    { k: 'リスクとガバナンス', sub: 'バイアス・説明・規制', icon: 'shield', m: 'm8', L: [2, 3, 3] },
    { k: '実装', sub: 'Python・SQL・モデル構築', icon: 'code', m: null, L: [0, 2, 4] }
  ];
  DS.DEPTH = ['不要', '用語を知る', '説明できる', '判断できる', '自分でできる'];
  DS.register('depth-map', function (el) {
    const f = DS.frame(el);
    const D = DS.DOMAINS;
    const W = 640, rowH = 40, X0 = 190, X1 = 620, H = 60 + D.length * rowH;
    const s = DS.stageSvg(f.stage, W, H, { scroll: true, label: '知識領域ごとに必要な深さをL1・L2・L3で比べた図' });
    const sx = DS.lin(0, 4, X0 + 20, X1 - 20);
    DS.DEPTH.forEach((d, i) => { svg('line', { x1: sx(i), x2: sx(i), y1: 34, y2: H - 10, class: 'st-grid', 'stroke-width': 1.5 }, s); svg('text', { x: sx(i), y: 24, 'text-anchor': 'middle', class: 't-xs', text: d }, s); });
    const lines = {};
    const dots = { 0: [], 1: [], 2: [] };
    D.forEach((d, i) => {
      const y = 56 + i * rowH;
      DS.svgIcon(s, d.icon, 8, y - 11, 22, 'si-ai');
      svg('text', { x: 36, y: y - 1, class: 't-sm', 'font-weight': 700, fill: 'var(--ink)', text: d.k }, s);
      svg('text', { x: 36, y: y + 14, class: 't-xs', text: d.sub }, s);
    });
    const cls = ['s-ink3', 's-ai', 's-ym'], scls = ['st-ink3', 'st-ai', 'st-ym'];
    [0, 2, 1].forEach(lv => {
      lines[lv] = svg('path', { d: 'M' + D.map((d, i) => sx(d.L[lv]) + ' ' + (56 + i * rowH)).join('L'), class: scls[lv] + ' nofill fade', 'stroke-width': lv === 1 ? 3 : 2, 'stroke-dasharray': lv === 1 ? '' : '5 4' }, s);
      D.forEach((d, i) => dots[lv].push(svg('circle', { cx: sx(d.L[lv]), cy: 56 + i * rowH, r: lv === 1 ? 8 : 6, class: cls[lv] + ' fade' }, s)));
    });
    const ex = f.add('fig__explain');
    const txt = {
      all: '<strong>3つの水準の違い。</strong>青の太線（L2：推進役）がこのサイトの到達目標。L3（黄）との差が大きいのは「実装」だけで、企画と推進ではむしろL2がL3を上回る。',
      0: '<strong>L1：全コンサル</strong>。生成AIだけは全員が「判断できる」水準を求められる。毎日の仕事で使い、その出力に責任を負うから。',
      1: '<strong>L2：推進役</strong>。企画と推進は「自分でできる」、技術は「判断できる」水準。実装は「説明できる」で足りるが、AIの助けを借りて簡単な集計を自分で回せると強い。',
      2: '<strong>L3：専門</strong>。技術領域はすべて「自分でできる」。企画や推進はコンサルとの協働で補う。'
    };
    function show(v) {
      [0, 1, 2].forEach(lv => { const on = v === 'all' || +v === lv; lines[lv].setAttribute('opacity', on ? 1 : 0.12); dots[lv].forEach(d => d.setAttribute('opacity', on ? 1 : 0.12)); });
      DS.explain(ex, txt[v]);
    }
    f.controls.appendChild(DS.seg([{ value: 'all', label: '3つを比べる' }, { value: '0', label: 'L1 全員' }, { value: '1', label: 'L2 推進役' }, { value: '2', label: 'L3 専門' }], 'all', show, '水準'));
    const lg = f.add('legend', '<span><i style="background:var(--ink-3)"></i>L1 全員</span><span><i style="background:var(--ai)"></i>L2 推進役（目標）</span><span><i style="background:var(--yamabuki)"></i>L3 専門</span>');
    void lg;
    show('all');
  });

  /* 考察ページ：自己診断 */
  DS.register('diagnosis', function (el) {
    const D = DS.DOMAINS;
    const saved = DS.store.get().diag || {};
    const val = D.map((d, i) => (saved[i] !== undefined ? saved[i] : 1));
    const wrap = h('div', { class: 'diag' });
    const list = h('div', { class: 'diag__list' });
    const res = h('div', { class: 'diag__result' });
    wrap.append(list, res);
    DS.clear(el); el.appendChild(wrap);
    D.forEach((d, i) => {
      const row = h('div', { class: 'diag__row', role: 'group', 'aria-label': d.k });
      row.innerHTML = '<label>' + DS.icon(d.icon) + d.k + '<small style="font-weight:500;color:var(--ink-3)">' + d.sub + '</small></label>';
      const lv = h('div', { class: 'diag__levels' });
      DS.DEPTH.forEach((t, j) => {
        const b = h('button', { type: 'button', 'aria-pressed': String(val[i] === j) }, t);
        b.addEventListener('click', () => { val[i] = j; lv.querySelectorAll('button').forEach((x, k) => x.setAttribute('aria-pressed', String(k === j))); DS.store.update(st => { st.diag = st.diag || {}; st.diag[i] = j; }); render(); });
        lv.appendChild(b);
      });
      row.appendChild(lv);
      list.appendChild(row);
    });
    function render() {
      const W = 420, rowH = 30, X0 = 120, X1 = 400, H = 30 + D.length * rowH;
      DS.clear(res);
      const fig = h('div', { class: 'fig', style: 'margin:0' });
      fig.innerHTML = '<div class="fig__head"><div class="fig__title">' + DS.icon('target') + '<span>あなたと目標（L2）の差</span></div></div>';
      res.appendChild(fig);
      const s = DS.stageSvg(fig, W, H, { label: '自己評価と目標水準の比較' });
      const sx = DS.lin(0, 4, X0, X1);
      [0, 1, 2, 3, 4].forEach(i => { svg('line', { x1: sx(i), x2: sx(i), y1: 16, y2: H - 4, class: 'st-grid' }, s); svg('text', { x: sx(i), y: 12, 'text-anchor': 'middle', class: 't-xs', text: i }, s); });
      const gaps = [];
      D.forEach((d, i) => {
        const y = 30 + i * rowH, t = d.L[1], v = val[i];
        svg('text', { x: X0 - 10, y: y + 4, 'text-anchor': 'end', class: 't-sm', fill: 'var(--ink)', text: d.k }, s);
        svg('line', { x1: sx(Math.min(v, t)), x2: sx(Math.max(v, t)), y1: y, y2: y, class: v < t ? 'st-bn' : 'st-wk', 'stroke-width': 4 }, s);
        svg('circle', { cx: sx(t), cy: y, r: 7, class: 's-surface st-ai', 'stroke-width': 2.5 }, s);
        svg('circle', { cx: sx(v), cy: y, r: 5.5, class: v < t ? 's-bn' : 's-wk' }, s);
        if (t - v > 0) gaps.push({ d: d, g: t - v });
      });
      gaps.sort((a, b) => b.g - a.g);
      const rec = h('div', { class: 'summary-box' });
      rec.innerHTML = gaps.length
        ? '<h3>優先して学ぶとよいモジュール</h3><ul>' + gaps.slice(0, 3).map(x => '<li>' + (x.d.m ? '<a href="modules/' + x.d.m + '.html">' + x.d.k + '（モジュール' + x.d.m.slice(1) + '）</a>' : x.d.k + '：AIと一緒に小さな集計を自分で回す練習を') + '：目標まであと' + x.g + '段階</li>').join('') + '</ul>'
        : '<h3>すべての領域で目標水準に届いています</h3><p>ケーススタディで実践力を確かめてみましょう。<a href="case.html">ケーススタディへ</a></p>';
      res.appendChild(rec);
      res.appendChild(h('p', { class: 'fig__note' }, '○＝目標（L2）、●＝あなたの自己評価。結果はこのブラウザにだけ保存されます。'));
    }
    render();
  });
})();
