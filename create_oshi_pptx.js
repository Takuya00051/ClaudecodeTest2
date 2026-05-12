const PptxGenJS = require("pptxgenjs");
const prs = new PptxGenJS();
prs.layout = "LAYOUT_WIDE"; // 13.33" x 7.5"

// ── Palette ──────────────────────────────────
const PU  = "4A1C6D";  // deep purple
const PM  = "7B1FA2";  // mid purple
const HK  = "C2185B";  // hot pink
const PL  = "F48FB1";  // light pink
const LV  = "F3E5F5";  // lavender
const LM  = "CE93D8";  // lavender border
const WH  = "FFFFFF";  // white
const DK  = "2D0A3F";  // dark text
const GL  = "F0F0F0";  // gray light
const GY  = "9E9E9E";  // gray

// ── Layout constants ─────────────────────────
const SBW = 1.2;   // sidebar width
const CX  = 1.45;  // content x
const CW  = 11.55; // content width
const BY  = 1.1;   // body y start

// ── Helpers ──────────────────────────────────
function sb(sl, n) {
  sl.addShape(prs.ShapeType.rect, {
    x: 0, y: 0, w: SBW, h: 7.5,
    fill: { color: PU }, line: { type: "none" }
  });
  sl.addShape(prs.ShapeType.ellipse, {
    x: 0.25, y: 0.22, w: 0.7, h: 0.7,
    fill: { color: HK }, line: { type: "none" }
  });
  sl.addText(String(n), {
    x: 0.25, y: 0.22, w: 0.7, h: 0.7,
    fontSize: 18, bold: true, color: WH,
    align: "center", valign: "middle"
  });
}

function ttl(sl, text) {
  sl.addText(text, {
    x: CX, y: 0.2, w: CW, h: 0.82,
    fontSize: 22, bold: true, color: HK,
    fontFace: "Arial Black",
    align: "left", valign: "middle"
  });
}

function rCard(sl, x, y, w, h, bg = LV, border = LM) {
  sl.addShape(prs.ShapeType.roundRect, {
    x, y, w, h, arcSize: 5,
    fill: { color: bg }, line: { color: border, pt: 1 }
  });
}

function dot(sl, x, y, color = HK) {
  sl.addShape(prs.ShapeType.ellipse, {
    x, y: y + 0.1, w: 0.14, h: 0.14,
    fill: { color }, line: { type: "none" }
  });
}

// ── SLIDE 1: TITLE ────────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: PU };

  sl.addShape(prs.ShapeType.ellipse, {
    x: 9.8, y: -1.5, w: 5.5, h: 5.5,
    fill: { color: PM, transparency: 65 }, line: { type: "none" }
  });
  sl.addShape(prs.ShapeType.ellipse, {
    x: -1.2, y: 4.8, w: 3.5, h: 3.5,
    fill: { color: HK, transparency: 72 }, line: { type: "none" }
  });

  sl.addText('なぜ人は"推し"に熱狂するのか？', {
    x: 0.8, y: 0.8, w: 11.73, h: 1.8,
    fontSize: 42, bold: true, color: WH,
    fontFace: "Georgia", align: "center", valign: "middle", wrap: true
  });

  sl.addText("SNS時代のファン心理学入門", {
    x: 0.8, y: 2.7, w: 11.73, h: 0.65,
    fontSize: 20, color: PL, fontFace: "Calibri",
    align: "center", italic: true
  });

  // Dot separator
  for (let i = 0; i < 5; i++) {
    sl.addShape(prs.ShapeType.ellipse, {
      x: 5.65 + i * 0.42, y: 3.5, w: 0.13, h: 0.13,
      fill: { color: PL }, line: { type: "none" }
    });
  }

  const pts = [
    "推し活市場は拡大中",
    "アイドル・VTuber・スポーツ・ブランドにも広がる",
    '"好き"はなぜここまで強い感情になるのか？',
  ];
  pts.forEach((t, i) => {
    sl.addText(t, {
      x: 1.5, y: 3.85 + i * 0.68, w: 10.33, h: 0.6,
      fontSize: 14, color: PL, fontFace: "Calibri", align: "center"
    });
  });
}

