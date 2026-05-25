import React, { useState, useEffect } from "react";
import { Product, CartItem, Order, Toast } from "./types";
import { getInitialProducts } from "./data";
import ProductCard from "./components/ProductCard";
import QuickViewModal from "./components/QuickViewModal";
import CartDrawer from "./components/CartDrawer";
import FormCheckout from "./components/FormCheckout";
import AdminDashboard from "./components/AdminDashboard";
import FloatingControls from "./components/FloatingControls";
import ToastContainer from "./components/ToastContainer";
import { 
  Sun, Moon, Heart, ShoppingBag, Eye, Star, Search, Filter, 
  ArrowUpDown, X, MessageCircle, Mail, MapPin, Award, RefreshCw, ShieldCheck, UserCheck, Trash2
} from "lucide-react";

// CSV sheet publish point
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR9a5ROp9IVB9ykk-K3lUO9tGBSlDJNjZLFeIaKlm2BsLJNnyhe0dOU1gPHQtwOvYB7TIVHyXmI1XYR/pub?output=csv";

export default function App() {
  // --- CORE STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  
  // Drawer & Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Checkout flow states
  const [activeCheckoutData, setActiveCheckoutData] = useState<{
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryType: "delivery" | "pickup";
    deliveryDate: string;
    notes: string;
    discountAmount: number;
    shippingAmount: number;
    discountCode: string;
  } | null>(null);

  // Info Modals (Shipping, Returns, Sustainability)
  const [activeInfoType, setActiveInfoType] = useState<string | null>(null);

  // Newsletter Input State
  const [newsletterEmail, setNewsletterEmail] = useState("");

  // --- INITIAL LOAD & SYNCHRONIZATION ---
  useEffect(() => {
    // 1. Theme Configuration
    const savedTheme = localStorage.getItem("teema_dark_mode") === "true";
    setIsDarkMode(savedTheme);
    if (savedTheme) {
      document.documentElement.classList.add("dark");
    }

    // 2. Fetch Wishlist & Cart from LocalStorage
    const savedWishlist = localStorage.getItem("teema_wishlist");
    if (savedWishlist) {
      try { setWishlist(JSON.parse(savedWishlist)); } catch (e) { console.error(e); }
    }

    const savedCart = localStorage.getItem("teema_cart");
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }

    // 3. Fetch Orders history
    const savedOrders = localStorage.getItem("teema_orders_history");
    if (savedOrders) {
      try { setOrders(JSON.parse(savedOrders)); } catch (e) { console.error(e); }
    }

    // 4. Products Integration with CSV option or hydrated static seed
    syncCatalogProducts();
  }, []);

  const syncCatalogProducts = async () => {
    setLoading(true);
    // Always fetch locally hydrated DB of additions as core baseline first
    const localCatalog = getInitialProducts();
    
    try {
      // Attempt to load from published Sheets CSV endpoint
      const res = await fetch(CSV_URL + "?t=" + Date.now());
      if (!res.ok) throw new Error("HTTP failed: " + res.status);
      const text = await res.text();
      const parsed = parseCSV(text);
      
      if (parsed && parsed.length > 0) {
        // Overlay properties or use sheets list
        const merged: Product[] = parsed.map((item, index) => {
          const rawPrice = Number((item.price || "0").toString().replace(/[^0-9.]/g, ""));
          return {
            id: `sheet-${index}-${Math.floor(Math.random()*100)}`,
            name: item.name || "Teema Premium Piece",
            price: rawPrice || 6000,
            description: item.description || "A gorgeous handpicked retro vintage garment.",
            category: item.category || "Dresses",
            image: item.image || item.image_link || item.imagelink || "https://res.cloudinary.com/dqbdcvsmr/image/upload/IMG_4328_yf7ce0.jpg",
            status: (item.status || "").toLowerCase().includes("sold") ? "Sold Out" : "Available",
            rating: item.rating ? Number(item.rating) : 4.8,
            reviewsCount: item.reviews ? Number(item.reviews) : 12,
            sizes: item.sizes ? item.sizes.split(",").map((s: string) => s.trim()) : ["S", "M", "L"],
            colors: item.colors ? item.colors.split(",").map((c: string) => c.trim()) : ["Classic Rose", "Royal Amethyst"],
            quantityAvailable: item.quantity ? Number(item.quantity) : 4
          };
        });

        // Sync with state & localStorage catalog base
        setProducts(merged);
        localStorage.setItem("teema_store_products", JSON.stringify(merged));
        addToast("Sheets inventory successfully synced, my Queen! 👑", "success");
      } else {
        setProducts(localCatalog);
      }
    } catch (err: any) {
      console.warn("CSV sheet connection bypassed/unavailable. Running local boutique vault directly:", err.message);
      setProducts(localCatalog);
    } finally {
      setLoading(false);
    }
  };

  // --- CSV PARSING ENGINE ---
  const parseLine = (line: string) => {
    const cols = [];
    let inQ = false;
    let cur = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQ = !inQ;
      } else if (ch === ',' && !inQ) {
        cols.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur);
    return cols;
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = parseLine(lines[0]).map((h) => h.replace(/^"|"$/g, "").toLowerCase().trim());
    return lines.slice(1).map((line) => {
      const cols = parseLine(line);
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = (cols[i] || "").replace(/^"|"$/g, "").trim();
      });
      return obj;
    }).filter((p) => p.name);
  };

  // --- TOAST FEEDBACK HANDLERS ---
  const addToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const fresh: Toast = { id: Date.now().toString(), message, type };
    setToasts((prev) => [...prev, fresh]);
    setTimeout(() => {
      removeToast(fresh.id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- THEME SWITCH TOGGLE ---
  const toggleThemeMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem("teema_dark_mode", String(nextMode));
    if (nextMode) {
      document.documentElement.classList.add("dark");
      addToast("Dark luxury mode activated 🌙", "info");
    } else {
      document.documentElement.classList.remove("dark");
      addToast("Soft twilight theme restored ☀️", "info");
    }
  };

  // --- CART WRAPPERS ---
  const handleAddToCart = (product: Product, size: string, color: string, qty: number = 1) => {
    if (product.status === "Sold Out" || product.quantityAvailable <= 0) {
      addToast("This piece has run out of stock, my Queen! Restock alert set.", "error");
      return;
    }

    setCart((prev) => {
      // Find matching item with SAME parameters
      const matchIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      let nextCart = [...prev];
      if (matchIdx > -1) {
        const nextQty = nextCart[matchIdx].qty + qty;
        const finalQty = Math.min(nextQty, product.quantityAvailable);
        nextCart[matchIdx] = { ...nextCart[matchIdx], qty: finalQty };
        addToast(`Boutique updated! Increased "${product.name}" quantity.`, "success");
      } else {
        nextCart.push({ product, qty, selectedSize: size, selectedColor: color });
        addToast(`Saved luxury piece "${product.name}" into your cart!`, "success");
      }

      localStorage.setItem("teema_cart", JSON.stringify(nextCart));
      return nextCart;
    });
  };

  const handleUpdateCartQty = (productName: string, size: string, color: string, newQty: number) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.product.name === productName && item.selectedSize === size && item.selectedColor === color
      );
      if (idx === -1) return prev;
      
      let nextCart = [...prev];
      const maxAvailable = nextCart[idx].product.quantityAvailable;
      if (newQty <= 0) {
        nextCart.splice(idx, 1);
        addToast("Item successfully cleared from cart.", "info");
      } else {
        nextCart[idx] = { ...nextCart[idx], qty: Math.min(newQty, maxAvailable) };
      }
      localStorage.setItem("teema_cart", JSON.stringify(nextCart));
      return nextCart;
    });
  };

  const handleRemoveCartItem = (productName: string, size: string, color: string) => {
    setCart((prev) => {
      const filtered = prev.filter(
        (item) => !(item.product.name === productName && item.selectedSize === size && item.selectedColor === color)
      );
      addToast("Removed item from cart.", "info");
      localStorage.setItem("teema_cart", JSON.stringify(filtered));
      return filtered;
    });
  };

  // --- WISHLIST WRAPPERS ---
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const match = prev.find((item) => item.id === product.id);
      let nextWish: Product[] = [];
      if (match) {
        nextWish = prev.filter((item) => item.id !== product.id);
        addToast(`Removed "${product.name}" from your wishlist.`, "info");
      } else {
        nextWish = [...prev, product];
        addToast(`Saved "${product.name}" to wishlist, my Queen! 💜`, "success");
      }
      localStorage.setItem("teema_wishlist", JSON.stringify(nextWish));
      return nextWish;
    });
  };

  // --- CUSTOM CATALOG SAVES (CRUD) ---
  const handleUpdateProductsCatalog = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem("teema_store_products", JSON.stringify(updatedProducts));
  };

  const handleUpdateOrdersList = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    localStorage.setItem("teema_orders_history", JSON.stringify(updatedOrders));
  };

  // --- SEARCH AND FILTERS COMPOSE ---
  const filteredProducts = products.filter((p) => {
    const categoryMatch = activeCategory === "all" || p.category.toLowerCase() === activeCategory.toLowerCase();
    const searchString = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !searchString ||
      p.name.toLowerCase().includes(searchString) ||
      p.category.toLowerCase().includes(searchString) ||
      p.description.toLowerCase().includes(searchString);

    return categoryMatch && matchesSearch;
  });

  // Sort logic sorting the filtered matrix
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "rating-desc") return b.rating - a.rating;
    return 0; // default order
  });

  // Unique category set representing current filters
  const uniqueCategories = ["all", "Dresses", "Tops", "Skirts", "Trousers"];

  const scrollToAnchor = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // --- NEWSLETTER CLUB ---
  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    const emailStr = newsletterEmail.trim();
    if (!emailStr || !emailStr.includes("@")) {
      addToast("Please enter a valid royal email, my Queen! 💜", "error");
      return;
    }

    const subscribers = JSON.parse(localStorage.getItem("teema_newsletter_list") || "[]");
    if (!subscribers.includes(emailStr)) {
      subscribers.push(emailStr);
      localStorage.setItem("teema_newsletter_list", JSON.stringify(subscribers));
    }

    addToast(`Welcome to the Royalty Club! Check your inbox shortly at ${emailStr}. 👑`, "success");
    setNewsletterEmail("");
  };

  // --- SHIPPING PARSERS & CONTENT MODALS ---
  const INFO_DATA: Record<string, { title: string; content: string[] }> = {
    shipping: {
      title: "Royal Shipping Logistics",
      content: [
        "🚚 Kaduna local dispatch is managed via courier riders at a flat rate of ₦1,500.",
        "📦 Interstate deliveries are shipped securely via DHL or transport partners, reaching Lagos, Abuja, Port Harcourt and nationwide regions within 3 to 5 business days.",
        "💎 Flat Interstate Standard Fee: ₦3,500 – ₦4,500.",
        "👑 ROYAL CAP: Receive COMPLIMENTARY shipping on total order baskets exceeding ₦70,000 automatically!"
      ]
    },
    returns: {
      title: "Grounded Return Safeguards",
      content: [
        "🌸 Every product in our catalog represents pristine authentic UK/US curations vetted personally. If fitting specifications fail, we offer flexible corrections.",
        "⏰ Return window is set within 48 hours of transit completions.",
        "🏷️ Garments must retain security brand tags, showing no signs of wash or perfume wear.",
        "💜 Message the design suite on WhatsApp to request size swaps or shop credits instantly!"
      ]
    },
    sustainability: {
      title: "Eco Elegance & Sustainability",
      content: [
        "🌿 Luxury thrift offsets standard fast carbon footprints. Vetting unique UK/US garments extends high-quality fabric cycles beautifully.",
        "⭐ By supporting Teema's Collections, you directly divert garments from global landfills, maintaining clean, circular garment paths.",
        "👑 Royalty is elegant, conscious, and sustainable."
      ]
    }
  };

  return (
    <div className={`min-h-screen text-stone-900 bg-[#FAF8FC] transition-colors duration-300 dark:bg-stone-950 dark:text-stone-100 ${isDarkMode ? "dark" : ""}`}>
      {/* 1. TOP STATUS ALERT BANNER */}
      <div className="bg-gradient-to-r from-purple-deep via-purple to-purple-deep text-white text-[10px] md:text-xs uppercase tracking-widest py-2.5 px-4 text-center font-bold relative z-30 shadow-md">
        <span>👑 FREE NATIONWIDE DISPATCH ON ORDERS OVER ₦70,000 · NEW ARRIVALS DROP WEEKLY 👑</span>
      </div>

      {/* 2. NAVIGATION BAR */}
      <nav id="hero-anchor" className="sticky top-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-purple-mist/20 dark:border-stone-800 z-40 transition-colors h-20 flex items-center shadow-xs">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex justify-between items-center">
          
          {/* Brand Logo and Text pairing representing royalty */}
          <div 
            onClick={() => {
              setIsAdminActive(false);
              scrollToAnchor("hero-anchor");
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-purple flex items-center justify-center font-serif text-white font-extrabold text-lg shadow-md group-hover:bg-gold transition-colors">
              T
            </div>
            <div>
              <h1 className="font-serif text-xl md:text-2xl font-black text-[#3B1A63] dark:text-purple-mist leading-none flex items-center">
                Teema's<span className="text-gold group-hover:text-purple transition-colors ml-1 font-serif">Collections</span>
              </h1>
              <span className="text-[9px] uppercase tracking-widest text-[#8B5CC8] font-bold block mt-0.5">Feminine Luxury Thrift</span>
            </div>
          </div>

          {/* Desktop central sections links */}
          <ul className="hidden md:flex items-center gap-8 text-xs uppercase font-extrabold tracking-widest text-stone-600 dark:text-stone-300">
            <li>
              <button 
                onClick={() => {
                  setIsAdminActive(false);
                  scrollToAnchor("catalog-anchor");
                }} 
                className="hover:text-purple transition-colors outline-none"
              >
                All Pieces
              </button>
            </li>
            <li className="relative group">
              <button 
                onClick={() => {
                  setIsAdminActive(false);
                  scrollToAnchor("moods-section");
                }} 
                className="hover:text-purple transition-colors outline-none flex items-center"
              >
                Collections
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setIsAdminActive(false);
                  scrollToAnchor("story-anchor");
                }} 
                className="hover:text-purple transition-colors outline-none"
              >
                Our Story
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setIsAdminActive(false);
                  scrollToAnchor("newsletter-section");
                }} 
                className="hover:text-purple transition-colors outline-none"
              >
                Royalty Club
              </button>
            </li>
          </ul>

          {/* Navigation Action Buttons (Cart, Wishlist, Admin, Theme) */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* Theme Switcher Toggle */}
            <button
              onClick={toggleThemeMode}
              className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
              aria-label="Toggle theme mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-gold fill-gold" /> : <Moon className="w-4 h-4 text-purple" />}
            </button>

            {/* Merchant Suite activator */}
            <button
              onClick={() => setIsAdminActive(!isAdminActive)}
              className={`hidden sm:flex items-center gap-1 text-xs uppercase font-bold px-3 py-1.5 rounded-xl border tracking-wider transition-all shadow-2xs ${
                isAdminActive 
                  ? "bg-purple text-white border-purple" 
                  : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-750"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Suite
            </button>

            {/* Wishlist button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="p-1.5 rounded-full hover:bg-[#FAF8FC] dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors relative"
              aria-label="Open Wishlist portfolio"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute top-[-3px] right-[-3px] bg-rose-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart trigger button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-purple text-white shadow-md shadow-purple/10 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl hover:bg-purple-deep transition-colors outline-none"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold font-mono tracking-wider hidden sm:inline">
                ₦{cart.reduce((acc, i) => acc + i.product.price * i.qty, 0).toLocaleString()}
              </span>
              <span className="bg-white text-purple text-[10px] font-black h-4 px-1.5 rounded-full flex items-center justify-center shrink-0">
                {cart.reduce((acc, i) => acc + i.qty, 0)}
              </span>
            </button>

          </div>
        </div>
      </nav>

      {/* 3. CORE ROUTER OUTLET CONTROLLER */}
      {isAdminActive ? (
        /* ================= MERCHANT VIEW BOARD PANEL ================= */
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in mb-16">
          <div className="mb-4">
            <button
              onClick={() => setIsAdminActive(false)}
              className="text-xs font-bold text-ash hover:text-purple uppercase tracking-widest flex items-center gap-1 underline mb-6"
            >
              ← Back to Teema's Luxury Store homepage
            </button>
          </div>
          <AdminDashboard
            products={products}
            orders={orders}
            onUpdateProducts={handleUpdateProductsCatalog}
            onUpdateOrders={handleUpdateOrdersList}
            addToast={addToast}
          />
        </div>
      ) : (
        /* ================= RETAIL ONLINE CUSTOMER SHOPFRONT ================= */
        <div className="space-y-16 animate-fade-in pb-16">
          
          {/* HERO BANNER BLOCK */}
          <header className="relative bg-[#FAF8FC] dark:bg-stone-950 overflow-hidden border-b border-purple-mist/10">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12">
              
              {/* Text side content */}
              <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 text-xs bg-purple-mist text-purple font-extrabold px-3.5 py-1 rounded-full uppercase tracking-widest shadow-2xs dark:bg-stone-900 dark:text-purple-light select-none">
                  ✦ Handpicked Curated Gems
                </span>
                
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-[3.8rem] font-extrabold text-[#3B1A63] dark:text-purple-mist leading-tight">
                  Welcome My <br />
                  <em className="text-gold font-serif not-italic">Beautiful Queens.</em>
                </h2>
                
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto md:mx-0 leading-relaxed font-sans">
                  Luxury is defined completely by the layout and materials fit, never by exorbitant sums. Discover handpicked classy UK/US thrift elements tailored beautifully for your wardrobe royalty.
                </p>

                <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3">
                  <button
                    onClick={() => scrollToAnchor("catalog-anchor")}
                    className="bg-purple text-white font-extrabold shadow-lg shadow-purple/10 px-8 py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-purple-deep transition-all hover:translate-y-[-1px]"
                  >
                    Shop Collection Catalog
                  </button>
                  <button
                    onClick={() => scrollToAnchor("moods-section")}
                    className="border border-purple text-purple dark:text-purple-light px-8 py-4 rounded-2xl text-xs uppercase tracking-widest font-extrabold bg-transparent hover:bg-purple-mist hover:text-purple-deep transition-all"
                  >
                    Browse Style Moods
                  </button>
                </div>

                {/* Micro indicators under hero CTA */}
                <div className="pt-6 border-t border-purple-mist/10 flex flex-wrap gap-5 justify-center md:justify-start text-[10px] text-stone-400 font-sans tracking-widest uppercase">
                  <span>✔ HANDPICKED VINTAGE</span>
                  <span>✔ 48HR RETURN ACCORDS</span>
                  <span>✔ SECURED BANK VETTINGS</span>
                </div>
              </div>

              {/* Parallax Image Content */}
              <div className="w-full md:w-1/2 relative">
                <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl relative bg-[#3B1A63]/5">
                  <img
                    src="https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.43.jpeg"
                    alt="Teema luxury showcase"
                    className="w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3B1A63]/60 via-transparent to-transparent" />
                  
                  {/* Floating promise badge bottom overlay */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 md:p-6 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl shadow-xl flex items-center gap-4">
                    <span className="text-3xl">👑</span>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#3B1A63] dark:text-purple-mist leading-none">Uncompromised Standards</h4>
                      <p className="text-[10px] text-[#C9A84C] mt-1 uppercase font-extrabold font-sans tracking-widest">Unbeatable Thrift Prices</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </header>

          {/* MARQUEE RUNNING TICKER ROW */}
          <div className="bg-[#5B2D8E] text-[#FFF] py-4 overflow-hidden relative select-none">
            <div className="flex whitespace-nowrap gap-16 animate-[marquee_25s_linear_infinite] px-4 text-xs font-bold uppercase tracking-widest w-max">
              <span>✦ TEEMA'S COLLECTIONS</span>
              <span>✦ FEMININE LUXURY THRIFT</span>
              <span>✦ CLASSY · ELEGANT · AFFORDABLE</span>
              <span>✦ HEY MY QUEENS</span>
              <span>✦ NATIONWIDE FAST SHIPPING</span>
              <span>✦ BRAND CONSCIOUS DISPATCH</span>
              <span>✦ TEEMA'S COLLECTIONS</span>
              <span>✦ FEMININE LUXURY THRIFT</span>
              <span>✦ CLASSY · ELEGANT · AFFORDABLE</span>
              <span>✦ HEY MY QUEENS</span>
            </div>
          </div>

          {/* MOODS SECTION */}
          <section id="moods-section" className="max-w-7xl mx-auto px-4 md:px-8 py-4">
            <div className="text-center space-y-2 mb-10">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#C9A84C]">Aesthetic Directions</span>
              <h3 className="font-serif text-3xl font-bold text-[#3B1A63] dark:text-purple-mist">Shop By Style Mood</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Click a lifestyle collection grid below to immediately organize pieces fitting your exact day's visual vibe.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
              {[
                { 
                  num: "01", 
                  title: "Teema's Escape", 
                  desc: "Soft light layers designed for slow relaxing country escapes.", 
                  category: "Dresses",
                  img: "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(3).jpeg" 
                },
                { 
                  num: "02", 
                  title: "Soft Moments", 
                  desc: "Classic silky cowl-neck structures defining casual grace.", 
                  category: "Tops",
                  img: "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(2).jpeg" 
                },
                { 
                  num: "03", 
                  title: "After Dark", 
                  desc: "Pleated silk skirts and majestic velvets command authority.", 
                  category: "Skirts",
                  img: "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(4).jpeg" 
                },
                { 
                  num: "04", 
                  title: "Office Edition", 
                  desc: "Boss energy, wide trousers tailored perfectly for executive board settings.", 
                  category: "Trousers",
                  img: "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.43.jpeg" 
                }
              ].map((m) => (
                <div 
                  key={m.num}
                  onClick={() => {
                    setActiveCategory(m.category);
                    scrollToAnchor("catalog-anchor");
                    addToast(`Filtered styles: ${m.category} mood`, "info");
                  }}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md border hover:border-gold/30 transition-all border-purple-mist/5"
                >
                  <img src={m.img} alt={m.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-purple-deep/95 via-[#3B1A63]/40 to-transparent p-5 text-white flex flex-col justify-end h-1/2">
                    <span className="text-[10px] font-sans font-extrabold tracking-widest text-gold uppercase mb-1">Collection {m.num}</span>
                    <h4 className="font-serif text-lg font-bold leading-tight mb-1">{m.title}</h4>
                    <p className="text-[10px] text-stone-200 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-sans">{m.desc}</p>
                    <span className="text-[9px] font-mono hover:text-gold uppercase tracking-widest font-bold mt-2 underline pointer-events-none">Explore mood →</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* MAIN CATALOG PANEL SECTION */}
          <section id="catalog-anchor" className="max-w-7xl mx-auto px-4 md:px-8 py-4 space-y-10 scroll-mt-24">
            {/* Header matrix with filter categories, search and sorts options inside single panel */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-purple-mist/20 dark:border-stone-800 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8B5CC8] tracking-widest">Active Storefront</span>
                  <h3 className="font-serif text-2xl md:text-3xl font-extrabold text-[#3B1A63] dark:text-purple-mist mt-0.5">The Signature Collections</h3>
                </div>

                {/* Realtime filter input widget */}
                <div className="relative w-full md:w-80 shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, category, fit details..."
                    className="w-full bg-stone-50 border border-stone-200 dark:bg-stone-800 dark:border-stone-700 rounded-2xl py-2.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-purple focus:outline-none focus:bg-white text-stone-900 dark:text-white"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Advanced multi-selectors (Category tabs row and Sort Select box) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-purple-mist/10">
                <div className="flex flex-wrap gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
                  {uniqueCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        addToast(`Filtered Category: ${cat}`, "info");
                      }}
                      className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border transition-all shrink-0 ${
                        activeCategory === cat
                          ? "bg-purple text-white border-purple shadow-sm"
                          : "bg-stone-100/50 hover:bg-stone-100 text-[#0D0D0D] dark:text-stone-300 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-purple-mist"
                      }`}
                    >
                      {cat === "all" ? "All Pieces" : cat}
                    </button>
                  ))}
                </div>

                {/* Sorting widget selector */}
                <div className="flex items-center gap-2 max-w-full shrink-0">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-stone-50 border border-stone-205 dark:bg-stone-800 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl p-2.5 text-[10px] font-bold uppercase tracking-wider focus:outline-none"
                  >
                    <option value="default">Default Sorting</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Alphabetical A-Z</option>
                    <option value="rating-desc">Highly Rated Star</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Catalog Grid Area */}
            {loading ? (
              /* SKELETON PREVIEW LOADERS */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse flex flex-col gap-3">
                    <div className="aspect-[3/4] w-full bg-stone-200 rounded-3xl" />
                    <div className="h-4 w-1/3 bg-stone-200 rounded" />
                    <div className="h-5 w-2/3 bg-stone-200 rounded" />
                    <div className="h-4 w-1/4 bg-stone-200 rounded" />
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              /* High quality customized empty state */
              <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-dashed border-purple-mist/50">
                <span className="text-5xl">👑</span>
                <p className="font-serif italic text-lg text-[#3B1A63] mt-4 font-bold dark:text-purple-mist">No royal piece matched your filter criteria, my Queen.</p>
                <p className="text-xs text-stone-400 mt-2 font-sans max-w-sm mx-auto">Try resetting active categories filters or explore wide trouser selections instead!</p>
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setSearchQuery("");
                    setSortBy("default");
                    addToast("Search queries and filter categories cleared successfully.", "info");
                  }}
                  className="mt-6 bg-[#3B1A63] hover:bg-purple text-white text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-2xl"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Fully Interactive Retail Roster */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sortedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onQuickView={(p) => setSelectedProduct(p)}
                    onAddToCart={(product, size, color) => handleAddToCart(product, size, color, 1)}
                    isWishlisted={!!wishlist.find((item) => item.id === p.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </section>

          {/* THE BRAND STORY (OUR STORY) */}
          <section id="story-anchor" className="max-w-7xl mx-auto px-4 md:px-8 py-4">
            <div className="bg-purple-deep text-white rounded-[3.5rem] overflow-hidden p-8 md:p-14 shadow-2xl relative">
              
              {/* Background ambient gold coin layout circles */}
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-purple/10 blur-3xl" />
              <div className="absolute bottom-[-50px] left-[-50px] w-96 h-96 rounded-full bg-gold/5 blur-3xl" />

              <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
                <div className="w-full lg:w-1/2 space-y-6">
                  <span className="text-xs uppercase tracking-widest font-extrabold text-[#C9A84C]">Our Essence Heritage</span>
                  <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">Handpicked Quality <br className="hidden md:inline" /> Vetted to Perfection</h3>
                  <p className="text-xs lg:text-sm text-stone-200/90 leading-relaxed font-sans max-w-md">
                    We source unique pre-vetted thrift pieces and ready-made gems directly from major UK🇬🇧 and US🇺🇸 hubs. Every single piece inside our dynamic locker undergoes meticulous inspection cycles, validating seam alignments, color vibrancy, and premium wear standards.
                  </p>
                  
                  {/* Milestones listed visually */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-purple-light/20">
                    <div>
                      <h4 className="text-2xl font-bold font-mono text-gold leading-none font-serif italic">100%</h4>
                      <p className="text-[10px] uppercase text-stone-300 tracking-wider mt-1.5">Vetted UK-US Import</p>
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold font-mono text-gold leading-none font-serif italic">4.9★</h4>
                      <p className="text-[10px] uppercase text-stone-300 tracking-wider mt-1.5">Customer Trust Star</p>
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold font-serif text-gold leading-none italic">Local</h4>
                      <p className="text-[10px] uppercase text-stone-300 tracking-wider mt-1.5">Kaduna Dispatch Center</p>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 grid grid-cols-12 gap-3 relative select-none">
                  <div className="col-span-8 rounded-3xl overflow-hidden aspect-[3/4]">
                    <img src="https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(1).jpeg" alt="Elegance story" className="w-full h-full object-cover" />
                  </div>
                  <div className="col-span-4 flex flex-col gap-3">
                    <div className="rounded-2xl overflow-hidden flex-1 aspect-square bg-[#FAF8FC]">
                      <img src="https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(2).jpeg" alt="Tops details" className="w-full h-full object-cover" />
                    </div>
                    <div className="rounded-2xl overflow-hidden flex-1 aspect-square bg-stone-300">
                      <img src="https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(4).jpeg" alt="Pleated skirts view" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* THE ROYAL CLUB NEWSLETTER */}
          <section id="newsletter-section" className="max-w-7xl mx-auto px-4 md:px-8 py-4 scroll-mt-24">
            <div className="bg-[#F0E8FA] dark:bg-stone-900 border border-purple-mist/50 rounded-[3.5rem] p-8 md:p-12 text-center relative overflow-hidden select-none">
              <span className="text-[10px] font-extrabold uppercase text-purple tracking-widest block mb-2 select-none">Brand Community VIP Club</span>
              
              <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[#3B1A63] dark:text-purple-mist mb-3">Hey My Queen 👑</h2>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed mb-8">
                Join our royal members digest circle to receive immediate access to restock dates, VIP vouchers, and drop maps!
              </p>

              <form onSubmit={handleSubscribeNewsletter} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
                <input
                  required
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address, Queen"
                  className="flex-1 bg-white dark:bg-stone-800 border border-purple-mist rounded-2xl py-3 px-5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-purple focus:bg-white text-xs font-semibold dark:border-stone-700 dark:text-white"
                />
                <button
                  type="submit"
                  className="bg-[#3B1A63] hover:bg-purple text-white font-extrabold text-xs uppercase px-8 py-3.5 rounded-2xl tracking-widest transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Join Royal Club
                </button>
              </form>
            </div>
          </section>

        </div>
      )}

      {/* 4. MAIN FOOTER */}
      <footer className="bg-stone-900 dark:bg-stone-950 text-stone-400 py-12 border-t border-stone-800 mt-16 select-none font-sans">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand profile column */}
          <div className="space-y-4">
            <h4 className="font-serif text-white font-black text-xl leading-none">
              Teema's<span className="text-gold font-serif text-xl ml-1 font-bold">Collections</span>
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed max-w-xs">
              Nigeria's benchmark Feminine Luxury Thrift outlet. Discover handselected, authenticated standard curations of dresses, tops and trousers fitted for modern royalties.
            </p>
            <div className="flex gap-2.5">
              <a href="https://www.instagram.com/TEEMAS_COLLECTIONS_NG" target="_blank" rel="noopener noreferrer" className="p-2 bg-stone-800 rounded-lg hover:bg-purple hover:text-white transition-colors">
                📸 Instagram
              </a>
              <a href="https://www.tiktok.com/@TEEMASCOLLECTIONS1" target="_blank" rel="noopener noreferrer" className="p-2 bg-stone-800 rounded-lg hover:bg-purple hover:text-white transition-colors">
                🎵 TikTok
              </a>
            </div>
          </div>

          {/* Quick shop directories column */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase text-stone-300 font-extrabold tracking-widest">Shop Directions</h4>
            <ul className="text-xs space-y-2.5 font-sans font-medium">
              {["Dresses", "Tops", "Skirts", "Trousers"].map((category) => (
                <li key={category}>
                  <button
                    onClick={() => {
                      setIsAdminActive(false);
                      setActiveCategory(category);
                      scrollToAnchor("catalog-anchor");
                      addToast(`Filtered Category: ${category}`, "info");
                    }}
                    className="hover:text-gold hover:underline transition-colors"
                  >
                    All Curated {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick helper links column */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase text-stone-300 font-extrabold tracking-widest">Client Vetting</h4>
            <ul className="text-xs space-y-2.5 font-sans font-medium">
              <li>
                <button onClick={() => setActiveInfoType("shipping")} className="hover:text-gold hover:underline transition-colors">
                  Delivery Regional Fees
                </button>
              </li>
              <li>
                <button onClick={() => setActiveInfoType("returns")} className="hover:text-gold hover:underline transition-colors">
                  Return & Swaps Policies
                </button>
              </li>
              <li>
                <button onClick={() => setActiveInfoType("sustainability")} className="hover:text-gold hover:underline transition-colors">
                  Eco & Sustainability
                </button>
              </li>
            </ul>
          </div>

          {/* Contact support data column */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase text-stone-300 font-extrabold tracking-widest">Boutique Inquires</h4>
            <ul className="text-xs space-y-2.5 leading-relaxed font-sans font-medium">
              <li className="flex items-start gap-2 max-w-xs">
                <MapPin className="w-4 h-4 text-purple-light shrink-0 mt-0.5" />
                <span>Kaduna center plaza outlet, Level 2, Kaduna State, Nigeria.</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <a href="https://wa.me/2348039567566" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline font-semibold">
                  +234 803 956 7566
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal copyright footer row */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-stone-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs select-none">
          <p>© 2026 Premium Teema's Collections Co. All rights reserved. Nigeria.</p>
          <div className="flex gap-4">
            <p className="text-stone-600 font-serif">Hey my Queens 👑</p>
          </div>
        </div>
      </footer>

      {/* --- SIDEBAR DRAWER 1: CART MODULE --- */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onStartCheckout={(checkoutData) => {
          setActiveCheckoutData(checkoutData);
          setIsCartOpen(false);
        }}
      />

      {/* --- SIDEBAR DRAWER 2: WISHLIST MODULE --- */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => setIsWishlistOpen(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 h-full flex flex-col shadow-2xl z-10 animate-fade-in p-6">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-purple-mist/20 pb-4 mb-6">
              <h3 className="font-serif text-xl font-bold flex items-center gap-2 text-[#3B1A63] dark:text-purple-mist">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                Your Loyalty Wishlist
              </h3>
              <button 
                onClick={() => setIsWishlistOpen(false)} 
                className="p-1.5 rounded-lg text-stone-400 hover:text-black hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Roster scroll */}
            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
              {wishlist.length === 0 ? (
                <div className="text-center py-20 text-stone-400">
                  <span className="text-3xl">💖</span>
                  <p className="font-serif italic mt-3 font-semibold text-[#3B1A63] dark:text-purple-mist">Your wishlist registry represents blank canvases.</p>
                  <p className="text-[10px] mt-1 font-sans">Save favorite pieces whilst shopping catalogues!</p>
                </div>
              ) : (
                wishlist.map((p) => (
                  <div key={p.id} className="flex gap-4 p-3 rounded-2xl border border-purple-mist/10 bg-[#FAF8FC]/30 items-center">
                    <img src={p.image} className="w-14 h-18 rounded-lg object-cover bg-stone-100 shadow-3xs" alt="" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-xs font-bold text-stone-900 dark:text-white line-clamp-1">{p.name}</h4>
                      <p className="text-[10px] text-purple font-mono font-bold mt-1">₦{p.price.toLocaleString()}</p>
                      <button 
                        onClick={() => {
                          handleAddToCart(p, p.sizes[0] || "M", p.colors[0] || "Ivory");
                          setIsWishlistOpen(false);
                        }}
                        className="mt-2 flex items-center gap-1.5 text-[9px] uppercase font-extrabold tracking-widest text-white bg-purple hover:bg-purple-deep px-3 py-1.5 rounded-lg shadow-sm"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        Send To Cart
                      </button>
                    </div>
                    
                    {/* Delete wishlist selector */}
                    <button 
                      onClick={() => handleToggleWishlist(p)} 
                      className="text-stone-300 hover:text-rose-500 p-2"
                      title="Clear save"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* --- OVERLAY MODAL 3: QUICKDETAILED VIEWS --- */}
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={!!(selectedProduct && wishlist.find((item) => item.id === selectedProduct.id))}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* --- OVERLAY MODAL 4: PAYSTACK CHECKOUT OVERLAY --- */}
      {activeCheckoutData && (
        <FormCheckout
          checkoutData={activeCheckoutData}
          cart={cart}
          onCancel={() => {
            setActiveCheckoutData(null);
            setIsCartOpen(true);
          }}
          onSuccess={(newOrder) => {
            // Success triggered — clear local cart
            setCart([]);
            localStorage.removeItem("teema_cart");
            setOrders((prev) => [newOrder, ...prev]);
            setActiveCheckoutData(null);
            addToast("Order and payment verified! WhatsApp dispatch generated.", "success");
          }}
        />
      )}

      {/* --- INFO DIALOG MODAL (Shipping, Policy, circular guides) --- */}
      {activeInfoType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative animate-fade-in-up">
            <button 
              onClick={() => setActiveInfoType(null)} 
              className="absolute top-4 right-4 p-1.5 bg-stone-100 rounded-full hover:bg-stone-200 text-stone-500"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="font-serif text-xl font-bold text-[#3B1A63] border-b border-purple-mist/10 pb-3 mb-4">
              {INFO_DATA[activeInfoType]?.title}
            </h3>
            
            <div className="space-y-3.5 text-xs text-stone-600 leading-relaxed">
              {INFO_DATA[activeInfoType]?.content.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-purple-mist/10 flex justify-end">
              <button 
                onClick={() => setActiveInfoType(null)} 
                className="bg-[#3B1A63] hover:bg-purple text-white text-[10px] uppercase font-extrabold px-6 py-2.5 rounded-xl tracking-wider"
              >
                Understood, my Queen 👑
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ANIMATED OVERLAY FLOATERS AND TOASTS SYSTEMS --- */}
      <FloatingControls
        cartCount={cart.reduce((acc, i) => acc + i.qty, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onNavigateToSection={scrollToAnchor}
        onToggleAdmin={() => setIsAdminActive(!isAdminActive)}
        isAdminActive={isAdminActive}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
