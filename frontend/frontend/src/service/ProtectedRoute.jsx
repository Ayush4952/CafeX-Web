export default function ProtectedRoute({ user, role, fallback = null, children }) {
  const signedIn = Boolean(user);
  const hasRequiredRole = !role || user?.role === role;

  return signedIn && hasRequiredRole ? children : fallback;
}
