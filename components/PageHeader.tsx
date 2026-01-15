import React from 'react';

interface Breadcrumb {
    label: string;
    href: string;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs?: any[];
    actions?: any;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs, actions }) => {
    return (
        <div className="flex flex-col gap-2">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 mb-2 text-sm">
                    {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={idx}>
                            {idx > 0 && <span className="text-slate-400">/</span>}
                            <button
                                onClick={crumb.onClick}
                                className={`font-medium ${crumb.active ? 'text-[#137fec]' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {crumb.label}
                            </button>
                        </React.Fragment>
                    ))}
                </nav>
            )}
            <div className="flex flex-wrap justify-between items-end gap-4 mt-2">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">{title}</h2>
                    {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
                </div>
                {actions && (
                    <div className="flex gap-3">
                        {Array.isArray(actions) ? actions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={action.onClick}
                                className={`h-11 px-6 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-[0.98] ${action.variant === 'primary'
                                    ? 'bg-[#137fec] text-white shadow-lg shadow-[#137fec]/20 hover:bg-[#137fec]/90'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {action.icon}
                                <span>{action.label}</span>
                            </button>
                        )) : actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
