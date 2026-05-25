import React, { useState, useEffect } from "react";
import { ArrowUp, Star, Home, Heart, Search, ShoppingBag, ShieldCheck } from "lucide-react";

interface FloatingControlsProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onNavigateToSection: (sectionId: string) => void;
  onToggleAdmin: () => void;
  isAdminActive: boolean;
}

export default function FloatingControls({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onNavigateToSection,
  onToggleAdmin,
  isAdminActive,
}: FloatingControlsProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) setShowScrollTop(true);
      else setShowScrollTop(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Sticky Bottom Bar for Mobile Devices */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-purple-mist/30 h-16 flex items-center justify-around px-4 z-40 shadow-xl text-stone-600">
        
        {/* Toggle Admin */}
        <button
          onClick={onToggleAdmin}
          className={`flex flex-col items-center gap-1 transition-all ${
            isAdminActive ? "text-purple scale-110 font-bold" : "hover:text-purple"
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Merchant</span>
        </button>

        {/* Home */}
        <button
          onClick={() => {
            onNavigateToSection("hero-anchor");
            if (isAdminActive) onToggleAdmin();
          }}
          className="flex flex-col items-center gap-1 hover:text-purple transition-all"
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Home</span>
        </button>

        {/* Search / Browse Anchor */}
        <button
          onClick={() => {
            onNavigateToSection("catalog-anchor");
            if (isAdminActive) onToggleAdmin();
          }}
          className="flex flex-col items-center gap-1 hover:text-purple transition-all"
        >
          <Search className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Browse</span>
        </button>

        {/* Wishlist Indicator */}
        <button
          onClick={onOpenWishlist}
          className="flex flex-col items-center gap-1 hover:text-purple transition-all relative"
        >
          <Heart className="w-5 h-5" />
          {wishlistCount > 0 && (
            <span className="absolute top-[-4px] right-2 bg-rose-500 text-white font-extrabold text-[8px] h-4 w-4 rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
          <span className="text-[9px] uppercase tracking-wider">Wishlist</span>
        </button>

        {/* Royal Cart slider activator */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center gap-1 hover:text-purple transition-all relative"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute top-[-4px] right-1 bg-purple text-white font-extrabold text-[8px] h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
              {cartCount}
            </span>
          )}
          <span className="text-[9px] uppercase tracking-wider font-semibold">Cart</span>
        </button>
      </div>

      {/* Floating Action Elements (WhatsApp and Back-to-Top) */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 flex flex-col gap-3 z-40">
        
        {/* Back to top scroll button */}
        {showScrollTop && (
          <button
            onClick={handleScrollTop}
            className="p-3 bg-purple text-white shadow-lg rounded-full border border-purple-light/20 hover:bg-purple-deep hover:translate-y-[-2px] hover:scale-105 active:scale-95 transition-all outline-none"
            title="Back To Top"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        {/* Floating WhatsApp Quick chat assistant support */}
        <a
          href="https://wa.me/2348039567566?text=Hey%20my%20queen%20Teema%20%F0%9F%91%91%20I'm%20visiting%20your%20luxury%20storefront%20and%20need%2520some%2520styling%252520guidance!%20%F0%9F%92%9C"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-[#25D366] text-white shadow-xl rounded-full hover:bg-[#1ebe5d] hover:translate-y-[-2px] hover:scale-105 active:scale-95 transition-all flex items-center justify-center animate-duration-1000"
          title="Direct WhatsApp Support Line"
          aria-label="WhatsApp support"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
    </>
  );
}
