/* The Master Plan - Al Shami strategy alignment deck
 * Build: node build.js   (needs pptxgenjs; set NODE_PATH if installed elsewhere)
 * Photos: drop final JPGs into ../photos/<slot>.jpg (see SLOTS below). Missing
 * photos render as labelled placeholder plates so layout QA still works.
 */
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require("./apply_theme.js");

const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(__dirname, "assets");
const PHOTOS = path.join(ROOT, "photos");
const OUT = path.join(ROOT, "master-plan.pptx");

// ---------- Theme ----------
const THEME = {
  name: "Al Shami Master Plan",
  headFontFace: "Cormorant Garamond",
  bodyFontFace: "Rubik",
  colors: {
    dk1: "1F1612", // espresso
    lt1: "F6F0E6", // cream
    dk2: "2E3A2B", // cardamom green
    lt2: "EDE3D3", // sand
    accent1: "C99A5B", // copper (accent on dark)
    accent2: "8A5A2B", // dark copper (accent on light)
    accent3: "5A4A3F", // body text on light
    accent4: "D9CBB6", // body text on dark
    accent5: "2A201A", // dark card panel
    accent6: "D8CBB8", // hairline on light
    hlink: "8A5A2B",
    folHlink: "5A4A3F",
  },
};
const HEX = THEME.colors;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "[Consultant name]";
pres.title = "The Master Plan - Al Shami";
pres.subject = "Strategy alignment session";
const C = pres.SchemeColor;
const ESP = C.text1, CREAM = C.background1, GREEN = C.text2, SAND = C.background2;
const COPPER = C.accent1, DCOPPER = C.accent2, BODY_L = C.accent3, BODY_D = C.accent4;
const PANEL = C.accent5, HAIR = C.accent6;
const HEAD = "+mj-lt", BODYF = "+mn-lt";

const W = 13.333, H = 7.5, M = 0.9, CW = W - 2 * M;
const EYE_Y = 0.85, TITLE_Y = 1.15, FOOT_Y = 6.98;

// ---------- Layouts (one per frame) ----------
pres.defineSlideMaster({ title: "DARK", background: { color: HEX.dk1 } });
pres.defineSlideMaster({ title: "LIGHT", background: { color: HEX.lt1 } });
pres.defineSlideMaster({ title: "SAND", background: { color: HEX.lt2 } });
pres.defineSlideMaster({ title: "PHOTO", background: { color: HEX.dk1 } });

// ---------- Photo slots ----------
const SLOTS = {
  "01-cover": "Roasted beans tumbling from a drum roaster",
  "04-ambition": "Arabic coffee poured from a brass dallah",
  "05-card-1": "Grab and go counter",
  "05-card-2": "Chef plating in an open kitchen",
  "05-card-3": "Resort terrace at sunset",
  "05-card-4": "Hands holding a small cup of cardamom coffee",
  "06-pillar-1": "Roastery with burlap sacks",
  "07-pillar-2": "Chef plating at a pass",
  "08-pillar-3": "Resort courtyard, lanterns at dusk",
  "09-pillar-4": "Heritage coffee house, brass and wood",
  "12-close": "Steam rising from a coffee cup",
};
const missing = [];
function photoPath(slot) {
  for (const ext of [".jpg", ".jpeg", ".png"]) {
    const p = path.join(PHOTOS, slot + ext);
    if (fs.existsSync(p)) return { p, real: true };
  }
  missing.push(slot);
  return { p: path.join(ASSETS, "plate_" + slot + ".jpg"), real: false };
}

// ---------- Helpers ----------
const T = (o) => Object.assign({ isTextBox: true, margin: 0, valign: "top", fontFace: BODYF }, o);

