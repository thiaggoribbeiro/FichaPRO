import { pdf } from '@react-pdf/renderer';
import PropertyPDF from '../components/PropertyPDF';
import { Property } from '../types';

/**
 * Gera e baixa o PDF da ficha de imóvel
 * @param property - Dados do imóvel para gerar a ficha
 */
export const generatePropertyPDF = async (property: Property): Promise<void> => {
    try {
        // Gerar o documento PDF
        const doc = <PropertyPDF property={property} />;
        const blob = await pdf(doc).toBlob();

        // Criar URL temporária para download
        const url = URL.createObjectURL(blob);

        // Criar link de download
        const link = document.createElement('a');
        link.href = url;
        link.download = `Ficha Imóvel - ${property.address || property.name} - ${property.city}-${property.state}.pdf`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Limpar URL temporária
        URL.revokeObjectURL(url);

        console.log('PDF gerado com sucesso!');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        throw error;
    }
};

/**
 * Gera o blob do PDF para preview ou outras operações
 * @param property - Dados do imóvel
 * @returns Blob do PDF
 */
export const generatePropertyPDFBlob = async (property: Property): Promise<Blob> => {
    const doc = <PropertyPDF property={property} />;
    return await pdf(doc).toBlob();
};
