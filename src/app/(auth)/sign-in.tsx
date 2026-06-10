import { useAuth, useSignIn } from "@clerk/expo";
import { Href, Link, Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isSignedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [taskRoute, setTaskRoute] = useState<Href | null>(null);

  const fallbackTaskUrls: Partial<Record<string, Href>> = {
    "continue-sign-up": "/sign-up",
    "complete-sign-up": "/sign-up",
    "verify-email-address": "/sign-in",
    "verify-phone-number": "/sign-in",
    "choose-organization": "/",
    "create-organization": "/",
  };

  const getTaskRoute = (taskKey?: string) => {
    if (!taskKey) return "/sign-in" as Href;
    return fallbackTaskUrls[taskKey] ?? ("/sign-in" as Href);
  };

  const router = useRouter();

  const isLoading = fetchStatus === "fetching";

  const onSignInPress = async () => {
    try {
      const { error } = await signIn.password({
        emailAddress: email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              const route = getTaskRoute(session.currentTask.key);
              setTaskRoute(route);
              return;
            }

            const url = decorateUrl("/");
            router.replace(url as Href);
          },
        });
      } else if (signIn.status === "needs_second_factor") {
        // Handle 2FA flow here, e.g., navigate to a 2FA verification screen
        console.log("🚀 ~ onSignInPress ~ signIn:", signIn);
        const { error } = await signIn.mfa.sendPhoneCode();
        if (error) {
          alert(error.message);
          return;
        }
      } else if (signIn.status === "needs_client_trust") {
        // Handle client trust flow here, e.g., navigate to a device trust screen
        console.log("🚀 ~ onSignInPress ~ signIn:", signIn);
        const emailFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === "email_code",
        );
        if (emailFactor) {
          await signIn.mfa.sendEmailCode();
        }
      } else {
        console.log("Error during sign-in: Unhandled sign-in status", signIn);
      }
    } catch (err) {
      console.error("Error during sign-in:", err);
    }
  };

  const onVerifyPress = async () => {
    try {
      const { error } = await signIn.mfa.verifyEmailCode({
        code,
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              const route = getTaskRoute(session.currentTask.key);
              setTaskRoute(route);
              console.log(
                "🚀 ~ onVerifyPress ~ session.currentTask:",
                session.currentTask,
              );
              return;
            }

            const url = decorateUrl("/");
            router.replace(url as Href);
          },
        });
      }
    } catch (err) {
      console.error("Error verifying email code:", err);
    }
  };

  if (signIn.status === "complete" && isSignedIn) {
    // router.replace("/");
    return null;
  }

  if (taskRoute) {
    return <Redirect href={taskRoute} />;
  }

  if (signIn.status === "needs_client_trust") {
    return (
      <View className="flex-1 justify-center items-center px-6 py-12">
        <Link href="/">
          <Image
            source={require("../../../assets/images/logo.png")}
            className="w-32 h-32 mb-6"
            resizeMode="contain"
          />
        </Link>
        <Text className="text-2xl font-bold mb-4">Verify Your Email</Text>
        <Text className="text-gray-600 mb-6 text-center">
          We have sent a verification code to your email address. Please enter
          the code below to complete your sign-up.
        </Text>

        <TextInput
          placeholder="Verification Code"
          className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 placeholder-gray-400 w-full mb-4"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
        />

        {errors.fields.code && (
          <Text className="text-red-500 text-sm mb-4">
            {errors.fields.code?.message}
          </Text>
        )}

        <TouchableOpacity
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-lg w-full"
          disabled={isLoading || code.trim() === ""}
          onPress={onVerifyPress}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-center text-white">Verify Email</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4"
          onPress={() => signIn.mfa.sendEmailCode()}
        >
          <Text className="text-blue-500 font-bold">Resend Code</Text>
        </TouchableOpacity>

        {/* back to signin */}
        <TouchableOpacity
          className="mt-4"
          onPress={() => router.push("/sign-in")}
        >
          <Text className="text-gray-600">
            Back to <Text className="text-blue-500 font-bold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      className="bg-white"
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-center px-6 py-12">
        <Link href="/">
          <Image
            source={require("../../../assets/images/logo.png")}
            className="w-32 h-32 mb-6"
            resizeMode="contain"
          />
        </Link>

        <Text className="text-2xl font-bold mb-4">Welcome Back</Text>
        <Text className="text-gray-600 mb-6">
          Please sign in to your account to continue.
        </Text>

        {/* Sign-in form goes here */}
        <View className="flex-col gap-3 mb-4">
          <TextInput
            placeholder="Email"
            className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 placeholder-gray-400"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          {errors?.fields?.identifier && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.fields.identifier?.message}
            </Text>
          )}

          <TextInput
            placeholder="Password"
            className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 placeholder-gray-400"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {errors?.fields?.password && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.fields.password?.message}
            </Text>
          )}

          <TouchableOpacity
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-lg"
            disabled={isLoading}
            onPress={onSignInPress}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-center text-white">Sign In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/sign-up")}>
              <Text className="text-blue-500 font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View nativeID="clerk-captcha" />
        </View>
      </View>
    </ScrollView>
  );
}
