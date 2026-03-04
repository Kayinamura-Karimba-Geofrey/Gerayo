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
exports.AnimatedScreen = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var AnimatedScreen = function (_a) {
    var children = _a.children, _b = _a.duration, duration = _b === void 0 ? 300 : _b, style = _a.style, props = __rest(_a, ["children", "duration", "style"]);
    var fadeAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.timing(fadeAnim, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim, duration]);
    return (<react_native_safe_area_context_1.SafeAreaView style={[styles.container, style]} {...props}>
            <react_native_1.Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                {children}
            </react_native_1.Animated.View>
        </react_native_safe_area_context_1.SafeAreaView>);
};
exports.AnimatedScreen = AnimatedScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
    },
});
