import {
  Navigate
} from "react-router-dom"

import {
  useAuth
} from "../context/AuthContext"

function RoleRoute({

  children,
  allowedRoles

}) {

  const { user } =
  useAuth()

  /* NOT LOGGED */

  if (!user) {

    return <Navigate to="/login" />

  }

  /* NO ACCESS */

  if (

    !allowedRoles.includes(
      user.role
    )

  ) {

    return <Navigate to="/" />

  }

  return children

}

export default RoleRoute