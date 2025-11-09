import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

interface PromoCode {
  code: string;
  type: 'lifetime' | 'monthly' | 'yearly';
  used: boolean;
  usedBy?: string;
  usedAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

interface SubscriptionState {
  isPremium: boolean;
  isPromoUser: boolean;
  promoCode: string | null;
  promoType: 'lifetime' | 'monthly' | 'yearly' | null;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  
  initializePurchases: (userId: string) => Promise<void>;
  checkPremiumStatus: () => Promise<boolean>;
  purchasePackage: (packageId: string) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  
  // Promo code functions
  redeemPromoCode: (code: string, userId: string) => Promise<{ success: boolean; message: string }>;
  validatePromoCode: (code: string) => Promise<{ valid: boolean; type?: string; message: string }>;
  
  setPremium: (isPremium: boolean) => void;
  clearSubscriptionData: () => void;
}

const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isPremium: false,
      isPromoUser: false,
      promoCode: null,
      promoType: null,
      customerInfo: null,
      offerings: null,

      initializePurchases: async (userId: string) => {
        try {
          console.log('Initializing RevenueCat for user:', userId);
          
          // Configure RevenueCat
          // IMPORTANT: Replace with your actual RevenueCat API keys
          const REVENUECAT_API_KEY = __DEV__ 
            ? 'your_dev_api_key_here'  // Development key
            : 'your_prod_api_key_here'; // Production key

          await Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
          
          // Get customer info
          const customerInfo = await Purchases.getCustomerInfo();
          set({ customerInfo });

          // Check if user has active subscription
          const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
          set({ isPremium });

          // Get available offerings
          const offerings = await Purchases.getOfferings();
          if (offerings.current !== null) {
            set({ offerings: offerings.current });
          }

          console.log('✅ RevenueCat initialized successfully');
          return;
        } catch (error) {
          console.error('❌ Error initializing RevenueCat:', error);
          throw error;
        }
      },

      checkPremiumStatus: async () => {
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
          
          set({ customerInfo, isPremium });
          return isPremium;
        } catch (error) {
          console.error('Error checking premium status:', error);
          return false;
        }
      },

      purchasePackage: async (packageId: string) => {
        try {
          const { offerings } = get();
          if (!offerings) {
            throw new Error('No offerings available');
          }

          const packageToPurchase = offerings.availablePackages.find(
            pkg => pkg.identifier === packageId
          );

          if (!packageToPurchase) {
            throw new Error('Package not found');
          }

          const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
          const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
          
          set({ customerInfo, isPremium });
          return isPremium;
        } catch (error: any) {
          console.error('Error purchasing package:', error);
          if (error.userCancelled) {
            console.log('User cancelled purchase');
          }
          return false;
        }
      },

      restorePurchases: async () => {
        try {
          const customerInfo = await Purchases.restorePurchases();
          const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
          
          set({ customerInfo, isPremium });
          return isPremium;
        } catch (error) {
          console.error('Error restoring purchases:', error);
          return false;
        }
      },

      validatePromoCode: async (code: string) => {
        try {
          const codeDoc = await getDoc(doc(db, 'promoCodes', code.toUpperCase()));
          
          if (!codeDoc.exists()) {
            return { valid: false, message: 'Invalid promo code' };
          }

          const promoData = codeDoc.data() as PromoCode;

          if (promoData.used) {
            return { valid: false, message: 'This code has already been used' };
          }

          if (promoData.expiresAt && new Date() > new Date(promoData.expiresAt)) {
            return { valid: false, message: 'This code has expired' };
          }

          return { 
            valid: true, 
            type: promoData.type,
            message: `Valid ${promoData.type} access code!` 
          };
        } catch (error) {
          console.error('Error validating promo code:', error);
          return { valid: false, message: 'Error validating code' };
        }
      },

      redeemPromoCode: async (code: string, userId: string) => {
        try {
          const upperCode = code.toUpperCase();
          const codeRef = doc(db, 'promoCodes', upperCode);
          const codeDoc = await getDoc(codeRef);
          
          if (!codeDoc.exists()) {
            return { success: false, message: 'Invalid promo code' };
          }

          const promoData = codeDoc.data() as PromoCode;

          if (promoData.used) {
            return { success: false, message: 'This code has already been used' };
          }

          if (promoData.expiresAt && new Date() > new Date(promoData.expiresAt)) {
            return { success: false, message: 'This code has expired' };
          }

          // Mark code as used
          await updateDoc(codeRef, {
            used: true,
            usedBy: userId,
            usedAt: serverTimestamp(),
          });

          // Update user's promo status
          const userRef = doc(db, 'users', userId);
          await setDoc(userRef, {
            isPremium: true,
            isPromoUser: true,
            promoCode: upperCode,
            promoType: promoData.type,
            promoRedeemedAt: serverTimestamp(),
          }, { merge: true });

          // Update local state
          set({ 
            isPremium: true,
            isPromoUser: true,
            promoCode: upperCode,
            promoType: promoData.type,
          });

          const typeMessage = promoData.type === 'lifetime' 
            ? 'lifetime premium access' 
            : `${promoData.type} premium access`;

          return { 
            success: true, 
            message: `Success! You now have ${typeMessage}!` 
          };
        } catch (error) {
          console.error('Error redeeming promo code:', error);
          return { success: false, message: 'Error redeeming code. Please try again.' };
        }
      },

      setPremium: (isPremium: boolean) => set({ isPremium }),

      clearSubscriptionData: () => {
        set({
          isPremium: false,
          isPromoUser: false,
          promoCode: null,
          promoType: null,
          customerInfo: null,
          offerings: null,
        });
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isPremium: state.isPremium,
        isPromoUser: state.isPromoUser,
        promoCode: state.promoCode,
        promoType: state.promoType,
      }),
    }
  )
);

export default useSubscriptionStore;


