"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  images: string[];
  inStock: boolean;
  featured: boolean;
  category: Category | null;
};

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    images: "",
    inStock: true,
    featured: false,
    categoryId: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      if (prodData.success) setProducts(prodData.data);
      if (catData.success) setCategories(catData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function openCreate() {
    setEditingProduct(null);
    setFormData({ name: "", description: "", price: "", salePrice: "", images: "", inStock: true, featured: false, categoryId: "" });
    setFormError("");
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: "",
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || "",
      images: product.images.join(", "),
      inStock: product.inStock,
      featured: product.featured,
      categoryId: product.category?.id || "",
    });
    setFormError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        images: formData.images ? formData.images.split(",").map((s) => s.trim()).filter(Boolean) : [],
        inStock: formData.inStock,
        featured: formData.featured,
        categoryId: formData.categoryId || null,
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to save product");
      } else {
        setShowForm(false);
        fetchProducts();
      }
    } catch {
      setFormError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`/api/products/${productId}`, { method: "DELETE" });
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-black font-body">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-xl rounded-full mt-4 mx-4 px-6 py-2 sticky top-0 z-50 flex justify-between items-center w-[calc(100%-2rem)] max-w-5xl md:mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tighter text-white font-headline">Luminous</Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-headline font-bold">
          <Link href="/vendor/dashboard" className="text-neutral-400 hover:text-white px-3 py-1 rounded-full transition-colors">Overview</Link>
          <span className="text-white border-b-2 border-white pb-0.5">Products</span>
          <Link href="/vendor/shop" className="text-neutral-400 hover:text-white px-3 py-1 rounded-full transition-colors">My Shop</Link>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary-container text-on-primary-fixed px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Product
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-10 pb-24">
        <h1 className="text-3xl font-headline font-extrabold text-white mb-8">Products</h1>

        {loading ? (
          <div className="text-center py-20 text-on-surface-variant">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-surface-container rounded-xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">inventory_2</span>
            <h2 className="text-xl font-headline font-bold text-white mb-2">No products yet</h2>
            <p className="text-on-surface-variant text-sm mb-6">Add your first product to start selling</p>
            <button onClick={openCreate} className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold font-headline hover:opacity-90 transition-opacity">
              Add Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant/10 group">
                <div className="aspect-square bg-surface-container-high relative overflow-hidden">
                  {product.images[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">image</span>
                    </div>
                  )}
                  {product.featured && (
                    <div className="absolute top-2 left-2 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Featured</div>
                  )}
                  {!product.inStock && (
                    <div className="absolute top-2 right-2 bg-error/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Out of Stock</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-headline font-bold text-on-surface text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-primary font-bold text-sm">{formatCurrency(product.salePrice || product.price)}</span>
                    {product.salePrice && (
                      <span className="text-on-surface-variant text-xs line-through">{formatCurrency(product.price)}</span>
                    )}
                  </div>
                  {product.category && (
                    <p className="text-on-surface-variant text-xs mb-3">{product.category.name}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="flex-1 bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-bold py-2 rounded-full transition-colors border border-outline-variant/20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 bg-error/10 hover:bg-error/20 text-error text-xs font-bold py-2 rounded-full transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-headline font-bold text-white">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="bg-error/10 border border-error/30 text-error rounded-DEFAULT px-4 py-3 mb-4 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-DEFAULT px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-DEFAULT px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-DEFAULT px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Sale Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData((p) => ({ ...p, salePrice: e.target.value }))}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-DEFAULT px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Image URLs (comma-separated)</label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData((p) => ({ ...p, images: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-DEFAULT px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              {categories.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-DEFAULT px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData((p) => ({ ...p, inStock: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-on-surface-variant">In Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData((p) => ({ ...p, featured: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-on-surface-variant">Featured</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-outline-variant/30 text-on-surface-variant py-3 rounded-full font-bold text-sm hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-primary text-on-primary py-3 rounded-full font-bold text-sm disabled:opacity-50">
                  {saving ? "Saving..." : editingProduct ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto min-w-[280px] rounded-full px-4 py-3 z-50 bg-neutral-900/80 backdrop-blur-2xl shadow-2xl flex justify-around items-center gap-4">
        <Link href="/vendor/dashboard" className="text-neutral-500 p-3 hover:text-white transition-all">
          <span className="material-symbols-outlined">dashboard</span>
        </Link>
        <span className="bg-primary-container/30 text-primary-container rounded-full p-3">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
        </span>
        <Link href="/vendor/shop" className="text-neutral-500 p-3 hover:text-white transition-all">
          <span className="material-symbols-outlined">storefront</span>
        </Link>
        <Link href="/vendor/subscription" className="text-neutral-500 p-3 hover:text-white transition-all">
          <span className="material-symbols-outlined">workspace_premium</span>
        </Link>
      </nav>
    </div>
  );
}
