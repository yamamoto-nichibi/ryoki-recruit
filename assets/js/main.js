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

  /* --- 3a. #soko → #liken のスタッキング演出：#soko が画面いっぱいになったところで
     いったん画面に固定（pin）して止め、止まっている間に #liken を下から重ねて覆う
     （GSAP ScrollTrigger）。

     これまで #liken の固定/解除は onEnter/onLeave で自前実装していたが、それは
     GSAP本体のpin機能（固定とスペーサーの調整を1フレームの中で原子的に行う
     仕組み）を手作業で再現しようとしていたに過ぎず、切り替えの瞬間がGSAP内部の
     更新タイミングと完全には同期しきらず、境界で一瞬戻る不具合の原因になっていた。
     そこで #liken も自前で切り替えず、GSAP本体のpinにそのまま任せる。

     #soko・#liken を別々にpinすると、両者が完全に同じピクセルで同時に解除される
     瞬間にGSAP内部の再計算が衝突し、一瞬 progress が0に巻き戻る不具合をヘッドレス
     browserでの実測で確認したため、#liken側の解除位置をわずかに（数px）後ろへ
     ずらし、2つのpinが同時に解除されないようにしている。 */
  if (window.gsap && window.ScrollTrigger && !document.documentElement.classList.contains("fv-static")) {
    var sokoEl = document.getElementById("soko");
    var likenEl = document.getElementById("liken");
    var wideEnough = window.matchMedia("(min-width: 901px)").matches;
    var okMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (sokoEl && likenEl && wideEnough && okMotion) {
      gsap.registerPlugin(ScrollTrigger);

      var likenHeight = function () {
        return Math.ceil(likenEl.getBoundingClientRect().height);
      };

      /* #soko を画面に固定して止める */
      ScrollTrigger.create({
        trigger: sokoEl,
        start: "bottom bottom",
        end: function () {
          return "+=" + likenHeight();
        },
        pin: true,
        pinSpacing: true,
        scrub: true,
      });

      /* 同じ区間で #liken もGSAP本体のpinで固定しつつ、下から重なるように
         yPercentを連動させる。pinType:"fixed" は、pinが内部で使うtransformと
         yPercentのtransformが同じプロパティを取り合って衝突するのを避けるため。
         end に +4px の余白を持たせ、#soko側のpin解除と完全に同時にならないようにする。 */
      gsap.fromTo(
        likenEl,
        { yPercent: 100 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sokoEl,
            start: "bottom bottom",
            end: function () {
              return "+=" + (likenHeight() + 4);
            },
            scrub: true,
            pin: likenEl,
            pinType: "fixed",
            pinSpacing: false,
          },
        }
      );

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
