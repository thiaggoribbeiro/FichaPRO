import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { Property } from '../types';

// Styles optimized for single-page A4 PDF and clean banner text
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#0d141b',
        fontFamily: 'Helvetica',
        padding: 0,
    },
    container: {
        width: '100%',
    },
    // Banner principal
    bannerContainer: {
        position: 'relative',
        width: '100%',
        height: 180,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    bannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        padding: 25,
        justifyContent: 'center',
    },
    badge: {
        backgroundColor: '#A64614',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 2,
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 7,
        fontWeight: 'extrabold',
        textTransform: 'uppercase',
    },
    propertyTitle: {
        color: '#ffffff',
        fontSize: 22,
        fontFamily: 'Helvetica-Bold',
    },
    propertyAddress: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 11,
        fontFamily: 'Helvetica',
        marginTop: 4,
    },
    // Seções
    section: {
        paddingHorizontal: 25,
        marginTop: 12,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionIndicator: {
        width: 3,
        height: 14,
        backgroundColor: '#A64614',
        borderRadius: 2,
        marginRight: 8,
    },
    sectionTitle: {
        color: '#ffffff',
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
    },
    // Grid de Detalhes
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    detailCard: {
        width: '48.5%',
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        padding: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 4,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    detailLabel: {
        color: '#94a3b8',
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
    },
    detailValue: {
        color: '#ffffff',
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
    },
    // Galeria
    galleryGrid: {
        flexDirection: 'row',
        gap: 10,
        height: 125,
    },
    mainImage: {
        width: '66%',
        height: '100%',
        borderRadius: 12,
        objectFit: 'cover',
    },
    subImagesContainer: {
        width: '32%',
        gap: 10,
    },
    subImage: {
        height: '46.5%',
        borderRadius: 12,
        objectFit: 'cover',
    },
    // IPTU Box
    iptuBox: {
        backgroundColor: '#1e293b',
        padding: 15,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iptuLabel: {
        color: '#A64614',
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    iptuTitle: {
        color: '#ffffff',
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
    },
    iptuExercise: {
        color: '#94a3b8',
        fontSize: 9,
        marginTop: 2,
    },
    iptuPrice: {
        color: '#ffffff',
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'right',
    },
    iptuBadge: {
        alignSelf: 'flex-end',
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 20,
        backgroundColor: 'rgba(166, 70, 20, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(166, 70, 20, 0.3)',
    },
    iptuBadgeText: {
        color: '#A64614',
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
    },
    // Footer / Contato
    footer: {
        backgroundColor: '#A64614',
        marginHorizontal: 25,
        marginTop: 12,
        padding: 15,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    footerPrice: {
        color: '#ffffff',
        fontSize: 20,
        fontFamily: 'Helvetica-Bold',
    },
    contactInfo: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    contactText: {
        color: '#ffffff',
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
    },
    contactPhone: {
        color: '#ffffff',
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        marginTop: 2,
    }
});

// Helper para formatar moeda
const formatCurrency = (value: any) => {
    const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

// Helper para formatar números
const formatNumber = (value: any) => {
    const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
    return new Intl.NumberFormat('pt-BR').format(num);
};

interface PropertyPDFProps {
    property: Property;
}

const PropertyPDF: React.FC<PropertyPDFProps> = ({ property }) => {
    const aerialImage = property.aerial_view_url || property.image_url;
    const frontImage = property.front_view_url;
    const sideImage = property.side_view_url;
    const terrainImage = property.terrain_marking_url;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.container}>
                    {/* Header Banner com Título e Endereço Embutidos */}
                    <View style={styles.bannerContainer}>
                        {aerialImage && <Image src={aerialImage} style={styles.bannerImage} />}
                        <View style={styles.bannerOverlay}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>Plus Imóveis</Text>
                            </View>
                            <Text style={styles.propertyTitle}>{property.name}</Text>
                            <Text style={styles.propertyAddress}>
                                {property.address}, {property.number} • {property.neighborhood}, {property.city} - {property.state}
                            </Text>
                        </View>
                    </View>

                    {/* Especificações */}
                    <View style={styles.section}>
                        <View style={styles.sectionTitleContainer}>
                            <View style={styles.sectionIndicator} />
                            <Text style={styles.sectionTitle}>Especificações do Imóvel</Text>
                        </View>
                        <View style={styles.detailsGrid}>
                            <DetailCard label="Área Terreno" value={`${formatNumber(property.land_area)} m²`} />
                            <DetailCard label="Área Const." value={`${formatNumber(property.built_area)} m²`} />
                            <DetailCard label="Testada Princ." value={`${formatNumber(property.main_quota)} m`} />
                            <DetailCard label="Cota Lateral" value={`${formatNumber(property.lateral_quota)} m`} />
                            <DetailCard label="Pavimentos" value={String(property.floors || 1)} />
                            <DetailCard label="Config. Terreno" value={property.terrain_config === 'regular' ? 'Regular' : 'Irregular'} />
                            <DetailCard label="Sequencial" value={property.sequencial || 'N/A'} />
                            <DetailCard label="Matrícula" value={property.matricula || 'N/A'} />
                        </View>
                    </View>

                    {/* Tour Visual */}
                    <View style={styles.section}>
                        <View style={styles.sectionTitleContainer}>
                            <View style={styles.sectionIndicator} />
                            <Text style={styles.sectionTitle}>Tour Visual</Text>
                        </View>
                        <View style={styles.galleryGrid}>
                            {frontImage && <Image src={frontImage} style={styles.mainImage} />}
                            <View style={styles.subImagesContainer}>
                                {sideImage && <Image src={sideImage} style={styles.subImage} />}
                                {terrainImage && <Image src={terrainImage} style={styles.subImage} />}
                            </View>
                        </View>
                    </View>

                    {/* IPTU */}
                    <View style={styles.section}>
                        <View style={styles.iptuBox}>
                            <View>
                                <Text style={styles.iptuLabel}>Encargos Anuais</Text>
                                <Text style={styles.iptuTitle}>Valor do IPTU</Text>
                                <Text style={styles.iptuExercise}>Exercício Corrente</Text>
                            </View>
                            <View>
                                <Text style={styles.iptuPrice}>{formatCurrency(property.iptu_value)}</Text>
                                <View style={styles.iptuBadge}>
                                    <Text style={styles.iptuBadgeText}>Cota Única</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Footer / Contato */}
                    <View style={styles.footer}>
                        <View>
                            <Text style={styles.footerLabel}>
                                {property.fiche_type === 'Venda' ? 'Valor de Venda' : 'Valor de Aluguel'}
                            </Text>
                            <Text style={styles.footerPrice}>
                                {property.fiche_type === 'Venda'
                                    ? formatCurrency(property.market_value)
                                    : (property.price ? formatCurrency(property.price) : 'Sob Consulta')}
                            </Text>
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactText}>Contato Whatsapp</Text>
                            <Text style={styles.contactPhone}>81 99999-9999</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

const DetailCard = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
            <Text style={styles.detailLabel}>{label}</Text>
        </View>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

export default PropertyPDF;