function photo(slide, slot, x, y, w, h, scrims = [], labelColor = COPPER) {
  const { p, real } = photoPath(slot);
  slide.addImage({ path: p, x, y, w, h, sizing: { type: "cover", w, h }, objectName: "Photo " + slot, altText: SLOTS[slot] });
  for (const s of scrims) {
    slide.addImage({ path: path.join(ASSETS, s.file + ".png"), x: s.x ?? x, y: s.y ?? y, w: s.w ?? w, h: s.h ?? h, objectName: "Scrim " + s.file, altText: "Gradient scrim" });
  }
  if (!real) {
    slide.addText(("PHOTO SLOT " + slot + " : " + SLOTS[slot]).toUpperCase(), T({
      x: x + 0.25, y: y + 0.3, w: w - 0.5, h: 0.6, fontSize: 9, color: labelColor, charSpacing: 1.5, align: "right",
      objectName: "Photo slot label " + slot }));
  }
}
function eyebrow(slide, text, x, y, w, color, opts = {}) {
  slide.addText(text.toUpperCase(), T(Object.assign({ x, y, w, h: 0.3, fontSize: 12, color, charSpacing: 2.5, objectName: "Eyebrow: " + text }, opts)));
}
function title(slide, text, color, opts = {}) {
  slide.addText(text, T(Object.assign({ x: M, y: TITLE_Y, w: CW, h: 0.8, fontSize: 40, fontFace: HEAD, color, objectName: "Title" }, opts)));
}
function footer(slide, n, color, x = M) {
  slide.addText("The Master Plan · " + String(n).padStart(2, "0"), T({ x, y: FOOT_Y, w: 4, h: 0.3, fontSize: 12, color, objectName: "Footer" }));
}
function rect(slide, x, y, w, h, fill, line, name) {
  const o = { x, y, w, h, fill: { color: fill }, objectName: name || "Panel" };
  o.line = line ? { color: line.color, width: line.width || 1 } : { color: fill, width: 0 };
  slide.addShape(pres.ShapeType.rect, o);
}
function hairline(slide, x, y, w, color) {
  slide.addShape(pres.ShapeType.line, { x, y, w, h: 0, line: { color, width: 0.75 }, objectName: "Hairline" });
}

// =====================================================================
// 1. COVER
// =====================================================================
pres.addSection({ title: "Opening" });
{
  const s = pres.addSlide({ masterName: "DARK", sectionTitle: "Opening" });
  const px = 6.4;
  photo(s, "01-cover", px, 0, W - px, H, [
    { file: "scrim_left_fade", x: px, y: 0, w: 3.6, h: H },
    { file: "scrim_bottom_soft", x: px, y: 0, w: W - px, h: H },
  ]);
  eyebrow(s, "Strategy alignment · Al Shami", M, 2.15, 6.5, COPPER);
  s.addText("The Master Plan", T({ x: M, y: 2.5, w: 7.6, h: 1.4, fontSize: 80, fontFace: HEAD, color: CREAM, objectName: "Cover title" }));
  s.addText("From heritage roaster to the Middle East’s proud coffee and hospitality house",
    T({ x: M, y: 4.05, w: 5.9, h: 1.1, fontSize: 20, color: BODY_D, lineSpacingMultiple: 1.2, objectName: "Cover subtitle" }));
  s.addText("[Consultant name] · [Month 2026]", T({ x: M, y: 6.6, w: 5.5, h: 0.3, fontSize: 12, color: BODY_D, charSpacing: 1.5, objectName: "Cover meta" }));
  s.addNotes("Welcome, and thank you for the time. This is not a pitch of finished answers. It is a working session to agree the direction, so that the next step is a concrete, costed plan. Everything here is a starting point for discussion.");
}

// =====================================================================
// 2. WHY WE'RE HERE
// =====================================================================
{
  const s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Opening" });
  eyebrow(s, "Why we’re here", M, EYE_Y, CW, DCOPPER);
  title(s, "Alignment first, then a concrete plan", ESP);
  const cards = [
    ["01", "Align", "Agree the vision and the ambition for Al Shami and the wider group."],
    ["02", "Prioritise", "Confirm the four pillars and decide what comes first."],
    ["03", "Commit", "Agree the next step: a concrete, costed plan with owners and dates."],
  ];
  const gap = 0.4, cw = (CW - 2 * gap) / 3, cy = 2.5, ch = 3.6, pad = 0.45;
  cards.forEach(([n, t, b], i) => {
    const x = M + i * (cw + gap);
    rect(s, x, cy, cw, ch, SAND, null, "Card " + n);
    s.addText(n, T({ x: x + pad, y: cy + pad, w: cw - 2 * pad, h: 0.7, fontSize: 40, fontFace: HEAD, color: DCOPPER, objectName: "Card number " + n }));
    s.addText(t, T({ x: x + pad, y: cy + 1.45, w: cw - 2 * pad, h: 0.5, fontSize: 22, fontFace: HEAD, color: ESP, objectName: "Card title " + t }));
    s.addText(b, T({ x: x + pad, y: cy + 2.0, w: cw - 2 * pad, h: 1.2, fontSize: 15, color: BODY_L, lineSpacingMultiple: 1.25, objectName: "Card body " + t }));
  });
  footer(s, 2, BODY_L);
  s.addNotes("Three outcomes for today: align on the ambition, prioritise the pillars, and commit to the next step. If we leave with those three agreed, the session has done its job.");
}

