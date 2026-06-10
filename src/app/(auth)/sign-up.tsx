import { useAuth, useSignUp } from "@clerk/expo";
import { Href, Link, useRouter } from "expo-router";
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

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  const router = useRouter();

  const isLoading = fetchStatus === "fetching";

  const onSignUpPress = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const { error } = await signUp.password({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (!error) {
        const { error: sendError } = await signUp.verifications.sendEmailCode();
        if (sendError) {
          alert(sendError.message);
          return;
        }
      }
    } catch (err) {
      console.error("Error during sign-up:", err);
    }
  };

  const onVerifyPress = async () => {
    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code,
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/");
            router.replace(url as Href);
          },
        });
      }
    } catch (err) {
      console.error("Error verifying email code:", err);
    }
  };

  if (signUp.status === "complete" && isSignedIn) {
    // router.replace("/");
    return null;
  }

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
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
          onPress={() => signUp.verifications.sendEmailCode()}
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

        <Text className="text-2xl font-bold mb-4">Create an Account</Text>
        <Text className="text-gray-600 mb-6">
          Find your dream home today. Sign up to get started with our
          personalized home search and
        </Text>

        {/* Sign-up form goes here */}
        <View className="flex-col gap-3 mb-4">
          <View className="flex-row gap-3">
            <TextInput
              placeholder="First Name"
              className="flex-1 border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 placeholder-gray-400"
              autoCapitalize="words"
              value={firstName}
              onChangeText={setFirstName}
            />

            <TextInput
              placeholder="Last Name"
              className="flex-1 border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 placeholder-gray-400"
              autoCapitalize="words"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <TextInput
            placeholder="Email"
            className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 placeholder-gray-400"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          {errors?.fields?.emailAddress && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.fields.emailAddress?.message}
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

          <TextInput
            placeholder="Confirm Password"
            className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 placeholder-gray-400"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-lg"
            disabled={isLoading}
            onPress={onSignUpPress}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-center text-white">Sign Up</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/sign-in")}>
              <Text className="text-blue-500 font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>

          <View nativeID="clerk-captcha" />
        </View>
      </View>
    </ScrollView>
  );
}
