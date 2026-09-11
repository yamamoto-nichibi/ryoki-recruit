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
