import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit3, AlertTriangle,
  Search, X, Package, Tractor, Droplets, Sprout, ShoppingCart, Leaf
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

/* ── Types ── */
interface InventoryItem {
  id: string;
  category: "Fertilizer" | "Machinery" | "Seeds" | "Pesticides" | "Fuel";
  name: string;
  quantity: number;
  unit: string;
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Maintenance";
  dateAdded: string;
}

const CATEGORY_CONFIG = {
  Fertilizer: { icon: Leaf, minCount: 10 },
  Machinery: { icon: Tractor, minCount: 1 },
  Seeds: { icon: Sprout, minCount: 50 },
  Pesticides: { icon: Droplets, minCount: 5 },
  Fuel: { icon: ShoppingCart, minCount: 20 },
};

const STATUS_COLORS = {
  "In Stock": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Low Stock": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Out of Stock": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "Maintenance": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const STORAGE_KEY = "DesiCane-inventory";

function loadInventory(): InventoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { }
  // Default seed data
  return [
    { id: "1", category: "Fertilizer", name: "Urea (Nitrogen)", quantity: 45, unit: "Bags (50kg)", status: "In Stock", dateAdded: "2025-03-10" },
    { id: "2", category: "Fertilizer", name: "DAP", quantity: 8, unit: "Bags (50kg)", status: "Low Stock", dateAdded: "2025-06-15" },
    { id: "3", category: "Machinery", name: "Mahindra Tractor", quantity: 1, unit: "Unit", status: "In Stock", dateAdded: "2024-12-01" },
    { id: "4", category: "Machinery", name: "Drip Irrigation Lines", quantity: 500, unit: "Meters", status: "Maintenance", dateAdded: "2026-01-20" },
    { id: "5", category: "Seeds", name: "Co 86032 Setts", quantity: 120, unit: "Quintals", status: "In Stock", dateAdded: "2026-04-05" },
    { id: "6", category: "Pesticides", name: "Chlorpyrifos", quantity: 2, unit: "Liters", status: "Low Stock", dateAdded: "2026-06-10" },
    { id: "7", category: "Fuel", name: "Diesel", quantity: 0, unit: "Liters", status: "Out of Stock", dateAdded: "2026-05-20" },
  ];
}

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>(loadInventory);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form state
  const [formCategory, setFormCategory] = useState<InventoryItem["category"]>("Fertilizer");
  const [formName, setFormName] = useState("");
  const [formQuantity, setFormQuantity] = useState(0);
  const [formUnit, setFormUnit] = useState("Bags");
  const [formStatus, setFormStatus] = useState<InventoryItem["status"]>("In Stock");

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Fertilizer: 0, Machinery: 0, Seeds: 0, Pesticides: 0, Fuel: 0 };
    items.forEach((a) => { counts[a.category] = (counts[a.category] || 0) + 1; });
    return counts;
  }, [items]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = items;
    if (filterCategory !== "All") list = list.filter((a) => a.category === filterCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
    }
    return list;
  }, [items, filterCategory, searchQuery]);

  const restockAlerts = useMemo(() => {
    const alerts: string[] = [];
    const lowStock = items.filter(i => i.status === "Low Stock" || i.status === "Out of Stock");
    if (lowStock.length > 0) {
      alerts.push(`🚨 ${lowStock.length} item(s) are low or out of stock.`);
    }
    const maintenance = items.filter(i => i.status === "Maintenance");
    if (maintenance.length > 0) {
      alerts.push(`🔧 ${maintenance.length} machinery item(s) need maintenance.`);
    }
    return alerts;
  }, [items]);

  const resetForm = () => {
    setFormCategory("Fertilizer");
    setFormName("");
    setFormQuantity(0);
    setFormUnit("Bags");
    setFormStatus("In Stock");
    setEditingItem(null);
  };

  const handleSubmit = () => {
    if (!formName.trim()) return;
    if (editingItem) {
      setItems((prev) => prev.map((a) =>
        a.id === editingItem.id
          ? { ...a, category: formCategory, name: formName, quantity: formQuantity, unit: formUnit, status: formStatus }
          : a
      ));
    } else {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        category: formCategory,
        name: formName,
        quantity: formQuantity,
        unit: formUnit,
        status: formStatus,
        dateAdded: new Date().toISOString().split("T")[0],
      };
      setItems((prev) => [...prev, newItem]);
    }
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormName(item.name);
    setFormQuantity(item.quantity);
    setFormUnit(item.unit);
    setFormStatus(item.status);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="page-container bg-neutral-50 dark:bg-neutral-950 min-h-screen transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#f5f5dc]/40 dark:bg-neutral-900 py-16 px-4">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-[1200px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-black/5 dark:bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-neutral-200 dark:border-white/10">
                  <Package size={24} className="text-neutral-900 dark:text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  Inventory Management
                </h1>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl">
                Track fertilizers, seeds, machinery, and other farming supplies for your sugarcane plots.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6">
          {/* Alerts */}
          {restockAlerts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              {restockAlerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-sm text-amber-800 dark:text-amber-300">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  {alert}
                </div>
              ))}
            </motion.div>
          )}

          {/* Category Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(CATEGORY_CONFIG).map(([type, config], i) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setFilterCategory(filterCategory === type ? "All" : type)}
                className={`cursor-pointer p-5 rounded-2xl border shadow-lg transition-all duration-300 hover:-translate-y-1 ${filterCategory === type
                  ? "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700 ring-2 ring-green-400"
                  : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800"
                  }`}
              >
                <config.icon size={28} className="text-neutral-600 dark:text-neutral-300 mb-2" />
                <p className="text-2xl font-black text-neutral-900 dark:text-white mt-2">{categoryCounts[type]}</p>
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{type}</p>
              </motion.div>
            ))}
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-green-600/20"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>

          {/* Inventory Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-md p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      {item.category === "Fertilizer" && <Leaf size={20} className="text-green-500" />}
                      {item.category === "Machinery" && <Tractor size={20} className="text-blue-500" />}
                      {item.category === "Seeds" && <Sprout size={20} className="text-emerald-500" />}
                      {item.category === "Pesticides" && <Droplets size={20} className="text-amber-500" />}
                      {item.category === "Fuel" && <ShoppingCart size={20} className="text-purple-500" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 dark:text-white text-sm">{item.name}</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.category}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[item.status]}`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{item.quantity}</span>
                  <span className="text-sm text-neutral-500 font-semibold">{item.unit}</span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button onClick={() => handleEdit(item)} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-semibold">
                    <Edit3 size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-semibold">
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-neutral-400 dark:text-neutral-500">
              <Package size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">No inventory items found.</p>
            </div>
          )}
        </div>
      </main>

      {/* ── Add/Edit Modal ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => { setShowForm(false); resetForm(); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {editingItem ? "Edit Item" : "Add New Item"}
                </h2>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                  <X size={18} className="text-neutral-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">Category</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as any)} className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400">
                    {Object.keys(CATEGORY_CONFIG).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">Item Name</label>
                  <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Urea, Tractor" className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">Quantity</label>
                    <input type="number" value={formQuantity} onChange={(e) => setFormQuantity(Number(e.target.value))} className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">Unit</label>
                    <input type="text" value={formUnit} onChange={(e) => setFormUnit(e.target.value)} placeholder="e.g. Bags, Liters" className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">Status</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)} className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400">
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors shadow-lg shadow-green-600/20"
                >
                  {editingItem ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
