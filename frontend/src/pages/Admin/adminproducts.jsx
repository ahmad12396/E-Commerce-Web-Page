import { useState, useEffect } from "react";
import AdminLayout from "../../components/adminlayout";
import { authFetch } from "../../utils/auth";

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: "", 
        price: "", 
        category: "", 
        stock: 0, 
        description: ""
    });
    const [imageFile, setImageFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const DJANGO_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";

    const getFullImageUrl = (path) => {
        if (!path) return "/placeholder.png";
        if (path.startsWith("http")) return path;
        return `${DJANGO_URL}${path}`;
    };

    const fetchData = async () => {
        try {
            const res = await fetch(`${DJANGO_URL}/api/products/`); 
            const data = await res.json();
            if (res.ok) {
                setProducts(Array.isArray(data) ? data : (data.results || []));
            }

            const catRes = await authFetch(`${DJANGO_URL}/api/admin/categories/`);
            if (catRes.ok) {
                const catData = await catRes.json();
                setCategories(Array.isArray(catData) ? catData : (catData.results || []));
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("price", formData.price);
        data.append("category", formData.category); 
        // Sync with your Django model field name 'stock'
        data.append("stock", parseInt(formData.stock) || 0); 
        data.append("description", formData.description || "New product description.");
        
        if (imageFile instanceof File) {
            data.append("image", imageFile);
        }

        const url = editId 
            ? `${DJANGO_URL}/api/admin/products/edit/${editId}/` 
            : `${DJANGO_URL}/api/admin/products/add/`;
        
        try {
            const res = await authFetch(url, {
                method: editId ? "PATCH" : "POST", 
                body: data
            });

            if (res.ok) {
                setShowModal(false);
                resetForm();
                await fetchData();
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } else {
                const errorData = await res.json();
                alert("Validation Error: " + JSON.stringify(errorData));
            }
        } catch (err) { 
            alert("Network error. Ensure Django is running.");
        } finally {
            setIsSaving(false);
        }
    };

    const openEdit = (product) => {
        setEditId(product.id);
        setFormData({
            name: product.name,
            price: product.price,
            // Grab ID even if category is returned as an object
            category: product.category?.id || product.category || "", 
            stock: product.stock || 0,
            description: product.description || ""
        });
        setImageFile(null);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ name: "", price: "", category: "", stock: 0, description: "" });
        setImageFile(null);
        setEditId(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently delete this product?")) return;
        try {
            const res = await authFetch(`${DJANGO_URL}/api/admin/products/delete/${id}/`, { method: "DELETE" });
            if (res.ok) fetchData();
        } catch (err) {
            alert("Delete failed.");
        }
    };

    if (loading) return <AdminLayout><div className="p-10 font-bold animate-pulse">Loading Inventory...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-black text-gray-900">Inventory</h1>
                <button 
                    onClick={() => { resetForm(); setShowModal(true); }} 
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                >
                    + Add Product
                </button>
            </div>

            {showToast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold">
                    Successfully Updated!
                </div>
            )}

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <tr>
                            <th className="px-8 py-4">Image</th>
                            <th className="px-8 py-4">Name</th>
                            <th className="px-8 py-4">Price</th>
                            <th className="px-8 py-4">Stock</th>
                            <th className="px-8 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-4">
                                    <img src={getFullImageUrl(p.image)} alt="" className="w-14 h-14 object-cover rounded-xl bg-gray-100" />
                                </td>
                                <td className="px-8 py-4 font-bold text-gray-900">{p.name}</td>
                                <td className="px-8 py-4 font-black text-blue-600">${p.price}</td>
                                <td className="px-8 py-4 font-medium text-gray-500">{p.stock} units</td>
                                <td className="px-8 py-4">
                                    <div className="flex gap-4">
                                        <button onClick={() => openEdit(p)} className="text-blue-600 font-bold hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(p.id)} className="text-red-500 font-bold hover:underline">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-black mb-6 text-gray-900">{editId ? "Update" : "Create"} Product</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase text-gray-400 ml-2">Product Name</label>
                                <input type="text" required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 ml-2">Price ($)</label>
                                    <input type="number" step="0.01" required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 ml-2">Stock Level</label>
                                    <input type="number" required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase text-gray-400 ml-2">Category</label>
                                <select required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                                    <option value="">Choose Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase text-gray-400 ml-2">Description</label>
                                <textarea rows="3" required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase text-gray-400 ml-2">Product Image</label>
                                <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 mt-1">
                                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" disabled={isSaving} className="flex-1 bg-black text-white p-4 rounded-2xl font-black hover:bg-gray-800 disabled:bg-gray-400 transition-colors">
                                    {isSaving ? "Saving..." : "Save Product"}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-4 bg-gray-100 rounded-2xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default AdminProducts;