import React, { useState, useEffect } from "react";
import { CartItem, Coupon } from "../types";
import { X, Trash2, Tag, Truck, ShieldCheck, Edit, Calendar } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (productName: string, selectedSize: string, selectedColor: string, newQty: number) => void;
  onRemoveItem: (productName: string, selectedSize: string, selectedColor: string) => void;
  onStartCheckout: (checkoutData: {
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
  }) => void;
}

const NIGERIAN_REGIONS = [
  { id: "kaduna", name: "Kaduna State (Local Center)", fee: 1500 },
  { id: "lagos", name: "Lagos State", fee: 3500 },
  { id: "abuja", name: "Abuja (FCT)", fee: 3000 },
  { id: "rivers", name: "Rivers (Port Harcourt)", fee: 4000 },
  { id: "other", name: "Other Nigerian States", fee: 4500 }
];

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onStartCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  
  // Checkout address information
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [regionId, setRegionId] = useState("kaduna");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  
  // Tab panels - "cart" view vs "checkout_form" view inside drawer
  const [currentStep, setCurrentStep] = useState<"cart_view" | "delivery_view">("cart_view");

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.qty, 0);

  // Apply Coupon Logic
  const handleApplyCoupon = () => {
    setCouponError("");
    const code = couponCode.toUpperCase().trim();
    if (code === "QUEEN10") {
      setAppliedCoupon({ code: "QUEEN10", discountPercent: 10, minSpend: 0 });
    } else if (code === "ROYAL20") {
      setAppliedCoupon({ code: "ROYAL20", discountPercent: 20, minSpend: 15000 });
      if (subtotal < 15000) {
        setCouponError("Min spend for ROYAL20 is ₦15,000, my queen.");
        setAppliedCoupon(null);
      }
    } else if (code === "TEEMA50") {
      setAppliedCoupon({ code: "TEEMA50", discountPercent: 50, minSpend: 40000 });
      if (subtotal < 40000) {
        setCouponError("Min spend for TEEMA50 is ₦40,000, my queen.");
        setAppliedCoupon(null);
      }
    } else {
      setCouponError("Invalid promo code, my queen 💜");
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  // Calculations
  const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discountPercent) / 100) : 0;
  
  // Kaduna 1500, rest, FREE over 70,000 Naira
  const isFreeShipping = subtotal >= 70000 || deliveryType === "pickup";
  const chosenRegion = NIGERIAN_REGIONS.find((r) => r.id === regionId);
  const shippingAmount = isFreeShipping ? 0 : chosenRegion ? chosenRegion.fee : 1500;
  
  const grandTotal = subtotal - discountAmount + shippingAmount;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || (deliveryType === "delivery" && !address)) {
      return;
    }
    // Fire callback
    onStartCheckout({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      deliveryAddress: deliveryType === "pickup" ? "Teema's Boutique Pickup Center" : address,
      deliveryType,
      deliveryDate,
      notes,
      discountAmount,
      shippingAmount,
      discountCode: appliedCoupon ? appliedCoupon.code : "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Background Overlay */}
      <div onClick={onClose} className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity" />

      {/* Cart Slider Box */}
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-fade-in z-10">
        
        {/* Header section of drawer */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-purple-mist/20">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-[1.4rem] font-bold text-[#3B1A63]">
              {currentStep === "cart_view" ? "Your Royal Cart" : "Checkout Details"}
            </h3>
            <span className="text-xs bg-purple-mist text-purple px-2 py-0.5 rounded-full font-bold">
              {cart.reduce((a, i) => a + i.qty, 0)} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic content scroll area */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          {currentStep === "cart_view" ? (
            /* ================= STEP 1: CART LIST ================= */
            cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-72 text-center">
                <span className="text-4xl mb-4">👑</span>
                <p className="font-serif italic text-lg text-[#3B1A63] font-medium">Your cart is empty, my beautiful queen!</p>
                <p className="text-xs text-stone-400 mt-2 font-sans">Give your wardrobe the royal upgrade it deserves today.</p>
                <button
                  onClick={onClose}
                  className="mt-6 border border-purple text-purple px-6 py-2.5 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-purple hover:text-white transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {cart.map((item, idx) => (
                  <div
                    key={`${item.product.name}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                    className="flex gap-4 p-3.5 rounded-xl border border-purple-mist/20 bg-[#FAF8FC]/50 hover:bg-[#FAF8FC]/80 transition-colors"
                  >
                    <div className="w-18 h-24 rounded-lg overflow-hidden bg-white shrink-0 shadow-sm">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-bold text-stone-900 line-clamp-1">{item.product.name}</h4>
                      <p className="text-[10px] text-stone-400 font-sans mt-0.5">Category: {item.product.category}</p>
                      
                      {/* Selected Attributes badge row */}
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="text-[9px] font-bold bg-[#F0E8FA] text-purple px-2 py-0.5 rounded">
                          Size: {item.selectedSize}
                        </span>
                        <span className="text-[9px] font-bold bg-[#FAF8FC] text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                          Color: {item.selectedColor}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 mt-3">
                        {/* Interactive Quantity picker inline */}
                        <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => onUpdateQty(item.product.name, item.selectedSize, item.selectedColor, item.qty - 1)}
                            className="px-2 py-1 hover:bg-stone-50 text-stone-500 disabled:opacity-30"
                            disabled={item.qty <= 1}
                          >
                            -
                          </button>
                          <span className="px-2.5 text-xs font-bold text-stone-800">{item.qty}</span>
                          <button
                            onClick={() => onUpdateQty(item.product.name, item.selectedSize, item.selectedColor, item.qty + 1)}
                            className="px-2 py-1 hover:bg-stone-50 text-stone-500 disabled:opacity-30"
                            disabled={item.qty >= item.product.quantityAvailable}
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-bold text-purple font-sans">
                          ₦{(item.product.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Delete item button */}
                    <button
                      onClick={() => onRemoveItem(item.product.name, item.selectedSize, item.selectedColor)}
                      className="text-stone-300 hover:text-rose-600 transition-colors self-start p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Coupon Panel */}
                <div className="mt-4 p-4 rounded-xl border border-purple-mist/50 bg-[#FAF8FC]/70">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5 mb-2.5">
                    <Tag className="w-3.5 h-3.5 text-purple" />
                    Enter Promo Coupon Code
                  </span>
                  
                  {appliedCoupon ? (
                    <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                      <div className="text-xs">
                        <span className="font-bold text-emerald-800">{appliedCoupon.code} Applied</span>
                        <p className="text-[10px] text-emerald-600 mt-0.5">{appliedCoupon.discountPercent}% Discount saved ₦{discountAmount.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-[10px] font-bold text-rose-500 underline uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g. QUEEN10"
                        className="flex-1 bg-white border border-stone-200 rounded-lg p-2 text-xs uppercase focus:outline-purple/50 focus:border-purple"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-purple hover:bg-purple-deep text-white text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-wider transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {couponError && <p className="text-[10px] text-rose-500 mt-1.5">{couponError}</p>}
                </div>
              </div>
            )
          ) : (
            /* ================= STEP 2: DELIVERY & CONTACT DATA ================= */
            <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
              <div className="flex gap-2 p-1.5 rounded-xl bg-[#FAF8FC] border border-stone-200">
                <button
                  type="button"
                  onClick={() => setDeliveryType("delivery")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    deliveryType === "delivery" ? "bg-purple text-white shadow-sm" : "text-stone-600 hover:bg-stone-200/50"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  Address Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType("pickup")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    deliveryType === "pickup" ? "bg-purple text-white shadow-sm" : "text-stone-600 hover:bg-stone-200/50"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Store Pickup
                </button>
              </div>

              {/* Form Input fields */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block mb-1">Your Full Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Queen Taylor"
                  className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs focus:ring-1 focus:ring-purple focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block mb-1">Email Address</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="taylor@luxury.com"
                    className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs focus:ring-1 focus:ring-purple focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block mb-1">WhatsApp / Phone</label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 810 XXX XXX"
                    className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs focus:ring-1 focus:ring-purple focus:outline-none"
                  />
                </div>
              </div>

              {deliveryType === "delivery" ? (
                <>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block mb-1">Delivery State Region</label>
                    <select
                      value={regionId}
                      onChange={(e) => setRegionId(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs focus:ring-1 focus:ring-purple focus:outline-none"
                    >
                      {NIGERIAN_REGIONS.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} — ₦{r.fee.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block mb-1">Complete Delivery Address</label>
                    <textarea
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street address, apartment name, landmark notes"
                      rows={2}
                      className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs focus:ring-1 focus:ring-purple focus:outline-none resize-none"
                    />
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-xl border border-gold/20 bg-[#FAF8FC] text-xs">
                  <p className="font-semibold text-gold font-serif mb-1">🏪 Pickup Address Location:</p>
                  <p className="text-stone-600 leading-relaxed">
                    Teema's Luxury Boutique Center, Kaduna Town Plaza, Level 2. Orders are ready within 2 hours of payment confirmation!
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-purple" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs focus:ring-1 focus:ring-purple focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block mb-1">Order Notes (Size, Custom)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Leave gift notes here"
                    className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs focus:ring-1 focus:ring-purple focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-purple-mist/10 text-[11px] text-[#7B6A90]">
                By completing checkout, you trigger instant order tracking. Support center live online!
              </div>

              {/* Invisible hidden submit for keyboard trigger */}
              <button type="submit" className="hidden" />
            </form>
          )}
        </div>

        {/* Dynamic Cart Summary Footer Panel */}
        {cart.length > 0 && (
          <div className="bg-[#FAF8FC] border-t border-purple-mist/20 p-6 flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs text-stone-500">
                <span>Subtotal Items</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between items-center text-xs text-emerald-600 font-semibold">
                  <span>Coupon discount ({appliedCoupon.discountPercent}%)</span>
                  <span>- ₦{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  Shipping Fee
                  {isFreeShipping && <span className="text-[9px] uppercase tracking-widest bg-purple text-white px-1.5 py-0.5 rounded font-bold">Free</span>}
                </span>
                <span>{isFreeShipping ? "₦0" : `₦${shippingAmount.toLocaleString()}`}</span>
              </div>

              {subtotal < 70000 && deliveryType === "delivery" && (
                <p className="text-[10px] text-stone-400 font-sans italic text-right">
                  Add <strong>₦{(70000 - subtotal).toLocaleString()}</strong> more for FREE Shipping!
                </p>
              )}

              <div className="pt-2.5 mt-2 border-t border-stone-200 flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest font-extrabold text-[#0D0D0D]">Grand Total</span>
                <span className="text-lg font-serif font-extrabold text-purple">₦{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {currentStep === "cart_view" ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep("delivery_view")}
                  className="w-full bg-purple hover:bg-purple-deep text-white font-bold py-3 px-6 rounded-2xl text-xs uppercase tracking-widest transition-colors shadow-lg active:scale-98"
                >
                  Proceed to Delivery Details →
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep("cart_view")}
                    className="w-1/3 bg-white hover:bg-stone-50 text-stone-700 font-bold py-3.5 px-4 rounded-xl border border-stone-200 text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    ← Review Items
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckoutSubmit}
                    disabled={!name || !email || !phone || (deliveryType === "delivery" && !address)}
                    className="flex-1 bg-purple hover:bg-purple-deep disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-widest transition-colors shadow-xl"
                  >
                    💳 Confirm and Pay with Paystack
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
