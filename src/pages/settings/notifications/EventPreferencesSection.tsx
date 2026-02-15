import React from 'react';
import { Loader2 } from 'lucide-react';
import {
    useNotificationEvents,
    useNotificationPreferences,
    useToggleNotificationPreference,
    type INotificationEvent,
    type INotificationPreference,
} from '@/hooks/settings/useNotificationEvents';

const CHANNELS = ['in_app', 'email', 'push'] as const;
const CHANNEL_LABELS: Record<string, string> = {
    in_app: 'In-App',
    email: 'Email',
    push: 'Push',
};

const CATEGORY_LABELS: Record<string, string> = {
    inventory: 'Inventory',
    sales: 'Sales',
    pos: 'POS',
    purchasing: 'Purchasing',
    b2b: 'B2B',
    system: 'System',
};

interface EventPreferencesSectionProps {
    canEdit: boolean;
}

export const EventPreferencesSection = ({ canEdit }: EventPreferencesSectionProps) => {
    const { data: events = [], isLoading: eventsLoading } = useNotificationEvents();
    const { data: preferences = [], isLoading: prefsLoading } = useNotificationPreferences();
    const togglePref = useToggleNotificationPreference();

    const isLoading = eventsLoading || prefsLoading;

    const isEnabled = (eventCode: string, channel: string) => {
        const pref = preferences.find(
            (p: INotificationPreference) => p.event_code === eventCode && p.channel === channel
        );
        return pref ? pref.is_enabled : true; // Default enabled
    };

    const handleToggle = (eventCode: string, channel: INotificationPreference['channel']) => {
        if (!canEdit) return;
        const current = isEnabled(eventCode, channel);
        togglePref.mutate({ eventCode, channel, enabled: !current });
    };

    // Group events by category
    const grouped = events.reduce<Record<string, INotificationEvent[]>>((acc, event) => {
        const cat = event.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(event);
        return acc;
    }, {});

    if (isLoading) {
        return (
            <div className="bg-[var(--theme-bg-secondary)] border border-white/5 rounded-xl p-8 flex items-center justify-center gap-2 text-[var(--theme-text-muted)]">
                <Loader2 size={20} className="animate-spin" />
                <span>Loading event preferences...</span>
            </div>
        );
    }

    if (events.length === 0) {
        return null;
    }

    return (
        <div className="bg-[var(--theme-bg-secondary)] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white">Event Notifications</h2>
                <p className="text-sm text-[var(--theme-text-muted)] mt-1">
                    Choose which events trigger notifications and through which channels
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-white/[0.02] text-[10px] uppercase tracking-wider text-[var(--muted-smoke)]">
                            <th className="px-6 py-4 text-left font-medium">Event</th>
                            {CHANNELS.map((ch) => (
                                <th key={ch} className="px-4 py-4 text-center font-medium w-24">
                                    {CHANNEL_LABELS[ch]}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(grouped).map(([category, catEvents]) => (
                            <React.Fragment key={category}>
                                <tr>
                                    <td
                                        colSpan={CHANNELS.length + 1}
                                        className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-gold)] bg-white/[0.02]"
                                    >
                                        {CATEGORY_LABELS[category] || category}
                                    </td>
                                </tr>
                                {catEvents.map((event) => (
                                    <tr
                                        key={event.code}
                                        className="border-t border-white/5 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-white">{event.name}</div>
                                            {event.description && (
                                                <div className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                                                    {event.description}
                                                </div>
                                            )}
                                        </td>
                                        {CHANNELS.map((ch) => (
                                            <td key={ch} className="px-4 py-4 text-center">
                                                <button
                                                    type="button"
                                                    disabled={!canEdit || togglePref.isPending}
                                                    onClick={() => handleToggle(event.code, ch)}
                                                    className={`
                                                        w-10 h-5 rounded-full relative transition-colors
                                                        ${isEnabled(event.code, ch)
                                                            ? 'bg-[var(--color-gold)]'
                                                            : 'bg-white/10'
                                                        }
                                                        ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                                    `}
                                                >
                                                    <span
                                                        className={`
                                                            absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                                                            ${isEnabled(event.code, ch) ? 'translate-x-5' : 'translate-x-0.5'}
                                                        `}
                                                    />
                                                </button>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
