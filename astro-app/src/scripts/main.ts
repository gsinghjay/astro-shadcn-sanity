document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initContactForm();
  initCarousel();
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

function initContactForm(): void {
  const form = document.querySelector('[data-contact-form]') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    const successMsg = form.querySelector('[data-form-success]') as HTMLElement | null;

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Sending...';
    }

    setTimeout(() => {
      form.dataset.formState = 'success';
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Submit';
      }
    }, 1500);
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
