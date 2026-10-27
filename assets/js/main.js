/* Trevo Assessoria de Eventos: comportamento do site
   Dependências: GSAP, ScrollTrigger e Lenis (assets/js/vendor) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  let lenis = null;

  /* ---------- menu mobile (hambúrguer) ---------- */
  const burger = $(".burger");
  const menu = $("#menu");
  const setMenu = (open) => {
    root.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menu.setAttribute("aria-hidden", String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener("click", () => setMenu(!root.classList.contains("menu-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  $$("#menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  matchMedia("(min-width: 900px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  const scrub = (trigger, start, end) => ({ trigger, start, end, scrub: true });

  /* ---------- rolagem suave, menu fixo e abertura ---------- */
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    $$('a[href^="#"]').forEach((a) =>
      a.addEventListener("click", (e) => {
        const alvo = $(a.getAttribute("href"));
        if (alvo) { e.preventDefault(); lenis.scrollTo(alvo, { duration: 1.4 }); }
      })
    );

    const nav = $("#nav");
    lenis.on("scroll", ({ scroll, direction }) => {
      nav.classList.toggle("is-solid", scroll > 80);
      nav.classList.toggle("is-hidden", direction === 1 && scroll > 600 && !root.classList.contains("menu-open"));
    });

    /* abertura: único momento orquestrado, curto */
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".hero__bg img", { scale: 1.16, duration: 2.2, ease: "power2.out" }, 0)
      .from(".hero__veil", { opacity: 0, duration: 1.1 }, 0)
      .from(".hero__mark img", { scale: 0.7, rotate: -30, opacity: 0, duration: 1.6 }, 0.1)
      .from(".hero h1 .line > span", { yPercent: 115, duration: 1.1, stagger: 0.12 }, 0.3)
      .from([".hero__script", ".hero .btn"], { opacity: 0, y: 14, duration: 0.9, stagger: 0.15 }, 0.9)
      .from(nav, { opacity: 0, duration: 0.8 }, 1);

    /* topo ao rolar */
    gsap.to(".hero__bg", { yPercent: 5, ease: "none", scrollTrigger: scrub(".hero", "top top", "bottom top") });
    gsap.to(".hero__copy", { yPercent: -14, opacity: 0, ease: "none", scrollTrigger: scrub(".hero", "top top", "70% top") });
    gsap.to(".hero__mark", { rotate: 90, ease: "none", scrollTrigger: scrub(".hero", "top top", "bottom top") });

    /* sobre nós: foto abre em arco, trevo gira */
    gsap.fromTo(".arch",
      { clipPath: "inset(100% 0% 0% 0% round 999px 999px 28px 28px)" },
      { clipPath: "inset(0% 0% 0% 0% round 999px 999px 28px 28px)", duration: 1.3, ease: "power3.inOut",
        scrollTrigger: { trigger: ".sobre", start: "top 62%" } });
    gsap.fromTo(".arch img", { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: scrub(".sobre", "top bottom", "bottom 30%") });
    gsap.to(".sobre__mark", { rotate: 150, ease: "none", scrollTrigger: scrub(".sobre", "top bottom", "bottom top") });
    gsap.from(".sobre__text > *", { y: 24, opacity: 0, duration: 0.9, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".sobre__text", start: "top 75%" } });

    return () => { gsap.ticker.remove(tick); lenis.destroy(); lenis = null; };
  });

  /* ---------- serviços (computador): galeria horizontal fixada na tela ---------- */
  mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
    const track = $(".track");
    const bar = $(".progress i");
    const dist = () => Math.max(0, track.scrollWidth - root.clientWidth);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: ".servicos__pin", start: "top top", end: () => "+=" + dist(),
        pin: true, pinSpacing: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (s) => { bar.style.transform = "scaleX(" + s.progress + ")"; },
      },
    });
    $$(".ph img").forEach((img) =>
      gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: "none",
        scrollTrigger: { trigger: img.closest(".card"), containerAnimation: tween, start: "left right", end: "right left", scrub: true } })
    );
  });

  /* ---------- avaliações (computador): cartões abrem em leque ---------- */
  mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
    const lista = $(".avaliacoes__lista");
    const cards = $$(".review");
    const passo = () => cards[0].offsetWidth + parseFloat(getComputedStyle(lista).columnGap);
    cards.forEach((c, i) =>
      gsap.fromTo(c, { x: () => (1 - i) * passo() * 0.94, rotate: (i - 1) * 5, scale: 0.94 },
        { x: 0, rotate: 0, scale: 1, ease: "power2.out",
          scrollTrigger: { trigger: lista, start: "top 88%", end: "top 38%", scrub: 0.8, invalidateOnRefresh: true } })
    );
  });

  /* ---------- avaliações (celular): entrada simples ---------- */
  mm.add("(max-width: 899px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.from(".review", { y: 40, opacity: 0, duration: 0.9, stagger: 0.15, ease: "power3.out",
      scrollTrigger: { trigger: ".avaliacoes__lista", start: "top 85%" } });
  });

  /* recalcula as posições depois de imagens e fontes carregarem */
  addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
