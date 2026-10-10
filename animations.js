(() => {
  "use strict";

  // The site works without GSAP. If the GSAP library is added later, use it
  // for richer animation; this lightweight version needs no extra dependency.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const cards = document.querySelectorAll(".event-card");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    cards.forEach((card) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(18px)";
      card.style.transition = "opacity .5s ease, transform .5s ease";
      observer.observe(card);
    });
  }

  const heroArt = document.querySelector(".hero-art");
  if (heroArt) {
    heroArt.animate(
      [{ transform: "translateY(0) rotate(0deg)" }, { transform: "translateY(-7px) rotate(1deg)" }, { transform: "translateY(0) rotate(0deg)" }],
      { duration: 5000, iterations: Infinity, easing: "ease-in-out" }
    );
  }
})();
