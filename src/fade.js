// Fade-in: une seule fois (évite que des éléments disparaissent quand la mise en page change)
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // Si tu ne veux pas de fade sur un élément, ajoute la classe `no-fade`
      if (entry.target.classList.contains("no-fade")) {
        observer.unobserve(entry.target);
        return;
      }

      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // On arrête d'observer après la 1ère apparition => ne "re-disparait" jamais
        observer.unobserve(entry.target);
      }
      // IMPORTANT: on ne retire plus la classe `visible` quand l'élément sort de l'écran
      // (sinon, quand tu cliques "afficher plus", certains éléments peuvent sortir/entrer
      // et ça donne l'impression qu'ils disparaissent).
    });
  },
  {
    threshold: 0.15,
  }
);

document.querySelectorAll(".fade-in").forEach((el) => {
  // opt-out explicite
  if (!el.classList.contains("no-fade")) {
    observer.observe(el);
  }
});