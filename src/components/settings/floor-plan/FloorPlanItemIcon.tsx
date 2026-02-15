import { Grid, Fence, Wine, ConciergeBell, SeparatorHorizontal } from 'lucide-react'
import type { FloorPlanItemType } from './floorPlanConstants'
import { ITEM_TYPE_CONFIGS } from './floorPlanConstants'

interface FloorPlanItemIconProps {
  itemType: FloorPlanItemType
  size?: number
  className?: string
}

/** Returns the appropriate Lucide icon for a floor plan item type. */
export function FloorPlanItemIcon({ itemType, size = 18, className }: FloorPlanItemIconProps) {
  const cfg = ITEM_TYPE_CONFIGS[itemType]
  const cls = className || cfg?.iconClass || 'text-white'

  switch (itemType) {
    case 'table':
      return <Grid size={size} className={cls} />
    case 'wall':
      return <Fence size={size} className={cls} />
    case 'bar':
      return <Wine size={size} className={cls} />
    case 'counter':
      return <ConciergeBell size={size} className={cls} />
    case 'divider':
      return <SeparatorHorizontal size={size} className={cls} />
    default:
      return <Grid size={size} className={cls} />
  }
}

export default FloorPlanItemIcon
