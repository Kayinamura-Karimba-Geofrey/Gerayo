"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatingFooter = void 0;
var expo_linear_gradient_1 = require("expo-linear-gradient");
var expo_router_1 = require("expo-router");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
// ─── Tab config — single source of truth ─────────────────────────────────────
var TABS = [
    {
        key: "home",
        label: "Home",
        route: "/",
        icon: require("../assets/images/material-symbols_home-outline-rounded.png"),
    },
    {
        key: "your-cars",
        label: "Your Car",
        route: "/your-cars",
        icon: require("../assets/images/car_icon.png"),
    },
    {
        key: "appointment",
        label: "Appointment",
        route: "/schedule-appointment",
        icon: require("../assets/images/mdi_calendar-outline.png"),
    },
    {
        key: "management",
        label: "Management",
        route: "/management",
        icon: require("../assets/images/material-symbols_settings-outline-rounded.png"),
    },
];
// ─── Single animated tab item ─────────────────────────────────────────────────
var TabItem = function (_a) {
    var tab = _a.tab, isActive = _a.isActive, onPress = _a.onPress, entryDelay = _a.entryDelay;
    // Scale for press feedback
    var pressScale = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    // Scale for the active indicator blob (grows in when active)
    var activeScale = (0, react_1.useRef)(new react_native_1.Animated.Value(isActive ? 1 : 0)).current;
    // Opacity for the icon/text (entry animation)
    var entryOpacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var entryY = (0, react_1.useRef)(new react_native_1.Animated.Value(12)).current;
    // ── Entry animation (staggered slide-up + fade-in) ──────────────────────
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.parallel([
            react_native_1.Animated.timing(entryOpacity, {
                toValue: 1,
                duration: 400,
                delay: entryDelay,
                useNativeDriver: true,
            }),
            react_native_1.Animated.spring(entryY, {
                toValue: 0,
                tension: 80,
                friction: 10,
                delay: entryDelay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);
    // ── Active indicator: scale in/out when tab changes ─────────────────────
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.spring(activeScale, {
            toValue: isActive ? 1 : 0,
            tension: 200,
            friction: 12,
            useNativeDriver: true,
        }).start();
    }, [isActive]);
    // ── Press handlers: quick scale-down + spring back ───────────────────────
    var handlePressIn = function () {
        react_native_1.Animated.spring(pressScale, {
            toValue: 0.85,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };
    var handlePressOut = function () {
        react_native_1.Animated.spring(pressScale, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };
    return (<react_native_1.Pressable style={styles.footerItem} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} android_ripple={{
            color: "rgba(255,255,255,0.08)",
            borderless: true,
            radius: 36,
        }}>
      {/* Staggered entry wrapper */}
      <react_native_1.Animated.View style={{
            alignItems: "center",
            opacity: entryOpacity,
            transform: [{ translateY: entryY }, { scale: pressScale }],
        }}>
        {/* Icon container with animated active background */}
        <react_native_1.View style={styles.iconWrapper}>
          {/* Active gradient background — scales in/out */}
          <react_native_1.Animated.View style={[
            styles.activeBackground,
            { transform: [{ scale: activeScale }], opacity: activeScale },
        ]}>
            <expo_linear_gradient_1.LinearGradient colors={["#3B6CF2", "#5D5FEF", "#7B4DFF"]} locations={[0, 0.5, 1]} style={react_native_1.StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}/>
          </react_native_1.Animated.View>

          {/* The icon itself — tint animates via JS (simple toggle) */}
          <react_native_1.Image source={tab.icon} style={[styles.icon, { tintColor: isActive ? "#FFF" : "#555" }]} resizeMode="contain"/>
        </react_native_1.View>

        {/* Label */}
        <react_native_1.Text style={[styles.footerText, isActive && styles.activeFooterText]}>
          {tab.label}
        </react_native_1.Text>

        {/* Active dot indicator at the bottom */}
        <react_native_1.Animated.View style={[
            styles.activeDot,
            { transform: [{ scale: activeScale }], opacity: activeScale },
        ]}/>
      </react_native_1.Animated.View>
    </react_native_1.Pressable>);
};
// ─── Main FloatingFooter ──────────────────────────────────────────────────────
var FloatingFooter = function (_a) {
    var activeTab = _a.activeTab;
    var insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    // Footer itself slides up from off-screen on mount
    var footerY = (0, react_1.useRef)(new react_native_1.Animated.Value(100)).current;
    var footerOpacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.parallel([
            react_native_1.Animated.timing(footerOpacity, {
                toValue: 1,
                duration: 400,
                delay: 100,
                useNativeDriver: true,
            }),
            react_native_1.Animated.spring(footerY, {
                toValue: 0,
                tension: 60,
                friction: 12,
                delay: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);
    return (<react_native_1.Animated.View style={[
            styles.footer,
            {
                bottom: 20 + insets.bottom,
                opacity: footerOpacity,
                transform: [{ translateY: footerY }],
            },
        ]}>
      {/* Subtle inner top border highlight — gives a glass-like depth */}
      <react_native_1.View style={styles.innerTopHighlight}/>

      {TABS.map(function (tab, index) { return (<TabItem key={tab.key} tab={tab} isActive={activeTab === tab.key} onPress={function () { return expo_router_1.router.push(tab.route); }} entryDelay={index * 60} // each tab staggers 60ms apart
        />); })}
    </react_native_1.Animated.View>);
};
exports.FloatingFooter = FloatingFooter;
// ─── Styles ───────────────────────────────────────────────────────────────────
var styles = react_native_1.StyleSheet.create({
    footer: {
        position: "absolute",
        left: "50%",
        marginLeft: -172,
        width: 344,
        height: 72,
        // Slightly deeper dark for a premium feel
        backgroundColor: "#0F1422",
        borderRadius: 20, // ← rounder = more modern
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: 8,
        // Rich multi-layer shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 20,
        overflow: "visible",
    },
    // Thin top edge highlight to simulate glass refraction
    innerTopHighlight: {
        position: "absolute",
        top: 0,
        left: 24,
        right: 24,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.10)",
        borderRadius: 1,
    },
    footerItem: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        paddingVertical: 6,
    },
    // Relative container so the gradient bg sits behind the icon
    iconWrapper: {
        width: 46,
        height: 38,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 3,
        overflow: "hidden", // clips the gradient within the rounded box
    },
    // Gradient background that scales in when active
    activeBackground: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { borderRadius: 12, overflow: "hidden" }),
    icon: {
        width: 22,
        height: 22,
        zIndex: 1, // icon stays above the gradient layer
    },
    footerText: {
        fontFamily: "Cairo",
        color: "rgba(255,255,255,0.38)",
        fontSize: 9.5,
        textAlign: "center",
        letterSpacing: 0.2,
    },
    activeFooterText: {
        fontFamily: "CairoMedium",
        color: "#FFFFFF",
        opacity: 1,
    },
    // Small glowing dot under the active label
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#7B4DFF",
        marginTop: 3,
        shadowColor: "#7B4DFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 4,
    },
});
