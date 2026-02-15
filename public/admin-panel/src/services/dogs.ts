import { db } from '../auth/firebase';
import { Dog } from '../types';

export const addDog = async (dog: Dog) => {
    try {
        const docRef = await db.collection('dogs').add(dog);
        return docRef.id;
    } catch (error) {
        console.error("Error adding dog: ", error);
        throw new Error("Could not add dog");
    }
};

export const getDogs = async () => {
    try {
        const snapshot = await db.collection('dogs').get();
        const dogs: Dog[] = [];
        snapshot.forEach(doc => {
            dogs.push({ id: doc.id, ...doc.data() } as Dog);
        });
        return dogs;
    } catch (error) {
        console.error("Error getting dogs: ", error);
        throw new Error("Could not retrieve dogs");
    }
};

export const updateDog = async (id: string, updatedDog: Partial<Dog>) => {
    try {
        await db.collection('dogs').doc(id).update(updatedDog);
    } catch (error) {
        console.error("Error updating dog: ", error);
        throw new Error("Could not update dog");
    }
};

export const deleteDog = async (id: string) => {
    try {
        await db.collection('dogs').doc(id).delete();
    } catch (error) {
        console.error("Error deleting dog: ", error);
        throw new Error("Could not delete dog");
    }
};