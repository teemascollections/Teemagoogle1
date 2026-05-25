import React from "react";
import { Product } from "../types";
import { Star, Heart, Eye, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  key?: string | number;
}

export default function ProductCard({
  product,
  onQuickView,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}: ProductCardProps) {
  const isSoldOut = product.status === "Sold Out" || product.quantityAvailable <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-purple-mist/45 bg-white shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Product Image and Overlay */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF8FC]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span
            className={`px-3 py-1 text-[10px] uppercase font-semibold tracking-widest rounded-full shadow-sm text-white ${
              isSoldOut ? "bg-stone-800" : "bg-purple"
            }`}
          >
            {isSoldOut ? "Sold Out" : "Pure Luxury"}
          </span>
          {product.quantityAvailable > 0 && product.quantityAvailable <= 2 && (
            <span className="px-3 py-1 text-[10px] uppercase font-semibold tracking-widest rounded-full bg-gold text-white shadow-sm">
              Only {product.quantityAvailable} Left!
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => onToggleWishlist(product)}
          className={`absolute top-3 right-3 p-2.5 rounded-full border shadow-sm backdrop-blur-sm transition-all duration-300 z-10 ${
            isWishlisted
              ? "bg-[#FAF8FC] text-rose-500 border-rose-100"
              : "bg-white/90 text-stone-500 hover:text-rose-500 border-stone-100 hover:scale-110"
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Action Overlay for desktops */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-purple-deep/90 via-purple-deep/40 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-2 z-10">
          {!isSoldOut ? (
            <>
              <button
                onClick={() => onAddToCart(product, product.sizes[0] || "M", product.colors[0] || "Ivory")}
                className="w-full bg-white hover:bg-gold hover:text-white text-stone-900 font-medium py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Quick Add
              </button>
              <button
                onClick={() => onQuickView(product)}
                className="w-full bg-purple/40 hover:bg-purple border border-white/20 text-white font-medium py-2 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Customize Details
              </button>
            </>
          ) : (
            <button
              disabled
              className="w-full bg-stone-700/80 text-stone-300 font-medium py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider cursor-not-allowed"
            >
              Out of stock
            </button>
          )}
        </div>

        {/* Quick View trigger for touch screens */}
        <button
          onClick={() => onQuickView(product)}
          className="absolute bottom-3 right-3 md:hidden bg-white/95 text-purple p-2.5 rounded-full shadow-lg border border-purple-mist/50"
          title="Quick View"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] text-purple-light uppercase font-bold tracking-widest">
            {product.category}
          </span>
          
          {/* Star Rating display */}
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-gold fill-gold" />
            <span className="text-[10px] font-semibold text-stone-500">{product.rating}</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-serif text-[1rem] leading-snug font-semibold text-stone-900 group-hover:text-purple transition-colors mb-2 line-clamp-1">
          {product.name}
        </h3>

        {/* Pricing block */}
        <div className="flex items-baseline justify-between gap-1.5 mt-auto">
          <p className="text-sm font-bold text-purple font-sans">
            ₦{product.price.toLocaleString()}
          </p>
          <span className="text-[10px] text-stone-400 font-sans">
            ₦{(product.price + 3500).toLocaleString()} Original
          </span>
        </div>

        {/* Available sizes */}
        <div className="mt-2.5 pt-2.5 border-t border-purple-mist/20 flex items-center gap-1.5 overflow-hidden">
          <span className="text-[9px] uppercase font-bold tracking-widest text-stone-400 shrink-0">
            Sizes:
          </span>
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
            {product.sizes.map((s) => (
              <span
                key={s}
                className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 shrink-0"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
