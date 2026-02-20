document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initCarousel();
  initGtmEvents();
});

function initScrollAnimations(): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-animate]').forEach((el) => {
    observer.observe(el);
  });
}

function initCarousel(): void {
  const carousel = document.querySelector('[data-carousel]') as HTMLElement | null;
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll('[data-slide]')) as HTMLElement[];
  const dots = Array.from(carousel.querySelectorAll('[data-dot]')) as HTMLButtonElement[];

  if (slides.length === 0) return;

  let currentIndex = 0;
  let intervalId: number | null = null;

  const goToSlide = (index: number): void => {
    slides[currentIndex]?.setAttribute('data-state', 'inactive');
    dots[currentIndex]?.setAttribute('data-state', 'inactive');

    currentIndex = index;

    slides[currentIndex]?.setAttribute('data-state', 'active');
    dots[currentIndex]?.setAttribute('data-state', 'active');
  };

  const nextSlide = (): void => {
    const nextIndex = (currentIndex + 1) % slides.length;
    goToSlide(nextIndex);
  };

  const startAutoPlay = (): void => {
    if (intervalId !== null) return;
    intervalId = window.setInterval(nextSlide, 5000);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
    });
  });

  startAutoPlay();
}

function initGtmEvents(): void {
  if (!window.dataLayer) return;

  // Form tracking
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    let formStarted = false;
    form.addEventListener('focusin', () => {
      if (!formStarted) {
        formStarted = true;
        window.dataLayer.push({ event: 'form_start', form: { name: 'contact' } });
      }
    });
  }

  // FAQ accordion tracking
  document.querySelectorAll('[data-slot="accordion-item"]').forEach((item) => {
    item.addEventListener('toggle', () => {
      if ((item as HTMLDetailsElement).open) {
        const question = item.querySelector('[data-slot="accordion-trigger"]')?.textContent?.trim() || '';
        window.dataLayer.push({ event: 'faq_expand', faq: { question } });
      }
    });
  });

  // Carousel dot tracking
  document.querySelectorAll('[data-dot]').forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = (dot as HTMLElement).dataset.dot;
      window.dataLayer.push({ event: 'carousel_navigate', carousel: { index: Number(index) } });
    });
  });
}
