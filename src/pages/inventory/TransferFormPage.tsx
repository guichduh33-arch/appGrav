import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Send, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import { useSectionsByType, useCreateTransfer, useTransfer } from '@/hooks/inventory'
import { useProducts } from '@/hooks/products'
import { useNetworkStatus } from '@/hooks/offline/useNetworkStatus'
import { logError } from '@/utils/logger'
import { TransferFormItems } from './transfer-form/TransferFormItems'

interface TransferItemForm {
  id?: string
  product_id: string
  product_name: string
  quantity_requested: number
  unit: string
  unit_cost: number
  line_total: number
}

export default function TransferFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { isOnline } = useNetworkStatus()
  const isEditing = Boolean(id)

  // Hooks for data
  const { warehouses, productionSections, salesSections } = useSectionsByType()
  const { data: products = [] } = useProducts()
  const { data: existingTransfer } = useTransfer(id ?? null)
  const createTransferMutation = useCreateTransfer()

  // Combine production and sales sections as destination options
  const destinationSections = [...productionSections, ...salesSections]

  // Track if initial mount check has been done
  const hasCheckedInitialOnlineStatus = useRef(false)

  // Form state - using section IDs for the new section-based model
  const [fromSectionId, setFromSectionId] = useState('')
  const [toSectionId, setToSectionId] = useState('')
  const [responsiblePerson, setResponsiblePerson] = useState('')
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<TransferItemForm[]>([])

  // Redirect if offline on initial load only
  useEffect(() => {
    if (!hasCheckedInitialOnlineStatus.current) {
      hasCheckedInitialOnlineStatus.current = true
      if (!isOnline) {
        toast.error('Transfers are not available offline')
        navigate('/inventory/transfers')
      }
    }
  }, [isOnline, navigate])

  // Load existing transfer data
  useEffect(() => {
    if (existingTransfer && isEditing) {
      setFromSectionId(existingTransfer.from_section_id || '')
      setToSectionId(existingTransfer.to_section_id || '')
      setResponsiblePerson(existingTransfer.responsible_person || '')
      setTransferDate(existingTransfer.transfer_date || new Date().toISOString().split('T')[0])
      setNotes(existingTransfer.notes || '')

      if (existingTransfer.items) {
        setItems(existingTransfer.items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product?.name || '',
          quantity_requested: item.quantity_requested,
          unit: 'unit',
          unit_cost: item.product?.cost_price || 0,
          line_total: item.quantity_requested * (item.product?.cost_price || 0)
        })))
      }
    }
  }, [existingTransfer, isEditing])

  const addItem = () => {
    setItems([...items, {
      product_id: '',
      product_name: '',
      quantity_requested: 1,
      unit: 'unit',
      unit_cost: 0,
      line_total: 0
    }])
  }

  const updateItem = (index: number, field: keyof TransferItemForm, value: string | number | null) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    if (field === 'product_id') {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index].product_name = product.name
        newItems[index].unit = product.unit || 'unit'
        newItems[index].unit_cost = product.cost_price || 0
        newItems[index].line_total = newItems[index].quantity_requested * (product.cost_price || 0)
      }
    }

    if (field === 'quantity_requested' || field === 'unit_cost') {
      newItems[index].line_total = newItems[index].quantity_requested * newItems[index].unit_cost
    }

    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const getTotalValue = () => {
    return items.reduce((sum, item) => sum + item.line_total, 0)
  }

  const handleSubmit = async (sendDirectly: boolean = false) => {
    if (!isOnline) {
      toast.error('Transfers are not available offline')
      return
    }

    if (!fromSectionId || !toSectionId) {
      toast.error('Please select source and destination locations')
      return
    }

    if (fromSectionId === toSectionId) {
      toast.error('Source and destination must be different')
      return
    }

    if (!responsiblePerson.trim()) {
      toast.error('Responsible person is required')
      return
    }

    if (items.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    if (items.some(item => !item.product_id || item.quantity_requested <= 0)) {
      toast.error('Please fill in all item details')
      return
    }

    try {
      await createTransferMutation.mutateAsync({
        fromSectionId,
        toSectionId,
        responsiblePerson: responsiblePerson.trim(),
        transferDate,
        notes: notes.trim() || undefined,
        sendDirectly,
        items: items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity_requested
        }))
      })

      toast.success('Transfer created successfully')
      navigate('/inventory/transfers')
    } catch (error) {
      logError('Error saving transfer:', error)
      toast.error(error instanceof Error ? error.message : 'Error loading transfers')
    }
  }

  const isSubmitting = createTransferMutation.isPending
  const canSave = isOnline && !isSubmitting

  const inputClass = 'w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed'
  const labelClass = 'block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2'

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Offline warning banner */}
      {!isOnline && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm font-medium">
          <WifiOff size={18} />
          <span>Connection lost. Please reconnect to save changes.</span>
        </div>
      )}

      <header className="mb-6 flex items-center gap-4">
        <button
          className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--theme-text-secondary)] bg-transparent border border-white/10 rounded-lg hover:border-white/20 hover:text-white transition-all"
          onClick={() => navigate('/inventory/transfers')}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="mb-0.5 text-2xl font-bold text-white">
            {isEditing ? 'Edit Transfer' : 'New Transfer'}
          </h1>
          <p className="text-sm text-[var(--theme-text-muted)]">
            Manage transfers between warehouse and sections
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {/* General Info */}
        <div className="rounded-xl border border-white/5 bg-[var(--onyx-surface)] p-5">
          <h2 className="mb-4 text-base font-bold text-white">Settings</h2>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div>
              <label className={labelClass}>From *</label>
              <select className={inputClass} value={fromSectionId} onChange={(e) => setFromSectionId(e.target.value)} disabled={!isOnline}>
                <option value="">Select location</option>
                {warehouses.map(section => (
                  <option key={section.id} value={section.id}>{section.icon} {section.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>To *</label>
              <select className={inputClass} value={toSectionId} onChange={(e) => setToSectionId(e.target.value)} disabled={!isOnline}>
                <option value="">Select location</option>
                {destinationSections.map(section => (
                  <option key={section.id} value={section.id}>{section.icon} {section.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Responsible *</label>
              <input type="text" className={inputClass} value={responsiblePerson} onChange={(e) => setResponsiblePerson(e.target.value)} placeholder="Responsible person" disabled={!isOnline} />
            </div>
            <div>
              <label className={labelClass}>Date *</label>
              <input type="date" className={inputClass} value={transferDate} onChange={(e) => setTransferDate(e.target.value)} disabled={!isOnline} />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Notes</label>
            <textarea className={inputClass + ' resize-y'} value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Additional notes..." disabled={!isOnline} />
          </div>
        </div>

        {/* Items */}
        <TransferFormItems
          items={items}
          products={products}
          isOnline={isOnline}
          onAddItem={addItem}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
          totalValue={getTotalValue()}
        />

        {/* Actions */}
        <div className="flex justify-between border-t border-white/5 pt-5 max-md:flex-col max-md:gap-3">
          <button
            className="px-5 py-2.5 bg-transparent border border-white/10 text-white text-sm font-medium rounded-xl hover:border-white/20 transition-all"
            onClick={() => navigate('/inventory/transfers')}
          >
            Cancel
          </button>
          <div className="flex gap-3 max-md:flex-col">
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-white/10 text-white text-sm font-medium rounded-xl hover:border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => handleSubmit(false)}
              disabled={!canSave}
              title={!isOnline ? 'Connection lost. Please reconnect to save changes.' : undefined}
            >
              <Save size={16} />
              Save as Draft
            </button>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gold)] text-black font-bold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => handleSubmit(true)}
              disabled={!canSave}
              title={!isOnline ? 'Connection lost. Please reconnect to save changes.' : undefined}
            >
              <Send size={16} />
              {isSubmitting ? 'Saving...' : 'Save & Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
