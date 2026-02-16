import React from 'react';
import { Search, ShoppingBag, Settings, UserCircle, Coffee, Cake, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product, Category } from '@/types/database';

interface POSTerminalWrapperProps {
    categories: Category[];
    products: Product[];
    onCategorySelect: (categoryId: string | null) => void;
    onProductSelect: (product: Product) => void;
    selectedCategoryId: string | null;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    cartComponent: React.ReactNode;
}

const POSTerminalWrapper: React.FC<POSTerminalWrapperProps> = ({
    categories,
    products,
    onCategorySelect,
    onProductSelect,
    selectedCategoryId,
    searchQuery,
    onSearchChange,
    cartComponent
}) => {
    // Map category icons/slugs to material-like icons (using lucide)
    const getCategoryIcon = (slug: string | null) => {
        switch (slug?.toLowerCase()) {
            case 'boulangerie': return <Utensils size={24} />;
            case 'patisserie': return <Cake size={24} />;
            case 'cafe': return <Coffee size={24} />;
            case 'merch': return <ShoppingBag size={24} />;
            default: return <Utensils size={24} />;
        }
    };

    return (
        <div className="bg-[#0D0D0F] font-['Inter'] h-screen flex overflow-hidden text-[#E5E7EB]">
            {/* Left Column: Navigation Bar */}
            <aside className="w-24 flex flex-col items-center py-8 border-r border-[#cab06d]/10 bg-[#0D0D0F]">
                <div className="mb-12">
                    <span className="font-['Playfair_Display'] italic text-[#cab06d] text-3xl select-none">B</span>
                </div>
                <nav className="flex flex-col gap-8 flex-1 w-full">
                    <button
                        onClick={() => onCategorySelect(null)}
                        className={cn(
                            "flex flex-col items-center gap-1 w-full py-4 transition-colors",
                            !selectedCategoryId ? "bg-[#cab06d]/10 text-[#cab06d] border-right-2 border-[#cab06d]" : "text-[#8E8E93] hover:text-[#cab06d]"
                        )}
                    >
                        <Utensils size={24} />
                        <span className="text-[10px] uppercase tracking-widest font-medium">All</span>
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onCategorySelect(cat.id)}
                            className={cn(
                                "flex flex-col items-center gap-1 w-full py-4 transition-colors",
                                selectedCategoryId === cat.id ? "bg-[#cab06d]/10 text-[#cab06d] border-right-2 border-[#cab06d]" : "text-[#8E8E93] hover:text-[#cab06d]"
                            )}
                        >
                            {getCategoryIcon(cat.icon)}
                            <span className="text-[10px] uppercase tracking-widest font-medium">{cat.name}</span>
                        </button>
                    ))}
                </nav>
                <div className="mt-auto flex flex-col gap-6 text-[#8E8E93]">
                    <button className="hover:text-[#cab06d] transition-colors"><Settings size={20} /></button>
                    <button className="hover:text-[#cab06d] transition-colors"><UserCircle size={20} /></button>
                </div>
            </aside>

            {/* Center Column: Product Grid */}
            <main className="flex-1 flex flex-col bg-[#0D0D0F]/50">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-10 border-b border-[#cab06d]/5">
                    <h1 className="text-xl font-medium tracking-tight">
                        {categories.find(c => c.id === selectedCategoryId)?.name || 'All Items'}
                        <span className="text-[#8E8E93] font-normal text-sm ml-2">/ Morning Selection</span>
                    </h1>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" size={16} />
                        <input
                            className="w-full bg-[#161618] border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[#cab06d]/50 text-[#E5E7EB] placeholder-[#8E8E93]"
                            placeholder="Search item..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </header>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => onProductSelect(product)}
                                className="group relative flex flex-col text-left bg-[#161618] border border-white/5 rounded-xl overflow-hidden transition-all hover:border-[#cab06d]/40 hover:shadow-2xl hover:shadow-[#cab06d]/5"
                            >
                                <div className="aspect-square relative overflow-hidden bg-neutral-900">
                                    <img
                                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                                        src={product.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop'}
                                        alt={product.name}
                                    />
                                </div>
                                <div className="p-5">
                                    <h3 className="text-[#E5E7EB] font-medium text-sm mb-1">{product.name}</h3>
                                    <p className="text-[#cab06d] text-sm font-semibold tracking-wider">Rp {(product.retail_price || 0).toLocaleString()}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            {/* Right Column: Active Order Sidebar (Cart) */}
            {cartComponent}

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #2a2a2c;
            border-radius: 10px;
        }
        .border-right-2 {
            border-right-width: 2px;
        }
      `}} />
        </div>
    );
};

export default POSTerminalWrapper;
