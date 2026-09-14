# 株式会社リョーキ 採用LP

新卒就活生向けの会社紹介ランディングページ。静的HTML/CSS/JS構成、ビルドには Vite を使用（`npm run build` → `dist/` を社内サーバーへFTPアップロード）。

## フォルダ構成

```
html/
├── index.html              … 1ページLP本体（全セクション）
├── assets/
│   ├── css/
│   │   ├── reset.css       … 最小リセット
│   │   └── style.css       … LP本体スタイル（先頭にデザイントークン）
│   ├── js/
│   │   └── main.js         … メニュー開閉 / 年号 / フェードイン
│   ├── images/             … 画像・ロゴ・favicon・OGP（.gitkeepのみ）
│   └── fonts/              … Webフォントを使う場合のみ（.gitkeepのみ）
├── .editorconfig
├── .gitignore
└── README.md
```

## ファーストビュー（`.fv`）

- **写真を重ねて貼ったコラージュ（新聞の写真面付け／Photoshop のグリッドコラージュ風）**。
  不揃いなサイズの写真を端で少し重ねながら敷き詰める。赤枠の参考画像（デザイン指定）に
  合わせて配置。出現アニメは **CSS のみ**（`animation-delay: var(--d)`）、JS 不要。
- 仕組み: `.fv__stage`（`position:absolute; inset:0`）の中に各写真を **`position:absolute`
  で個別配置**（CSS Grid は使わない）。位置・サイズは 1920×1080 の方眼上でピクセル設計し、
  **% に換算**して `--l/--t/--w/--h` で指定（`index.html` のインライン `style`）。
  前後関係は `--z`（z-index）。写真同士は端を少し重ね、参考画像どおり所々に白地
  （`.fv` の `#fff`）が覗く。
- **white のフチ / padding / box-shadow / 回転 / 拡大は一切付けない**。写真は水平垂直に整列。
  出現は不透明度のみ（`@keyframes fvPop` は opacity 0→1 だけ）。
- 写真タイルは 16 枚。`const-cranes` を右上の大きな背景に、`const-truck` を中央、
  `そこに、リョーキ`（`.fv__catch`）を右下大きめに置く構成。
- スマホ（≤640px）は `nth-child` で **2 列 × 6 段のベタ組み**に組み替え、4 枚
  （`env-attach` / `mv_sitemap_sp` / `recycle` / `top_mv_sp3`）を非表示。座標はインライン
  `style` で入れているため、上書きに `--l/--t/--w/--h` へ `!important` が必要。
- 使用画像は `assets/images/fv/`（`top_mv_sp3.jpg` と `mv_sitemap_sp.jpg` のみ `assets/images/` 直下）。
  差し替えは `assets/images/fv/` の同名ファイルを置き換える。生成スクリプトは
  `tools/optimize-fv-images.py`（source→slug のマップを編集して再実行）。
- 大キャッチコピー `assets/images/catchcopy.png`（黒・透過 PNG。FV の `.fv__catch` 用）。
  モザイク上でも読めるよう白いにじみ（drop-shadow）を付与。
- 末尾クロージングの筆文字は白抜き版 `assets/images/closing-catch-white.png`（`.closing__catch`）。
  帯コラージュ写真の上に暗い drop-shadow で浮かせている。
- 帯コラージュ（`.closing__strip`）は `assets/images/closing-1〜4-*.jpg`（河川敷／夕景の建設現場／
  ボトル再生／スクランブル交差点）の 4 枚を `gap: 0` で隙間なく連結。差し替えは同名ファイルを上書き。
- 左の 4 行コピーは `.fv__copy`、スクロール誘導は `.fv__scroll`。いずれもモザイクの上に重ねて配置。
- `index.html?static` で出現アニメを無効化（確認・撮影用）。

### コンセプト（`.concept`）— FV から地続きのコラージュ

- **FV のコラージュがそのまま下へ続く**構成（区切り線なし）。企画のキーコピーを中央に載せる。
- FV と同じ方式：`.concept__grid`（`position:relative; aspect-ratio:1920/1250`）の中に
  各写真を `position:absolute`＋`--l/--t/--z` で配置。フチ/影/回転なし・水平垂直。
- **写真はトリミングしない**：CSS で `height:auto`（`object-fit` は使わない）、インライン
  `style` では **`--w`（幅）だけ**指定して元写真の比率を保つ。`--h` は使わない。
- 継ぎ目を消す工夫: `.concept { margin-top:-2vh; z-index:1 }` で FV の最下段にわずかに重ね、
  さらに `.concept__grid` の**上端 T:0 を写真で埋めて** FV のボトム列と直接つなぐ。
