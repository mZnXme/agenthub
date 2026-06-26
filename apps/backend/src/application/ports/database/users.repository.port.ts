export type FirebaseUserData = {
  firebaseUid: string
  email: string
  name: string
  picture?: string | null
}

export abstract class UsersRepositoryPort {
  abstract findByFirebaseUid(firebaseUid: string): Promise<unknown | null>
  abstract findByEmail(email: string): Promise<unknown | null>
  abstract createFirebaseUser(data: FirebaseUserData): Promise<unknown>
  abstract linkFirebaseUid(id: string, firebaseUid: string): Promise<unknown>
  abstract updateProfile(id: string, data: { name: string; picture?: string | null }): Promise<unknown>
  abstract findById(id: string): Promise<unknown | null>
}
