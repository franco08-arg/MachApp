import { Navigate, useLocation } from 'react-router-dom'
import { getSession } from '../auth.js'
import { findAccount } from '../services/accounts.js'

function AdminRoute({ children }) {
  const location = useLocation()
  const session = getSession()
  const account = session?.identifier
    ? findAccount(session.identifier)
    : null
  const role = session?.role ?? account?.role ?? 'user'

  if (role !== 'admin') {
    return <Navigate to="/descubrimiento" replace state={{ from: location.pathname }} />
  }

  return children
}

export default AdminRoute
