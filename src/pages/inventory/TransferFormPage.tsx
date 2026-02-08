import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Save, Trash2, Send, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import { useSectionsByType, useCreateTransfer, useTransfer } from '@/hooks/inventory'
import { useProducts } from '@/hooks/products'
import { useNetworkStatus } from '@/hooks/offline/useNetworkStatus'
import './TransferFormPage.css'

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
      // Support both old location-based and new section-based transfers
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
    // Check online status
    if (!isOnline) {
      toast.error('Transfers are not available offline')
      return
    }

    // Validation
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
      console.error('Error saving transfer:', error)
      toast.error(error instanceof Error ? error.message : 'Error loading transfers')
    }
  }

  const isSubmitting = createTransferMutation.isPending
  const canSave = isOnline && !isSubmitting

  return (
    <div className="transfer-form-page">
      {/* Offline warning banner */}
      {!isOnline && (
        <div className="offline-warning-banner" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#b91c1c'
        }}>
          <WifiOff size={18} />
          <span>Connection lost. Please reconnect to save changes.</span>
        </div>
      )}

      <header className="transfer-form-header">
        <button className="btn btn-ghost" onClick={() => navigate('/inventory/transfers')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="transfer-form-title">
            {isEditing ? 'Edit Transfer' : 'New Transfer'}
          </h1>
          <p className="transfer-form-subtitle">
            Manage transfers between warehouse and sections
          </p>
        </div>
      </header>

      <div className="transfer-form-container">
        {/* General Info */}
        <div className="transfer-form-section">
          <h2>Settings</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>From *</label>
              <select
                value={fromSectionId}
                onChange={(e) => setFromSectionId(e.target.value)}
                disabled={!isOnline}
              >
                <option value="">Select location</option>
                {warehouses.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.icon} {section.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>To *</label>
              <select
                value={toSectionId}
                onChange={(e) => setToSectionId(e.target.value)}
                disabled={!isOnline}
              >
                <option value="">Select location</option>
                {destinationSections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.icon} {section.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Responsible *</label>
              <input
                type="text"
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                placeholder="Responsible person"
                disabled={!isOnline}
              />
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                disabled={!isOnline}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes..."
              disabled={!isOnline}
            />
          </div>
        </div>

        {/* Items */}
        <div className="transfer-form-section">
          <div className="section-header">
            <h2>Items</h2>
            <button
              className="btn btn-secondary btn-sm"
              onClick={addItem}
              disabled={!isOnline}
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="no-items">
              <p>No items added yet</p>
            </div>
          ) : (
            <div className="items-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ width: '120px' }}>Quantity</th>
                    <th style={{ width: '80px' }}>Unit</th>
                    <th style={{ width: '120px' }}>Unit Cost</th>
                    <th style={{ width: '120px' }}>Line Total</th>
                    <th style={{ width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <select
                          value={item.product_id}
                          onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                          disabled={!isOnline}
                        >
                          <option value="">Select product</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.sku && `(${p.sku})`}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity_requested}
                          onChange={(e) => updateItem(index, 'quantity_requested', Number(e.target.value))}
                          disabled={!isOnline}
                        />
                      </td>
                      <td>
                        <span className="unit-display">{item.unit || '-'}</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_cost}
                          onChange={(e) => updateItem(index, 'unit_cost', Number(e.target.value))}
                          disabled={!isOnline}
                        />
                      </td>
                      <td className="total-cell">Rp{item.line_total.toLocaleString('id-ID')}</td>
                      <td>
                        <button
                          className="btn-icon btn-icon--danger"
                          onClick={() => removeItem(index)}
                          disabled={!isOnline}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {items.length > 0 && (
            <div className="transfer-summary">
              <div className="summary-row">
                <span className="summary-label">Total Items:</span>
                <span className="summary-value">{items.length}</span>
              </div>
              <div className="summary-row total">
                <span className="summary-label">Total Value:</span>
                <span className="summary-value">Rp{getTotalValue().toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="transfer-form-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/inventory/transfers')}
          >
            Cancel
          </button>
          <div className="action-group">
            <button
              className="btn btn-outline"
              onClick={() => handleSubmit(false)}
              disabled={!canSave}
              title={!isOnline ? 'Connection lost. Please reconnect to save changes.' : undefined}
            >
              <Save size={18} />
              Save as Draft
            </button>
            <button
              className="btn btn-primary"
              onClick={() => handleSubmit(true)}
              disabled={!canSave}
              title={!isOnline ? 'Connection lost. Please reconnect to save changes.' : undefined}
            >
              <Send size={18} />
              {isSubmitting ? 'Saving...' : 'Save & Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