// =====================================================================
// 3. WHERE AL SHAMI STANDS TODAY
// =====================================================================
pres.addSection({ title: "Where we are" });
{
  const s = pres.addSlide({ masterName: "SAND", sectionTitle: "Where we are" });
  eyebrow(s, "Today", M, EYE_Y, CW, DCOPPER);
  title(s, "Where Al Shami stands today", ESP);
  const cols = [
    { h: "What we build on", sub: null, filled: true, items: [
      "A trusted name with [a century] of roasting craft",
      "Grab & go: the first step into modern retail",
      "Modernisation efforts already underway",
      "Loyal customers and strong local recognition"] },
    { h: "What we need to fix", sub: "Hypotheses to validate", filled: false, items: [
      "A brand and packaging built for regional growth",
      "Standard operations and consistent quality",
      "Talent, training and a clear structure",
      "A growth roadmap beyond Syria"] },
  ];
  const gap = 0.4, cw = (CW - gap) / 2, cy = 2.4, ch = 4.0, pad = 0.5;
  cols.forEach((c, i) => {
    const x = M + i * (cw + gap);
    rect(s, x, cy, cw, ch, CREAM, null, "Column " + (i + 1));
    s.addText(c.h, T({ x: x + pad, y: cy + pad, w: cw - 2 * pad, h: 0.5, fontSize: 22, fontFace: HEAD, color: ESP, objectName: "Column heading" }));
    if (c.sub) eyebrow(s, c.sub, x + pad, cy + pad + 0.52, cw - 2 * pad, DCOPPER);
    let y = cy + 1.45;
    c.items.forEach((it, j) => {
      const dot = { x: x + pad, y: y + 0.08, w: 0.12, h: 0.12, objectName: "Marker" };
      dot.fill = c.filled ? { color: DCOPPER } : { color: CREAM };
      dot.line = { color: DCOPPER, width: 1 };
      s.addShape(pres.ShapeType.ellipse, dot);
      s.addText(it, T({ x: x + pad + 0.32, y, w: cw - 2 * pad - 0.32, h: 0.5, fontSize: 15, color: BODY_L, objectName: "Item " + (j + 1) }));
      y += 0.6;
    });
  });
  footer(s, 3, BODY_L);
  s.addNotes("First, credit where it is due: the name, the craft, the grab and go launch and the modernisation already underway are real momentum. The right-hand column is a set of hypotheses, not verdicts. We want to test them with you today.");
}

// =====================================================================
// 4. THE AMBITION
// =====================================================================
{
  const s = pres.addSlide({ masterName: "PHOTO", sectionTitle: "Where we are" });
  photo(s, "04-ambition", 0, 0, W, H, [{ file: "scrim_green" }], BODY_D);
  eyebrow(s, "The ambition", M, 2.25, CW, COPPER);
  s.addText("From Syria’s heritage roaster to the Middle East’s proudest coffee and hospitality house.",
    T({ x: M, y: 2.65, w: CW, h: 1.7, fontSize: 40, fontFace: HEAD, color: CREAM, lineSpacingMultiple: 1.05, objectName: "Statement" }));
  s.addText("A proud brand that grows across the region, gives back to its community and builds a legacy that outlasts its founders.",
    T({ x: M, y: 4.55, w: 8.2, h: 0.9, fontSize: 18, color: BODY_D, lineSpacingMultiple: 1.25, objectName: "Statement sub" }));
  footer(s, 4, BODY_D);
  s.addNotes("This is the ambition we want to test with you. Pause on it. Is this the scale you want: regional, community minded, built to outlast the founders? If the words are wrong, this is the moment to change them.");
}

