// ============================================================
// main.js — JS compartilhado por todas as páginas
//   - menu hamburger
//   - troca de idioma PT/EN (persistida em localStorage)
//   - cursor bolinha com contraste automático + grow em links
//   - efeitos de scroll: barra de progresso, parallax, reveal, count-up
// ============================================================

(function () {
    "use strict";

    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // ---------- Menu hamburger ----------
    var lines = document.querySelector(".lines");
    var menu = document.querySelector(".menu");

    if (lines && menu) {
        lines.addEventListener("click", function () {
            lines.classList.toggle("x");
            menu.classList.toggle("show");
        });
        menu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                lines.classList.remove("x");
                menu.classList.remove("show");
            });
        });
    }

    // ---------- Troca de idioma ----------
    var checkbox = document.querySelector("#checkBoxLanguage");
    var body = document.body;

    var saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "pt") {
        body.dataset.setlanguage = saved;
        if (checkbox) checkbox.checked = saved === "en";
    }

    if (checkbox) {
        checkbox.addEventListener("change", function () {
            var lang = checkbox.checked ? "en" : "pt";
            body.dataset.setlanguage = lang;
            localStorage.setItem("lang", lang);
        });
    }

    // ---------- Cursor bolinha (contraste automático via mix-blend-mode) ----------
    if (finePointer) {
        var dot = document.createElement("div");
        dot.className = "cursor-dot";
        dot.style.opacity = "0";
        body.appendChild(dot);

        window.addEventListener("mousemove", function (e) {
            dot.style.opacity = "1";
            dot.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
        });

        document.addEventListener("mouseleave", function () {
            dot.style.opacity = "0";
        });

        // cresce sobre elementos clicáveis
        var hoverSel = "a, button, label, input, .pill, .lines, [role='button'], [onclick]";
        document.querySelectorAll(hoverSel).forEach(function (el) {
            el.addEventListener("mouseenter", function () { dot.classList.add("is-hover"); });
            el.addEventListener("mouseleave", function () { dot.classList.remove("is-hover"); });
        });
    }

    // ---------- Barra de progresso do scroll ----------
    var progress = document.createElement("div");
    progress.className = "scroll-progress";
    body.appendChild(progress);

    // ---------- Elementos de efeito de scroll ----------
    var heroBg = document.querySelector(".hero__bg");
    var heroLine1 = document.querySelector('.hero__line[data-line="1"]');
    var heroLine2 = document.querySelector('.hero__line[data-line="2"]');
    var chartLine = document.getElementById("chartLinePath");
    var chartLen = 0;
    if (chartLine && chartLine.getTotalLength) {
        chartLen = chartLine.getTotalLength();
        chartLine.style.strokeDasharray = chartLen;
        // começa "não desenhada"; se reduzir movimento, mostra inteira
        chartLine.style.strokeDashoffset = prefersReduced ? 0 : chartLen;
    }
    var collage = document.querySelector(".hobbies__collage");
    var collageImgs = collage ? collage.querySelectorAll("img") : [];

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function onScroll() {
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var vh = window.innerHeight;
        var docHeight = document.documentElement.scrollHeight - vh;
        var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progress.style.width = pct + "%";

        if (prefersReduced) return;

        // parallax + nome do hero que se separa
        if (scrollTop < vh) {
            if (heroBg) heroBg.style.transform = "translateY(" + scrollTop * 0.4 + "px)";
            var hp = scrollTop / vh; // 0 → 1 ao longo do hero
            if (heroLine1) {
                heroLine1.style.transform = "translateX(" + (-hp * 22) + "vw)";
                heroLine1.style.opacity = (1 - hp * 0.8).toFixed(2);
            }
            if (heroLine2) {
                heroLine2.style.transform = "translateX(" + (hp * 22) + "vw)";
                heroLine2.style.opacity = (1 - hp * 0.8).toFixed(2);
            }
        }

        // gráfico: a linha vai sendo "traçada" por cima das colunas conforme o scroll
        if (chartLine && chartLen) {
            var crect = chartLine.getBoundingClientRect();
            var cprog = clamp((vh * 0.85 - crect.top) / (vh * 0.5), 0, 1); // 0 → 1
            chartLine.style.strokeDashoffset = (chartLen * (1 - cprog)).toFixed(1);
        }

        // colagem de hobbies: aglomerada → separada no meio da tela
        if (collageImgs.length === 3) {
            var rect = collage.getBoundingClientRect();
            var t = clamp((vh * 0.9 - rect.top) / (vh * 0.5), 0, 1); // 0 junto, 1 separado
            var inv = 1 - t;
            var w = rect.width / 3;
            var scale = (0.72 + 0.28 * t).toFixed(3);
            collageImgs[0].style.transform =
                "translateX(" + (inv * w * 1.05).toFixed(1) + "px) rotate(" + (-inv * 8).toFixed(1) + "deg) scale(" + scale + ")";
            collageImgs[1].style.transform =
                "translateY(" + (inv * 60).toFixed(1) + "px) scale(" + scale + ")";
            collageImgs[2].style.transform =
                "translateX(" + (-inv * w * 1.05).toFixed(1) + "px) rotate(" + (inv * 8).toFixed(1) + "deg) scale(" + scale + ")";
        }
    }

    var ticking = false;
    window.addEventListener("scroll", function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    onScroll();

    // ---------- Scroll reveal (com stagger) ----------
    var revealEls = document.querySelectorAll(".reveal");

    // stagger: atraso progressivo entre irmãos .reveal do mesmo container
    revealEls.forEach(function (el) {
        var parent = el.parentElement;
        var siblings = Array.prototype.filter.call(parent.children, function (c) {
            return c.classList.contains("reveal");
        });
        var idx = siblings.indexOf(el);
        if (idx > 0) el.style.transitionDelay = Math.min(idx * 0.08, 0.4) + "s";
    });

    if (prefersReduced || !("IntersectionObserver" in window)) {
        revealEls.forEach(function (el) { el.classList.add("in"); });
    } else {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        revealEls.forEach(function (el) { observer.observe(el); });
    }

    // ---------- Count-up nos números ----------
    var counters = document.querySelectorAll("[data-count]");

    function animateCount(el) {
        var target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        if (prefersReduced) { el.textContent = target + suffix; return; }
        var start = 0;
        var duration = 1200;
        var startTime = null;
        function step(ts) {
            if (!startTime) startTime = ts;
            var p = Math.min((ts - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(start + (target - start) * eased) + suffix;
            if (p < 1) window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
    }

    if (counters.length) {
        if (!("IntersectionObserver" in window)) {
            counters.forEach(animateCount);
        } else {
            var cObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCount(entry.target);
                        cObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.6 });
            counters.forEach(function (el) { cObserver.observe(el); });
        }
    }
})();
