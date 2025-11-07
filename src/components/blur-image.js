'use client';
import { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

export default function BlurImage({ src, alt, className, ...props }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100">
      <Image
        src={src || '/images/products/placeholder.svg'}
        alt={alt || 'Image'}
        fill
        onLoadingComplete={() => setLoaded(true)}
        className={clsx(
          'object-cover transition-all duration-700 ease-out',
          loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-60 blur-md scale-[1.02]',
          className
        )}
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${btoa(`
          <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="300" fill="#f6f7f8"/>
            <rect id="r" width="400" height="300" fill="#eee"/>
            <animate xlink:href="#r" attributeName="x" from="-400" to="400" dur="1.2s" repeatCount="indefinite" />
          </svg>
        `)}`}
        {...props}
      />
    </div>
  );
}
