/* ===================================================
   main.js  —  採用LP 雛形スクリプト
   =================================================== */
(function () {
  "use strict";

  /* ヘッダーはロゴ＋外部リンクボタン2つのみ（ナビ／ハンバーガーなし）。 */

  /* ファーストビューの時間差アニメーションは CSS のみで動作します
     （.fv__tile などの animation-delay: var(--d)）。JS は不要です。
     URL に ?static を付けると出現アニメーションを無効化します（確認・撮影用）。 */
  if (location.search.indexOf("static") !== -1) {
    document.documentElement.classList.add("fv-static");
  }

  /* --- 2. フッターの年号を自動更新 --- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* --- 3. スクロールで要素をフェードイン（.concept の写真もここで出す） --- */
  const targets = document.querySelectorAll(".section, .hero__inner, .concept, [data-reveal]");
  if ("IntersectionObserver" in window && targets.length) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    targets.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ?static のときは .concept / data-reveal も即表示 */
  if (document.documentElement.classList.contains("fv-static")) {
    document.querySelectorAll(".concept, [data-reveal]").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* --- 3a. #soko → #liken のスタッキング演出（GSAP ScrollTrigger）。

     これまで #liken 側を「pinする」「onEnter/onLeaveでposition手動切り替え」の
     両方を試したが、どちらも #liken を一時的にドキュメントフローから出し入れする
     ため、その瞬間に .stack の高さが変化したり、GSAPが自動生成する pin-spacer が
     入れ子になって #liken の実際の座標が .stack の範囲外（#more より下）に
     ズレるなど、構造的な不具合を繰り返し起こしていた。

     そこで #liken は「常に position:fixed（一切トグルしない）」の透明な板として
     扱い、見た目の動き（入ってくる → 留まる → 抜けていく）はすべて transform
     （yPercent）だけで表現する。pinもposition切り替えも使わないため、
     ドキュメントフローの高さが変化する瞬間そのものが存在せず、これまでの不具合
     の原因（二重スペーサー・切り替えのタイミングのズレ）が構造的に起こり得ない。

     必要なスクロール量（#sokoのpinで確保する分）は、#likenが画面外から入り→
     画面を覆ったまま留まり→画面外へ抜けきるまでの3区間ぶん（ビューポート3つ分）。 */
  if (window.gsap && window.ScrollTrigger && !document.documentElement.classList.contains("fv-static")) {
    var sokoEl = document.getElementById("soko");
    var likenEl = document.getElementById("liken");
    var wideEnough = window.matchMedia("(min-width: 901px)").matches;
    var okMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (sokoEl && likenEl && wideEnough && okMotion) {
      gsap.registerPlugin(ScrollTrigger);

      /* #liken を常時 position:fixed の板にする（以後トグルしない）。
         yPercent:100 で画面のすぐ下、見えない位置に置いておく。 */
      gsap.set(likenEl, { position: "fixed", top: 0, left: 0, right: 0, yPercent: 100 });

      ScrollTrigger.create({
        trigger: sokoEl,
        start: "bottom bottom",
        end: function () {
          return "+=" + window.innerHeight * 3;
        },
        pin: true,
        pinSpacing: true,
        scrub: true,
        onUpdate: function (self) {
          var p = self.progress;
          var yPercent;
          if (p < 1 / 3) {
            yPercent = 100 - (p / (1 / 3)) * 100; /* 入ってくる：100% → 0% */
          } else if (p < 2 / 3) {
            yPercent = 0; /* 画面を覆ったまま留まる */
          } else {
            yPercent = -((p - 2 / 3) / (1 / 3)) * 100; /* 抜けていく：0% → -100% */
          }
          gsap.set(likenEl, { yPercent: yPercent });
        },
      });

      /* 画像読み込み等でレイアウト高さが後から変わるとpin開始位置がズレて
         スクロール途中でジャンプするため、読み込み完了後に必ず測り直す。 */
      window.addEventListener("load", function () {
        ScrollTrigger.refresh();
      });
    }
  }

  /* --- 3b. #more の背景動画：動きを減らす設定なら停止し poster を見せる --- */
  var moreVideo = document.querySelector(".more__bg");
  if (moreVideo) {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var applyMotionPref = function () {
      if (reduceMotion.matches) {
        moreVideo.removeAttribute("autoplay");
        moreVideo.pause();
      } else if (moreVideo.paused) {
        var p = moreVideo.play();
        if (p && typeof p.catch === "function") p.catch(function () {});
      }
    };
    applyMotionPref();
    if (typeof reduceMotion.addEventListener === "function") {
      reduceMotion.addEventListener("change", applyMotionPref);
    } else if (typeof reduceMotion.addListener === "function") {
      reduceMotion.addListener(applyMotionPref);
    }
  }

  /* --- 4. 「そこにいるリョーキ」：吹き出し → モーダル --- */
  var lastFocused = null;

  document.querySelectorAll(".bubble[data-modal]").forEach(function (btn) {
    var dlg = document.getElementById(btn.getAttribute("data-modal"));
    if (!dlg) return;
    btn.addEventListener("click", function () {
      lastFocused = btn;
      if (typeof dlg.showModal === "function") {
        dlg.showModal();
      } else {
        dlg.setAttribute("open", "");
        dlg.style.display = "block";
      }
    });
  });

  document.querySelectorAll("dialog.modal").forEach(function (dlg) {
    var closeBtn = dlg.querySelector(".modal__close");

    function closeDlg() {
      if (typeof dlg.close === "function") {
        dlg.close();
      } else {
        dlg.removeAttribute("open");
        dlg.style.display = "none";
      }
    }

    if (closeBtn) closeBtn.addEventListener("click", closeDlg);

    /* 背景（::backdrop）クリックで閉じる：ダイアログ矩形の外をクリックしたら閉じる */
    dlg.addEventListener("click", function (e) {
      var r = dlg.getBoundingClientRect();
      var outside =
        e.clientX < r.left || e.clientX > r.right ||
        e.clientY < r.top || e.clientY > r.bottom;
      if (outside) closeDlg();
    });

    /* 閉じたらトリガーへフォーカスを戻す（<dialog> の close イベント） */
    dlg.addEventListener("close", function () {
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
        lastFocused = null;
      }
    });
  });
})();
