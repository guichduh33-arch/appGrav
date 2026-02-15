import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useCustomers, useCustomerCategories } from '@/hooks/customers'
import { CustomersHeader } from '@/components/customers/CustomersHeader'
import { CustomersStats } from '@/components/customers/CustomersStats'
import { CustomersFilters } from '@/components/customers/CustomersFilters'
import { CustomerCard } from '@/components/customers/CustomerCard'
import { importCustomersFromCsv } from '@/services/customers/csvImportService'

export default function CustomersPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { data: customers = [], isLoading: loading } = useCustomers()
    const { data: categories = [] } = useCustomerCategories(true)

    const handleImportCsv = useCallback(async (file: File) => {
        try {
            toast.info('Importing customers...')
            const result = await importCustomersFromCsv(file)
            queryClient.invalidateQueries({ queryKey: ['customers'] })
            toast.success(`Imported ${result.imported} customers${result.skipped ? `, ${result.skipped} skipped` : ''}`)
            if (result.errors.length > 0) {
                toast.warning(result.errors[0])
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Import failed')
        }
    }, [queryClient])
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [tierFilter, setTierFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const stats = useMemo(() => {
        const active = customers.filter(c => c.is_active)
        const totalSpent = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0)
        const totalPoints = customers.reduce((sum, c) => sum + (c.lifetime_points || 0), 0)
        return {
            totalCustomers: customers.length,
            activeMembers: active.length,
            totalPointsIssued: totalPoints,
            averageSpent: customers.length > 0 ? totalSpent / customers.length : 0,
        }
    }, [customers])

    const filteredCustomers = customers.filter(customer => {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
            customer.name.toLowerCase().includes(searchLower) ||
            customer.company_name?.toLowerCase().includes(searchLower) ||
            customer.phone?.includes(searchTerm) ||
            customer.email?.toLowerCase().includes(searchLower) ||
            customer.membership_number?.toLowerCase().includes(searchLower)
        const matchesCategory = categoryFilter === 'all' || customer.category_id === categoryFilter
        const matchesTier = tierFilter === 'all' || customer.loyalty_tier === tierFilter
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && customer.is_active) ||
            (statusFilter === 'inactive' && !customer.is_active)
        return matchesSearch && matchesCategory && matchesTier && matchesStatus
    })

    const getCountForCategory = (categoryId: string) =>
        customers.filter(c => c.category_id === categoryId).length

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6 max-w-[1600px] mx-auto max-md:p-4">
            <CustomersHeader
                onNavigateCategories={() => navigate('/customers/categories')}
                onNavigateNew={() => navigate('/customers/new')}
                onImportCsv={handleImportCsv}
            />

            <CustomersStats {...stats} />

            <CustomersFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                tierFilter={tierFilter}
                onTierFilterChange={setTierFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                categories={categories}
                customerCount={customers.length}
                getCountForCategory={getCountForCategory}
            />

            {/* Customer List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-[var(--muted-smoke)] gap-4">
                    <div className="spinner" />
                    <span>Loading customers...</span>
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-[var(--onyx-surface)] rounded-xl border border-dashed border-white/10">
                    <Users size={64} className="text-white/10 mb-4" />
                    <h3 className="m-0 mb-2 text-[var(--muted-smoke)] text-lg font-display">No customer found</h3>
                    <p className="m-0 mb-6 text-[var(--theme-text-muted)] text-sm">
                        {searchTerm || categoryFilter !== 'all' || tierFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Start by adding your first customer'}
                    </p>
                    {!searchTerm && categoryFilter === 'all' && (
                        <button
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[var(--color-gold)] text-black"
                            onClick={() => navigate('/customers/new')}
                        >
                            <Plus size={16} />
                            Add a customer
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 max-md:grid-cols-1">
                    {filteredCustomers.map(customer => (
                        <CustomerCard
                            key={customer.id}
                            customer={customer}
                            onView={(id) => navigate(`/customers/${id}`)}
                            onEdit={(id) => navigate(`/customers/${id}/edit`)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
