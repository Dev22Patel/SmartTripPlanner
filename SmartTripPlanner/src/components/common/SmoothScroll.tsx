import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

const SmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2, // Adjusts the scroll duration (default: 1)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easing function
      wheelMultiplier: 1, // Controls sensitivity of scroll
      touchMultiplier: 2, // Adjust for touch devices
      infinite: false, // Set to true for infinite scroll
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy(); // Cleanup on unmount
    };
  }, []);

  return null;
};

export default SmoothScroll;
