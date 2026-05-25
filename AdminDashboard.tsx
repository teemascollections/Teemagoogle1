import React, { useState, useEffect } from "react";
import { Product, Order } from "../types";
import { 
  Package, TrendingUp, ShoppingBag, AlertTriangle, Users, 
  Plus, Edit2, Trash2, Check, RefreshCw, Layers, Calendar, ChevronRight 
} from "lucide-react";

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onUpdateProducts: (updatedProducts: Product[]) => void;
  onUpdateOrders: (updatedOrders: Order[]) => void;
  addToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function AdminDashboard({
  products,
  orders,
  onUpdateProducts,
  onUpdateOrders,
  addToast,
}: AdminDashboardProps) {
  
  // Tab panels: "analytics" | "products" | "orders" | "customers" | "inventory"
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "orders" | "customers" | "inventory">("analytics");

  // Local state for product forms
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  
  // Product form inputs
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Dresses");
  const [formPrice, setFormPrice] = useState(0);
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formSizes, setFormSizes] = useState("S, M, L");
  const [formColors, setFormColors] = useState("Standard Purple, Champagne, Onyx");
  const [formQuantity, setFormQuantity] = useState(5);

  const resetForm = () => {
    setFormName("");
    setFormCategory("Dresses");
    setFormPrice(0);
    setFormDescription("");
    setFormImage("");
    setFormSizes("S, M, L");
    setFormColors("Standard Purple, Champagne, Onyx");
    setFormQuantity(5);
    setIsEditing(false);
    setCurrentEditId(null);
  };

  const handleEditProductClick = (p: Product) => {
    setIsEditing(true);
    setCurrentEditId(p.id);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormDescription(p.description);
    setFormImage(p.image);
    setFormSizes(p.sizes.join(", "));
    setFormColors(p.colors.join(", "));
    setFormQuantity(p.quantityAvailable);
    
    // Smooth scrolling to form
    const formEl = document.getElementById("admin-product-form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || formPrice <= 0 || !formImage) {
      addToast("Please fill in Name, Price, and Image, my Queen!", "error");
      return;
    }

    const sizesArr = formSizes.split(",").map(s => s.trim()).filter(Boolean);
    const colorsArr = formColors.split(",").map(c => c.trim()).filter(Boolean);

    if (isEditing && currentEditId) {
      // Update custom product
      const updated: Product[] = products.map((p): Product => {
        if (p.id === currentEditId) {
          return {
            ...p,
            name: formName,
            category: formCategory,
            price: Number(formPrice),
            description: formDescription,
            image: formImage,
            sizes: sizesArr,
            colors: colorsArr,
            quantityAvailable: Number(formQuantity),
            status: Number(formQuantity) > 0 ? ("Available" as const) : ("Sold Out" as const)
          };
        }
        return p;
      });
      onUpdateProducts(updated);
      addToast(`Updated product "${formName}" successfully!`, "success");
    } else {
      // Create new product
      const newProduct: Product = {
        id: `NEW-${Date.now().toString().slice(-4)}`,
        name: formName,
        category: formCategory,
        price: Number(formPrice),
        description: formDescription,
        image: formImage,
        sizes: sizesArr,
        colors: colorsArr,
        quantityAvailable: Number(formQuantity),
        status: Number(formQuantity) > 0 ? "Available" : "Sold Out",
        rating: 4.8,
        reviewsCount: 1
      };
      onUpdateProducts([newProduct, ...products]);
      addToast(`Added item ${formName} to collection catalog!`, "success");
    }
    resetForm();
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name} from Teema's Collections?`)) {
      const filtered = products.filter(p => p.id !== id);
      onUpdateProducts(filtered);
      addToast("Product deleted safely.", "info");
    }
  };

  const toggleProductStatus = (product: Product) => {
    const updated: Product[] = products.map((p): Product => {
      if (p.id === product.id) {
        const nextStatus = p.status === "Available" ? "Sold Out" : "Available";
        const nextQty = nextStatus === "Sold Out" ? 0 : p.quantityAvailable === 0 ? 3 : p.quantityAvailable;
        return {
          ...p,
          status: nextStatus,
          quantityAvailable: nextQty
        };
      }
      return p;
    });
    onUpdateProducts(updated);
    addToast("Toggled item availability state.", "success");
  };

  // Order status transitions save handler
  const handleOrderStatusChange = (orderId: string, nextStatus: any) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status: nextStatus };
      }
      return o;
    });
    onUpdateOrders(updated);
    addToast(`Order ${orderId} status set to ${nextStatus}`, "success");
  };

  // Calculations for analytics
  const totalSalesRevenue = orders.reduce((acc, o) => {
    if (o.status !== "Cancelled") return acc + o.totalAmount;
    return acc;
  }, 0);

  const pendingOrdersCount = orders.filter(o => o.status === "Pending").length;
  const lowStockItems = products.filter(p => p.quantityAvailable <= 2 && p.status === "Available");
  const outOfStockCount = products.filter(p => p.quantityAvailable === 0 || p.status === "Sold Out").length;

  // Retrieve unique customers analytics
  const customersList = orders.reduce((acc: any[], current) => {
    const match = acc.find(c => c.phone === current.customerPhone);
    if (match) {
      match.totalOrders += 1;
      match.totalSpent += current.totalAmount;
    } else {
      acc.push({
        id: current.customerPhone,
        name: current.customerName,
        email: current.customerEmail,
        phone: current.customerPhone,
        totalOrders: 1,
        totalSpent: current.totalAmount,
        lastDate: current.orderDate
      });
    }
    return acc;
  }, []);

  return (
    <div className="bg-[#FAF8FC] border border-purple-mist/30 rounded-3xl p-6 md:p-8 shadow-xl mt-6">
      
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-purple-mist/20 pb-5">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#C9A84C]">Merchant Suite</span>
          <h2 className="font-serif text-3xl font-extrabold text-[#3B1A63] mt-0.5">Teema's Executive Dashboard</h2>
          <p className="text-xs text-stone-500 mt-1 font-sans">
            Secure, fully lightweight client store manager. Track real performance data stored in localStorage databases.
          </p>
        </div>
        
        {/* Rapid summary badge metrics */}
        <div className="flex gap-2">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono">
            LIVE PREVIEW
          </span>
          <span className="bg-purple-mist text-purple px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Automatic Auto-Sync
          </span>
        </div>
      </div>

      {/* Grid Tabs Row Selector */}
      <div className="flex flex-wrap gap-2 mb-8 bg-stone-100 p-1.5 rounded-2xl max-w-2xl">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === "analytics" ? "bg-purple text-white shadow" : "text-stone-600 hover:bg-stone-200/50"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === "products" ? "bg-purple text-white shadow" : "text-stone-600 hover:bg-stone-200/50"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Inventory Items
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === "orders" ? "bg-purple text-white shadow" : "text-stone-600 hover:bg-stone-200/50"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === "customers" ? "bg-purple text-white shadow" : "text-stone-600 hover:bg-stone-200/50"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          My Queens
        </button>
      </div>

      {/* ======================= TAB 1: ANALYTICS ======================= */}
      {activeTab === "analytics" && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-purple-mist/20 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Total Sales Volume</p>
                <h3 className="text-xl font-bold font-mono text-[#3B1A63] mt-1">₦{totalSalesRevenue.toLocaleString()}</h3>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">100% Secure payments processed</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-purple-mist/20 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Total Orders Filed</p>
                <h3 className="text-xl font-bold font-mono text-[#3B1A63] mt-1">{orders.length}</h3>
                <span className="text-[10px] text-[#C9A84C] font-semibold mt-1 inline-block">
                  {pendingOrdersCount} pending dispatch queens
                </span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-purple-mist/20 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Active Stock Catalog</p>
                <h3 className="text-xl font-bold font-mono text-[#3B1A63] mt-1">{products.length}</h3>
                <span className="text-[10px] text-purple-light font-semibold mt-1 inline-block">
                  {products.filter(p => p.status === "Available").length} items currently in stock
                </span>
              </div>
              <div className="p-3 bg-purple-mist text-purple rounded-xl">
                <Package className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-purple-mist/20 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Out of Stock Alert</p>
                <h3 className="text-xl font-bold font-mono text-rose-600 mt-1">{outOfStockCount}</h3>
                <span className="text-[10px] text-rose-500 font-semibold mt-1 inline-block">
                  {lowStockItems.length} items with critically low stock
                </span>
              </div>
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick instructions and guide chart list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-purple-mist/20 shadow-sm">
              <h4 className="font-serif text-lg font-bold text-[#3B1A63] mb-4">Critically Low Stock Warning:</h4>
              
              {lowStockItems.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No low stock items. Everything is beautifully backed up, my Queen!</p>
              ) : (
                <div className="divide-y divide-purple-mist/10 space-y-2.5 max-h-60 overflow-y-auto pr-2">
                  {lowStockItems.map((p) => (
                    <div key={p.id} className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-3">
                        <img src={p.image} className="w-9 h-12 rounded object-cover shadow-sm" alt="Small view" />
                        <div>
                          <p className="text-xs font-bold text-stone-900">{p.name}</p>
                          <span className="text-[9px] text-[#8B5CC8] uppercase font-semibold">{p.category}</span>
                        </div>
                      </div>
                      <span className="text-xs bg-amber-50 text-amber-700 font-bold py-1 px-2.5 rounded-lg border border-amber-200">
                        {p.quantityAvailable} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-purple-mist/20 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-lg font-bold text-[#3B1A63] mb-3">Coupons Setup & Guide Lines:</h4>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  Customer promo vouchers are hardcoded inside the cart processor. Educate your customers to apply:
                </p>
                <ul className="space-y-2 text-xs text-stone-600 font-mono">
                  <li>🎁 <strong className="text-purple">QUEEN10</strong> : 10% Off. (Free minimum spend barrier)</li>
                  <li>🌟 <strong className="text-purple">ROYAL20</strong> : 20% Off. (Applies on orders above ₦15,000)</li>
                  <li>💥 <strong className="text-purple">TEEMA50</strong> : 50% Off. (Applies on supreme order values above ₦40,000)</li>
                </ul>
              </div>
              <div className="mt-4 p-3.5 bg-purple-mist/20 border border-purple-mist/10 rounded-xl text-xs text-stone-500">
                ⭐ Kaduna shipping is flat relative to states region distance. Free transit kicks in automatically if items checkout values exceed ₦70,000!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: MANAGE PRODUCTS ======================= */}
      {activeTab === "products" && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Add / Edit Form Block */}
          <div id="admin-product-form" className="bg-white p-6 rounded-3xl border border-purple-mist/20 shadow-sm">
            <h4 className="font-serif text-lg font-bold text-[#3B1A63] mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#C9A84C]" />
              {isEditing ? "Modify Collection Item Data" : "Upload Premium Restocks"}
            </h4>

            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Product Title Name</label>
                  <input
                    required
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Imperial Silk Kimono Wrap"
                    className="w-full mt-1 bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-purple focus:outline-none focus:bg-white transition-all text-stone-900 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Collection Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full mt-1 bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-purple focus:outline-none focus:bg-white text-stone-900 font-semibold"
                    >
                      <option value="Dresses">Dresses</option>
                      <option value="Tops">Tops</option>
                      <option value="Skirts">Skirts</option>
                      <option value="Trousers">Trousers</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Price (₦ Naira Sum)</label>
                    <input
                      required
                      type="number"
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full mt-1 bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-purple focus:outline-none focus:bg-white text-stone-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">In-box Stock Qty</label>
                    <input
                      required
                      type="number"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(Number(e.target.value))}
                      className="w-full mt-1 bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-purple focus:outline-none focus:bg-white text-stone-900 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Item Description Details Summary</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide details about the fit (e.g., handpicked UK silk lining, high elasticity)..."
                    rows={2}
                    className="w-full mt-1 bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-purple focus:outline-none focus:bg-white transition-all resize-none text-stone-600"
                  />
                </div>
              </div>

              {/* Advanced option specs column */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Product Image Link Address</label>
                  <input
                    required
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://imageUrl.jpg..."
                    className="w-full mt-1 bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-purple focus:outline-none focus:bg-white text-stone-900 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Sizes (comma split)</label>
                    <input
                      type="text"
                      value={formSizes}
                      onChange={(e) => setFormSizes(e.target.value)}
                      placeholder="S, M, L"
                      className="w-full mt-1 bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-purple text-stone-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Colors (split)</label>
                    <input
                      type="text"
                      value={formColors}
                      onChange={(e) => setFormColors(e.target.value)}
                      placeholder="White, Bronze"
                      className="w-full mt-1 bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-purple text-stone-900 font-semibold"
                    />
                  </div>
                </div>

                {/* Form Action buttons */}
                <div className="pt-3 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#3B1A63] hover:bg-[#5B2D8E] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all"
                  >
                    {isEditing ? "Save Edits" : "Launch Item"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-3.5 px-4 rounded-xl text-xs uppercase transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Catalog items roster */}
          <div className="bg-white rounded-3xl border border-purple-mist/20 p-6 shadow-sm">
            <h4 className="font-serif text-lg font-bold text-[#3B1A63] mb-5">Current Active Collection Inventory Matrix</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-purple-mist/20 pb-4 text-stone-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Item Detail</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price Value</th>
                    <th className="py-3 px-4">Stock In-box</th>
                    <th className="py-3 px-4">Status Roster</th>
                    <th className="py-3 px-4 text-right">Actions Matrix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-mist/10">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF8FC]/50 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img src={p.image} className="w-10 h-13 object-cover rounded-md shadow-sm bg-stone-100 shrink-0" alt="" />
                        <div>
                          <p className="font-bold text-stone-900 line-clamp-1">{p.name}</p>
                          <span className="text-[10px] text-stone-400 font-mono">ID: {p.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-600 font-sans">{p.category}</td>
                      <td className="py-3 px-4 font-bold font-mono text-purple">₦{p.price.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-stone-600 font-sans">
                        <span className={p.quantityAvailable <= 2 ? "text-amber-600 font-bold" : ""}>
                          {p.quantityAvailable} items
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleProductStatus(p)}
                          className={`font-semibold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs ${
                            p.status === "Available" && p.quantityAvailable > 0
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {p.status === "Available" && p.quantityAvailable > 0 ? "Available" : "Sold Out"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleEditProductClick(p)}
                            className="p-2 text-[#C9A84C] hover:bg-stone-50 rounded-lg transition-colors border border-stone-200 shadow-2xs"
                            title="Edit specifications"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-2 text-rose-500 hover:bg-stone-50 rounded-lg transition-colors border border-stone-200 shadow-2xs"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================= TAB 3: MANAGE ORDERS ======================= */}
      {activeTab === "orders" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-white rounded-3xl border border-purple-mist/20 p-6 shadow-sm">
            <h4 className="font-serif text-lg font-bold text-[#3B1A63] mb-5">Chronological Orders Tracker Log</h4>
            
            {orders.length === 0 ? (
              <div className="text-center py-10 text-stone-400">
                <p className="font-serif italic text-base">No transaction entries found on localhost systems yet.</p>
                <p className="text-[10px] mt-2 font-sans">Customer sales will propagate here automatically.</p>
              </div>
            ) : (
              <div className="divide-y divide-purple-mist/20 space-y-5">
                {orders.map((o) => (
                  <div key={o.id} className="pt-5 first:pt-0 flex flex-col md:flex-row gap-5 items-start justify-between">
                    <div className="space-y-2.5 flex-1">
                      {/* Order Title header row */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-bold text-stone-900 text-sm font-sans">{o.id}</span>
                        <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {o.orderDate}
                        </span>
                        <span className="text-[10px] uppercase font-extrabold bg-[#F0E8FA] text-purple px-2 py-0.5 rounded">
                          {o.deliveryType}
                        </span>
                      </div>

                      {/* Items row details */}
                      <div className="bg-[#FAF8FC] p-3 rounded-2xl border border-purple-mist/15 text-xs">
                        <p className="font-bold text-stone-700 font-serif mb-1">Fulfillment Composition:</p>
                        <ul className="space-y-1 list-disc pl-4 text-stone-600 font-sans">
                          {o.items.map((cartItem, idx) => (
                            <li key={idx}>
                              {cartItem.product.name} (Size: {cartItem.selectedSize}, Color: {cartItem.selectedColor}) x{cartItem.qty} — <strong className="text-purple">₦{cartItem.product.price.toLocaleString()}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Client metadata summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] text-stone-500 font-sans">
                        <p>👤 <strong>Recipient:</strong> {o.customerName}</p>
                        <p>📱 <strong>Contact Phone:</strong> {o.customerPhone}</p>
                        <p>💳 <strong>Gateway Ref:</strong> <span className="font-mono text-[10px] text-purple">{o.paymentRef}</span></p>
                        <p className="sm:col-span-2">📍 <strong>Target Address:</strong> {o.deliveryAddress}</p>
                        {o.deliveryDate && <p>📆 <strong>Target Date:</strong> {o.deliveryDate}</p>}
                        {o.notes && <p className="col-span-1 sm:col-span-2 text-[#7B6A90]">📝 <strong>Notes:</strong> "{o.notes}"</p>}
                      </div>
                    </div>

                    {/* Right side: Status toggle options & Financial overview */}
                    <div className="bg-[#FAF8FC] border border-stone-100 p-4 rounded-2xl w-full md:w-54 shrink-0 flex flex-col justify-between self-stretch">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Total Settled</span>
                        <h4 className="text-base font-bold font-mono text-[#3B1A63] mt-0.5">₦{o.totalAmount.toLocaleString()}</h4>
                      </div>

                      <div className="mt-4">
                        <label className="text-[9px] uppercase font-bold tracking-widest text-[#C9A84C] block mb-1">Dispatch Roster Status</label>
                        <select
                          value={o.status}
                          onChange={(e) => handleOrderStatusChange(o.id, e.target.value as any)}
                          className={`w-full mt-1 border p-2 rounded-xl text-xs font-bold focus:outline-none ${
                            o.status === "Delivered"
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                              : o.status === "Shipped"
                              ? "bg-blue-50 border-blue-300 text-blue-850"
                              : o.status === "Cancelled"
                              ? "bg-stone-100 border-stone-300 text-stone-500"
                              : "bg-amber-50 border-amber-300 text-amber-800"
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ======================= TAB 4: UNIQUE CUSTOMERS ======================= */}
      {activeTab === "customers" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-white rounded-3xl border border-purple-mist/20 p-6 shadow-sm">
            <h4 className="font-serif text-lg font-bold text-[#3B1A63] mb-5">Registered Customer Roster (My Queens Ledger)</h4>
            <p className="text-xs text-stone-500 mb-5 font-sans leading-relaxed">
              Automated listing based on successful cart receipts. Great to lookup premium buyer loyalty accounts!
            </p>

            {customersList.length === 0 ? (
              <p className="text-xs text-stone-400 italic">Pre-payments customer roster is blank. Completed transactions populate client keys automatically.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-purple-mist/20 pb-4 text-stone-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Customer identity</th>
                      <th className="py-3 px-4">Contact Tel</th>
                      <th className="py-3 px-4">Orders Placed</th>
                      <th className="py-3 px-4">Cumulative Spending</th>
                      <th className="py-3 px-4 text-right">Last Transaction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-mist/10 text-stone-700">
                    {customersList.map((c) => (
                      <tr key={c.id} className="hover:bg-[#FAF8FC]/50 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-bold text-stone-900 text-sm">{c.name}</p>
                          <span className="text-stone-400 font-mono text-[10px]">{c.email}</span>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-stone-600">{c.phone}</td>
                        <td className="py-4 px-4 font-bold text-stone-900 font-sans">{c.totalOrders} order(s)</td>
                        <td className="py-4 px-4 font-extrabold font-mono text-purple">₦{c.totalSpent.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right font-semibold text-stone-500 font-sans">{c.lastDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
