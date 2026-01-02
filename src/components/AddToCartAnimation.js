'use client';

import { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';

export default function AddToCartAnimation({ trigger }) {
  const [animationData, setAnimationData] = useState(null);
  const animationRef = useRef(null);

  // ✅ Load animation JSON from public folder
  useEffect(() => {
    fetch('/lottie/add-to-cart-success.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error('Error loading animation:', err));
  }, []);

  // ✅ Play animation each time "trigger" changes
  useEffect(() => {
    if (trigger && animationRef.current) {
      animationRef.current.setDirection(1);
      animationRef.current.play();
    }
  }, [trigger]);

  if (!animationData) return null;

  return (
    <div className="fixed bottom-10 right-10 w-36 h-36 pointer-events-none z-50">
      <Lottie
        lottieRef={animationRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
      />
    </div>
  );
}