// ── SLIDE 2: 推しとは何か？ ───────────────────
{
  const sl = prs.addSlide();
  sb(sl, 2);
  ttl(sl, '「推し」の定義');

  // Definition bullets (left)
  const defs = ["応援したい対象", "感情移入する存在", "自分の人生に影響を与える存在"];
  defs.forEach((d, i) => {
    const y = BY + i * 0.92;
    rCard(sl, CX, y, 4.8, 0.78);
    dot(sl, CX + 0.18, y + 0.08);
    sl.addText(d, {
      x: CX + 0.44, y, w: 4.25, h: 0.78,
      fontSize: 14, color: DK, fontFace: "Calibri", valign: "middle", wrap: true
    });
  });

  // Examples label (right)
  sl.addText("推しの例", {
    x: 6.5, y: BY - 0.02, w: 6.5, h: 0.48,
    fontSize: 15, bold: true, color: PU, fontFace: "Arial Black"
  });

  const exs = ["アイドル", "アニメキャラ", "スポーツ選手", "犬", "ブランド", "配信者"];
  const exC = [HK, PM, "1565C0", "558B2F", "E65100", "00838F"];
  exs.forEach((ex, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const ex_x = 6.5 + col * 3.3, ex_y = BY + 0.52 + row * 0.83;
    sl.addShape(prs.ShapeType.roundRect, {
      x: ex_x, y: ex_y, w: 3.1, h: 0.65,
      arcSize: 30, fill: { color: exC[i] }, line: { type: "none" }
    });
    sl.addText(ex, {
      x: ex_x, y: ex_y, w: 3.1, h: 0.65,
      fontSize: 14, bold: true, color: WH, align: "center", valign: "middle"
    });
  });

  // Point card (bottom)
  rCard(sl, CX, 4.1, CW, 2.65, "FFF0F5", HK);
  sl.addShape(prs.ShapeType.rect, {
    x: CX, y: 4.1, w: 0.22, h: 2.65,
    fill: { color: HK }, line: { type: "none" }
  });
  sl.addText("ポイント", {
    x: CX + 0.38, y: 4.2, w: 3, h: 0.48,
    fontSize: 14, bold: true, color: HK, fontFace: "Arial Black"
  });
  sl.addText('「所有」ではなく「応援」が中心', {
    x: CX + 0.38, y: 4.75, w: CW - 0.6, h: 0.85,
    fontSize: 20, bold: true, color: DK, fontFace: "Georgia",
    align: "center", valign: "middle"
  });
}

// ── SLIDE 3: なぜ人は推しを作るのか？ ──────────
{
  const sl = prs.addSlide();
  sb(sl, 3);
  ttl(sl, "なぜ人は推しを作るのか？");

  rCard(sl, CX, BY, CW, 0.75, "FFF0F5", HK);
  sl.addText('人間の脳は"物語"が好き', {
    x: CX + 0.2, y: BY, w: CW - 0.4, h: 0.75,
    fontSize: 20, bold: true, color: HK, fontFace: "Arial Black",
    align: "center", valign: "middle"
  });

  const reasons = [
    "人はストーリーに感情移入する",
    "成長・努力・苦労を見ると応援したくなる",
    "「昔から知っている」が愛着になる",
  ];
  const rC = [HK, PM, "1565C0"];
  reasons.forEach((r, i) => {
    const y = BY + 0.93 + i * 0.88;
    sl.addShape(prs.ShapeType.ellipse, {
      x: CX, y: y + 0.07, w: 0.58, h: 0.58,
      fill: { color: rC[i] }, line: { type: "none" }
    });
    sl.addText(String(i + 1), {
      x: CX, y: y + 0.07, w: 0.58, h: 0.58,
      fontSize: 14, bold: true, color: WH, align: "center", valign: "middle"
    });
    sl.addText(r, {
      x: CX + 0.72, y, w: CW - 0.72, h: 0.72,
      fontSize: 15, color: DK, fontFace: "Calibri", valign: "middle"
    });
  });

  // Example card
  rCard(sl, CX, BY + 3.68, CW, 1.22, LV, LM);
  sl.addText("例：", {
    x: CX + 0.2, y: BY + 3.75, w: 0.8, h: 0.4,
    fontSize: 13, bold: true, color: PM
  });
  const exItems = ["下積み時代", "無名時代", "初期から追っている感覚"];
  exItems.forEach((ex, i) => {
    sl.addShape(prs.ShapeType.roundRect, {
      x: CX + 0.15 + i * 3.8, y: BY + 4.23, w: 3.55, h: 0.52,
      arcSize: 15, fill: { color: LM }, line: { type: "none" }
    });
    sl.addText(ex, {
      x: CX + 0.15 + i * 3.8, y: BY + 4.23, w: 3.55, h: 0.52,
      fontSize: 13, color: PU, bold: true, align: "center", valign: "middle"
    });
  });

  // Keyword
  rCard(sl, CX, BY + 5.1, CW, 0.62, PU, PU);
  sl.addText('キーワード：「自分だけが知っていた感」', {
    x: CX + 0.2, y: BY + 5.1, w: CW - 0.4, h: 0.62,
    fontSize: 15, bold: true, color: WH, fontFace: "Calibri",
    align: "center", valign: "middle"
  });
}

