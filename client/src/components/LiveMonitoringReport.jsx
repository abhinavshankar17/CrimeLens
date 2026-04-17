import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const colors = {
  bg: '#ffffff',
  headerBg: '#0f172a',
  accent: '#0ea5e9',
  red: '#ef4444',
  green: '#22c55e',
  orange: '#f97316',
  textDark: '#0f172a',
  textMid: '#334155',
  textLight: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  stripeBg: '#f8fafc',
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: colors.bg,
    fontFamily: 'Helvetica',
  },
  // Cover header
  coverHeader: {
    backgroundColor: colors.headerBg,
    padding: 30,
    marginHorizontal: -40,
    marginTop: -40,
    marginBottom: 30,
  },
  coverTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  coverSubtitle: {
    fontSize: 10,
    color: colors.accent,
    marginTop: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  coverMeta: {
    fontSize: 8,
    color: '#94a3b8',
    marginTop: 12,
  },
  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.headerBg,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    paddingBottom: 6,
    marginBottom: 10,
  },
  // Summary stats row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 7,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  // Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.headerBg,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  tableRowStriped: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    backgroundColor: colors.stripeBg,
  },
  tableCell: {
    fontSize: 8,
    color: colors.textMid,
  },
  // Evidence card
  evidenceCard: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.stripeBg,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  evidenceImage: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
  },
  evidenceBody: {
    padding: 10,
  },
  badge: {
    fontSize: 7,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.textMuted,
  },
});

const getThreatColor = (type) => {
  const t = (type || '').toLowerCase();
  if (t === 'attack' || t === 'murder') return colors.red;
  if (t === 'weapons') return colors.orange;
  if (t === 'theft') return '#a855f7';
  return colors.accent;
};

const LiveMonitoringReport = ({ alerts, sessionStart, sessionEnd }) => {
  const totalAlerts = alerts.length;
  const avgConf = totalAlerts > 0 ? Math.round(alerts.reduce((s, a) => s + (a.confidence || 0), 0) / totalAlerts) : 0;
  const crimeTypes = [...new Set(alerts.map(a => a.type))];
  const maxThreat = totalAlerts > 0 ? alerts.reduce((max, a) => (a.confidence || 0) > (max.confidence || 0) ? a : max, alerts[0]) : null;

  return (
    <Document>
      {/* Page 1: Cover + Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverHeader}>
          <Text style={styles.coverTitle}>CrimeLens</Text>
          <Text style={styles.coverSubtitle}>Live Surveillance Monitoring Report</Text>
          <Text style={styles.coverMeta}>
            Session: {sessionStart} — {sessionEnd}  |  Generated: {new Date().toLocaleString()}
          </Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Incidents</Text>
              <Text style={{ ...styles.statValue, color: totalAlerts > 0 ? colors.red : colors.green }}>{totalAlerts}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Avg Confidence</Text>
              <Text style={styles.statValue}>{avgConf}%</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Crime Types</Text>
              <Text style={styles.statValue}>{crimeTypes.length}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Peak Threat</Text>
              <Text style={{ ...styles.statValue, color: colors.red }}>{maxThreat ? `${maxThreat.confidence}%` : 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Incident Log Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident Log</Text>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderText, width: '10%' }}>#</Text>
            <Text style={{ ...styles.tableHeaderText, width: '15%' }}>Time</Text>
            <Text style={{ ...styles.tableHeaderText, width: '15%' }}>Type</Text>
            <Text style={{ ...styles.tableHeaderText, width: '10%' }}>Conf.</Text>
            <Text style={{ ...styles.tableHeaderText, width: '50%' }}>Description</Text>
          </View>
          {alerts.map((alert, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowStriped}>
              <Text style={{ ...styles.tableCell, width: '10%', fontWeight: 'bold' }}>{i + 1}</Text>
              <Text style={{ ...styles.tableCell, width: '15%' }}>{alert.time}</Text>
              <Text style={{ ...styles.tableCell, width: '15%', color: getThreatColor(alert.type), fontWeight: 'bold' }}>{alert.type}</Text>
              <Text style={{ ...styles.tableCell, width: '10%' }}>{alert.confidence}%</Text>
              <Text style={{ ...styles.tableCell, width: '50%' }}>{alert.description}</Text>
            </View>
          ))}
        </View>

        {/* Recommended Actions from highest threat */}
        {maxThreat && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Primary Recommended Action</Text>
            <View style={{ padding: 12, backgroundColor: '#fef2f2', borderLeftWidth: 3, borderLeftColor: colors.red, borderRadius: 3 }}>
              <Text style={{ fontSize: 9, color: colors.textDark, fontWeight: 'bold', marginBottom: 4 }}>
                [{maxThreat.type?.toUpperCase()}] — Confidence: {maxThreat.confidence}%
              </Text>
              <Text style={{ fontSize: 9, color: colors.textMid }}>{maxThreat.action || 'Dispatch authorities immediately'}</Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>CONFIDENTIAL — CrimeLens AI Forensics Platform</Text>
          <Text style={styles.footerText}>Page 1</Text>
        </View>
      </Page>

      {/* Page 2+: Evidence Snapshots */}
      {alerts.filter(a => a.snapshot).length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Captured Evidence Snapshots</Text>
            <Text style={{ fontSize: 8, color: colors.textLight, marginBottom: 15 }}>
              The following frames were automatically captured at the moment each threat was detected by the AI surveillance system.
            </Text>
          </View>

          {alerts.filter(a => a.snapshot).map((alert, i) => (
            <View key={i} style={styles.evidenceCard} wrap={false}>
              <View style={styles.evidenceHeader}>
                <Text style={{ fontSize: 8, fontWeight: 'bold', color: colors.textDark }}>INCIDENT #{i + 1} — {alert.time}</Text>
                <Text style={{ ...styles.badge, backgroundColor: getThreatColor(alert.type) }}>{alert.type}</Text>
              </View>
              {alert.snapshot && <Image style={styles.evidenceImage} src={alert.snapshot} />}
              <View style={styles.evidenceBody}>
                <Text style={{ fontSize: 8, color: colors.textMid, marginBottom: 4 }}>{alert.description}</Text>
                <Text style={{ fontSize: 7, color: colors.textLight }}>Confidence: {alert.confidence}% | Action: {alert.action}</Text>
              </View>
            </View>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>CONFIDENTIAL — CrimeLens AI Forensics Platform</Text>
            <Text style={styles.footerText}>Page 2</Text>
          </View>
        </Page>
      )}
    </Document>
  );
};

export default LiveMonitoringReport;