// =====================================================================
// 5. FOUR PILLARS, ONE DIRECTION
// =====================================================================
pres.addSection({ title: "The plan" });
const PILLARS = [
  { n: "01", t: "Fix & modernise Al Shami", d: "A proud regional brand built on grab & go", card: "05-card-1", slot: "06-pillar-1",
    amb: "Build on grab & go and the modernisation already started: a proud Middle East brand with CSR at its heart.",
    out: "A modern Al Shami, ready to grow across the region",
    ws: [["Brand & marketing", "Refresh identity, packaging and story; build a digital presence"],
         ["Concept", "Turn grab & go into a repeatable format: kiosk, cafe, retail shelf"],
         ["Operations", "SOPs, roasting consistency, quality control and supply chain"],
         ["People", "Key hires, a training academy and service standards"],
         ["Build", "Store design standards, retail and e\u2011commerce channels"],
         ["Impact (CSR)", "Ethical sourcing and community programs that carry the name"]],
    notes: "Pillar one is the foundation and the first priority. Everything else borrows credibility from a modern, consistent Al Shami. Grab and go is the proof point we scale from, with CSR built in from the start, not added later." },
  { n: "02", t: "New concept creation", d: "New F&B brands that diversify growth", card: "05-card-2", slot: "07-pillar-2",
    amb: "New F&B brands that diversify revenue, use Al Shami’s strengths and open new markets.",
    out: "[2-3] proven concepts, ready to scale",
    ws: [["Concept", "Spot market gaps; design concepts, menus and guest experiences"],
         ["Brand & marketing", "Naming, identity and launch campaigns for each concept"],
         ["Operations", "Kitchen design, SOPs and a shared supplier network"],
         ["People", "Hire chefs and GMs; train every team to one standard"],
         ["Build", "Site selection, design, fit-out and a pilot location"],
         ["Execution", "Stage gates: test, learn, then scale or stop"]],
    notes: "Pillar two uses what Al Shami already has: sourcing, roasting, a trusted name and loyal customers. New concepts are tested as pilots with clear stage gates, so we scale what works and stop what does not." },
  { n: "03", t: "Resort & hospitality group", d: "Venues that carry the Al Shami welcome", card: "05-card-3", slot: "08-pillar-3",
    amb: "Resorts and venues that carry the Al Shami standard of welcome and generosity.",
    out: "A pipeline with [first resort] in development",
    ws: [["Concept", "Positioning, guest experience and the F&B program"],
         ["Brand", "One group brand architecture across every venue"],
         ["Operations", "Operating model, management systems and service standards"],
         ["People", "A leadership team and a hospitality academy"],
         ["Build", "Site and partner strategy, feasibility and development"],
         ["Execution", "A phased pipeline with clear investment gates"]],
    notes: "Pillar three is the long game: hospitality venues that express the Al Shami welcome at a larger scale. It is capital intensive, so it moves in phases with investment gates, and it depends on the people and systems built in pillars one and two." },
  { n: "04", t: "Continuity & legacy", d: "Governance, succession and lasting impact", card: "05-card-4", slot: "09-pillar-4",
    amb: "Clear governance, next-generation leadership and an impact that reaches beyond the founders.",
    out: "A group that runs on systems, not on individuals",
    ws: [["Governance", "A board, a family charter and clear decision rights"],
         ["People", "Succession planning and next-generation development"],
         ["Systems", "Finance, reporting and shared KPIs across the group"],
         ["Brand heritage", "An archive and a story that protect the name"],
         ["Impact (CSR)", "A foundation for community and sourcing impact"],
         ["Execution", "An annual strategy review that keeps the plan alive"]],
    notes: "Pillar four is what makes the other three last. Governance, succession and shared systems turn a family business into an institution. It runs alongside the others from day one rather than waiting until the end." },
];
{
  const s = pres.addSlide({ masterName: "DARK", sectionTitle: "The plan" });
  eyebrow(s, "The plan", M, EYE_Y, CW, COPPER);
  title(s, "Four pillars, one direction", CREAM);
  const gap = 0.333, cw = (CW - 3 * gap) / 4, cy = 2.25, ph = 2.1, panel = 2.35, pad = 0.3;
  PILLARS.forEach((p, i) => {
    const x = M + i * (cw + gap);
    photo(s, p.card, x, cy, cw, ph, [{ file: "scrim_bottom" }]);
    s.addText(p.n, T({ x: x + pad, y: cy + ph - 0.8, w: 1.2, h: 0.6, fontSize: 40, fontFace: HEAD, color: COPPER, objectName: "Pillar number " + p.n }));
    rect(s, x, cy + ph, cw, panel, PANEL, null, "Pillar panel " + p.n);
    s.addText(p.t, T({ x: x + pad, y: cy + ph + 0.28, w: cw - 2 * pad + 0.05, h: 1.1, fontSize: 22, fontFace: HEAD, color: CREAM, lineSpacingMultiple: 0.95, objectName: "Pillar title " + p.n }));
    s.addText(p.d, T({ x: x + pad, y: cy + ph + 1.42, w: cw - 2 * pad, h: 0.85, fontSize: 14, color: BODY_D, lineSpacingMultiple: 1.25, objectName: "Pillar description " + p.n }));
  });
  footer(s, 5, BODY_D);
  s.addNotes("Four pillars, one direction. Fix and modernise Al Shami first, create new concepts, build toward a hospitality group, and put continuity and legacy underneath it all. The order matters, and that sequencing is one of the decisions we want from you today.");
}