// ── SLIDE 4: SNSが推し活を変えた ──────────────
{
  const sl = prs.addSlide();
  sb(sl, 4);
  ttl(sl, "SNSが推し活を変えた");

  // "昔" card
  rCard(sl, CX, BY, 5.25, 3.75, GL, GY);
  sl.addText("昔", {
    x: CX + 0.2, y: BY + 0.1, w: 4.9, h: 0.55,
    fontSize: 22, bold: true, color: GY, fontFace: "Arial Black", align: "center"
  });
  ["テレビ", "雑誌", "限られた接触"].forEach((t, i) => {
    dot(sl, CX + 0.3, BY + 0.82 + i * 0.88, GY);
    sl.addText(t, {
      x: CX + 0.55, y: BY + 0.82 + i * 0.88, w: 4.8, h: 0.78,
      fontSize: 16, color: "424242", fontFace: "Calibri", valign: "middle"
    });
  });

  // VS
  sl.addText("VS", {
    x: 6.85, y: BY + 1.5, w: 0.85, h: 0.9,
    fontSize: 18, bold: true, color: HK, fontFace: "Arial Black",
    align: "center", valign: "middle"
  });

  // "今" card
  rCard(sl, 7.75, BY, 5.83, 3.75, "FFF0F5", HK);
  sl.addText("今", {
    x: 7.85, y: BY + 0.1, w: 5.55, h: 0.55,
    fontSize: 22, bold: true, color: HK, fontFace: "Arial Black", align: "center"
  });
  ["毎日更新", "ライブ配信", "コメント返信", "日常が見える"].forEach((t, i) => {
    dot(sl, 7.9, BY + 0.82 + i * 0.73, HK);
    sl.addText(t, {
      x: 8.15, y: BY + 0.82 + i * 0.73, w: 5.2, h: 0.65,
      fontSize: 16, color: DK, fontFace: "Calibri", valign: "middle"
    });
  });

  // Result card
  rCard(sl, CX, BY + 3.92, CW, 1.78, PU, PU);
  sl.addText("結果", {
    x: CX + 0.3, y: BY + 4.02, w: 1.5, h: 0.45,
    fontSize: 13, bold: true, color: PL
  });
  sl.addText("距離感が一気に近くなった", {
    x: CX + 0.3, y: BY + 4.5, w: CW - 0.6, h: 0.85,
    fontSize: 22, bold: true, color: WH, fontFace: "Georgia",
    align: "center", valign: "middle"
  });
}

// ── SLIDE 5: "共感"が最大の価値 ──────────────
{
  const sl = prs.addSlide();
  sb(sl, 5);
  ttl(sl, '"共感"が最大の価値');

  rCard(sl, CX, BY, CW, 1.22, "FFF0F5", HK);
  sl.addText('人は完璧な存在より、\n"少し弱さがある存在"に惹かれる', {
    x: CX + 0.2, y: BY, w: CW - 0.4, h: 1.22,
    fontSize: 18, bold: true, color: DK, fontFace: "Georgia",
    align: "center", valign: "middle", wrap: true
  });

  sl.addText("共感される要素", {
    x: CX, y: BY + 1.42, w: CW, h: 0.44,
    fontSize: 14, bold: true, color: PU, fontFace: "Arial Black"
  });

  const ky = ["不器用", "失敗", "努力", "孤独", "挑戦"];
  const kyC = [HK, "E65100", PM, "1565C0", "558B2F"];
  const pillW = 2.01, gap = 0.1875;
  const startX = CX + (CW - ky.length * pillW - (ky.length - 1) * gap) / 2;
  ky.forEach((k, i) => {
    const x = startX + i * (pillW + gap);
    sl.addShape(prs.ShapeType.roundRect, {
      x, y: BY + 1.98, w: pillW, h: 0.72,
      arcSize: 25, fill: { color: kyC[i] }, line: { type: "none" }
    });
    sl.addText(k, {
      x, y: BY + 1.98, w: pillW, h: 0.72,
      fontSize: 16, bold: true, color: WH, align: "center", valign: "middle"
    });
  });

  sl.addText("SNSで強い投稿", {
    x: CX, y: BY + 2.95, w: CW, h: 0.44,
    fontSize: 14, bold: true, color: PU, fontFace: "Arial Black"
  });

  rCard(sl, CX, BY + 3.52, 5.0, 1.88, GL, GY);
  sl.addText("成功報告だけ", {
    x: CX + 0.2, y: BY + 3.52, w: 4.65, h: 1.88,
    fontSize: 17, color: GY, bold: true, align: "center", valign: "middle"
  });

  sl.addText("→", {
    x: 6.55, y: BY + 4.15, w: 0.85, h: 0.65,
    fontSize: 26, color: HK, bold: true, align: "center", valign: "middle"
  });

  rCard(sl, 7.5, BY + 3.52, 5.6, 1.88, "FFF0F5", HK);
  sl.addText("過程や裏側を見せる投稿", {
    x: 7.6, y: BY + 3.52, w: 5.4, h: 1.88,
    fontSize: 17, color: HK, bold: true, align: "center", valign: "middle"
  });
}

