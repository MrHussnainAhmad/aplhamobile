import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";

const APP_NAME = "SSC";
const APP_VERSION = "0.1.0";
const DEVELOPER_NAME = "Hussnain Ahmad";
const DEVELOPER_PORTFOLIO = "https://hussnainahmad.vercel.app/";
const DEVELOPER_WHATSAPP =
  "https://wa.me/923301039076?text=Hello%2C%20I%20am%20the%20owner%20of%20SSC%2C%20the%20app%20you%20developed%2C%20and%20I%20need%20urgent%20help%21";
const BACKEND_DEPLOYMENT = "https://superior.up.railway.app/";

const SystemDetailScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconWrap}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>System Information</Text>
        <View style={styles.iconWrap} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* App Card Section */}
        <View style={styles.card}>
          <View style={styles.appHeader}>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>{APP_NAME}</Text>
              <Text style={styles.appDesc}>Superior Science College</Text>
            </View>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>v{APP_VERSION}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>App Name</Text>
            <Text style={styles.detailValue}>{APP_NAME}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>App Version</Text>
            <Text style={styles.detailValue}>{APP_VERSION}</Text>
          </View>
        </View>

        {/* Developer Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Developer Information</Text>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{DEVELOPER_NAME}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Portfolio</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(DEVELOPER_PORTFOLIO)}
            >
              <Text style={styles.linkText} numberOfLines={1}>
                Visit Website
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Urgent Contact</Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => Linking.openURL(DEVELOPER_WHATSAPP)}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
              <Text style={styles.ctaText}></Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Backend Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Backend Service</Text>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Deployment</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(BACKEND_DEPLOYMENT)}
              style={styles.linkContainer}
            >
              <Text style={styles.linkText} numberOfLines={1}>
                View Deployment
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#4F46E5",
    paddingTop: Platform.select({ ios: 60, android: 50, default: 55 }),
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  appInfo: {
    flexDirection: "column",
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: 0.25,
  },
  appDesc: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  versionBadge: {
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  versionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7C3AED",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1E293B",
    flex: 1,
    textAlign: "right",
  },
  linkContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  linkText: {
    fontSize: 15,
    color: "#4F46E5",
    fontWeight: "600",
    paddingVertical: 4,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 50,
  },
  ctaButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default SystemDetailScreen;
