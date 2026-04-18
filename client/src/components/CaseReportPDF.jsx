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
  },
  // Suspect section styles
  suspectCard: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suspectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  suspectName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  suspectAlias: {
    fontSize: 8,
    color: '#64748b',
    fontStyle: 'italic',
  },
  suspectMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  suspectMetaItem: {
    fontSize: 8,
    color: '#475569',
  },
  suspectScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  suspectScoreLabel: {
    fontSize: 7,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suspectReason: {
    fontSize: 8,
    color: '#334155',
    marginBottom: 3,
    paddingLeft: 8,
  },
  rankBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0891b2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rankText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  statusBadge: {
    padding: '2 8',
    borderRadius: 10,
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});


const getStatusStyle = (status) => {
  switch(status) {
    case 'wanted': return { backgroundColor: '#fef2f2', color: '#b91c1c' };
    case 'released': return { backgroundColor: '#fff7ed', color: '#c2410c' };
    case 'under_surveillance': return { backgroundColor: '#fefce8', color: '#a16207' };
    default: return { backgroundColor: '#f1f5f9', color: '#475569' };
  }
};

const getDangerColor = (level) => {
  switch(level) {
    case 'extreme': return '#b91c1c';
    case 'high': return '#c2410c';
    case 'moderate': return '#a16207';
    case 'low': return '#15803d';
    default: return '#475569';
  }
};

const CaseReportPDF = ({ data, imageUrl, suspects }) => {
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
          <Text style={styles.footerText}>Page 1 of {suspects?.length > 0 ? '2' : '1'}</Text>
        </View>
      </Page>

      {/* Page 2: Suspect Profiler */}
      {suspects?.length > 0 && (
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Suspect Profiler</Text>
              <Text style={styles.subtitle}>Top {suspects.length} Potential Culprits — Criminal Records Match</Text>
            </View>
            <Text style={styles.timestamp}>{timestamp}</Text>
          </View>

          {/* Suspects */}
          {suspects.slice(0, 5).map((s, idx) => {
            const statusStyle = getStatusStyle(s.criminal.status);
            const dangerColor = getDangerColor(s.criminal.dangerLevel);
            return (
              <View key={idx} style={styles.suspectCard} wrap={false}>
                <View style={styles.suspectHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.rankBadge, idx === 0 ? { backgroundColor: '#b91c1c' } : {}]}>
                      <Text style={styles.rankText}>#{idx + 1}</Text>
                    </View>
                    <View>
                      <Text style={styles.suspectName}>{s.criminal.name}</Text>
                      <Text style={styles.suspectAlias}>aka "{s.criminal.alias}" · {s.criminal.age}y/o · {s.criminal.gender}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.suspectScore, { color: s.matchScore >= 60 ? '#b91c1c' : s.matchScore >= 40 ? '#c2410c' : '#a16207' }]}>
                      {s.matchScore}%
                    </Text>
                    <Text style={styles.suspectScoreLabel}>Match</Text>
                  </View>
                </View>

                <View style={styles.suspectMeta}>
                  <Text style={[styles.statusBadge, statusStyle]}>
                    {(s.criminal.status || '').replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={[styles.suspectMetaItem, { color: dangerColor, fontWeight: 'bold' }]}>
                    Danger: {(s.criminal.dangerLevel || '').toUpperCase()}
                  </Text>
                  {s.criminal.knownCrimes?.length > 0 && (
                    <Text style={styles.suspectMetaItem}>
                      {s.criminal.knownCrimes.length} prior offense(s)
                    </Text>
                  )}
                </View>

                {/* Match Reasons */}
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#0891b2', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Match Factors
                  </Text>
                  {s.matchReasons?.map((r, ri) => (
                    <View key={ri} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={styles.suspectReason}>• {r.factor}: {r.detail}</Text>
                      <Text style={{ fontSize: 7, color: '#0891b2', fontWeight: 'bold' }}>+{r.weight}pts</Text>
                    </View>
                  ))}
                </View>

                {/* Known Weapons */}
                {s.criminal.associatedWeapons?.length > 0 && (
                  <View style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 7, color: '#b91c1c' }}>
                      Known Weapons: {s.criminal.associatedWeapons.join(', ')}
                    </Text>
                  </View>
                )}

                {/* Physical Description */}
                {s.criminal.physicalDescription && (
                  <View style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 7, color: '#64748b' }}>
                      {s.criminal.physicalDescription.height && `Height: ${s.criminal.physicalDescription.height}`}
                      {s.criminal.physicalDescription.weight && ` · Weight: ${s.criminal.physicalDescription.weight}`}
                      {s.criminal.physicalDescription.distinguishingMarks?.length > 0 && ` · Marks: ${s.criminal.physicalDescription.distinguishingMarks.join(', ')}`}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>CrimeLens Forensic Document - Confidential - Suspect Analysis</Text>
            <Text style={styles.footerText}>Page 2 of 2</Text>
          </View>
        </Page>
      )}
    </Document>
  );
};

export default CaseReportPDF;