// ── SLIDE 6: ファンコミュニティの力 ───────────
{
  const sl = prs.addSlide();
  sb(sl, 6);
  ttl(sl, "ファンコミュニティの力");

  rCard(sl, CX, BY, CW, 0.78, PU, PU);
  sl.addText('推し活は"仲間"を作る', {
    x: CX + 0.2, y: BY, w: CW - 0.4, h: 0.78,
    fontSize: 20, bold: true, color: WH, fontFace: "Arial Black",
    align: "center", valign: "middle"
  });

  const acts = ["コメント文化", "二次創作", "オフ会", "イベント参加", "グッズ共有"];
  const actC = [HK, PM, "1565C0", "558B2F", "E65100"];
  const actW = (CW - 4 * 0.13) / 5; // ≈ 2.25
  acts.forEach((a, i) => {
    const x = CX + i * (actW + 0.13);
    rCard(sl, x, BY + 0.98, actW, 2.45, LV, LM);
    sl.addShape(prs.ShapeType.ellipse, {
      x: x + actW / 2 - 0.33, y: BY + 1.12, w: 0.66, h: 0.66,
      fill: { color: actC[i] }, line: { type: "none" }
    });
    sl.addText(String(i + 1), {
      x: x + actW / 2 - 0.33, y: BY + 1.12, w: 0.66, h: 0.66,
      fontSize: 13, bold: true, color: WH, align: "center", valign: "middle"
    });
    sl.addText(a, {
      x: x + 0.1, y: BY + 1.95, w: actW - 0.2, h: 1.35,
      fontSize: 13, bold: true, color: DK, align: "center", valign: "middle", wrap: true
    });
  });

  rCard(sl, CX, BY + 3.63, CW, 2.0, "FFF0F5", HK);
  sl.addShape(prs.ShapeType.rect, {
    x: CX, y: BY + 3.63, w: 0.2, h: 2.0,
    fill: { color: HK }, line: { type: "none" }
  });
  sl.addText("重要", {
    x: CX + 0.38, y: BY + 3.73, w: 2, h: 0.42,
    fontSize: 13, bold: true, color: HK, fontFace: "Arial Black"
  });
  sl.addText('人は「推し」だけでなく、\n"推しを好きな人たち"も好きになる', {
    x: CX + 0.38, y: BY + 4.2, w: CW - 0.6, h: 1.2,
    fontSize: 17, color: DK, fontFace: "Georgia",
    align: "center", valign: "middle", wrap: true
  });
}

