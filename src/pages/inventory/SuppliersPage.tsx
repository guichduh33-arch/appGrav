import { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, Phone, Mail, MapPin, User, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Supplier } from '../../types/database';
import './InventoryPage.css'; // Reuse inventory styles

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setSuppliers(data || []);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setName(supplier.name);
        setContact(supplier.contact_person || '');
        setEmail(supplier.email || '');
        setPhone(supplier.phone || '');
        setAddress(supplier.address || '');
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingSupplier(null);
        setName('');
        setContact('');
        setEmail('');
        setPhone('');
        setAddress('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const supplierData = {
                name,
                contact_person: contact,
                email,
                phone,
                address
            };

            if (editingSupplier) {
                const { error } = await (supabase
                    .from('suppliers') as any)
                    .update(supplierData)
                    .eq('id', editingSupplier.id);
                if (error) throw error;
            } else {
                const { error } = await (supabase
                    .from('suppliers') as any)
                    .insert(supplierData);
                if (error) throw error;
            }

            fetchSuppliers();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving supplier:', error);
            alert('Failed to save supplier');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;

        try {
            const { error } = await (supabase
                .from('suppliers') as any)
                .update({ is_active: false })
                .eq('id', id);

            if (error) throw error;
            fetchSuppliers();
        } catch (error) {
            console.error('Error deleting supplier:', error);
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="inventory-page">
            <header className="inventory-header">
                <div className="inventory-title">
                    <h1>Suppliers</h1>
                    <p>Manage your product suppliers</p>
                </div>
                <button
                    className="btn-primary flex items-center gap-2"
                    onClick={handleAddNew}
                    aria-label="Add new supplier"
                    title="Add new supplier"
                >
                    <Plus size={20} />
                    Add Supplier
                </button>
            </header>

            <main className="inventory-content">
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            aria-label="Search suppliers"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSuppliers.map((supplier) => (
                            <div key={supplier.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(supplier)}
                                            className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                                            aria-label={`Edit ${supplier.name}`}
                                            title="Edit"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(supplier.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                                            aria-label={`Delete ${supplier.name}`}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm text-gray-600">
                                    {supplier.contact_person && (
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-gray-400" />
                                            <span>{supplier.contact_person}</span>
                                        </div>
                                    )}
                                    {supplier.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} className="text-gray-400" />
                                            <span>{supplier.phone}</span>
                                        </div>
                                    )}
                                    {supplier.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} className="text-gray-400" />
                                            <span>{supplier.email}</span>
                                        </div>
                                    )}
                                    {supplier.address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            <span className="line-clamp-1">{supplier.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredSuppliers.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                No suppliers found. Click "Add Supplier" to create one.
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-scale-in">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="Close modal"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="supplier-name">Company Name *</label>
                                <input
                                    id="supplier-name"
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Enter company name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="supplier-contact">Contact Person</label>
                                <input
                                    id="supplier-contact"
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={contact}
                                    onChange={e => setContact(e.target.value)}
                                    placeholder="Enter contact person name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="supplier-email">Email</label>
                                    <input
                                        id="supplier-email"
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="supplier-phone">Phone</label>
                                    <input
                                        id="supplier-phone"
                                        type="tel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="supplier-address">Address</label>
                                <textarea
                                    id="supplier-address"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    placeholder="Enter full address"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 bg-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