// =====================================================================
// 6-9. ONE SLIDE PER PILLAR
// =====================================================================
PILLARS.forEach((p, i) => {
  const s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "The plan" });
  const pw = W * 0.4; // 5.333
  photo(s, p.slot, 0, 0, pw, H, [{ file: "scrim_full_dark" }, { file: "scrim_left_fade_soft", x: 0, y: 0, w: pw, h: H }]);
  const tx = M, tw = pw - M - 0.6;
  eyebrow(s, "Pillar " + p.n, tx, EYE_Y, tw, COPPER);
  s.addText(p.t, T({ x: tx, y: TITLE_Y, w: tw, h: 1.9, fontSize: 40, fontFace: HEAD, color: CREAM, lineSpacingMultiple: 1.0, objectName: "Title" }));
  eyebrow(s, "Ambition", tx, 3.9, tw, COPPER);
  s.addText(p.amb, T({ x: tx, y: 4.22, w: tw, h: 1.35, fontSize: 15, color: BODY_D, lineSpacingMultiple: 1.25, objectName: "Ambition" }));
  eyebrow(s, "Outcome", tx, 5.62, tw, COPPER);
  s.addText(p.out, T({ x: tx, y: 5.94, w: tw, h: 0.75, fontSize: 15, color: CREAM, lineSpacingMultiple: 1.25, objectName: "Outcome" }));

  const rx = pw + 0.75, rw = W - M - rx, lw = 1.8;
  eyebrow(s, "Workstreams", rx, EYE_Y, rw, DCOPPER);
  let y = 1.35; const rh = 0.82;
  hairline(s, rx, y, rw, HAIR);
  p.ws.forEach(([label, action], j) => {
    s.addText(label.toUpperCase(), T({ x: rx, y: y + 0.17, w: lw, h: 0.5, fontSize: 11, color: DCOPPER, charSpacing: 1.5, bold: true, lineSpacingMultiple: 1.2, objectName: "Workstream label " + (j + 1) }));
    s.addText(action, T({ x: rx + lw + 0.15, y: y + 0.14, w: rw - lw - 0.15, h: rh - 0.2, fontSize: 15, color: BODY_L, lineSpacingMultiple: 1.2, objectName: "Workstream action " + (j + 1) }));
    y += rh;
    hairline(s, rx, y, rw, HAIR);
  });
  footer(s, 6 + i, BODY_L, rx);
  s.addNotes(p.notes);
});

