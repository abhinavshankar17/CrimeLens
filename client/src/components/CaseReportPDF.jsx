import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register a font for a more premium look
// Note: In a real app we might host these or use standard ones
// Using standard fonts for reliability in this environment

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 15,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a', // Deep Slate
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 9,
    color: '#64748b', // Slate 500
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timestamp: {
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'right',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'black',
    color: '#0891b2', // Professional Cyan
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 4,
  },
  content: {
    fontSize: 10,
    color: '#334155', // Slate 700
    lineHeight: 1.6,
  },
  threatContainer: {
    backgroundColor: '#f8fafc',
    padding: 18,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  threatItem: {
    alignItems: 'center',
  },
  threatLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  threatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  evidenceImage: {
    width: '100%',
    height: 320,
    objectFit: 'contain',
    marginBottom: 25,
    borderRadius: 4,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detectionTable: {
    display: 'table',
    width: '100%',
    marginTop: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    minHeight: 25,
    alignItems: 'center',
  },
  tableColHeader: {
    width: '33.33%',
    backgroundColor: '#f8fafc',
    padding: 6,
  },
  tableCol: {
    width: '33.33%',
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 9,
    color: '#334155',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 5,
  },
  bullet: {
    width: 12,
    fontSize: 10,
    color: '#0891b2',
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: '#334155',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});


const CaseReportPDF = ({ data, imageUrl }) => {
  const { detections, threatScore, threatLevel, forensicReport } = data;
  const timestamp = new Date().toLocaleString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>CrimeLens Forensic Report</Text>
            <Text style={styles.subtitle}>Automated AI Scene Analysis System</Text>
          </View>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>

        {/* Threat Assessment Summary */}
        <View style={styles.threatContainer}>
          <View style={styles.threatItem}>
            <Text style={styles.threatLabel}>THREAT SCORE</Text>
            <Text style={[styles.threatValue, { color: threatScore > 70 ? '#b91c1c' : threatScore > 40 ? '#b45309' : '#15803d' }]}>
              {threatScore}/100
            </Text>
          </View>
          <View style={styles.threatItem}>
            <Text style={styles.threatLabel}>RISK LEVEL</Text>
            <Text style={[styles.threatValue, { color: threatScore > 70 ? '#b91c1c' : threatScore > 40 ? '#b45309' : '#15803d' }]}>
              {threatLevel}
            </Text>
          </View>
          <View style={styles.threatItem}>
            <Text style={styles.threatLabel}>CONFIDENCE</Text>
            <Text style={[styles.threatValue, { color: '#0891b2' }]}>
              {forensicReport.confidence}%
            </Text>
          </View>
        </View>


        {/* Evidence Imagery */}
        {imageUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evidence Imagery</Text>
            <Image src={imageUrl} style={styles.evidenceImage} />
          </View>
        )}

        {/* Scene Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scene Overview</Text>
          <Text style={styles.content}>{forensicReport.sceneOverview}</Text>
        </View>

        {/* Detection List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detected Objects ({detections.length})</Text>
          <View style={styles.detectionTable}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Object Class</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Category</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Confidence</Text></View>
            </View>
            {detections.map((det, idx) => (
              <View key={idx} style={styles.tableRow}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{det.class}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{det.category}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{Math.round(det.confidence * 100)}%</Text></View>
              </View>
            ))}
          </View>
        </View>

        {/* Forensic Interpretation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forensic Interpretation</Text>
          <Text style={styles.content}>{forensicReport.forensicInterpretation}</Text>
        </View>

        {/* Risk Factors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Factors & Anomaly Analysis</Text>
          {forensicReport.threatAssessment?.factors?.map((factor, i) => (
            <View key={i} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{factor}</Text>
            </View>
          ))}
          {forensicReport.anomalyAnalysis?.map((anomaly, i) => (
            <View key={`a-${i}`} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{anomaly}</Text>
            </View>
          ))}
        </View>

        {/* Recommended Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Actions</Text>
          {forensicReport.recommendedActions?.map((action, i) => (
            <View key={i} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{action}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CrimeLens Forensic Document - Confidential</Text>
          <Text style={styles.footerText}>Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default CaseReportPDF;
