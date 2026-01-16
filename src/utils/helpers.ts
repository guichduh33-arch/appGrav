// Format number as Indonesian Rupiah
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp')
}

// Format price with dot separator (Rp 35.000)
export function formatPrice(amount: number): string {
    return `Rp ${amount.toLocaleString('id-ID')}`
}

// Parse price string to number
export function parsePrice(priceStr: string): number {
    return parseInt(priceStr.replace(/[^\d]/g, ''), 10) || 0
}

// Format date/time
export function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

export function formatDateTime(date: Date | string): string {
    return `${formatDate(date)} ${formatTime(date)}`
}

// Generate order number
export function generateOrderNumber(): string {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `POS-${dateStr}-${random}`
}

// Calculate timer color based on elapsed time (in seconds)
export function getTimerColor(elapsedSeconds: number): string {
    if (elapsedSeconds < 120) return 'timer-new' // < 2 min
    if (elapsedSeconds < 300) return 'timer-ok' // 2-5 min
    if (elapsedSeconds < 480) return 'timer-attention' // 5-8 min
    if (elapsedSeconds < 600) return 'timer-urgent' // 8-10 min
    return 'timer-late' // > 10 min
}

// Format elapsed time (MM:SS)
export function formatElapsedTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => void>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), delay)
    }
}

// Play notification sound
export function playSound(soundFile: string): void {
    const audio = new Audio(`/sounds/${soundFile}`)
    audio.volume = 0.5
    audio.play().catch(() => {
        // Ignore audio play errors (common on mobile without user interaction)
    })
}