- **集英社 採用サイト風に 1 枚を小さく（`--w` 11〜25%、多くは 12〜20%）・多く（約 29 枚）散らし**、
  「街が動き出すところ。～」のボックスのまわりに写真が**集まってくる**構成。
  `.concept__card` は **`z-index:20`（全写真より前面）**・`top:45%`（中央やや下）・
  強めのドロップシャドウ。方眼は短め（`1920/1250`）で、ボックスの下は写真を短い帯に
  とどめ、すぐ ABOUT へ移る。比率を保つため写真の間に自然な白地が少し残る。
- 写真は環境機器プラント・人物・倉庫・福祉ショールームなど（`crowd / recycle / family /
  hq / const-*` などは FV から再掲）。
- 写真タイルは**最初から表示**（スクロールでのフェードインなし）。`.concept__card` のみ
  `IntersectionObserver`（`main.js`）で `.is-visible` 付与 → opacity＋translate で出現。
- スマホ（≤640px）は絶対配置をやめ、`.concept__grid` を `display:flex` の 2 列ベタ組みで縦に流す。
  `.concept__card` も static に戻す（`?static` / reduced-motion 時の中央寄せ translate は
  `@media (min-width:641px)` に閉じ込め、モバイルで左に飛び出さないようにしている）。
- コピーは `.concept__card`（`concept__lead` の 3 行は枠付き、`そこ` を `<b>` で枠囲み）。

## セクション構成（index.html）

ブランド／コンセプトサイト構成（デザイン comp に合わせ、旧 about〜entry の雛形節は撤去）。

| ID          | 内容                                                    |
| ----------- | ------------------------------------------------------- |
| `#hero`     | ファーストビュー（写真コラージュ＋キャッチ）           |
| `#concept`  | 「街が動き出すところ。～」FV から地続きのコラージュ    |
| `#soko`     | 「そこ にいるリョーキ」本文＋支給 SVG の吹き出し3つ（＝建設/環境/福祉？）＋`click.svg` |
| `#liken`    | 「リョーキという会社を、人にたとえると」写真＋本文     |
| `#more`     | 背景動画＋暗いスクリムの外部サイト誘導（コーポレート／採用サイト） |
| `#need`     | 「必要なところに、いる。」散らし写真＋コピー           |
| （末尾）    | 帯コラージュ＋「そこに、リョーキ」筆文字 → フッター    |

- 後半セクションの CSS は `style.css` の「8. コンセプトサイト後半」ブロック。
- `#soko` の吹き出しは支給素材（`assets/images/soko/hukidasi_1〜3.svg` 線画＋`click.svg`）。
  各吹き出しは **`<button class="bubble" data-modal="...">`** ＝ 1 つのクリック領域で、
  中に `bubble__shape`（形）／`bubble__click`（CLICK）／`bubble__label`（見出し）を重ねる。
  右半分に絶対配置し、`.bubble__label` は各シェイプの頭部中央へ。≤900px は本文下に横並び。
- クリックで `<dialog class="modal modal--story" id="modal-build|env|welfare">` を `showModal()` で開く。
  閉じる：右上「閉じる ×」ボタン／背景クリック／Esc（`<dialog>` 標準）。閉じるとトリガーへフォーカスを戻す。
  JS は `main.js` の「4. 吹き出し → モーダル」。
- モーダルは **フルスクリーン・白地＋写真の端に沿う黒い罫線グリッド**（デザイン comp 準拠）。
  CSS は `style.css` の `.modal--story` 一式。
  - 罫線は `background-image` の gradient レイヤーで描画。縦4本＝`--gx1`（写真左）／`--gx2`（写真右）／
    `--gx3`（本文カラム左＝ガター）／`--gx4`（本文カラム右）、横2本＝上（`--gy1`）下（`--gy2`）で
    画面の端から端まで横断。線色は `--guide`（黒 `#141414`）。列位置は vw、行位置は vh 基準で画面に比例。
  - 右上：黒ボックスの「閉じる ×」（右端 `--gx4`・上 `--gy1` にそろえる）
  - 左：大きな縦写真 `modal_1〜3.png`（749×959）を写真列のガイド枠から `--gap`（0.5rem）内側に置き、
    `object-fit:cover` で敷く（罫線が写真に隠れず、端に沿って見えるようにするため）
  - 中央やや右：`.modal__heading`（大見出し）＋`.modal__lead`＋`.modal__text` 群（本文は comp のコピー）
  - 右下：切り抜き写真 `modal_1〜3_sub.png`（2・3 は2枚を1枚に合成済み。幅 `max-width:24vw`／
    高さ `max-height:40vh` でキャップ）／筆文字 `modal_copy.png`（685×184）
  - ≤820px は縦積み＋罫線グリッドは非表示（`background-image:none`）。素材は `assets/images/soko/`。
