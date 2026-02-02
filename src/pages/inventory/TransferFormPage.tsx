import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus, Save, Trash2, Send, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLocations, useCreateTransfer, useTransfer } from '@/hooks/inventory'
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
  const { t } = useTranslation()
  const { isOnline } = useNetworkStatus()
  const isEditing = Boolean(id)

  // Hooks for data
  const { data: locations = [] } = useLocations({ isActive: true })
  const { data: products = [] } = useProducts()
  const { data: existingTransfer } = useTransfer(id ?? null)
  const createTransferMutation = useCreateTransfer()

  // Track if initial mount check has been done
  const hasCheckedInitialOnlineStatus = useRef(false)

  // Form state
  const [fromLocationId, setFromLocationId] = useState('')
  const [toLocationId, setToLocationId] = useState('')
  const [responsiblePerson, setResponsiblePerson] = useState('')
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<TransferItemForm[]>([])

  // Redirect if offline on initial load only
  useEffect(() => {
    if (!hasCheckedInitialOnlineStatus.current) {
      hasCheckedInitialOnlineStatus.current = true
      if (!isOnline) {
        toast.error(t('inventory.transfers.offline.blocked'))
        navigate('/inventory/transfers')
      }
    }
  }, [isOnline, t, navigate])

  // Load existing transfer data
  useEffect(() => {
    if (existingTransfer && isEditing) {
      setFromLocationId(existingTransfer.from_location_id)
      setToLocationId(existingTransfer.to_location_id)
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

  // Filter locations by type
  const warehouses = useMemo(() =>
    locations.filter(l => l.location_type === 'main_warehouse'),
    [locations]
  )
  const sections = useMemo(() =>
    locations.filter(l => l.location_type === 'section'),
    [locations]
  )

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
      toast.error(t('inventory.transfers.offline.blocked'))
      return
    }

    // Validation
    if (!fromLocationId || !toLocationId) {
      toast.error(t('inventory.transfers.validation.selectLocations'))
      return
    }

    if (!responsiblePerson.trim()) {
      toast.error(t('inventory.transfers.validation.responsibleRequired'))
      return
    }

    if (items.length === 0) {
      toast.error(t('inventory.transfers.validation.addItems'))
      return
    }

    if (items.some(item => !item.product_id || item.quantity_requested <= 0)) {
      toast.error(t('inventory.transfers.validation.fillItems'))
      return
    }

    try {
      await createTransferMutation.mutateAsync({
        fromLocationId,
        toLocationId,
        responsiblePerson: responsiblePerson.trim(),
        transferDate,
        notes: notes.trim() || undefined,
        sendDirectly,
        items: items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity_requested
        }))
      })

      toast.success(t('inventory.transfers.messages.created'))
      navigate('/inventory/transfers')
    } catch (error) {
      console.error('Error saving transfer:', error)
      toast.error(error instanceof Error ? error.message : t('inventory.transfers.messages.loadError'))
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
          <span>{t('inventory.transfers.offline.connectionLost')}</span>
        </div>
      )}

      <header className="transfer-form-header">
        <button className="btn btn-ghost" onClick={() => navigate('/inventory/transfers')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="transfer-form-title">
            {isEditing ? t('inventory.transfers.editTransfer') : t('inventory.transfers.newTransfer')}
          </h1>
          <p className="transfer-form-subtitle">
            {t('inventory.transfers.subtitle')}
          </p>
        </div>
      </header>

      <div className="transfer-form-container">
        {/* General Info */}
        <div className="transfer-form-section">
          <h2>{t('common.settings')}</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>{t('inventory.transfers.form.from')} *</label>
              <select
                value={fromLocationId}
                onChange={(e) => setFromLocationId(e.target.value)}
                disabled={!isOnline}
              >
                <option value="">{t('inventory.transfers.form.selectLocation')}</option>
                {warehouses.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t('inventory.transfers.form.to')} *</label>
              <select
                value={toLocationId}
                onChange={(e) => setToLocationId(e.target.value)}
                disabled={!isOnline}
              >
                <option value="">{t('inventory.transfers.form.selectLocation')}</option>
                {sections.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t('inventory.transfers.form.responsible')} *</label>
              <input
                type="text"
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                placeholder={t('inventory.transfers.form.responsible')}
                disabled={!isOnline}
              />
            </div>
            <div className="form-group">
              <label>{t('inventory.transfers.form.date')} *</label>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                disabled={!isOnline}
              />
            </div>
          </div>
          <div className="form-group">
            <label>{t('inventory.transfers.form.notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={t('inventory.transfers.form.notesPlaceholder')}
              disabled={!isOnline}
            />
          </div>
        </div>

        {/* Items */}
        <div className="transfer-form-section">
          <div className="section-header">
            <h2>{t('inventory.transfers.form.items')}</h2>
            <button
              className="btn btn-secondary btn-sm"
              onClick={addItem}
              disabled={!isOnline}
            >
              <Plus size={16} />
              {t('inventory.transfers.form.addItem')}
            </button>
          </div>

          {items.length === 0 ? (
            <div className="no-items">
              <p>{t('inventory.transfers.form.noItems')}</p>
            </div>
          ) : (
            <div className="items-table">
              <table>
                <thead>
                  <tr>
                    <th>{t('inventory.transfers.form.product')}</th>
                    <th style={{ width: '120px' }}>{t('inventory.transfers.form.quantity')}</th>
                    <th style={{ width: '120px' }}>{t('inventory.transfers.form.unitCost')}</th>
                    <th style={{ width: '120px' }}>{t('inventory.transfers.form.lineTotal')}</th>
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
                          <option value="">{t('inventory.transfers.form.selectProduct')}</option>
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
                <span className="summary-label">{t('inventory.transfers.form.totalItems')}:</span>
                <span className="summary-value">{items.length}</span>
              </div>
              <div className="summary-row total">
                <span className="summary-label">{t('inventory.transfers.form.totalValue')}:</span>
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
            {t('inventory.transfers.actions.cancel')}
          </button>
          <div className="action-group">
            <button
              className="btn btn-outline"
              onClick={() => handleSubmit(false)}
              disabled={!canSave}
              title={!isOnline ? t('inventory.transfers.offline.connectionLost') : undefined}
            >
              <Save size={18} />
              {t('inventory.transfers.actions.saveDraft')}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => handleSubmit(true)}
              disabled={!canSave}
              title={!isOnline ? t('inventory.transfers.offline.connectionLost') : undefined}
            >
              <Send size={18} />
              {isSubmitting ? t('common.saving') : t('inventory.transfers.actions.saveAndSend')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
