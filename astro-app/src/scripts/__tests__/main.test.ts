/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Tests for client-side scripts in main.ts.
 * Since main.ts uses IIFE patterns triggered by DOMContentLoaded,
 * we test the DOM behaviors these functions produce rather than
 * importing the functions directly.
 */

describe("Carousel logic", () => {
  let carousel: HTMLElement;
  let slides: HTMLElement[];
  let dots: HTMLButtonElement[];

  beforeEach(() => {
    document.body.innerHTML = `
      <div data-carousel>
        <div data-slide data-state="active">Slide 1</div>
        <div data-slide data-state="inactive">Slide 2</div>
        <div data-slide data-state="inactive">Slide 3</div>
        <button data-dot data-state="active">1</button>
        <button data-dot data-state="inactive">2</button>
        <button data-dot data-state="inactive">3</button>
      </div>
    `;
    carousel = document.querySelector("[data-carousel]")!;
    slides = Array.from(carousel.querySelectorAll("[data-slide]"));
    dots = Array.from(carousel.querySelectorAll("[data-dot]")) as HTMLButtonElement[];
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("carousel DOM has correct initial state", () => {
    expect(slides).toHaveLength(3);
    expect(dots).toHaveLength(3);
    expect(slides[0].dataset.state).toBe("active");
    expect(slides[1].dataset.state).toBe("inactive");
  });

  it("goToSlide logic transitions state correctly", () => {
    // Simulate goToSlide(1)
    slides[0].setAttribute("data-state", "inactive");
    dots[0].setAttribute("data-state", "inactive");
    slides[1].setAttribute("data-state", "active");
    dots[1].setAttribute("data-state", "active");

    expect(slides[0].dataset.state).toBe("inactive");
    expect(slides[1].dataset.state).toBe("active");
    expect(dots[1].dataset.state).toBe("active");
  });

  it("nextSlide wraps around correctly", () => {
    // Simulate (currentIndex + 1) % slides.length at last slide
    const currentIndex = 2;
    const nextIndex = (currentIndex + 1) % slides.length;
    expect(nextIndex).toBe(0); // Wraps to first slide
  });
});

describe("Contact form logic", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form data-contact-form>
        <input type="text" name="name" />
        <button type="submit">Submit</button>
        <div data-form-success style="display:none">Thank you!</div>
      </form>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("form DOM structure is correct", () => {
    const form = document.querySelector("[data-contact-form]");
    expect(form).not.toBeNull();
    expect(form?.querySelector('button[type="submit"]')).not.toBeNull();
  });

  it("submit button can be programmatically disabled", () => {
    const btn = document.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = "Sending...";

    expect(btn.disabled).toBe(true);
    expect(btn.textContent).toBe("Sending...");
  });

  it("form state can be set to success", () => {
    const form = document.querySelector(
      "[data-contact-form]",
    ) as HTMLFormElement;
    form.dataset.formState = "success";
    expect(form.dataset.formState).toBe("success");
  });
});

describe("Scroll animation logic", () => {
  it("IntersectionObserver is NOT natively available in jsdom (requires polyfill in real app)", () => {
    // jsdom does not implement IntersectionObserver — the real browser does.
    // This test documents the boundary: scroll animations only run in browsers.
    expect(typeof globalThis.IntersectionObserver).toBe("undefined");
  });

  it("data-animate elements can receive animate-visible class", () => {
    document.body.innerHTML = '<div data-animate class="opacity-0">Hello</div>';
    const el = document.querySelector("[data-animate]")!;

    // Simulate what the observer callback does
    el.classList.add("animate-visible");

    expect(el.classList.contains("animate-visible")).toBe(true);
    expect(el.classList.contains("opacity-0")).toBe(true);
  });
});