- `#more` の背景は `<video class="more__bg" autoplay muted loop playsinline poster="…/fv/crowd.jpg">`
  ＝ `assets/video/more-bg.mp4`（H.264/AAC・1280×720・約10秒）。`object-fit: cover` でフルブリード、
  読み込み前・非対応時は `poster`／CSS の `crowd.jpg` 下地を表示。上に `.more::before` の暗い
  グラデーションスクリム（rgba(16,21,27,.70→.82)）を重ねて白文字の可読性を確保。
  `prefers-reduced-motion: reduce` のときは `main.js` が動画を pause（poster を静止表示）。
  差し替えは `assets/video/more-bg.mp4` を同名で上書き。
- スクロール出現は `[data-reveal]` を `main.js` の IntersectionObserver で監視（`?static` で無効化）。
- ヘッダーのグローバルナビは `#concept / #soko / #liken`、CTA は `#more`。
- フッターは白ベース：ロゴ（`logo.svg`）＋コピーライト（`#year` は現在年を自動表示）。
- 外部リンク先（コーポレート／採用サイトの URL）は `.more__btn` の `href="#"` を差し替える。

## 画面幅に比例して全体をズーム（fluid scaling）

- `html { font-size: calc(100vw / var(--design-w) * 16) }`（`--design-w: 1280`）で
  **ルート文字サイズを画面幅に完全比例**させている。`style.css` のサイズ・余白は原則 `rem`
  なので、文字・画像・余白・コンテナ幅が同じ比率で伸び縮みする（＝サイト全体がズーム）。
- `≤900px` は `html { font-size: 16px }` に固定し、スマホ／タブレット用のブレークポイント設計に任せる。
- `px` のまま残しているのは意図的なもの：`1px/2px/1.5px` の罫線・ヘアライン、`999px` のピル角丸、
  メディアクエリのブレークポイント、box-shadow の負の spread。
- 拡大縮小の基準を変えるには `:root { --design-w }` を編集（大きくすると全体が小さく表示される）。
  完全に全画面幅で連続スケールさせたい場合は `@media (max-width: 900px) { html { font-size: 16px } }` を外す。

## セクション・スタッキング（前が固定 → 次が覆いかぶさる）

- **`#soko` / `#liken` だけ** を `<div class="stack">` で囲み、**`position: sticky; top: 0;
  min-height: 100vh`**（不透明背景＋`z-index` 2→3、上端 `box-shadow` で重なりの縁）。
  `#soko` が画面に貼り付いたまま `#liken` が下からせり上がって覆う。
- 固定は `.stack` 区間の中だけで働き、**区間の終端（`#liken` の下端）で解除**される。
  そのため以降の `#more` / `#need` / `.closing` / フッターは通常フローで正しく前面に出る
  （以前は containing block が `<main>` だったため `#liken` が最後まで貼り付き、
  クロージングやフッターに本文が透けて見える不具合があった）。
- `.stack` には `overflow` / `transform` / `filter` を掛けない（sticky が壊れる）。
- `#more` / `#need` は sticky ではなく通常フローの全画面高さセクション（`min-height:100vh`＋flex 中央寄せ）。
  `#need` の本文（`.need__text`）は `[data-reveal]` でスクロール時にふわっとフェードイン。
- scroll-snap は不具合が出たため不使用。`.soko[data-reveal]` / `.liken[data-reveal]` は
  sticky と transform が競合するのでフェードを無効化。
- `≤900px` と `prefers-reduced-motion` では sticky を解除して通常スクロール。

## 開発方法

Vite を使用。初回のみ依存パッケージをインストール:

```bash
npm install
```

ローカル確認（ホットリロード付き）:

```bash
npm run dev
```

ブラウザで <http://localhost:5173> を開く。

## ビルド & 社内サーバーへのアップロード

本番用ファイルを `dist/` に出力:

```bash
npm run build
```

`dist/` フォルダの中身一式を、社内サーバーへ FTP クライアント（FileZilla など）で手動アップロードする。
`npm run preview` で `dist/` の内容をローカルで最終確認できる。

## 本番前チェックリスト

- [ ] `<title>` / `meta description` / OGP（`og:url`, `og:image`）を実値に差し替え
- [ ] `assets/images/` にロゴ・favicon・OGP画像・写真を配置
- [ ] ブランドカラーを `style.css` の `:root` トークンで設定
- [ ] エントリーフォームのリンク先URLを設定
- [ ] コーポレートサイト / プライバシーポリシーのリンク先を設定
- [ ] 各セクションの本文コピーを流し込み
