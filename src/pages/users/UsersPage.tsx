import { UserPlus, Edit2, Trash2, Users, CheckCircle2, Shield, CalendarClock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

// Mock users data
const MOCK_USERS = [
    {
        id: 1,
        name: 'Mamat',
        email: 'mamat@thebreakery.com',
        role: 'admin',
        status: 'active',
        lastActive: '2025-01-15T10:30:00'
    },
    {
        id: 2,
        name: 'Sarah',
        email: 'sarah@thebreakery.com',
        role: 'manager',
        status: 'active',
        lastActive: '2025-01-15T09:45:00'
    },
    {
        id: 3,
        name: 'Ahmad',
        email: 'ahmad@thebreakery.com',
        role: 'barista',
        status: 'active',
        lastActive: '2025-01-15T10:15:00'
    },
    {
        id: 4,
        name: 'Dewi',
        email: 'dewi@thebreakery.com',
        role: 'cashier',
        status: 'active',
        lastActive: '2025-01-15T08:00:00'
    },
    {
        id: 5,
        name: 'Budi',
        email: 'budi@thebreakery.com',
        role: 'kitchen',
        status: 'inactive',
        lastActive: '2025-01-10T16:00:00'
    },
];

const UsersPage = () => {
    const formatLastActive = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'En ligne';
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        return `Il y a ${diffDays}j`;
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'Admin';
            case 'manager': return 'Manager';
            case 'barista': return 'Barista';
            case 'cashier': return 'Caissier';
            case 'kitchen': return 'Cuisine';
            default: return role;
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin': return 'danger';
            case 'manager': return 'warning';
            case 'barista': return 'success';
            case 'cashier': return 'info';
            default: return 'neutral';
        }
    };

    const activeCount = MOCK_USERS.filter(u => u.status === 'active').length;
    const adminCount = MOCK_USERS.filter(u => u.role === 'admin' || u.role === 'manager').length;

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Équipe</h1>
                    <p className="text-gray-500 mt-1">Gérez les membres et leurs accès.</p>
                </div>
                <Button leftIcon={<UserPlus size={18} />}>
                    Ajouter un membre
                </Button>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Membres"
                    value={MOCK_USERS.length}
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                />
                <StatCard
                    label="Actifs"
                    value={activeCount}
                    icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                />
                <StatCard
                    label="Admins/Managers"
                    value={adminCount}
                    icon={<Shield className="w-5 h-5 text-orange-600" />}
                />
                <StatCard
                    label="En service"
                    value="3"
                    icon={<CalendarClock className="w-5 h-5 text-purple-600" />}
                />
            </div>

            {/* Users Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dernière activité</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {MOCK_USERS.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                                                {getInitials(user.name)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <Badge variant={getRoleBadgeVariant(user.role)}>
                                            {getRoleLabel(user.role)}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <span className="text-sm text-gray-700 capitalize">{user.status}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500">
                                        {formatLastActive(user.lastActive)}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

function StatCard({ label, value, icon }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                {icon}
            </div>
        </div>
    );
}

export default UsersPage;