// ── SLIDE 7: なぜグッズを買うのか？ ────────────
{
  const sl = prs.addSlide();
  sb(sl, 7);
  ttl(sl, "なぜグッズを買うのか？");

  rCard(sl, CX, BY, CW, 0.98, "FFF0F5", HK);
  sl.addText('グッズは"モノ"ではなく、感情の保存装置', {
    x: CX + 0.2, y: BY, w: CW - 0.4, h: 0.98,
    fontSize: 19, bold: true, color: DK, fontFace: "Georgia",
    align: "center", valign: "middle"
  });

  const reasons = ["思い出を残したい", "応援したい", "所属感", "アイデンティティ化"];
  const rC = [HK, PM, "1565C0", "558B2F"];
  const cardW = (CW - 0.28) / 2; // ≈ 5.635
  reasons.forEach((r, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = CX + col * (cardW + 0.28);
    const y = BY + 1.18 + row * 1.72;
    rCard(sl, x, y, cardW, 1.52, LV, LM);
    sl.addShape(prs.ShapeType.ellipse, {
      x: x + 0.22, y: y + 0.28, w: 0.62, h: 0.62,
      fill: { color: rC[i] }, line: { type: "none" }
    });
    sl.addText(String(i + 1), {
      x: x + 0.22, y: y + 0.28, w: 0.62, h: 0.62,
      fontSize: 13, bold: true, color: WH, align: "center", valign: "middle"
    });
    sl.addText(r, {
      x: x + 1.0, y, w: cardW - 1.18, h: 1.52,
      fontSize: 15, bold: true, color: DK, fontFace: "Calibri",
      valign: "middle", wrap: true
    });
  });

  rCard(sl, CX, BY + 4.65, CW, 1.08, PU, PU);
  sl.addText('高級品より、「意味のあるモノ」が強い', {
    x: CX + 0.3, y: BY + 4.65, w: CW - 0.6, h: 1.08,
    fontSize: 18, bold: true, color: WH, fontFace: "Georgia",
    align: "center", valign: "middle"
  });
}

// ── SLIDE 8: ブランド化する推し ────────────────
{
  const sl = prs.addSlide();
  sb(sl, 8);
  ttl(sl, "ブランド化する推し");

  rCard(sl, CX, BY, CW, 0.75, "FFF0F5", HK);
  sl.addText('推しは"世界観"になる', {
    x: CX + 0.2, y: BY, w: CW - 0.4, h: 0.75,
    fontSize: 19, bold: true, color: HK, fontFace: "Arial Black",
    align: "center", valign: "middle"
  });

  // Left: brand characteristics
  sl.addText("強いブランドの特徴", {
    x: CX, y: BY + 0.95, w: 5.4, h: 0.45,
    fontSize: 14, bold: true, color: PU, fontFace: "Arial Black"
  });
  ["一貫性", "独自の言葉", "独自の美学", "世界観が崩れない"].forEach((c, i) => {
    dot(sl, CX + 0.02, BY + 1.56 + i * 0.82);
    sl.addText(c, {
      x: CX + 0.28, y: BY + 1.56 + i * 0.82, w: 5.1, h: 0.72,
      fontSize: 15, color: DK, fontFace: "Calibri", valign: "middle"
    });
  });

  // Right: examples
  sl.addText("例", {
    x: 7.15, y: BY + 0.95, w: 6.1, h: 0.45,
    fontSize: 14, bold: true, color: PU, fontFace: "Arial Black"
  });
  const exs = ["Apple", "Harley-Davidson", "サッカークラブ", "ストリートブランド"];
  const exC = ["1565C0", "B71C1C", "558B2F", "E65100"];
  exs.forEach((e, i) => {
    sl.addShape(prs.ShapeType.roundRect, {
      x: 7.15, y: BY + 1.52 + i * 0.82, w: 5.9, h: 0.65,
      arcSize: 10, fill: { color: exC[i] }, line: { type: "none" }
    });
    sl.addText(e, {
      x: 7.15, y: BY + 1.52 + i * 0.82, w: 5.9, h: 0.65,
      fontSize: 15, bold: true, color: WH, align: "center", valign: "middle"
    });
  });

  rCard(sl, CX, BY + 4.9, CW, 0.92, PU, PU);
  sl.addText('ファン心理：「商品」ではなく"文化"を買っている', {
    x: CX + 0.2, y: BY + 4.9, w: CW - 0.4, h: 0.92,
    fontSize: 16, bold: true, color: WH, fontFace: "Georgia",
    align: "center", valign: "middle"
  });
}

