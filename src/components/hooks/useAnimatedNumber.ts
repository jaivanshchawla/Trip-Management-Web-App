import { useState, useEffect, useRef } from 'react';

// Improved easing function for a smoother ease-in-out effect
const easeInOutQuint = (t: number): number =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

export function useAnimatedNumber(endValue: number, duration: number = 2000) {
  const [displayValue, setDisplayValue] = useState(0);
  const currentValueRef = useRef(0); // Current value during the animation
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;
    currentValueRef.current = displayValue; // Initialize from current value

    const updateValue = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1); // Clamp between 0 and 1
      const easedProgress = easeInOutQuint(progress);

      // Calculate the new value
      const newValue = currentValueRef.current + (endValue - currentValueRef.current) * easedProgress;

      setDisplayValue(Number(newValue.toFixed(2))); // Update the state

      if (progress < 1) {
        requestAnimationFrame(updateValue); // Continue animation
      }
    };

    const animationFrame = requestAnimationFrame(updateValue);

    return () => cancelAnimationFrame(animationFrame); // Cleanup on unmount
  }, [endValue, duration]);

  // Return the formatted value with comma separators
  return Number(displayValue.toFixed(0)).toLocaleString('en-IN');
}
