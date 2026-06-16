"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="relative w-full" style={{ background: "#1a1a1a", height: "320px" }}>
      <Image
        src={images[current]}
        alt={`${title} 사진 ${current + 1}`}
        fill
        className="object-contain"
        sizes="(max-width: 672px) 100vw, 672px"
        priority={current === 0}
      />

      {/* 이전 버튼 */}
      {images.length > 1 && current > 0 && (
        <button
          onClick={() => setCurrent((p) => p - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg"
          style={{ background: "rgba(255,255,255,0.85)", color: "#c2500a" }}
        >
          ‹
        </button>
      )}

      {/* 다음 버튼 */}
      {images.length > 1 && current < images.length - 1 && (
        <button
          onClick={() => setCurrent((p) => p + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg"
          style={{ background: "rgba(255,255,255,0.85)", color: "#c2500a" }}
        >
          ›
        </button>
      )}

      {/* 인디케이터 점 */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-2 h-2 rounded-full transition-colors"
              style={{ background: i === current ? "#f97316" : "rgba(255,255,255,0.6)" }}
            />
          ))}
        </div>
      )}

      {/* 장 수 표시 */}
      {images.length > 1 && (
        <span
          className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
        >
          {current + 1}/{images.length}
        </span>
      )}
    </div>
  );
}
