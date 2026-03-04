"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HapticButton = void 0;
var Haptics = require("expo-haptics");
var react_1 = require("react");
var react_native_1 = require("react-native");
var HapticButton = function (_a) {
    var children = _a.children, style = _a.style, onPress = _a.onPress, disabled = _a.disabled, props = __rest(_a, ["children", "style", "onPress", "disabled"]);
    var scaleAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    var handlePressIn = function () {
        react_native_1.Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };
    var handlePressOut = function () {
        react_native_1.Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };
    var handlePress = function (event) {
        if (react_native_1.Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        if (onPress) {
            onPress(event);
        }
    };
    return (<react_native_1.TouchableOpacity activeOpacity={0.8} onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} disabled={disabled} style={[{ opacity: disabled ? 0.6 : 1 }]} {...props}>
            <react_native_1.Animated.View style={[
            styles.buttonBase,
            style,
            { transform: [{ scale: scaleAnim }] }
        ]}>
                {children}
            </react_native_1.Animated.View>
        </react_native_1.TouchableOpacity>);
};
exports.HapticButton = HapticButton;
var styles = react_native_1.StyleSheet.create({
    buttonBase: {
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
