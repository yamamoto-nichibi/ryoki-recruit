/* ===================================================
   main.js  —  採用LP 雛形スクリプト
   =================================================== */
(function () {
  "use strict";

  /* --- 1. ヘッダーのハンバーガーメニュー --- */
  var menuBtn = document.querySelector(".site-header__menu-btn");
  var menu = document.querySelector(".site-header__menu");
  if (menuBtn && menu) {
    var closeMenu = function () {
      menu.classList.remove("is-open");
      menuBtn.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
    };
    menuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = menu.classList.toggle("is-open");
      menuBtn.classList.toggle("is-open", isOpen);
      menuBtn.setAttribute("aria-expanded", String(isOpen));
    });
    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
        closeMenu();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

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

})();
