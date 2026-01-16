import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font, Link } from '@react-pdf/renderer';
import { Property } from '../types';

// Registrar fonte (opcional - usar fonte do sistema por padrão)
// Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.ttf' });

// Estilos baseados no modelo Plus Imóveis
const styles = StyleSheet.create({
    // === CORES DO TEMA ===
    page: {
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },

    // === PÁGINA 1: CAPA ===
    coverPage: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    coverBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    coverOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '60%',
        backgroundColor: '#1a2e44',
        opacity: 0.95,
    },
    coverContent: {
        position: 'absolute',
        bottom: 120,
        left: 0,
        width: '100%',
        textAlign: 'center',
    },
    coverBrand: {
        fontSize: 14,
        color: '#6b8cae',
        marginBottom: 16,
        letterSpacing: 2,
    },
    coverTitle: {
        fontSize: 36,
        fontFamily: 'Helvetica-Bold',
        color: '#ffffff',
        marginBottom: 12,
    },
    coverSubtitle: {
        fontSize: 24,
        color: '#ffffff',
        opacity: 0.9,
    },
    coverFooter: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        fontSize: 10,
        color: '#6b8cae',
    },

    // === PÁGINA 2: APRESENTAÇÃO ===
    pageWithHeader: {
        padding: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#2d4a68',
        paddingBottom: 15,
        marginBottom: 30,
    },
    headerBrand: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        color: '#1a2e44',
    },
    sectionTitle: {
        fontSize: 32,
        fontFamily: 'Helvetica-BoldOblique',
        color: '#1a2e44',
        marginBottom: 20,
    },
    presentationContainer: {
        flexDirection: 'row',
        gap: 30,
    },
    presentationText: {
        flex: 1,
    },
    presentationDescription: {
        fontSize: 12,
        color: '#333333',
        lineHeight: 1.6,
        textAlign: 'justify',
    },
    presentationImage: {
        width: 280,
        height: 200,
        objectFit: 'cover',
        borderRadius: 4,
    },
    areasBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#1a2e44',
        padding: 25,
        flexDirection: 'row',
    },
    areaItem: {
        marginRight: 60,
    },
    areaValue: {
        fontSize: 28,
        fontFamily: 'Helvetica-Bold',
        color: '#ffffff',
    },
    areaUnit: {
        fontSize: 14,
        color: '#ffffff',
    },
    areaLabel: {
        fontSize: 10,
        color: '#6b8cae',
        marginTop: 4,
    },

    // === PÁGINA 3: DETALHES ===
    detailsContainer: {
        flexDirection: 'row',
        gap: 30,
        marginTop: 20,
    },
    detailsImageContainer: {
        width: 250,
        position: 'relative',
    },
    detailsImage: {
        width: '100%',
        height: 180,
        objectFit: 'cover',
        borderRadius: 4,
    },
    detailsImageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 8,
        height: '100%',
        backgroundColor: '#1a2e44',
    },
    detailsContent: {
        flex: 1,
    },
    detailsTitle: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        color: '#1a2e44',
        marginBottom: 20,
    },
    detailRow: {
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 10,
        color: '#666666',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#1a2e44',
    },
    sectionSubtitle: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        color: '#1a2e44',
        marginTop: 20,
        marginBottom: 10,
    },

    // === PÁGINA 4: FINAL ===
    finalPage: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    finalBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '50%',
        objectFit: 'cover',
    },
    finalHeader: {
        position: 'absolute',
        top: 20,
        left: 20,
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        color: '#ffffff',
    },
    finalInfoBox: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '45%',
        backgroundColor: '#1a2e44',
        padding: 30,
    },
    finalAddress: {
        fontSize: 28,
        fontFamily: 'Helvetica-Bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    finalCity: {
        fontSize: 16,
        color: '#ffffff',
        opacity: 0.8,
    },
    finalMapsLink: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    finalMapsText: {
        fontSize: 12,
        color: '#ffffff',
        marginRight: 10,
    },
    mapsIcon: {
        width: 30,
        height: 30,
    },
});

// Formatar moeda
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

// Formatar número com separador de milhar
const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
};

interface PropertyPDFProps {
    property: Property;
}

