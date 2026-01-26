import React from 'react';
import { Property } from '../types';
import PublicPropertySheet from './PublicPropertySheet';
import PropertyPDF from './PropertyPDF';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { X, Share2, FileDown } from 'lucide-react';
import Toast, { ToastType } from './Toast';

interface PropertySheetModalProps {
    property: Property;
    onClose: () => void;
}

const PropertySheetModal: React.FC<PropertySheetModalProps> = ({ property, onClose }) => {
    const [toast, setToast] = React.useState<{ message: string; type: ToastType } | null>(null);

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type });
    };

    const handleShare = () => {
        const url = `${window.location.origin}${window.location.pathname}?p=${property.id}`;
        navigator.clipboard.writeText(url);
        showToast('Link da ficha copiado para o clipboard!', 'success');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-[500px] h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-300">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                    <h3 className="font-bold text-slate-800 dark:text-white">Pré-visualização da Ficha</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-500"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body (Scrollable Sheet) */}
                <div className="flex-1 overflow-y-auto no-scrollbar bg-[#f6f7f8] dark:bg-[#101922]">
                    <div className="max-w-[430px] mx-auto shadow-lg bg-white dark:bg-slate-900 min-h-full">
                        <PublicPropertySheet property={property} />
                    </div>
                </div>

                {/* Modal Footer (Actions) */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                    <div className="flex gap-3">
                        <button
                            onClick={handleShare}
                            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-3.5 rounded-xl font-bold text-sm transition-all"
                        >
                            <Share2 size={18} />
                            Compartilhar Link
                        </button>
                        <PDFDownloadLink
                            document={<PropertyPDF property={property} />}
                            fileName={`ficha_${property.name.toLowerCase().replace(/\s+/g, '_')}.pdf`}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#A64614] hover:bg-orange-600 text-white px-4 py-3.5 rounded-xl font-bold text-sm transition-all text-center"
                        >
                            {({ loading }) => (
                                <>
                                    <FileDown size={18} />
                                    {loading ? 'Preparando...' : 'Exportar PDF'}
                                </>
                            )}
                        </PDFDownloadLink>
                    </div>
                </div>
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default PropertySheetModal;
