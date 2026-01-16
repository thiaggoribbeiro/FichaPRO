import React from 'react';
import PageHeader from './PageHeader';
import { BarChart3, TrendingUp, Home, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
    const stats = [
        { label: 'Valor Total do Portfólio', value: 'R$ 45.2M', icon: <TrendingUp className="w-5 h-5 text-emerald-600" />, change: '+12.5%', color: 'bg-emerald-50' },
        { label: 'Imóveis Ativos', value: '12', icon: <Home className="w-5 h-5 text-blue-600" />, change: '0%', color: 'bg-blue-50' },
        { label: 'Inquilinos', value: '8', icon: <Users className="w-5 h-5 text-purple-600" />, change: '+2', color: 'bg-purple-50' },
        { label: 'Taxa de Ocupação', value: '92%', icon: <BarChart3 className="w-5 h-5 text-orange-600" />, change: '-2.4%', color: 'bg-orange-50' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <PageHeader
                title="Painel de Indicadores"
                subtitle="Acompanhe o desempenho do seu portfólio imobiliário em tempo real."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-xl ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-emerald-600' : stat.change === '0%' ? 'text-slate-400' : 'text-rose-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1">{stat.label}</h3>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <BarChart3 className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Gráficos e Detalhes vindo em breve</h3>
                <p className="text-slate-500 max-w-md">
                    Estamos preparando uma análise detalhada do seu patrimônio com gráficos comparativos e projeções futuras.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