const PropertyPDF: React.FC<PropertyPDFProps> = ({ property }) => {
    const currentYear = new Date().getFullYear();
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${property.address}, ${property.number}, ${property.city}, ${property.state}`
    )}`;

    return (
        <Document>
            {/* PÁGINA 1: CAPA */}
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.coverPage}>
                    {/* Imagem de fundo - Visão Aérea */}
                    {property.aerial_view_url && (
                        <Image src={property.aerial_view_url} style={styles.coverBackground} />
                    )}

                    {/* Overlay degradê azul */}
                    <View style={styles.coverOverlay} />

                    {/* Conteúdo central */}
                    <View style={styles.coverContent}>
                        <Text style={styles.coverBrand}>Plus Imóveis</Text>
                        <Text style={styles.coverTitle}>{property.address || property.name}</Text>
                        <Text style={styles.coverSubtitle}>{property.city} - {property.state}</Text>
                    </View>

                    {/* Rodapé */}
                    <Text style={styles.coverFooter}>
                        Ficha do Imóvel - Plus Imóveis - {currentYear}
                    </Text>
                </View>
            </Page>

            {/* PÁGINA 2: APRESENTAÇÃO */}
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.pageWithHeader}>
                    {/* Cabeçalho */}
                    <View style={styles.header}>
                        <Text style={styles.headerBrand}>Plus Imóveis</Text>
                    </View>

                    {/* Título e conteúdo */}
                    <Text style={styles.sectionTitle}>Apresentação</Text>

                    <View style={styles.presentationContainer}>
                        <View style={styles.presentationText}>
                            <Text style={styles.presentationDescription}>
                                {property.tenant_category || 'Imóvel disponível para locação ou venda. Entre em contato para mais informações sobre este imóvel.'}
                            </Text>
                        </View>

                        {/* Imagem - Marcação do Terreno */}
                        {property.terrain_marking_url && (
                            <Image src={property.terrain_marking_url} style={styles.presentationImage} />
                        )}
                    </View>
                </View>

                {/* Barra inferior com áreas */}
                <View style={styles.areasBar}>
                    <View style={styles.areaItem}>
                        <Text style={styles.areaValue}>
                            {formatNumber(property.land_area)}<Text style={styles.areaUnit}>m²</Text>
                        </Text>
                        <Text style={styles.areaLabel}>Área de Terreno</Text>
                    </View>
                    <View style={styles.areaItem}>
                        <Text style={styles.areaValue}>
                            {formatNumber(property.built_area)}<Text style={styles.areaUnit}>m²</Text>
                        </Text>
                        <Text style={styles.areaLabel}>Área Construída</Text>
                    </View>
                </View>
            </Page>

            {/* PÁGINA 3: DETALHES DO TERRENO */}
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.pageWithHeader}>
                    {/* Cabeçalho */}
                    <View style={styles.header}>
                        <Text style={styles.headerBrand}>Plus Imóveis</Text>
                    </View>

                    <View style={styles.detailsContainer}>
                        {/* Imagem - Vista Frontal/Lateral */}
                        <View style={styles.detailsImageContainer}>
                            {property.front_view_url ? (
                                <Image src={property.front_view_url} style={styles.detailsImage} />
                            ) : property.side_view_url ? (
                                <Image src={property.side_view_url} style={styles.detailsImage} />
                            ) : null}
                            <View style={styles.detailsImageOverlay} />
                        </View>

                        {/* Dados do imóvel */}
                        <View style={styles.detailsContent}>
                            <Text style={styles.detailsTitle}>Detalhes do Terreno</Text>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Localização:</Text>
                                <Text style={styles.detailValue}>
                                    {property.address}, {property.number}{property.complement ? `, ${property.complement}` : ''}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Matrícula:</Text>
                                <Text style={styles.detailValue}>{property.registration || 'N/A'}</Text>
                            </View>

                            <Text style={styles.sectionSubtitle}>Parâmetros Construtivos</Text>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Área do Lote:</Text>
                                <Text style={styles.detailValue}>{formatNumber(property.land_area)} m²</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Cota Principal:</Text>
                                <Text style={styles.detailValue}>{formatNumber(property.main_quota || 0)} m²</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Cota Lateral:</Text>
                                <Text style={styles.detailValue}>{formatNumber(property.lateral_quota || 0)} m²</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>IPTU:</Text>
                                <Text style={styles.detailValue}>{formatCurrency(property.iptu_value || 0)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>

            {/* PÁGINA 4: FINAL */}
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.finalPage}>
                    {/* Imagem de fundo - Visão Aérea */}
                    {property.aerial_view_url && (
                        <Image src={property.aerial_view_url} style={styles.finalBackground} />
                    )}

                    {/* Cabeçalho */}
                    <Text style={styles.finalHeader}>Plus Imóveis</Text>

                    {/* Box inferior com endereço */}
                    <View style={styles.finalInfoBox}>
                        <Text style={styles.finalAddress}>{property.address}</Text>
                        <Text style={styles.finalCity}>{property.city}-{property.state}</Text>

                        {/* Link para Google Maps */}
                        <View style={styles.finalMapsLink}>
                            <Link src={googleMapsUrl}>
                                <Text style={styles.finalMapsText}>Ir para o Google Maps</Text>
                            </Link>
                            {/* Ícone do Google Maps - usando emoji como placeholder */}
                            <Text style={{ fontSize: 24 }}>📍</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default PropertyPDF;
