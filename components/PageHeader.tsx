import React from 'react';

interface Breadcrumb {
    label: string;
    href: string;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs?: Breadcrumb[];
    actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs, actions }) => {
    return (
        <div className="flex flex-col gap-2">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            <a className="hover:text-[#137fec]" href={crumb.href}>{crumb.label}</a>
                            {index < breadcrumbs.length - 1 && (
                                <span className="material-symbols-outlined text-xs">chevron_right</span>
                            )}
                        </React.Fragment>
                    ))}
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="font-medium text-slate-900">{title}</span>
                </div>
            )}
            <div className="flex flex-wrap justify-between items-end gap-4 mt-2">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">{title}</h2>
                    {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
                </div>
                {actions && (
                    <div className="flex gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
