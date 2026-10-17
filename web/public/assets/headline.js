(() => {
  const target = document.querySelector('[data-rotating-headline]');
  if (!target) return;
  const messages = {
    en: ['Built with precision.', 'Protection that never sleeps.', 'Your community. Secured.', 'Moderation made simple.'],
    hi: ['सटीकता के साथ निर्मित।', 'हर पल आपकी सुरक्षा।', 'आपका समुदाय। सुरक्षित।', 'मॉडरेशन हुआ आसान।'],
    de: ['Mit Präzision entwickelt.', 'Schutz rund um die Uhr.', 'Deine Community. Geschützt.', 'Moderation leicht gemacht.'],
    es: ['Diseñado con precisión.', 'Protección sin descanso.', 'Tu comunidad. Protegida.', 'Moderación simplificada.'],
    fr: ['Conçu avec précision.', 'Une protection sans repos.', 'Votre communauté. Protégée.', 'La modération simplifiée.'],
    pt: ['Feito com precisão.', 'Proteção que nunca dorme.', 'Sua comunidade. Protegida.', 'Moderação simplificada.'],
    it: ['Creato con precisione.', 'Protezione senza sosta.', 'La tua comunità. Protetta.', 'Moderazione semplice.']
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const lines = () => messages[document.documentElement.lang] || messages.en;
  let index = 0, busy = false, generation = 0, animation;
  const live = document.createElement('span');
  live.className = 'headline-accessible';
  target.after(live);
  target.setAttribute('aria-hidden', 'true');
  const updateAccessible = () => { live.textContent = lines()[0]; };
  updateAccessible();
  const reset = () => {
    generation++; animation?.cancel(); busy = false; index = 0;
    target.textContent = lines()[0]; updateAccessible();
  };
  new MutationObserver(reset).observe(document.documentElement, {attributes:true,attributeFilter:['lang']});
  reduced.addEventListener('change', reset);
  setInterval(async () => {
    if (document.hidden || reduced.matches || busy) return;
    busy = true;
    const version = generation;
    try {
      animation = target.animate([{opacity:1,transform:'translateY(0)',filter:'blur(0)'},{opacity:0,transform:'translateY(-14px)',filter:'blur(4px)'}],{duration:300,easing:'ease-in',fill:'forwards'});
      await animation.finished;
      if (version !== generation) return;
      index = (index+1) % lines().length;
      target.textContent = lines()[index];
      animation.cancel();
      animation = target.animate([{opacity:0,transform:'translateY(14px)',filter:'blur(4px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0)'}],{duration:550,easing:'cubic-bezier(.22,1,.36,1)'});
      await animation.finished;
    } catch {} finally { if(version === generation) busy = false; }
  }, 4200);
})();
