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
                                className={`font-medium ${crumb.active ? 'text-[#A64614]' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {crumb.label}
                            </button>
                        </React.Fragment>
                    ))}
                </nav>
            )}
            <div className="flex flex-wrap justify-between items-end gap-4 mt-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
                    {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
                </div>
                {actions && (
                    <div className="flex gap-3">
                        {Array.isArray(actions) ? actions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={action.onClick}
                                className={`h-10 px-4 rounded-xl font-semibold flex items-center gap-2 transition-all active:scale-[0.98] ${action.variant === 'primary'
                                    ? 'bg-[#A64614] text-white shadow-md shadow-[#A64614]/10 hover:bg-[#A64614]/90'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <span className="flex items-center justify-center scale-90">{action.icon}</span>
                                <span className="text-sm">{action.label}</span>
                            </button>
                        )) : actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
