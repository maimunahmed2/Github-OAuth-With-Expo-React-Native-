import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { Button } from "react-native";
import { GithubAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/firebase-config";
import { createTokenWithCode } from "@/utils/create-token-with-code";

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint: `https://github.com/settings/connections/applications/${process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID}`,
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: "595c98792cfe3ece270e",
      scopes: ["identity", "user:email", "user:follow"],
      redirectUri: makeRedirectUri({
        scheme: "testauth",
      }),
    },
    discovery
  );

  async function handleResponse() {
    // Verify that everything went well
    if (response?.type === "success") {
      // Here we grab the code from the response
      const { code } = response.params;

      // And use this code to get the access_token
      const { token_type, scope, access_token } = await createTokenWithCode(
        code
      );

      // Just in case we don't have the token return early
      if (!access_token) return;

      // GithubAuthProvider is a class that we can import from 'firebase/auth'
      // We pass the token and it returns a credential
      const credential = GithubAuthProvider.credential(access_token);

      // Finally we use that credential to register the user in Firebase
      const data = await signInWithCredential(auth, credential);
    }
  }

  React.useEffect(() => {
    handleResponse();
  }, [response]);

  return (
    <Button
      disabled={!request}
      title="Login"
      onPress={() => {
        promptAsync();
      }}
    />
  );
}
