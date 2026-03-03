import {
  Cairo_500Medium,
  Cairo_700Bold,
  useFonts,
} from "@expo-google-fonts/cairo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { AnimatedScreen } from "../../components/AnimatedScreen";
import { HapticButton } from "../../components/HapticButton";

// ── Facebook-style floating label input ──────────────────────────────────────
interface FBFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
  hasError: boolean;
  errorText?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  maxLength?: number;
  returnKeyType?: "next" | "done";
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput>;
  rightSlot?: React.ReactNode;
  prefix?: React.ReactNode;
  entranceDelay?: number;
  h: (n: number) => number;
  moderateScale: (n: number, f?: number) => number;
}

function FBField({
  label,
  value,
  onChangeText,
  onFocus,
  onBlur,
  isFocused,
  hasError,
  errorText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  maxLength,
  returnKeyType = "next",
  onSubmitEditing,
  inputRef,
  rightSlot,
  prefix,
  entranceDelay = 0,
  h,
  moderateScale,
}: FBFieldProps) {
  const labelAnim = useRef(
    new Animated.Value(value.length > 0 ? 1 : 0),
  ).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const prevError = useRef("");
  const hasValue = value.length > 0;

  // Staggered entrance slide-up + fade
  React.useEffect(() => {
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 340,
      delay: entranceDelay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  // Float label when focused or filled — exactly like Facebook
  React.useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isFocused || hasValue ? 1 : 0,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [isFocused, hasValue]);

  // Border: idle=#CDD1D4  focused=#1877F2  error=#FA3E3E
  React.useEffect(() => {
    const to = hasError ? 2 : isFocused ? 1 : 0;
    Animated.timing(borderAnim, {
      toValue: to,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [isFocused, hasError]);

  // One-time shake when a new error arrives
  React.useEffect(() => {
    if (hasError && errorText && errorText !== prevError.current) {
      prevError.current = errorText;
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 6,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -6,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 4,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -4,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 30,
          useNativeDriver: true,
        }),
      ]).start();
    }
    if (!hasError) prevError.current = "";
  }, [hasError, errorText]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ["#CDD1D4", "#1877F2", "#FA3E3E"],
  });
  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [h(15), h(5)],
  });
  const labelSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [moderateScale(15), moderateScale(11)],
  });
  const labelColor = borderAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ["#90949C", "#1877F2", "#FA3E3E"],
  });
  const entranceY = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  return (
    <Animated.View
      style={{ opacity: entranceAnim, transform: [{ translateY: entranceY }] }}
    >
      <Animated.View
        style={[
          styles.fbField,
          {
            borderColor,
            height: h(52),
            transform: [{ translateX: shakeAnim }],
          },
        ]}
      >
        {prefix && <View style={{ height: h(52) }}>{prefix}</View>}

        <View style={styles.fbFieldInner}>
          {/* Floating label — only when no prefix */}
          {!prefix && (
            <Animated.Text
              style={[
                styles.fbLabel,
                { top: labelTop, fontSize: labelSize, color: labelColor },
              ]}
              pointerEvents="none"
            >
              {label}
            </Animated.Text>
          )}
          {/* Static mini label alongside phone prefix */}
          {prefix && (
            <Text
              style={[styles.fbLabelStatic, { fontSize: moderateScale(11) }]}
            >
              {label}
            </Text>
          )}
          <TextInput
            ref={inputRef}
            style={[
              styles.fbInput,
              {
                fontSize: moderateScale(16),
                paddingTop: prefix ? h(4) : h(22),
                paddingBottom: h(6),
              },
            ]}
            value={value}
            onChangeText={onChangeText}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder=""
            placeholderTextColor="transparent"
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            selectionColor="#1877F2"
            cursorColor="#1877F2"
          />
        </View>

        {rightSlot && <View style={styles.fbFieldRight}>{rightSlot}</View>}
      </Animated.View>

      {hasError && errorText ? (
        <Text style={[styles.fbErrorText, { fontSize: moderateScale(12) }]}>
          {errorText}
        </Text>
      ) : null}
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Cairo_500Medium, Cairo_700Bold });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [touched, setTouched] = useState({
    fullName: false,
    phone: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const buttonScale = useRef(new Animated.Value(1)).current;
  const checkboxScale = useRef(new Animated.Value(1)).current;

  // Facebook-style: short, friendly messages; no strength bars or icons
  const validateFullName = (v: string) =>
    v.length > 0 && v.trim().length < 3
      ? "Enter your full name (at least 3 characters)"
      : "";
  const validatePhone = (v: string) =>
    v.length > 0 && !/^07\d{8}$/.test(v)
      ? "Enter a valid Rwanda mobile number"
      : "";
  const validateEmail = (v: string) =>
    v.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? "Enter a valid email address"
      : "";
  const validatePassword = (v: string) =>
    v.length > 0 && v.length < 6
      ? "Your password must be at least 6 characters"
      : "";
  const validateConfirmPassword = (v: string) =>
    v.length > 0 && v !== password
      ? "Your passwords don't match. Try again."
      : "";

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFocusedField(null);
    let err = "";
    if (field === "fullName") err = validateFullName(fullName);
    else if (field === "phone") err = validatePhone(phone);
    else if (field === "email") err = validateEmail(email);
    else if (field === "password") err = validatePassword(password);
    else if (field === "confirmPassword")
      err = validateConfirmPassword(confirmPassword);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  React.useEffect(() => {
    if (touched.confirmPassword)
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(confirmPassword),
      }));
  }, [password, touched.confirmPassword]);

  const isFormValid =
    fullName.trim().length >= 3 &&
    /^07\d{8}$/.test(phone) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 6 &&
    confirmPassword === password;

  const h = (size: number) => (size / 812) * screenHeight;
  const w = (size: number) => (size / 375) * screenWidth;
  const moderateScale = (size: number, factor = 0.5) =>
    size + (h(size) - size) * factor;

  if (!fontsLoaded)
    return <View style={{ flex: 1, backgroundColor: "#1a1a3a" }} />;

  const handleScroll = (e: any) =>
    setScrolled(e.nativeEvent.contentOffset.y > 10);

  const handleRegister = () => {
    // Reveal all errors simultaneously — Facebook behaviour
    setTouched({
      fullName: true,
      phone: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    setErrors({
      fullName: validateFullName(fullName),
      phone: validatePhone(phone),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
    });
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 220,
        friction: 6,
      }),
    ]).start(() => {
      if (isFormValid) router.push("/(auth)/verify-phone");
    });
  };

  const toggleRememberMe = () => {
    Animated.sequence([
      Animated.timing(checkboxScale, {
        toValue: 0.72,
        duration: 65,
        useNativeDriver: true,
      }),
      Animated.spring(checkboxScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 260,
        friction: 6,
      }),
    ]).start();
    setRememberMe(!rememberMe);
  };

  const dynamicStyles = {
    formContainer: {
      borderTopLeftRadius: scrolled ? 0 : h(56),
      borderTopRightRadius: scrolled ? 0 : h(56),
      minHeight: screenHeight - h(100),
    },
    headerText: {
      fontSize: moderateScale(40),
      height: moderateScale(30),
      lineHeight: moderateScale(30),
    },
  };

  const fieldHasError = (f: keyof typeof errors) => touched[f] && !!errors[f];

  return (
    <LinearGradient
      colors={["#1A1458", "#054B8D"]}
      locations={[0.68, 1]}
      style={styles.container}
    >
      <AnimatedScreen>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <StatusBar style="light" />

          <View style={[styles.header, { top: h(30) }]}>
            <Text style={[styles.headerTitle, dynamicStyles.headerText]}>
              Gerayo
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.mainScroll, { paddingTop: h(100) }]}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <View style={[styles.formContainer, dynamicStyles.formContainer]}>
              <View
                style={[
                  styles.scrollContent,
                  { paddingTop: h(24), paddingBottom: h(20) },
                ]}
              >
                <Text
                  style={[
                    styles.formTitle,
                    { fontSize: moderateScale(24), marginBottom: h(20) },
                  ]}
                >
                  Create Account
                </Text>

                <View style={[styles.inputGroup, { gap: h(14) }]}>
                  <FBField
                    label="Full name"
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setFocusedField("fullName")}
                    onBlur={() => handleBlur("fullName")}
                    isFocused={focusedField === "fullName"}
                    hasError={fieldHasError("fullName")}
                    errorText={errors.fullName}
                    returnKeyType="next"
                    onSubmitEditing={() => phoneRef.current?.focus()}
                    entranceDelay={60}
                    h={h}
                    moderateScale={moderateScale}
                  />

                  <FBField
                    label="Phone number"
                    value={phone}
                    onChangeText={setPhone}
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => handleBlur("phone")}
                    isFocused={focusedField === "phone"}
                    hasError={fieldHasError("phone")}
                    errorText={errors.phone}
                    keyboardType="phone-pad"
                    maxLength={10}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    inputRef={phoneRef}
                    entranceDelay={120}
                    h={h}
                    moderateScale={moderateScale}
                    prefix={
                      <TouchableOpacity
                        style={[
                          styles.countryCode,
                          { height: h(52), width: w(80) },
                        ]}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.countryCodeText,
                            { fontSize: moderateScale(15) },
                          ]}
                        >
                          RW
                        </Text>
                        <Ionicons
                          name="chevron-down"
                          size={moderateScale(14)}
                          color="#fff"
                        />
                      </TouchableOpacity>
                    }
                  />

                  <FBField
                    label="Email address"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => handleBlur("email")}
                    isFocused={focusedField === "email"}
                    hasError={fieldHasError("email")}
                    errorText={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    inputRef={emailRef}
                    entranceDelay={180}
                    h={h}
                    moderateScale={moderateScale}
                  />

                  {/* Password — "Show"/"Hide" text label exactly like Facebook */}
                  <FBField
                    label="New password"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => handleBlur("password")}
                    isFocused={focusedField === "password"}
                    hasError={fieldHasError("password")}
                    errorText={errors.password}
                    secureTextEntry={!showPassword}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmRef.current?.focus()}
                    inputRef={passwordRef}
                    entranceDelay={240}
                    h={h}
                    moderateScale={moderateScale}
                    rightSlot={
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
                        activeOpacity={0.6}
                      >
                        <Text
                          style={[
                            styles.showHideText,
                            { fontSize: moderateScale(14) },
                          ]}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </Text>
                      </TouchableOpacity>
                    }
                  />

                  <FBField
                    label="Confirm password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => handleBlur("confirmPassword")}
                    isFocused={focusedField === "confirmPassword"}
                    hasError={fieldHasError("confirmPassword")}
                    errorText={errors.confirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    returnKeyType="done"
                    inputRef={confirmRef}
                    entranceDelay={300}
                    h={h}
                    moderateScale={moderateScale}
                    rightSlot={
                      <TouchableOpacity
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
                        activeOpacity={0.6}
                      >
                        <Text
                          style={[
                            styles.showHideText,
                            { fontSize: moderateScale(14) },
                          ]}
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </Text>
                      </TouchableOpacity>
                    }
                  />
                </View>

                <View
                  style={[
                    styles.optionsRow,
                    { marginTop: h(14), marginBottom: h(22) },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.rememberMe}
                    onPress={toggleRememberMe}
                    activeOpacity={0.7}
                  >
                    <Animated.View
                      style={[
                        styles.checkbox,
                        { width: moderateScale(18), height: moderateScale(18) },
                        rememberMe && styles.checkboxChecked,
                        { transform: [{ scale: checkboxScale }] },
                      ]}
                    >
                      {rememberMe && (
                        <Ionicons
                          name="checkmark"
                          size={moderateScale(12)}
                          color="#fff"
                        />
                      )}
                    </Animated.View>
                    <Text
                      style={[
                        styles.optionText,
                        { fontSize: moderateScale(14) },
                      ]}
                    >
                      Remember Me
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.forgotPassword,
                        { fontSize: moderateScale(14) },
                      ]}
                    >
                      Forgot Password
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Always solid Facebook blue — no opacity dimming ever */}
                <Animated.View
                  style={{
                    transform: [{ scale: buttonScale }],
                    alignSelf: "center",
                  }}
                >
                  <HapticButton
                    style={[
                      styles.primaryButton,
                      { height: h(46), width: w(260), marginBottom: h(20) },
                    ]}
                    onPress={handleRegister}
                  >
                    <Text
                      style={[
                        styles.primaryButtonText,
                        { fontSize: moderateScale(16) },
                      ]}
                    >
                      Create Account
                    </Text>
                  </HapticButton>
                </Animated.View>

                <View
                  style={[styles.dividerContainer, { marginBottom: h(12) }]}
                >
                  <Text
                    style={[
                      styles.dividerText,
                      { fontSize: moderateScale(20) },
                    ]}
                  >
                    Continue with
                  </Text>
                </View>

                <View
                  style={[
                    styles.socialContainer,
                    { gap: w(20), marginBottom: h(24) },
                  ]}
                >
                  <HapticButton
                    style={[
                      styles.socialButton,
                      { width: h(44), height: h(44), borderRadius: h(22) },
                    ]}
                  >
                    <Ionicons
                      name="logo-google"
                      size={moderateScale(20)}
                      color="#FFF"
                    />
                  </HapticButton>
                  <HapticButton
                    style={[
                      styles.socialButton,
                      { width: h(44), height: h(44), borderRadius: h(22) },
                    ]}
                  >
                    <Ionicons
                      name="logo-apple"
                      size={moderateScale(20)}
                      color="#FFF"
                    />
                  </HapticButton>
                </View>

                <View style={styles.loginContainer}>
                  <Text
                    style={[styles.loginText, { fontSize: moderateScale(14) }]}
                  >
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/login")}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.loginLink,
                        { fontSize: moderateScale(14) },
                      ]}
                    >
                      Login.
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </AnimatedScreen>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  headerTitle: {
    fontFamily: "Cairo_500Medium",
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "center",
  },
  mainScroll: { flexGrow: 1 },
  formContainer: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  scrollContent: { paddingHorizontal: 32 },
  formTitle: {
    fontFamily: "Cairo_700Bold",
    color: "#1A1A2E",
    textAlign: "center",
  },
  inputGroup: {},

  // ── Facebook-style field ───────────────────────────────────────────────────
  // Subtle grey background, thin 1px border, rounded corners.
  // No box-shadow ring on focus — border color change only.
  fbField: {
    width: "100%",
    maxWidth: 296,
    alignSelf: "center",
    backgroundColor: "#F5F6F7",
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  fbFieldInner: { flex: 1, position: "relative", justifyContent: "center" },
  fbLabel: {
    position: "absolute",
    left: 14,
    fontFamily: "Cairo_500Medium",
    zIndex: 1,
  },
  fbLabelStatic: {
    color: "#90949C",
    fontFamily: "Cairo_500Medium",
    paddingLeft: 12,
    paddingTop: 4,
  },
  fbInput: {
    fontFamily: "Cairo_500Medium",
    color: "#1C1E21",
    paddingHorizontal: 14,
    width: "100%",
  } as any,
  fbFieldRight: {
    paddingRight: 14,
    paddingLeft: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  showHideText: { color: "#1877F2", fontFamily: "Cairo_700Bold" },
  fbErrorText: {
    color: "#FA3E3E",
    fontFamily: "Cairo_500Medium",
    marginTop: 5,
    paddingHorizontal: 2,
    alignSelf: "center",
    width: "100%",
    maxWidth: 296,
  },

  // Phone prefix
  countryCode: {
    backgroundColor: "#0056b3",
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  countryCodeText: { color: "#fff", fontFamily: "Cairo_500Medium" },

  // Options
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: 296,
    alignSelf: "center",
  },
  rememberMe: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: {
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#0056b3",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: { backgroundColor: "#0056b3" },
  optionText: { color: "#888", fontFamily: "Cairo_500Medium" },
  forgotPassword: { color: "#0056b3", fontFamily: "Cairo_700Bold" },

  // Button — solid Facebook blue always
  primaryButton: {
    backgroundColor: "#1877F2",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1877F2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: { color: "#fff", fontFamily: "Cairo_700Bold" },

  // Social
  dividerContainer: { alignItems: "center" },
  dividerText: { color: "#ADADAD", fontFamily: "Cairo_500Medium" },
  socialContainer: { flexDirection: "row", justifyContent: "center" },
  socialButton: {
    backgroundColor: "#0056b3",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0056b3",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },

  // Login
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: { color: "#ADADAD", fontFamily: "Cairo_500Medium" },
  loginLink: { color: "#0056b3", fontFamily: "Cairo_700Bold" },
});
