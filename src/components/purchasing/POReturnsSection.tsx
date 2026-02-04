import { formatCurrency } from '@/utils/helpers'
import type { IPOReturnsSectionProps } from './types'

const returnReasonLabels: Record<string, string> = {
  damaged: 'Damaged',
  wrong_item: 'Wrong item',
  quality_issue: 'Quality issue',
  excess_quantity: 'Excess quantity',
  other: 'Other',
}

export function POReturnsSection({ returns }: IPOReturnsSectionProps) {
  const getReturnReasonLabel = (reason: string): string => {
    return returnReasonLabels[reason] || reason
  }

  if (returns.length === 0) {
    return null
  }

  return (
    <div className="po-detail-card">
      <h2>Returns</h2>
      <div className="po-returns-list">
        {returns.map((ret) => (
          <div key={ret.id} className="po-return-item">
            <div className="po-return-item__header">
              <span className="po-return-item__product">{ret.item?.product_name}</span>
              <span className={`status-badge status-badge--${ret.status}`}>{ret.status}</span>
            </div>
            <div className="po-return-item__body">
              <div>
                Quantity:{' '}
                <strong>{parseFloat(ret.quantity_returned.toString())}</strong>
              </div>
              <div>
                Reason:{' '}
                <strong>{getReturnReasonLabel(ret.reason)}</strong>
              </div>
              {ret.reason_details && <div>{ret.reason_details}</div>}
              {ret.refund_amount && (
                <div>
                  Refund amount:{' '}
                  <strong>{formatCurrency(parseFloat(ret.refund_amount.toString()))}</strong>
                </div>
              )}
              <div className="po-return-item__date">
                {new Date(ret.return_date).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
