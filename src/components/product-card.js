"use client";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

export function ProductCard({ product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 bg-white"
    >
      <div className="relative w-full h-64 bg-gray-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-indigo-600 font-bold text-lg">
              ${product.discountPrice ?? product.price}
            </span>
            {product.discountPrice && (
              <span className="text-gray-400 text-sm line-through ml-2">
                ${product.price}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star size={16} fill="currentColor" />
            <span className="text-sm text-gray-700">{product.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
