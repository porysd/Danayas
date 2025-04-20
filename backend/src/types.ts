export type AuthContext = {
  Variables: {
    userId: number,
    role: 'admin' | 'staff' | 'customer';
  };
};