import React from 'react';
import PageHeader from './PageHeader';
import { BarChart3 } from 'lucide-react';

const Dashboard: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <PageHeader
                title="Dashboard"
                subtitle="Acompanhe o desempenho do seu portfólio imobiliário."
            />

            <div className="mt-8 bg-white p-12 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[500px] text-center">
                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                    <BarChart3 className="w-12 h-12 text-[#A64614]" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Gráficos e Detalhes em breve</h3>
                <p className="text-slate-500 max-w-md text-lg">
                    Estamos preparando uma análise detalhada do seu patrimônio com gráficos comparativos e projeções futuras.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
