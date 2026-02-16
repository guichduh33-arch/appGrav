import React, { useState } from 'react';
import { CreditCard, Banknote, Gift, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/stores/cartStore';

interface POSCheckoutWrapperProps {
    cartItems: CartItem[];
    subtotal: number;
    total: number;
    tax: number;
    onComplete: (paymentMethod: string, amount: number) => void;
    onCancel: () => void;
}

const POSCheckoutWrapper: React.FC<POSCheckoutWrapperProps> = ({
    cartItems,
    subtotal,
    total,
    tax,
    onComplete,
    onCancel
}) => {
    const [selectedMethod, setSelectedMethod] = useState<'card' | 'cash' | 'gift'>('cash');
    const [entryAmount, setEntryAmount] = useState<string>(total.toString());

    const handleNumpad = (val: string) => {
        if (val === 'clear') {
            setEntryAmount('0');
        } else if (val === 'del') {
            setEntryAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
        } else {
            setEntryAmount(prev => prev === '0' ? val : prev + val);
        }
    };

    return (
        <div className="bg-[#0D0D0F] text-[#E5E7EB] font-['Inter'] min-h-screen flex flex-col fixed inset-0 z-50">
            {/* Header / Navigation Bar */}
            <header className="h-16 border-b border-[#c8a45b]/20 flex items-center justify-between px-8 bg-[#1A1A1C]/50">
                <div className="flex items-center gap-4">
                    <span className="text-[#c8a45b] tracking-widest uppercase font-semibold text-lg">The Breakery</span>
                    <div className="h-4 w-px bg-[#c8a45b]/30"></div>
                    <span className="text-[#E5E7EB]/60 text-sm">Station 04 • Terminal 12</span>
                </div>
                <button onClick={onCancel} className="text-[#E5E7EB]/60 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Column: Order Summary */}
                <section className="w-[450px] border-r border-[#c8a45b]/20 flex flex-col bg-[#1A1A1C]/20">
                    <div className="p-6 border-b border-[#c8a45b]/10">
                        <h2 className="text-xs uppercase tracking-[0.2em] text-[#c8a45b]/80 font-bold">Current Order</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-widest text-[#E5E7EB]/40 border-b border-[#c8a45b]/10">
                                    <th className="pb-3 font-semibold">Item</th>
                                    <th className="pb-3 font-semibold text-center w-12">Qty</th>
                                    <th className="pb-3 font-semibold text-right w-24">Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#c8a45b]/5">
                                {cartItems.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="py-4">
                                            <p className="text-[#E5E7EB] font-medium">{item.product?.name || 'Product'}</p>
                                            {item.selectedVariants && item.selectedVariants.length > 0 && <p className="text-[10px] text-[#E5E7EB]/40">{item.selectedVariants[0].optionLabels.join(', ')}</p>}
                                        </td>
                                        <td className="py-4 text-center">{item.quantity}</td>
                                        <td className="py-4 text-right">Rp {(item.unitPrice * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Totals Section */}
                    <div className="p-8 bg-[#1A1A1C] border-t border-[#c8a45b]/20 space-y-3">
                        <div className="flex justify-between text-sm text-[#E5E7EB]/60">
                            <span>Subtotal</span>
                            <span>Rp {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-[#E5E7EB]/60">
                            <span>Tax (10%)</span>
                            <span>Rp {tax.toLocaleString()}</span>
                        </div>
                        <div className="pt-4 flex justify-between items-baseline">
                            <span className="text-xs uppercase tracking-widest font-bold text-[#c8a45b]">Total Amount</span>
                            <span className="text-4xl font-light text-[#c8a45b] tracking-tight">Rp {total.toLocaleString()}</span>
                        </div>
                    </div>
                </section>

                {/* Right Column: Payment Methods & Keypad */}
                <section className="flex-1 flex flex-col p-8 bg-[#0D0D0F]">
                    <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
                        <h2 className="text-xs uppercase tracking-[0.2em] text-[#c8a45b]/80 font-bold mb-6">Select Payment Method</h2>

                        {/* Payment Tiles */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <button
                                onClick={() => setSelectedMethod('card')}
                                className={cn(
                                    "h-32 border flex flex-col items-center justify-center transition-all group",
                                    selectedMethod === 'card' ? "border-[#c8a45b] bg-[#c8a45b]/10 ring-1 ring-[#c8a45b]/50" : "border-[#c8a45b]/20 bg-[#1A1A1C] hover:border-[#c8a45b]"
                                )}
                            >
                                <CreditCard size={24} className={cn("mb-2", selectedMethod === 'card' ? "text-[#c8a45b]" : "text-[#E5E7EB]/40")} />
                                <span className={cn("text-xs font-semibold tracking-widest uppercase", selectedMethod === 'card' ? "text-[#c8a45b]" : "text-[#E5E7EB]/60")}>Credit Card</span>
                            </button>
                            <button
                                onClick={() => setSelectedMethod('cash')}
                                className={cn(
                                    "h-32 border flex flex-col items-center justify-center transition-all group",
                                    selectedMethod === 'cash' ? "border-[#c8a45b] bg-[#c8a45b]/10 ring-1 ring-[#c8a45b]/50" : "border-[#c8a45b]/20 bg-[#1A1A1C] hover:border-[#c8a45b]"
                                )}
                            >
                                <Banknote size={24} className={cn("mb-2", selectedMethod === 'cash' ? "text-[#c8a45b]" : "text-[#E5E7EB]/40")} />
                                <span className={cn("text-xs font-semibold tracking-widest uppercase", selectedMethod === 'cash' ? "text-[#c8a45b]" : "text-[#E5E7EB]/60")}>Cash</span>
                            </button>
                            <button
                                onClick={() => setSelectedMethod('gift')}
                                className={cn(
                                    "h-32 border flex flex-col items-center justify-center transition-all group",
                                    selectedMethod === 'gift' ? "border-[#c8a45b] bg-[#c8a45b]/10 ring-1 ring-[#c8a45b]/50" : "border-[#c8a45b]/20 bg-[#1A1A1C] hover:border-[#c8a45b]"
                                )}
                            >
                                <Gift size={24} className={cn("mb-2", selectedMethod === 'gift' ? "text-[#c8a45b]" : "text-[#E5E7EB]/40")} />
                                <span className={cn("text-xs font-semibold tracking-widest uppercase", selectedMethod === 'gift' ? "text-[#c8a45b]" : "text-[#E5E7EB]/60")}>Gift Card</span>
                            </button>
                        </div>

                        {/* Center Focus: Keypad & Input */}
                        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                            <div className="w-full max-w-md">
                                <div className="text-center mb-4">
                                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#E5E7EB]/40">Enter Amount</span>
                                </div>
                                <div className="bg-[#1A1A1C]/50 border border-[#c8a45b]/20 rounded-xl p-6 text-center mb-8">
                                    <span className="text-5xl font-light tracking-tight text-[#E5E7EB]">Rp {parseFloat(entryAmount || '0').toLocaleString()}</span>
                                </div>
                                {/* Numeric Keypad */}
                                <div className="grid grid-cols-3 gap-px bg-[#c8a45b]/10 border border-[#c8a45b]/10 rounded-xl overflow-hidden shadow-2xl shadow-[#c8a45b]/5">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                        <button key={num} onClick={() => handleNumpad(num.toString())} className="bg-[#1A1A1C] h-20 text-2xl font-light hover:bg-[#c8a45b] hover:text-[#0D0D0F] transition-colors">{num}</button>
                                    ))}
                                    <button onClick={() => handleNumpad('clear')} className="bg-[#1A1A1C]/80 h-20 text-xs font-bold uppercase tracking-widest text-[#c8a45b] hover:bg-[#c8a45b] hover:text-[#0D0D0F] transition-colors">Clear</button>
                                    <button onClick={() => handleNumpad('0')} className="bg-[#1A1A1C] h-20 text-2xl font-light hover:bg-[#c8a45b] hover:text-[#0D0D0F] transition-colors">0</button>
                                    <button onClick={() => handleNumpad('del')} className="bg-[#1A1A1C]/80 h-20 text-xs font-bold uppercase tracking-widest text-[#c8a45b] hover:bg-[#c8a45b] hover:text-[#0D0D0F] transition-colors">Del</button>
                                </div>
                            </div>
                        </div>

                        {/* Primary Action Button */}
                        <div className="mt-auto pt-8">
                            <div className="flex gap-4 mb-4">
                                <button className="flex-1 border border-[#c8a45b]/20 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#c8a45b]/5 transition-colors">Split Bill</button>
                                <button className="flex-1 border border-[#c8a45b]/20 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#c8a45b]/5 transition-colors">Apply Discount</button>
                            </div>
                            <button
                                onClick={() => onComplete(selectedMethod, parseFloat(entryAmount))}
                                className="w-full bg-[#c8a45b] hover:bg-[#c8a45b]/90 text-[#0D0D0F] py-6 rounded-lg text-sm font-bold uppercase tracking-[0.25em] transition-all shadow-lg shadow-[#c8a45b]/20"
                            >
                                Process Payment
                            </button>
                        </div>
                    </div>
                </section>
            </main>

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
      `}} />
        </div>
    );
};

export default POSCheckoutWrapper;
