export interface Dog {
    id: string;
    name: string;
    breed: string;
    age: number;
    imageUrl: string;
}

export interface User {
    uid: string;
    email: string;
    displayName?: string;
}

export interface AuthResponse {
    user: User | null;
    error?: string;
}