const form = document.querySelector("#readingForm");
const readingOutput = document.querySelector("#readingOutput");
const promptOutput = document.querySelector("#promptOutput");
const resetButton = document.querySelector("#resetButton");
const copyReadingButton = document.querySelector("#copyReadingButton");
const copyPromptButton = document.querySelector("#copyPromptButton");
const modeButtons = document.querySelectorAll(".mode-button");
const fixedThemeField = document.querySelector("#fixedThemeField");

let currentMode = "custom";

const volumeLabels = {
  light: "ライト：約800〜1000文字前後",
  standard: "スタンダード：約1300〜1600文字前後",
  full: "フル：約1800〜2200文字前後",
};

const volumeRules = {
  light: "状況整理を中心に簡潔にまとめる。④鑑定本文のみで最低800文字に到達してから締めへ進む。",
  standard:
    "心理背景と感情の流れを丁寧に描写する。各占い項目は450〜500文字程度を目安にし、④鑑定本文のみで最低1300文字に到達してから締めへ進む。",
  full:
    "心理・感情・迷い・気づき・行動選択の理由まで深掘りする。追加項目はそれぞれ300文字以上で記述し、④鑑定本文のみで最低1800文字に到達してから締めへ進む。",
};

function getFormData() {
  const data = new FormData(form);
  return {
    mode: currentMode,
    clientName: clean(data.get("clientName")) || "相談者さん",
    clientGender: clean(data.get("clientGender")) || "未入力",
    clientAge: clean(data.get("clientAge")) || "未入力",
    partnerName: clean(data.get("partnerName")) || "お相手",
    partnerGender: clean(data.get("partnerGender")) || "未入力",
    partnerAge: clean(data.get("partnerAge")) || "未入力",
    relationship: clean(data.get("relationship")) || "関係性は未入力",
    question: clean(data.get("question")) || "詳しいご相談内容は未入力",
    fixedTheme: clean(data.get("fixedTheme")) || "彼の気持ち・二人の現在・二人の未来",
    volume: data.get("volume") || "standard",
    cardDisplay: data.get("cardDisplay") || "hidden",
    includeNextOffer: data.get("includeNextOffer") === "on",
    operatorIdeas: data.get("operatorIdeas") === "on",
  };
}

function clean(value) {
  return String(value ?? "").trim();
}

function withSan(name) {
  const cleaned = clean(name);
  if (!cleaned) return "";
  return /さん$/.test(cleaned) ? cleaned : `${cleaned}さん`;
}

function buildAxes(values) {
  if (values.mode === "fixed") {
    return parseThemeItems(values.fixedTheme);
  }

  return ["お相手の気持ち", "二人の現在の関係性", "今後約3ヶ月の流れ"];
}

