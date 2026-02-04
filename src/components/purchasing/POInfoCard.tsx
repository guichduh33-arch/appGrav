import type { IPOInfoCardProps } from './types'

export function POInfoCard({ purchaseOrder }: IPOInfoCardProps) {
  return (
    <div className="po-detail-card">
      <h2>Order information</h2>
      <div className="po-detail-grid">
        <div className="po-detail-field">
          <label>Supplier</label>
          <div className="po-detail-value">
            <strong>{purchaseOrder.supplier?.name}</strong>
          </div>
        </div>

        <div className="po-detail-field">
          <label>Order date</label>
          <div className="po-detail-value">
            {new Date(purchaseOrder.order_date).toLocaleDateString('fr-FR')}
          </div>
        </div>

        <div className="po-detail-field">
          <label>Expected delivery</label>
          <div className="po-detail-value">
            {purchaseOrder.expected_delivery_date
              ? new Date(purchaseOrder.expected_delivery_date).toLocaleDateString('fr-FR')
              : '-'}
          </div>
        </div>

        <div className="po-detail-field">
          <label>Actual delivery</label>
          <div className="po-detail-value">
            {purchaseOrder.actual_delivery_date
              ? new Date(purchaseOrder.actual_delivery_date).toLocaleDateString('fr-FR')
              : '-'}
          </div>
        </div>

        {purchaseOrder.notes && (
          <div className="po-detail-field po-detail-field--full">
            <label>Notes</label>
            <div className="po-detail-value">{purchaseOrder.notes}</div>
          </div>
        )}
      </div>
    </div>
  )
}
