// src/services/auth.service.ts
import { auth } from '../config/firebaseConfig';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile as updateAuthProfile,
    updateEmail
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const db = getFirestore();

class AuthService {
    async register(email: string, password: string, name: string, role: string) {
        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store user data in Firestore
            await setDoc(doc(db, 'authenticated_users', user.uid), {
                name,
                email,
                role,
                createdAt: new Date(),
            });

            return user;
        } catch (error) {
            console.error('Registration Error:', error);
            throw error;
        }
    }

    async login(email: string, password: string) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, 'authenticated_users', user.uid));
            if (!userDoc.exists()) {
                throw new Error('User data not found');
            }

            return { user, userData: userDoc.data() };
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    }

    async updateProfile(uid: string, updates: { name?: string; email?: string; role?: string }) {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('No user logged in');
            }

            // Update Firebase Auth profile if name is being updated
            if (updates.name) {
                await updateAuthProfile(currentUser, {
                    displayName: updates.name
                });
            }

            // Update email in Firebase Auth if email is being updated
            if (updates.email && updates.email !== currentUser.email) {
                await updateEmail(currentUser, updates.email);
            }

            // Update Firestore document
            const userRef = doc(db, 'authenticated_users', uid);
            await updateDoc(userRef, {
                ...updates,
                updatedAt: new Date()
            });

            // Get updated user data
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) {
                throw new Error('User data not found');
            }

            return userDoc.data();
        } catch (error) {
            console.error('Profile Update Error:', error);
            throw error;
        }
    }

    async logout() {
        await signOut(auth);
    }
}

export default new AuthService();
