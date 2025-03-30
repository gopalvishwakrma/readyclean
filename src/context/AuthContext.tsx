
import React, { createContext, useState, useEffect, useContext } from "react";
import { auth, db, onAuthStateChanged, doc, getDoc } from "../lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { toast } from "../lib/toast";

interface User extends FirebaseUser {
  role?: "user" | "admin";
  fullName?: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();
          
          // Combine Firebase auth user with Firestore data
          const enhancedUser = {
            ...user,
            role: userData?.role || "user",
            fullName: userData?.fullName,
            phone: userData?.phone,
            address: userData?.address
          };
          
          setCurrentUser(enhancedUser);
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Error loading user profile");
          setCurrentUser(user as User);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      isAdmin: currentUser?.role === "admin" || currentUser?.email === "admin@bookhaven.com" && currentUser?.email === "admin@bookhaven.com"
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
