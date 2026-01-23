import React from 'react';

interface FooterProps {
    onSaveDraft?: () => void;
    onGeneratePdf?: () => void;
    isSaving?: boolean;
}

const Footer: React.FC<FooterProps> = ({ onSaveDraft, onGeneratePdf, isSaving = false }) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 py-4 px-6 z-50">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-green-500">
                        <span className="material-symbols-outlined text-sm">{isSaving ? 'sync' : 'cloud_done'}</span>
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {isSaving ? 'Salvando...' : 'Alterações salvas'}
                        </span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={onSaveDraft}
                        className="px-6 py-3 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                        Salvar Rascunho
                    </button>
                    <button
                        onClick={onGeneratePdf}
                        className="flex items-center gap-2 px-8 py-3 bg-[#A64614] text-white rounded-lg text-sm font-bold hover:bg-[#A64614]/90 shadow-lg shadow-[#A64614]/20 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                        Gerar Ficha em PDF
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
