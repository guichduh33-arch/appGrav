/** Floor plan item types supported by the editor */
export const ITEM_TYPES = [
  'table', 'wall', 'bar', 'counter', 'divider',
] as const

export type FloorPlanItemType = (typeof ITEM_TYPES)[number]

export type FloorPlanShape = 'square' | 'round' | 'rectangle'

export interface FloorPlanItem {
  id: string
  item_type: FloorPlanItemType
  number?: string
  capacity?: number
  section?: string
  status?: 'available' | 'occupied' | 'reserved'
  shape: FloorPlanShape
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
  color?: string
  floor?: number
}

/** Visual config per item type */
export interface ItemTypeConfig {
  value: FloorPlanItemType
  label: string
  description: string
  /** Tailwind bg class for canvas element */
  bgClass: string
  /** Tailwind border class for canvas element */
  borderClass: string
  /** Tailwind text class for icon in toolbar/add menu */
  iconClass: string
  /** Default width */
  defaultWidth: number
  /** Default height */
  defaultHeight: number
  /** Default shape */
  defaultShape: FloorPlanShape
  /** Whether the item has capacity (seats) */
  hasCapacity: boolean
}

export const ITEM_TYPE_CONFIGS: Record<FloorPlanItemType, ItemTypeConfig> = {
  table: {
    value: 'table', label: 'Table', description: 'Seating table for customers',
    bgClass: 'bg-emerald-500/20', borderClass: 'border-emerald-500',
    iconClass: 'text-emerald-400',
    defaultWidth: 80, defaultHeight: 80, defaultShape: 'square', hasCapacity: true,
  },
  wall: {
    value: 'wall', label: 'Wall', description: 'Structural wall or partition',
    bgClass: 'bg-stone-500/20', borderClass: 'border-stone-400',
    iconClass: 'text-stone-400',
    defaultWidth: 160, defaultHeight: 16, defaultShape: 'rectangle', hasCapacity: false,
  },
  bar: {
    value: 'bar', label: 'Bar', description: 'Bar counter with seating',
    bgClass: 'bg-amber-500/20', borderClass: 'border-amber-500',
    iconClass: 'text-amber-400',
    defaultWidth: 140, defaultHeight: 50, defaultShape: 'rectangle', hasCapacity: true,
  },
  counter: {
    value: 'counter', label: 'Counter', description: 'Service or ordering counter',
    bgClass: 'bg-sky-500/20', borderClass: 'border-sky-400',
    iconClass: 'text-sky-400',
    defaultWidth: 120, defaultHeight: 40, defaultShape: 'rectangle', hasCapacity: false,
  },
  divider: {
    value: 'divider', label: 'Divider', description: 'Visual separator or railing',
    bgClass: 'bg-violet-500/20', borderClass: 'border-violet-400/60',
    iconClass: 'text-violet-400',
    defaultWidth: 120, defaultHeight: 8, defaultShape: 'rectangle', hasCapacity: false,
  },
}

export const TABLE_SHAPES: { value: FloorPlanShape; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'round', label: 'Round' },
  { value: 'rectangle', label: 'Rectangle' },
]

export const FLOOR_SECTIONS = [
  { value: 'Main', label: 'Indoor' },
  { value: 'Terrace', label: 'Terrace' },
  { value: 'VIP', label: 'VIP' },
]
