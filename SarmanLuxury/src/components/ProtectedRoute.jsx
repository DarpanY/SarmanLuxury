import {
  Navigate
} from "react-router-dom"

import {
  useAuth
} from "../context/AuthContext"

function ProtectedRoute({
  children
}) {

  const { user } =
  useAuth()

  /* NOT LOGGED IN */

  if (!user) {

    return <Navigate to="/login" />

  }

  /* LOGGED IN */

  return children

}

export default ProtectedRoute