import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { X, ShoppingBag, Star, Plus, Minus, Heart } from "lucide-react";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: string, qty: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}: QuickViewModalProps) {
  if (!product) return null;

  const isSoldOut = product.status === "Sold Out" || product.quantityAvailable <= 0;
  
  // Custom states for options selected in quickview
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");

  // Populate first available options whenever chosen product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || "M");
      setSelectedColor(product.colors[0] || "Ivory");
      setQuantity(1);
      setActiveImage(product.image);
    }
  }, [product]);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < product.quantityAvailable) setQuantity(quantity + 1);
  };

  const allImages = [product.image, ...(product.secondaryImages || [])].filter((img, i, arr) => arr.indexOf(img) === i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in animate-duration-200">
      {/* Modal Box */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-fade-in-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-500 hover:text-purple hover:scale-110 shadow-md transition-all z-20"
          aria-label="Close Detailed View"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Advanced Image Gallery */}
        <div className="w-full md:w-1/2 p-6 flex flex-col bg-[#FAF8FC] justify-center border-r border-purple-mist/10">
          <div className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden shadow-sm bg-white mb-4">
            <img
              src={activeImage || product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Thumbnails list */}
          {allImages.length > 1 && (
            <div className="flex gap-2 justify-center py-1 overflow-x-auto">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-14 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === img ? "border-purple scale-105 shadow-md" : "border-stone-100 hover:border-purple-mist"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Options Selector Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto no-scrollbar justify-between">
          <div>
            {/* Category tag and status */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#8B5CC8]">
                {product.category}
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-gold fill-gold" />
                <span className="text-xs font-bold text-stone-700">{product.rating}</span>
                <span className="text-[10px] text-stone-400">({product.reviewsCount} verified reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="font-serif text-2xl font-bold text-[#3B1A63] mb-3 leading-tight">
              {product.name}
            </h2>

            {/* Pricing Panel */}
            <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-purple-mist/20 border border-purple-mist/10">
              <span className="text-xl font-bold text-purple">
                ₦{product.price.toLocaleString()}
              </span>
              <span className="text-xs text-stone-400 line-through">
                ₦{(product.price + 3500).toLocaleString()}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Thrift Value Verified
              </span>
            </div>

            {/* Product description content */}
            <p className="text-xs text-stone-600 leading-relaxed mb-6 font-sans">
              {product.description}
            </p>

            {/* Color Selector */}
            {product.colors.length > 0 && (
              <div className="mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                  Select Color Accent: <strong className="text-purple ml-1 font-normal">{selectedColor}</strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`text-[11px] font-medium px-4 py-2 rounded-xl transition-all border ${
                        selectedColor === c
                          ? "bg-purple-deep text-white border-purple-deep shadow-sm scale-105"
                          : "bg-white text-stone-700 border-stone-200 hover:border-purple-mist hover:bg-[#FAF8FC]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Select Size:
                  </span>
                  <span className="text-[10px] text-[#C9A84C] font-semibold cursor-pointer underline">
                    Size Guide (UK / Standard sizing)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-11 h-11 rounded-xl text-xs font-bold transition-all border flex items-center justify-center ${
                        selectedSize === s
                          ? "bg-purple text-white border-purple shadow-md scale-105"
                          : "bg-stone-50 text-[#0D0D0D] border-stone-200 hover:border-purple-mist"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Availability status line */}
            <div className="flex items-center gap-2 mb-6 text-xs text-stone-500 font-sans">
              <span className={`w-2.5 h-2.5 rounded-full ${isSoldOut ? "bg-rose-500" : "bg-emerald-500"}`} />
              {isSoldOut ? (
                <span className="font-semibold text-rose-600">This piece is sold out! Join list for next restock.</span>
              ) : (
                <span>
                  Only <strong className="text-purple">{product.quantityAvailable} items</strong> available. Curated unique piece!
                </span>
              )}
            </div>
          </div>

          {/* Action Footer: Quantity selector, Wishlist, Add to Cart */}
          <div className="pt-4 border-t border-purple-mist/20 flex flex-col gap-3">
            {!isSoldOut && (
              <div className="flex items-center gap-4 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 shrink-0">
                  Select Qty:
                </span>
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                  <button
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                    className="p-2.5 hover:bg-stone-100 text-stone-500 disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-[#0D0D0D]">{quantity}</span>
                  <button
                    onClick={handleIncrease}
                    disabled={quantity >= product.quantityAvailable}
                    className="p-2.5 hover:bg-stone-100 text-stone-500 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                disabled={isSoldOut}
                onClick={() => {
                  onAddToCart(product, selectedSize, selectedColor, quantity);
                  onClose();
                }}
                className={`flex-1 py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all ${
                  isSoldOut
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                    : "bg-purple hover:bg-purple-deep text-white shadow-lg shadow-purple/10 active:scale-95 hover:translate-y-[-1px]"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {isSoldOut ? "Sold Out" : "Send To My Queen Cart"}
              </button>

              <button
                onClick={() => onToggleWishlist(product)}
                className={`p-3.5 rounded-2xl border transition-colors ${
                  isWishlisted
                    ? "bg-[#FAF8FC] text-rose-500 border-rose-100"
                    : "bg-white text-stone-400 border-stone-200 hover:text-rose-500 hover:bg-[#FAF8FC]"
                }`}
                title="Save to Wishlist"
              >
                <Heart className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