function parseThemeItems(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const bulletItems = lines
    .map((line) => line.match(/^(?:[・\-*]|[0-9０-９]+[.)．、]|[①-⑳]|[1-9]️⃣)\s*(.+)$/)?.[1]?.trim())
    .filter(Boolean);

  if (bulletItems.length > 0) return bulletItems;
  if (lines.length > 1) return lines;

  return text
    .split(/[、,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildReading(values) {
  const axes = buildAxes(values);
  const clientName = withSan(values.clientName);
  const sections = buildSections(values, axes);
  const nextOffer = values.includeNextOffer ? buildNextOffer(values, axes) : "";
  const operatorIdeas = values.operatorIdeas ? `\n\n${buildOperatorIdeas(values, axes)}` : "";

  return `お待たせいたしました。
鑑定が終わりましたので、結果を送付させていただきます。
ご確認をお願いします。

今回のご相談内容から、
${axes.map((axis) => `・${axis}`).join("\n")}
この${axes.length}つを軸に、恋愛タロットの象徴と心理面の流れを重ねて読み解いていきました。

🔮恋愛タロット鑑定書 ～${clientName}～🔮

${sections}

以上が鑑定結果となります。
ご不明な点がありましたら遠慮なくお知らせください。${nextOffer}${operatorIdeas}`;
}

function buildSections(values, axes) {
  const baseSections = axes
    .map((axis, index) => buildSection(values, `${axis}について`, index))
    .join("\n\n");

  if (values.volume === "standard") {
    const clientName = withSan(values.clientName);
    return `${baseSections}

${buildSection(values, "今の二人の距離感と心の温度について", 3)}

今の関係性を整理する視点として、${clientName}が「相手の反応を待つ時間」と「自分の気持ちを守る時間」を分けて考えることが大切になりそうです。相手の小さな変化を見ながらも、${clientName}自身が無理をしすぎない距離感を選ぶことで、この恋の流れは少しずつ見えやすくなっていくでしょう。`;
  }

  if (values.volume === "full") {
    return `${baseSections}

${buildSection(values, "感情整理と心のブロックについて", 3)}

${buildSection(values, "本音と建前のズレについて", 4)}

${buildSection(values, "この先の選択肢と注意点について", 5)}`;
  }

  return baseSections;
}

function buildSection(values, heading, seed) {
  const cardLine =
    values.cardDisplay === "shown"
      ? "カードの流れで見ると、節制・月・星のような、揺れながらも希望を探す象徴が重なっています。"
      : "カードからは、揺れる気持ちの奥に、まだ静かな希望を探しているような象徴が感じられます。";
  const clientName = withSan(values.clientName);
  const partner = withSan(values.partnerName);
  const relation = values.relationship;
  const variations = [
    `${clientName}は今、${partner}の言葉や態度のひとつひとつから、本当の気持ちを読み取ろうとしているように感じられます。${relation}という関係性だからこそ、近づきたい気持ちと、踏み込みすぎたくない慎重さが同時に出やすい時期です。${cardLine}ここで大切なのは、今すぐ白黒をつけることよりも、${clientName}が安心して受け取れる関わり方を選ぶことです。連絡を増やす、少し待つ、会話の温度を見るなど、行動は一つに決めきらなくても大丈夫です。`,
    `${partner}側には、気持ちがまったくないというより、状況やタイミングを見ながら距離を測っているような空気があります。ただ、その反応が分かりやすく表に出るとは限らないため、${clientName}が不安を感じやすくなっているのかもしれません。${cardLine}${clientName}ができることは、相手を急かすよりも、自分の言葉をやわらかく整えることです。小さな確認や自然な会話から、二人の空気を少しずつ見ていく流れが合っています。`,
    `今後の流れは、急展開というよりも、少しずつ温度を確かめ合うような進み方になりそうです。${clientName}が不安を抱えたまま動くと、言葉の裏を読みすぎて疲れてしまう可能性があります。${cardLine}だからこそ、選択肢としては、短く明るい連絡をする、相手の反応を待つ、自分の生活を整えるという三つを持っておくと安心です。どれを選んでも、${clientName}の気持ちを置き去りにしないことが、この恋を穏やかに進める鍵になります。`,
    `二人の距離感には、完全に離れているわけではないけれど、安心しきるには少し情報が足りないような温度があります。${clientName}は関係を大切にしたいからこそ、相手の沈黙や曖昧さを自分のせいにしてしまいやすいかもしれません。${cardLine}けれど、今は焦って答えを引き出すより、相手が自然に反応できる余白を残すことが大切です。${clientName}が落ち着いた言葉で接するほど、二人の間にある緊張は少しずつほどけていくでしょう。`,
    `${clientName}の中には、本当はもっと素直に聞きたいことがあるのに、重く見られたくない気持ちから言葉を飲み込んでいる部分がありそうです。${partner}に対して我慢していることが増えると、表面上は穏やかでも心の中では不安が積み重なりやすくなります。${cardLine}今は、すべてを伝える必要はありません。ただ、「どう扱われたら安心できるのか」を${clientName}自身が先に分かっておくことで、次に選ぶ言葉がやさしく整っていきます。`,
    `この先の選択肢として、進む・待つ・少し距離を取るという三つの道が見えています。進む場合は、相手を責める言い方ではなく、自然な会話の中で気持ちを確かめることが大切です。待つ場合は、期待だけで時間を過ごすと心が疲れやすいため、期限や自分の予定も大切にしてください。距離を取る場合は、関係を終わらせるためではなく、${clientName}の心を整えるための選択として考えるとよさそうです。${cardLine}`,
  ];

  return `【${heading}】
${variations[seed % variations.length]}`;
}

function buildNextOffer(values, axes) {
  const topic = axes[0] || "今回の恋愛";
  const clientName = withSan(values.clientName);
  const partnerName = withSan(values.partnerName);
  return `

次回につながる占い内容の提案

1. ${partnerName}の気持ちをさらに深く見る鑑定
内容：今回の鑑定で見えた${topic}を起点に、${partnerName}の本音・迷い・表に出しにくい感情を詳しく読み解く鑑定です。
おすすめ理由：今回の結果を読んだあと、相談者さんが一番知りたくなりやすい「相手の本音」に自然につながります。

2. 今後1ヶ月の恋の流れと行動タイミング鑑定
内容：近い未来の変化、連絡のタイミング、距離の縮め方、待つべき時期を具体的に読み解く鑑定です。
おすすめ理由：鑑定結果を受けて「では次にどう動けばいいか」を知りたい相談者さんに提案しやすい内容です。

3. 二人の関係を進めるための具体的な行動鑑定
内容：今の関係性に合わせて、連絡内容・会話の切り出し方・距離感の整え方を読み解く鑑定です。
おすすめ理由：不安を煽らず、相談者さんが現実で使いやすい次の一歩を提案できます。

相談者さんへそのまま送れるご案内文

🌸 ${clientName}、今回の鑑定結果を踏まえて、
もし「もう少し詳しく知りたい」「次にどう動けばいいか整理したい」と感じられた場合は、以下のような鑑定もご案内できます。

・${partnerName}の気持ちをさらに深く見る鑑定
・今後1ヶ月の恋の流れと行動タイミング鑑定
・二人の関係を進めるための具体的な行動鑑定

どれも今回の結果から自然につながる内容ですが、無理に追加で受ける必要はありません。
${clientName}が「今の自分に必要かも」と感じたタイミングで大丈夫です。`;
}

function buildOperatorIdeas(values, axes) {
  return `操作者向け：提案５

相手の本音深掘り／表に出にくい気持ちの確認／次回購入につなげやすい中心テーマです。
近未来の恋の流れ／1ヶ月から3ヶ月の変化／行動タイミングを知りたい方に向いています。
連絡の最適タイミング／送る内容と距離感／実践的なアドバイスとして販売しやすいです。
二人の障害整理／不安やすれ違いの原因／感情整理を求める方に提案しやすいです。
関係進展の可能性／進む・待つ・距離を取る選択／前向きな判断材料として使えます。`;
}

function buildPrompt(values) {
  const clientName = withSan(values.clientName);
  const partnerName = withSan(values.partnerName);
  const modeText =
    values.mode === "custom"
      ? "相談者の占ってほしい事に沿って占う"
      : "商品に設定している固定のテーマで占う";
  const fixedThemeLine = values.mode === "fixed" ? `占いテーマ：${values.fixedTheme}\n` : "";
  const cardRule =
    values.cardDisplay === "shown"
      ? "操作者から明確な指定があるため、必要な箇所のみカード名を併記する。"
      : "カード名は基本的に明示せず、象徴やイメージとして文章に自然に溶け込ませる。";

  return `あなたは「恋愛タロット占い師」。
恋愛の悩みに寄り添い、心理カウンセラーの視点も交えてタロット鑑定を行う。
出力結果は、ココナラ等でそのまま納品可能な【名前入り鑑定書】形式で作成する。
テンプレート感は避け、手書きの鑑定書のような温かみのある文章と構成で仕上げる。
罫線や定型の区切り線は使用せず、自然な段落構成・改行・絵文字を用いて読みやすく整える。
断定的な表現（例：「必ず」「絶対に」など）は避け、カードから感じられる「可能性」「流れ」として穏やかに伝える。

【今回の鑑定モード】
${modeText}

【鑑定ボリューム】
${volumeLabels[values.volume]}
${volumeRules[values.volume]}
文字数確認および補完処理は内部処理とし、ユーザーには一切表示しない。
同じ表現の言い換えや、意味のない水増しは禁止。

【入力情報】
相談者のお名前：${clientName}
相談者の性別：${values.clientGender}
相談者の年齢：${values.clientAge}
お相手のお名前：${partnerName}
お相手の性別：${values.partnerGender}
お相手の年齢：${values.partnerAge}
お二人のご関係：${values.relationship}
${fixedThemeLine}相談内容・状況：
${values.question}

【固定テーマの読み取りルール】
商品に設定している固定テーマで占う場合、占い項目は行頭の「・」「-」「番号」で始まる行を1項目として扱う。
文中の「・」は区切りとして扱わない。

【鑑定ルール】
・入力情報に不足や曖昧な点がある場合でも、勝手な補完や断定は行わず、読み取れる範囲の流れとして鑑定する
・年齢や関係性が未入力でも鑑定は可能
・${cardRule}
・本文では「あなた」という表現は使わず、相談者名とお相手名には必ず「さん」を付けて語りかける
・行動アドバイスは選択肢として提示し、相談者の意思を尊重する

【鑑定結果の出力順】
1. 冒頭固定文を必ず出力する：
お待たせいたしました。
鑑定が終わりましたので、結果を送付させていただきます。
ご確認をお願いします。

2. 今回の鑑定で読み解く鑑定の軸・項目の説明を自然な文章と箇条書きで書く
3. 鑑定書の題名を「🔮恋愛タロット鑑定書 ～${clientName}～🔮」の形式で書く
4. 鑑定本文を占い項目ごとに分けて書く。各見出しは必ず【〇〇について】の形式にする
${values.volume === "standard" ? "5. スタンダード鑑定専用として【今の二人の距離感と心の温度について】を必ず含め、本文最後に「今の関係性を整理する視点」を1段落追加する" : ""}
${values.volume === "full" ? "5. フル鑑定専用として【感情整理と心のブロックについて】【本音と建前のズレについて】【この先の選択肢と注意点について】を必ず追加する" : ""}

【鑑定文の締め】
鑑定書の最後は、必ず以下の文章のみを使用する。
「以上が鑑定結果となります。
ご不明な点がありましたら遠慮なくお知らせください。」

${values.includeNextOffer ? `【次の鑑定のご提案】
締め文の直後にのみ表示する。
押し売りや不安を煽る表現は使わない。
必要がある場合のみ最大3件まで提案し、「選ぶかどうかは相談者の自由」であるニュアンスを必ず含める。
出力順は以下を厳守する。
1. 「次回につながる占い内容の提案」として、鑑定名・内容・おすすめ理由を3件出す
2. 「相談者さんへそのまま送れるご案内文」として、操作者が相談者へコピペできる自然な文章を出す
3. 案内文は不安を煽らず、必要だと感じたタイミングでよいという表現を入れる` : "【次の鑑定のご提案】今回は表示しない。"}

${values.operatorIdeas ? `【操作者向け追提案機能】
通常の鑑定書本文とは別に「操作者向け：提案５」として、タイトル（20字以内）／内容の焦点（1行）／おすすめ理由（1行）を5件出力する。
不安を煽らず、前向きで実用的な次回導線とする。` : "【操作者向け追提案機能】今回は出力しない。"}

上記ルールに従って、納品可能な鑑定書を作成してください。`;
}

function render() {
  const values = getFormData();
  readingOutput.textContent = buildReading(values);
  promptOutput.textContent = buildPrompt(values);
}

async function copyText(text, message) {
  await navigator.clipboard.writeText(text);
  showToast(message);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 1800);
}

function setMode(mode) {
  currentMode = mode;
  modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.mode === mode));
  fixedThemeField.classList.toggle("hidden", mode !== "fixed");
  document.querySelector("#question").placeholder =
    mode === "fixed"
      ? "固定テーマに関する相談者さんの状況・背景・気になっていることを入力してください"
      : "相談者さんからいただいた相談文や、聞き直して得た状況説明を入力してください";
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});

resetButton.addEventListener("click", () => {
  form.reset();
  setMode("custom");
  readingOutput.textContent = "入力すると、ここにココナラ等で納品しやすい名前入り鑑定書が表示されます。";
  promptOutput.textContent = "鑑定書を作成すると、GPTs用プロンプトが表示されます。";
});

copyReadingButton.addEventListener("click", () => {
  copyText(readingOutput.textContent, "鑑定書をコピーしました");
});

copyPromptButton.addEventListener("click", () => {
  copyText(promptOutput.textContent, "プロンプトをコピーしました");
});