// =====================================================================
// 10. HOW WE GET THERE
// =====================================================================
pres.addSection({ title: "The road ahead" });
{
  const s = pres.addSlide({ masterName: "DARK", sectionTitle: "The road ahead" });
  eyebrow(s, "The roadmap", M, EYE_Y, CW, COPPER);
  title(s, "How we get there", CREAM);
  const phases = [
    ["Phase 1 · Now", "Align", "Vision, pillars and priorities agreed", "This session", true],
    ["Phase 2", "Plan", "A concrete, costed plan per pillar with owners and KPIs", "[__ weeks]", false],
    ["Phase 3", "Execute", "Quick wins on Al Shami first, then pilots for new concepts", "[__ months]", false],
    ["Phase 4", "Scale", "Regional roll-out, hospitality pipeline and governance in place", "[__ years]", false],
  ];
  const gap = 0.333, cw = (CW - 3 * gap) / 4, lineY = 2.85, cy = 3.45, ch = 3.25, pad = 0.35;
  s.addShape(pres.ShapeType.line, { x: M, y: lineY, w: CW, h: 0, line: { color: DCOPPER, width: 1 }, objectName: "Timeline" });
  phases.forEach(([eb, t, b, tag, hi], i) => {
    const x = M + i * (cw + gap), cx = x + cw / 2, d = 0.2 + i * 0.12;
    s.addShape(pres.ShapeType.ellipse, { x: cx - d / 2, y: lineY - d / 2, w: d, h: d,
      fill: { color: hi ? COPPER : ESP }, line: { color: COPPER, width: 1.5 }, objectName: "Node " + (i + 1) });
    rect(s, x, cy, cw, ch, PANEL, hi ? { color: COPPER, width: 1 } : null, "Phase card " + (i + 1));
    eyebrow(s, eb, x + pad, cy + pad, cw - 2 * pad, COPPER);
    s.addText(t, T({ x: x + pad, y: cy + pad + 0.38, w: cw - 2 * pad, h: 0.5, fontSize: 22, fontFace: HEAD, color: CREAM, objectName: "Phase title " + t }));
    s.addText(b, T({ x: x + pad, y: cy + pad + 0.9, w: cw - 2 * pad, h: 1.35, fontSize: 14, color: BODY_D, lineSpacingMultiple: 1.25, objectName: "Phase body " + t }));
    s.addText(tag, T({ x: x + pad, y: cy + ch - pad - 0.3, w: cw - 2 * pad, h: 0.3, fontSize: 12, color: hi ? COPPER : BODY_D, charSpacing: 1.5, objectName: "Phase timing " + t }));
  });
  footer(s, 10, BODY_D);
  s.addNotes("We are in phase one today. Phase two is the ask: a short planning sprint that turns each pillar into a concrete, costed plan with owners and KPIs. Execution starts with quick wins on Al Shami itself before any new concept is piloted.");
}

// =====================================================================
// 11. WHAT WE NEED TO AGREE TODAY
// =====================================================================
{
  const s = pres.addSlide({ masterName: "SAND", sectionTitle: "The road ahead" });
  eyebrow(s, "Decisions", M, EYE_Y, CW, DCOPPER);
  title(s, "What we need to agree today", ESP);
  const items = [
    "Confirm the ambition and the four pillars",
    "Agree priorities and sequencing across the pillars",
    "Name the decision makers and a project lead on your side",
    "Share the data: sales, costs, sites and current plans",
    "Lock dates for the planning workshops",
  ];
  let y = 2.35; const rh = 0.84;
  hairline(s, M, y, CW, HAIR);
  items.forEach((it, i) => {
    s.addText(String(i + 1).padStart(2, "0"), T({ x: M, y: y + 0.1, w: 1.0, h: 0.6, fontSize: 32, fontFace: HEAD, color: DCOPPER, objectName: "Decision number " + (i + 1) }));
    s.addText(it, T({ x: M + 1.1, y: y + 0.24, w: CW - 1.1, h: 0.5, fontSize: 20, color: ESP, objectName: "Decision " + (i + 1) }));
    y += rh;
    hairline(s, M, y, CW, HAIR);
  });
  footer(s, 11, BODY_L);
  s.addNotes("Five decisions, and none of them need a number attached yet. Confirm the ambition and the pillars, agree the order, name the people, share the data, and lock the workshop dates. With those agreed, we can start the planning phase immediately.");
}

// =====================================================================
// 12. CLOSE
// =====================================================================
{
  const s = pres.addSlide({ masterName: "PHOTO", sectionTitle: "The road ahead" });
  photo(s, "12-close", 0, 0, W, H, [{ file: "scrim_close" }], BODY_D);
  eyebrow(s, "Thank you", M, 2.4, CW, COPPER);
  s.addText("Let’s build the next century of Al Shami, together.",
    T({ x: M, y: 2.8, w: 9.6, h: 2.0, fontSize: 44, fontFace: HEAD, color: CREAM, lineSpacingMultiple: 1.05, objectName: "Statement" }));
  s.addText("[Consultant name] · [email] · [phone]", T({ x: M, y: 5.35, w: 8, h: 0.35, fontSize: 15, color: BODY_D, charSpacing: 1, objectName: "Contact" }));
  s.addNotes("Thank you. The ambition is yours; the plan is ours to build together. The next step is a date for the first planning workshop.");
}

// ---------- Write ----------
(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("Wrote", OUT);
  if (missing.length) console.log("Photo slots using placeholder plates:", missing.join(", "));
})();
