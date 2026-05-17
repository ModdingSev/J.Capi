'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export default function ProductImage({ src, alt, sizes, className, priority }: ProductImageProps) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <span className="text-gray-400 text-sm text-center px-8 line-clamp-3">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized
      onError={() => setImgError(true)}
    />
  );
}
