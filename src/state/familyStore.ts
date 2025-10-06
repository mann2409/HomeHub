import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface FamilyMember {
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'member';
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: Date;
  leftAt?: Date;
}

export interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
  inviteCode: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FamilyState {
  currentUserId: string | null; // Track which user this data belongs to
  familyIds: string[]; // Array of all family IDs user belongs to
  activeFamilyId: string | null; // Currently active/selected family
  families: Record<string, Family>; // Map of family ID to family data
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUserId: (userId: string | null) => void;
  createFamily: (name: string, userId: string, userEmail: string, userName: string) => Promise<string>;
  joinFamily: (inviteCode: string, userId: string, userEmail: string, userName: string) => Promise<void>;
  loadFamily: (familyId: string) => Promise<void>;
  loadUserFamilies: (userId: string) => Promise<void>;
  updateFamilyName: (name: string) => Promise<void>;
  generateInviteCode: () => string;
  migrateFamilyData: (familyId: string) => Promise<void>;
  setActiveFamily: (familyId: string) => void;
  clearFamilyData: () => void;
  leaveFamily: (familyId: string) => Promise<void>;
  subscribeToFamily: (familyId: string) => () => void;
  getActiveFamily: () => Family | null;
}

const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      familyIds: [],
      activeFamilyId: null,
      families: {},
      isLoading: false,
      error: null,

      setUserId: (userId) => {
        const { currentUserId } = get();
        
        // If userId changed, clear family data
        if (currentUserId !== userId) {
          console.log('User changed - clearing family data');
          set({
            currentUserId: userId,
            familyIds: [],
            activeFamilyId: null,
            families: {},
          });
        }
      },

      generateInviteCode: () => {
        // Generate a 6-character invite code
        return Math.random().toString(36).substring(2, 8).toUpperCase();
      },

      // Migration function to add status field to existing members
      migrateFamilyData: async (familyId: string) => {
        try {
          console.log('Starting family data migration for:', familyId);
          const familyDoc = await getDoc(doc(db, 'families', familyId));
          
          if (familyDoc.exists()) {
            const data = familyDoc.data();
            const needsMigration = data.members.some((m: any) => !m.status);
            
            if (needsMigration) {
              console.log('Migrating members - adding status field');
              const migratedMembers = data.members.map((member: any) => ({
                ...member,
                status: member.status || 'ACTIVE',
              }));
              
              await updateDoc(doc(db, 'families', familyId), {
                members: migratedMembers,
                updatedAt: serverTimestamp(),
              });
              
              console.log('✅ Migration complete!');
            } else {
              console.log('No migration needed - all members have status field');
            }
          }
        } catch (error) {
          console.error('Error during migration:', error);
        }
      },

      getActiveFamily: () => {
        const { activeFamilyId, families } = get();
        return activeFamilyId ? families[activeFamilyId] || null : null;
      },

      // Load all families where the user is an ACTIVE member
      loadUserFamilies: async (userId: string) => {
        try {
          console.log('Loading families for user:', userId);
          set({ isLoading: true, error: null });

          // Query all families
          const familiesRef = collection(db, 'families');
          const snapshot = await getDocs(familiesRef);
          
          const userFamilies: string[] = [];
          const familiesData: Record<string, Family> = {};

          snapshot.forEach((doc) => {
            const data = doc.data();
            const familyId = doc.id;
            
            // Check if user is an ACTIVE member of this family
            const userMember = data.members.find((m: any) => 
              m.userId === userId && (m.status === 'ACTIVE' || !m.status)
            );

            if (userMember) {
              console.log('Found family:', data.name, familyId);
              userFamilies.push(familyId);
              
              // Convert timestamps and add default status
              familiesData[familyId] = {
                ...data,
                id: familyId,
                members: data.members.map((member: any) => ({
                  ...member,
                  status: member.status || 'ACTIVE',
                  joinedAt: member.joinedAt?.toDate?.() || new Date(member.joinedAt),
                  leftAt: member.leftAt?.toDate?.() || (member.leftAt ? new Date(member.leftAt) : undefined),
                })),
                createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
              } as Family;
            }
          });

          console.log(`Found ${userFamilies.length} families for user`);

          set({
            familyIds: userFamilies,
            families: familiesData,
            activeFamilyId: userFamilies.length > 0 ? (get().activeFamilyId || userFamilies[0]) : null,
            isLoading: false,
          });

        } catch (error: any) {
          console.error('Error loading user families:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      createFamily: async (name, userId, userEmail, userName) => {
        try {
          set({ isLoading: true, error: null });

          const familyId = `family_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          const inviteCode = get().generateInviteCode();

          const newFamily: Family = {
            id: familyId,
            name,
            members: [
              {
                userId,
                email: userEmail,
                name: userName,
                role: 'owner',
                status: 'ACTIVE',
                joinedAt: new Date(),
              },
            ],
            inviteCode,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Create family document in Firestore
          await setDoc(doc(db, 'families', familyId), {
            ...newFamily,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          set((state) => ({
            familyIds: [...state.familyIds, familyId],
            activeFamilyId: familyId,
            families: { ...state.families, [familyId]: newFamily },
            isLoading: false,
          }));

          console.log('Family created successfully:', familyId);
          return familyId;
        } catch (error: any) {
          console.error('Error creating family:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      joinFamily: async (inviteCode, userId, userEmail, userName) => {
        try {
          set({ isLoading: true, error: null });

          // Search for family with this invite code
          const familiesRef = collection(db, 'families');
          const q = query(familiesRef, where('inviteCode', '==', inviteCode.toUpperCase()));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            throw new Error('Invalid invite code. Please check and try again.');
          }

          const familyDoc = querySnapshot.docs[0];
          const familyData = familyDoc.data() as Family;
          const familyId = familyDoc.id;

          // Check if user already exists in members
          const existingMember = familyData.members.find(m => m.userId === userId);
          
          if (existingMember) {
            // User exists - check their status
            if (existingMember.status === 'ACTIVE') {
              throw new Error('You are already an active member of this family');
            }
            
            // User exists but is INACTIVE - reactivate them
            console.log('User was INACTIVE, reactivating...');
            
            const reactivatedMember: FamilyMember = {
              ...existingMember,
              status: 'ACTIVE',
              joinedAt: new Date(), // Update join date
            };
            
            // Remove old member object and add updated one
            await updateDoc(doc(db, 'families', familyId), {
              members: arrayRemove(existingMember),
            });
            
            await updateDoc(doc(db, 'families', familyId), {
              members: arrayUnion(reactivatedMember),
              updatedAt: serverTimestamp(),
            });
            
            const updatedFamily = {
              ...familyData,
              members: familyData.members.map(m =>
                m.userId === userId ? reactivatedMember : m
              ),
            };
            
            set((state) => ({
              familyIds: state.familyIds.includes(familyId) ? state.familyIds : [...state.familyIds, familyId],
              activeFamilyId: familyId,
              families: { ...state.families, [familyId]: updatedFamily },
              isLoading: false,
            }));
            
            console.log('Successfully rejoined family:', familyId);
            return;
          }

          // User doesn't exist - add as new member
          const newMember: FamilyMember = {
            userId,
            email: userEmail,
            name: userName,
            role: 'member',
            status: 'ACTIVE',
            joinedAt: new Date(),
          };

          await updateDoc(doc(db, 'families', familyId), {
            members: arrayUnion(newMember),
            updatedAt: serverTimestamp(),
          });

          // Load the family data and add to user's families
          const updatedFamily = { ...familyData, members: [...familyData.members, newMember] };
          
          set((state) => ({
            familyIds: [...state.familyIds, familyId],
            activeFamilyId: familyId,
            families: { ...state.families, [familyId]: updatedFamily },
            isLoading: false,
          }));

          console.log('Successfully joined family:', familyId);
        } catch (error: any) {
          console.error('Error joining family:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      loadFamily: async (familyId) => {
        try {
          set({ isLoading: true, error: null });

          const familyDoc = await getDoc(doc(db, 'families', familyId));

          if (familyDoc.exists()) {
            const data = familyDoc.data();
            
            // Convert Firestore timestamps to dates for members
            // Also add default status for backward compatibility
            const familyData: Family = {
              ...data,
              members: data.members.map((member: any) => ({
                ...member,
                status: member.status || 'ACTIVE', // Default to ACTIVE for existing members
                joinedAt: member.joinedAt?.toDate?.() || new Date(member.joinedAt),
                leftAt: member.leftAt?.toDate?.() || (member.leftAt ? new Date(member.leftAt) : undefined),
              })),
              createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
              updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
            } as Family;
            
            set((state) => ({
              families: { ...state.families, [familyId]: familyData },
              isLoading: false,
            }));
          } else {
            throw new Error('Family not found');
          }
        } catch (error: any) {
          console.error('Error loading family:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateFamilyName: async (name) => {
        const { activeFamilyId } = get();
        if (!activeFamilyId) return;

        try {
          await updateDoc(doc(db, 'families', activeFamilyId), {
            name,
            updatedAt: serverTimestamp(),
          });

          set((state) => ({
            families: {
              ...state.families,
              [activeFamilyId]: state.families[activeFamilyId]
                ? { ...state.families[activeFamilyId], name, updatedAt: new Date() }
                : state.families[activeFamilyId],
            },
          }));
        } catch (error: any) {
          console.error('Error updating family name:', error);
          set({ error: error.message });
          throw error;
        }
      },

      setActiveFamily: (familyId) => {
        set({ activeFamilyId: familyId });
      },

      clearFamilyData: () => {
        set({
          familyIds: [],
          activeFamilyId: null,
          families: {},
          isLoading: false,
          error: null,
        });
      },

      leaveFamily: async (familyId) => {
        try {
          set({ isLoading: true, error: null });
          
          const wasActiveFamily = get().activeFamilyId === familyId;
          const currentUserId = get().currentUserId;
          
          // Update user status to INACTIVE in Firestore
          if (currentUserId) {
            try {
              // Fetch the current family document from Firestore to get exact data
              const familyDocRef = doc(db, 'families', familyId);
              const familySnapshot = await getDoc(familyDocRef);
              
              if (familySnapshot.exists()) {
                const familyData = familySnapshot.data();
                
                // Find the member in the Firestore data (not local state)
                const currentMemberInFirestore = familyData.members.find((m: any) => m.userId === currentUserId);
                
                if (currentMemberInFirestore) {
                  // Create updated member with INACTIVE status
                  const inactiveMember = {
                    ...currentMemberInFirestore,
                    status: 'INACTIVE',
                    leftAt: new Date(),
                  };
                  
                  // Remove old member object (using exact Firestore data)
                  await updateDoc(familyDocRef, {
                    members: arrayRemove(currentMemberInFirestore),
                  });
                  
                  // Add updated member with INACTIVE status
                  await updateDoc(familyDocRef, {
                    members: arrayUnion(inactiveMember),
                    updatedAt: serverTimestamp(),
                  });
                  
                  console.log('✅ Set user status to INACTIVE in Firestore');
                }
              }
            } catch (error) {
              console.error('❌ Error updating status in Firestore:', error);
              // Continue with local removal even if Firestore fails
            }
          }
          
          // If we left the active family, clear all family data from other stores FIRST
          if (wasActiveFamily) {
            console.log('Clearing all family data from other stores...');
            // Clear tasks from all stores since we left the active family
            const useTaskStore = (await import('./taskStore')).default;
            const useShoppingStore = (await import('./shoppingStore')).default;
            const useMealStore = (await import('./mealStore')).default;
            const useFinanceStore = (await import('./financeStore')).default;
            
            // Set empty arrays (but keep userId)
            useTaskStore.setState({ tasks: [] });
            useShoppingStore.setState({ items: [] });
            useMealStore.setState({ meals: [] });
            useFinanceStore.setState({ expenses: [] });
            
            console.log('✅ Cleared all family data after leaving active family');
          }
          
          // Now remove family from local state and set loading to false
          set((state) => {
            const newFamilyIds = state.familyIds.filter(id => id !== familyId);
            const newFamilies = { ...state.families };
            delete newFamilies[familyId];
            
            return {
              familyIds: newFamilyIds,
              activeFamilyId: state.activeFamilyId === familyId 
                ? (newFamilyIds[0] || null) 
                : state.activeFamilyId,
              families: newFamilies,
              isLoading: false,
            };
          });
          
          console.log('✅ Left family successfully');
        } catch (error: any) {
          console.error('Error leaving family:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      subscribeToFamily: (familyId) => {
        const unsubscribe = onSnapshot(
          doc(db, 'families', familyId),
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              
              // Convert Firestore timestamps to dates for members
              // Also add default status for backward compatibility
              const familyData: Family = {
                ...data,
                members: data.members.map((member: any) => ({
                  ...member,
                  status: member.status || 'ACTIVE', // Default to ACTIVE for existing members
                  joinedAt: member.joinedAt?.toDate?.() || new Date(member.joinedAt),
                  leftAt: member.leftAt?.toDate?.() || (member.leftAt ? new Date(member.leftAt) : undefined),
                })),
                createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
              } as Family;
              
              set((state) => ({
                families: { ...state.families, [familyId]: familyData },
              }));
            }
          },
          (error) => {
            console.error('Error subscribing to family:', error);
            set({ error: error.message });
          }
        );

        return unsubscribe;
      },
    }),
    {
      name: 'family-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        familyIds: state.familyIds,
        activeFamilyId: state.activeFamilyId,
        families: state.families,
      }),
    }
  )
);

export default useFamilyStore;

