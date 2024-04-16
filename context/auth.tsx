import { router, useRootNavigationState, useSegments } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Text, View } from "react-native";
import { auth } from "../firebase-config";

type User = {
  uid: string;
  displayName: string;
  photoUrl: string;
  providerId: string;
  createdAt: string;
  lastLoginAt: string;
  email: string;
};
interface ContextInterface {
  user: User | null;
  signIn: Dispatch<SetStateAction<User>>;
  signOut: () => void;
}

const initialState = {
  uid: "",
  createdAt: "",
  displayName: "",
  lastLoginAt: "",
  photoUrl: "",
  providerId: "",
  email: "",
};

const contextInitialState: ContextInterface = {
  user: initialState,
  signIn: () => {},
  signOut: () => {},
};

const AuthContext = createContext(contextInitialState);

export function useAuth(): ContextInterface {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within a provider");
  }

  return context;
}

function useProtectedRoute(user: User) {
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    if (!navigationState.key || hasNavigated) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user.uid && !inAuthGroup) {
      router.replace("/(tabs)/");
      setHasNavigated(true);
    } else if (user.uid && inAuthGroup) {
      router.replace("/(tabs)");
      setHasNavigated(true);
    }
  }, [user.uid, navigationState, segments, hasNavigated]);
}

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const [user, setUser] = useState(initialState);

  useProtectedRoute(user);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const dataWeCareAbout: User = {
          uid: user.providerData[0].uid,
          displayName: user.providerData[0].displayName ?? "",
          photoUrl: user.providerData[0].photoURL ?? "",
          providerId: user.providerData[0].providerId,
          createdAt: user.metadata.creationTime!,
          lastLoginAt: user.metadata.lastSignInTime!,
          email: user.providerData[0].email!,
        };

        console.log(user);
        setUser(dataWeCareAbout);
        // router.replace("/(tabs)");
      }

      console.log("User is not authenticated");
      router.replace("/(tabs)/");
    });
    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn: setUser,
        signOut: () => {
          setUser(initialState);
          signOut(auth);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const Auth = () => {
  return (
    <View>
      <Text>Auth</Text>
    </View>
  );
};

export default Auth;