// ── SLIDE 9: 推し活市場の未来 ─────────────────
{
  const sl = prs.addSlide();
  sb(sl, 9);
  ttl(sl, "推し活市場の未来");

  rCard(sl, CX, BY, CW, 0.75, PU, PU);
  sl.addText("推し活はさらに拡大する", {
    x: CX + 0.2, y: BY, w: CW - 0.4, h: 0.75,
    fontSize: 19, bold: true, color: WH, fontFace: "Arial Black",
    align: "center", valign: "middle"
  });

  sl.addText("今後増えるもの", {
    x: CX, y: BY + 0.95, w: CW, h: 0.44,
    fontSize: 14, bold: true, color: PU, fontFace: "Arial Black"
  });

  const futures = [
    { t: "AIキャラクター", d: "バーチャル存在との感情的な絆" },
    { t: "バーチャル存在", d: "VTuber・メタバースのキャラクター" },
    { t: "小規模コミュニティブランド", d: "深い共感を持つニッチな集団" },
    { t: "超ニッチ趣味", d: "マニアックな世界に熱狂するファン層" },
  ];
  const fC = [HK, PM, "1565C0", "558B2F"];
  futures.forEach((f, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = CX + col * 5.88;
    const y = BY + 1.55 + row * 1.58;
    rCard(sl, x, y, 5.6, 1.35, LV, LM);
    sl.addShape(prs.ShapeType.rect, {
      x, y, w: 0.2, h: 1.35, fill: { color: fC[i] }, line: { type: "none" }
    });
    sl.addText(f.t, {
      x: x + 0.35, y: y + 0.05, w: 5.1, h: 0.55,
      fontSize: 14, bold: true, color: DK, fontFace: "Arial Black", valign: "middle", wrap: true
    });
    sl.addText(f.d, {
      x: x + 0.35, y: y + 0.6, w: 5.1, h: 0.68,
      fontSize: 13, color: GY, fontFace: "Calibri", valign: "middle", wrap: true
    });
  });

  rCard(sl, CX, BY + 4.88, CW, 0.9, HK, HK);
  sl.addText('"マス"より"深い共感"', {
    x: CX + 0.2, y: BY + 4.88, w: CW - 0.4, h: 0.9,
    fontSize: 18, bold: true, color: WH, fontFace: "Georgia",
    align: "center", valign: "middle"
  });
}

// ── SLIDE 10: まとめ ──────────────────────────
{
  const sl = prs.addSlide();
  sl.background = { color: PU };

  sl.addShape(prs.ShapeType.ellipse, {
    x: 10.5, y: -1.2, w: 4.5, h: 4.5,
    fill: { color: PM, transparency: 65 }, line: { type: "none" }
  });
  sl.addShape(prs.ShapeType.ellipse, {
    x: -0.8, y: 4.5, w: 3.0, h: 3.0,
    fill: { color: HK, transparency: 70 }, line: { type: "none" }
  });

  sl.addText("推しとは、", {
    x: 0.5, y: 0.22, w: 12.33, h: 0.62,
    fontSize: 18, color: PL, fontFace: "Calibri", align: "center"
  });
  sl.addText("「感情を預けられる存在」", {
    x: 0.5, y: 0.8, w: 12.33, h: 1.0,
    fontSize: 32, bold: true, color: WH, fontFace: "Georgia",
    align: "center", valign: "middle"
  });

  sl.addText("今日のポイント", {
    x: 0.5, y: 2.02, w: 12.33, h: 0.48,
    fontSize: 14, bold: true, color: PL, fontFace: "Arial Black", align: "center"
  });

  const pts = [
    "人は物語に熱狂する",
    "SNSで距離感が変わった",
    "共感が最重要",
    "グッズは感情の保存",
    "強い推しは文化になる",
  ];
  const ptC = [HK, PM, "1565C0", "558B2F", "E65100"];
  const ptW = (12.33 - 4 * 0.12) / 5; // ≈ 2.37
  pts.forEach((pt, i) => {
    const x = 0.5 + i * (ptW + 0.12);
    sl.addShape(prs.ShapeType.roundRect, {
      x, y: 2.6, w: ptW, h: 2.05,
      arcSize: 8, fill: { color: ptC[i] }, line: { type: "none" }
    });
    sl.addText(pt, {
      x, y: 2.6, w: ptW, h: 2.05,
      fontSize: 13, bold: true, color: WH, fontFace: "Calibri",
      align: "center", valign: "middle", wrap: true
    });
  });

  sl.addText("「好き」は、", {
    x: 0.5, y: 4.85, w: 12.33, h: 0.48,
    fontSize: 14, color: PL, align: "center"
  });
  sl.addText("人間の行動を最も強く動かすエネルギーの一つ。", {
    x: 0.5, y: 5.38, w: 12.33, h: 0.65,
    fontSize: 16, bold: true, color: WH, fontFace: "Georgia", align: "center"
  });
  sl.addText("— SNS時代のファン心理学入門 —", {
    x: 0.5, y: 6.1, w: 12.33, h: 0.45,
    fontSize: 12, color: PL, italic: true, align: "center"
  });
}

// ── WRITE FILE ────────────────────────────────
prs.writeFile({ fileName: "推し活_ファン心理学.pptx" })
  .then(() => console.log("Done: 推し活_ファン心理学.pptx created!"))
  .catch(err => { console.error("Error:", err); process.exit(1); });
