import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme/theme';
import {
  ShieldAlert,
  MessageSquare,
  BarChart2,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Star,
  Shirt,
  Heart,
  Tag,
  RefreshCw,
  Zap,
  Info,
  Calendar,
} from 'lucide-react-native';
import {
  getAdminFeedbacks,
  updateFeedbackStatus,
  getAdminAdsConfig,
  updateAdminAdsConfig,
  getAdminUrlLogs,
  getWardrobeInsights,
} from '../database/adminDb';

export default function AdminDashboardScreen({ onExitAdmin }) {
  const [adminTab, setAdminTab] = useState('feedbacks'); // 'feedbacks' | 'analytics' | 'monetization' | 'security'

  const [feedbacks, setFeedbacks] = useState([]);
  const [adsConfig, setAdsConfig] = useState(null);
  const [urlLogs, setUrlLogs] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (adminTab === 'analytics') {
      loadInsights();
    }
  }, [adminTab]);

  const loadAdminData = async () => {
    setLoading(true);
    const fbList = await getAdminFeedbacks();
    setFeedbacks(fbList);

    const ads = await getAdminAdsConfig();
    setAdsConfig(ads);

    const logs = await getAdminUrlLogs();
    setUrlLogs(logs);

    await loadInsights();
    setLoading(false);
  };

  const loadInsights = async () => {
    const data = await getWardrobeInsights();
    setInsights(data);
  };

  const handleUpdateFeedback = async (id, status) => {
    await updateFeedbackStatus(id, status);
    await loadAdminData();
  };

  const handleToggleBanner = async (val) => {
    const updated = await updateAdminAdsConfig({ banner_enabled: val ? 1 : 0 });
    setAdsConfig(updated);
  };

  const handleToggleRewarded = async (val) => {
    const updated = await updateAdminAdsConfig({ rewarded_enabled: val ? 1 : 0 });
    setAdsConfig(updated);
  };

  const handleChangeFreq = async (freq) => {
    const updated = await updateAdminAdsConfig({ interstitial_freq: freq });
    setAdsConfig(updated);
  };

  return (
    <View style={styles.container}>
      {/* Top Admin Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitBtn} onPress={onExitAdmin}>
          <ArrowLeft size={16} color="#FFF" style={{ marginRight: 4 }} />
          <Text style={styles.exitBtnText}>Exit Admin Mode</Text>
        </TouchableOpacity>

        <View style={styles.adminTitleRow}>
          <ShieldAlert color={COLORS.accentGold} size={18} style={{ marginRight: 6 }} />
          <Text style={styles.adminTitle}>Fullstack Developer Admin</Text>
        </View>

        <TouchableOpacity onPress={loadAdminData} style={styles.refreshBtn}>
          <RefreshCw size={14} color={COLORS.accentCyan} />
        </TouchableOpacity>
      </View>

      {/* Admin Tab Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabItem, adminTab === 'feedbacks' && styles.tabItemActive]}
          onPress={() => setAdminTab('feedbacks')}
        >
          <MessageSquare
            size={14}
            color={adminTab === 'feedbacks' ? COLORS.accentCyan : COLORS.textMuted}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabText, adminTab === 'feedbacks' && styles.tabTextActive]}>
            Feedbacks ({feedbacks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, adminTab === 'analytics' && styles.tabItemActive]}
          onPress={() => setAdminTab('analytics')}
        >
          <BarChart2
            size={14}
            color={adminTab === 'analytics' ? COLORS.primaryLight : COLORS.textMuted}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabText, adminTab === 'analytics' && styles.tabTextActive]}>
            Insights
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, adminTab === 'monetization' && styles.tabItemActive]}
          onPress={() => setAdminTab('monetization')}
        >
          <DollarSign
            size={14}
            color={adminTab === 'monetization' ? COLORS.accentGold : COLORS.textMuted}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabText, adminTab === 'monetization' && styles.tabTextActive]}>
            Ad Monetization
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, adminTab === 'security' && styles.tabItemActive]}
          onPress={() => setAdminTab('security')}
        >
          <ShieldCheck
            size={14}
            color={adminTab === 'security' ? COLORS.accentGreen : COLORS.textMuted}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabText, adminTab === 'security' && styles.tabTextActive]}>
            Security Log
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={COLORS.primaryLight} />
          </View>
        )}

        {/* TAB 1: User Feedbacks Inbox */}
        {adminTab === 'feedbacks' && (
          <View>
            <Text style={styles.sectionHeading}>User Feedbacks & Ratings Inbox</Text>

            {feedbacks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>No user feedbacks submitted yet.</Text>
              </View>
            ) : (
              feedbacks.map((item) => (
                <View key={item.id} style={styles.feedbackCard}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.userInfoRow}>
                      <Text style={styles.userNameText}>{item.user_name || 'Anonymous User'}</Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{item.category}</Text>
                      </View>
                    </View>
                    <View style={styles.ratingRow}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          color={i < item.rating ? COLORS.accentGold : COLORS.textMuted}
                          fill={i < item.rating ? COLORS.accentGold : 'transparent'}
                        />
                      ))}
                    </View>
                  </View>

                  <Text style={styles.commentText}>{item.comment}</Text>
                  <Text style={styles.timestampText}>
                    Submitted on: {new Date(item.created_at).toLocaleString()}
                  </Text>

                  {/* Status Action Buttons */}
                  <View style={styles.actionRow}>
                    <Text style={styles.statusLabel}>Status: {item.status}</Text>
                    {item.status !== 'Resolved' && (
                      <TouchableOpacity
                        style={styles.resolveBtn}
                        onPress={() => handleUpdateFeedback(item.id, 'Resolved')}
                      >
                        <CheckCircle size={12} color="#FFF" style={{ marginRight: 4 }} />
                        <Text style={styles.resolveBtnText}>Mark Resolved</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: Real Local Wardrobe Insights */}
        {adminTab === 'analytics' && insights && (
          <View>
            <Text style={styles.sectionHeading}>My Wardrobe Insights (Real Device SQLite Data)</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Shirt color={COLORS.primaryLight} size={24} />
                <Text style={styles.statNumber}>{insights.totalOutfits}</Text>
                <Text style={styles.statLabel}>Total Outfits Added</Text>
              </View>

              <View style={styles.statCard}>
                <Heart color={COLORS.secondary} size={24} />
                <Text style={styles.statNumber}>{insights.totalSavedLooks}</Text>
                <Text style={styles.statLabel}>Saved Fits Lookbook</Text>
              </View>

              <View style={styles.statCard}>
                <Tag color={COLORS.accentGold} size={24} />
                <Text style={styles.statNumber}>{insights.totalCustomCats}</Text>
                <Text style={styles.statLabel}>Custom Categories</Text>
              </View>

              <View style={styles.statCard}>
                <Calendar color={COLORS.accentCyan} size={24} />
                <Text style={styles.statNumber}>{insights.daysActive} Days</Text>
                <Text style={styles.statLabel}>Wardrobe Active</Text>
              </View>
            </View>

            {/* Popular Fashion Demographics */}
            <View style={styles.detailCard}>
              <Text style={styles.detailCardTitle}>My Personal Style Preferences</Text>
              <View style={styles.demoRow}>
                <Text style={styles.demoLabel}>Top Outfit Category:</Text>
                <Text style={styles.demoValue}>{insights.topCategory}</Text>
              </View>
              <View style={styles.demoRow}>
                <Text style={styles.demoLabel}>Fashion Style Vibe:</Text>
                <Text style={styles.demoValue}>{insights.styleVibe}</Text>
              </View>
              <View style={styles.demoRow}>
                <Text style={styles.demoLabel}>Preferred Fit & Cut:</Text>
                <Text style={styles.demoValue}>{insights.fitPref}</Text>
              </View>
              <View style={styles.demoRow}>
                <Text style={styles.demoLabel}>Favorite Color Palette:</Text>
                <Text style={styles.demoValue}>{insights.favoriteColors}</Text>
              </View>
            </View>
          </View>
        )}

        {/* TAB 3: AdMob Monetization & Ad Revenue Controls */}
        {adminTab === 'monetization' && adsConfig && (
          <View>
            <Text style={styles.sectionHeading}>AdMob Ad Revenue & Monetization Pre-Wiring</Text>

            {/* Setup Notice Card */}
            <View style={styles.noticeCard}>
              <Info size={20} color={COLORS.accentGold} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle}>AdMob SDK Setup Notice</Text>
                <Text style={styles.noticeText}>
                  AdMob revenue tracking will activate once the Google AdMob SDK is connected with real developer Ad Unit IDs.
                </Text>
              </View>
            </View>

            {/* Live Ad Controls */}
            <Text style={styles.sectionHeading}>Ad Placement Controls</Text>

            <View style={styles.controlCard}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Bottom Fitting Banner Ads</Text>
                  <Text style={styles.switchDesc}>Pre-wired toggle to display AdMob banner at studio bottom</Text>
                </View>
                <Switch
                  value={adsConfig.banner_enabled === 1}
                  onValueChange={handleToggleBanner}
                  trackColor={{ false: '#333', true: COLORS.primary }}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Rewarded Video Ads for Avatars</Text>
                  <Text style={styles.switchDesc}>Pre-wired toggle for rewarded video views on premium 3D models</Text>
                </View>
                <Switch
                  value={adsConfig.rewarded_enabled === 1}
                  onValueChange={handleToggleRewarded}
                  trackColor={{ false: '#333', true: COLORS.accentGreen }}
                />
              </View>

              {/* Interstitial Frequency Selection */}
              <Text style={styles.switchTitle}>Full-Screen Interstitial Ad Frequency</Text>
              <Text style={styles.switchDesc}>Pre-wired trigger to show ad after every N saved fits:</Text>
              <View style={styles.freqRow}>
                {[1, 2, 3, 5].map((freq) => {
                  const isSelected = adsConfig.interstitial_freq === freq;
                  return (
                    <TouchableOpacity
                      key={freq}
                      style={[styles.freqChip, isSelected && styles.freqChipActive]}
                      onPress={() => handleChangeFreq(freq)}
                    >
                      <Text style={[styles.freqChipText, isSelected && styles.freqChipTextActive]}>
                        Every {freq} Fits
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* TAB 4: Steganography & Security URL Inspection Shield */}
        {adminTab === 'security' && (
          <View>
            <Text style={styles.sectionHeading}>Anti-Steganography & URL Security Shield</Text>
            <Text style={styles.subHeading}>
              Inspect imported image URLs for steganography payloads, executable file extensions, and SQLi syntax.
            </Text>

            {urlLogs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>No imported URL logs recorded.</Text>
              </View>
            ) : (
              urlLogs.map((log) => (
                <View key={log.id} style={styles.securityCard}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.domainText}>{log.domain}</Text>
                    <View
                      style={[
                        styles.riskBadge,
                        log.risk_level === 'HIGH'
                          ? styles.riskHigh
                          : log.risk_level === 'MEDIUM'
                          ? styles.riskMedium
                          : styles.riskSafe,
                      ]}
                    >
                      <Text style={styles.riskBadgeText}>{log.risk_level} RISK</Text>
                    </View>
                  </View>

                  <Text style={styles.urlText} numberOfLines={2}>
                    {log.url}
                  </Text>

                  {/* Threat Flags */}
                  <View style={styles.flagsBox}>
                    <Text style={styles.flagsHeader}>Inspection Flags:</Text>
                    {log.flags &&
                      log.flags.map((flag, idx) => (
                        <Text key={idx} style={styles.flagItemText}>
                          • {flag}
                        </Text>
                      ))}
                  </View>

                  <View style={styles.actionRow}>
                    <Text style={styles.statusLabel}>Status: {log.status}</Text>
                    {log.status === 'Flagged' ? (
                      <TouchableOpacity style={styles.blockBtn}>
                        <XCircle size={12} color="#FFF" style={{ marginRight: 4 }} />
                        <Text style={styles.blockBtnText}>Blocked Domain</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.safeBtn}>
                        <ShieldCheck size={12} color="#000" style={{ marginRight: 4 }} />
                        <Text style={styles.safeBtnText}>Verified Clean</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  loadingBox: {
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGlass,
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  exitBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  adminTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminTitle: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 14,
  },
  refreshBtn: {
    padding: 6,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGlass,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accentGold,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: SPACING.md,
  },
  sectionHeading: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  subHeading: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: SPACING.md,
  },
  emptyCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  emptyCardText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  feedbackCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginBottom: SPACING.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 14,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  categoryBadgeText: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
  },
  commentText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 6,
  },
  timestampText: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGlass,
  },
  statusLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  resolveBtn: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  resolveBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginBottom: SPACING.sm,
  },
  statNumber: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  detailCardTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGlass,
  },
  demoLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  demoValue: {
    color: COLORS.accentGold,
    fontSize: 12,
    fontWeight: '700',
  },
  noticeCard: {
    backgroundColor: 'rgba(253, 203, 110, 0.12)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(253, 203, 110, 0.4)',
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noticeTitle: {
    color: COLORS.accentGold,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  noticeText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  controlCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGlass,
  },
  switchTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  switchDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  freqRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  freqChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  freqChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  freqChipText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  freqChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  securityCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginBottom: SPACING.md,
  },
  domainText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  riskSafe: {
    backgroundColor: 'rgba(46, 213, 115, 0.2)',
  },
  riskMedium: {
    backgroundColor: 'rgba(253, 203, 110, 0.2)',
  },
  riskHigh: {
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
  },
  riskBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  urlText: {
    color: COLORS.accentCyan,
    fontSize: 11,
    marginVertical: 4,
  },
  flagsBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: SPACING.xs + 4,
    borderRadius: RADIUS.sm,
    marginVertical: 6,
  },
  flagsHeader: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  flagItemText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  blockBtn: {
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  blockBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  safeBtn: {
    backgroundColor: COLORS.accentGreen,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  safeBtnText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
});
