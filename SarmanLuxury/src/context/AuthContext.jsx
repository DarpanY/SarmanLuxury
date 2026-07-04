import {

  createContext,
  useContext,
  useState,
  useEffect

} from "react"

const AuthContext =
createContext()

export function AuthProvider({
  children
}) {

  /* STORAGE */

  const storedUser =
  JSON.parse(

    localStorage.getItem(
      "user"
    )

  )

  const storedToken =
  localStorage.getItem(
    "token"
  )

  /* STATE */

  const [user, setUser] =
  useState(storedUser || null)

  const [token, setToken] =
  useState(storedToken || null)

  /* SAVE */

  useEffect(() => {

    localStorage.setItem(

      "user",

      JSON.stringify(user)

    )

  }, [user])

  useEffect(() => {

    if (token) {

      localStorage.setItem(
        "token",
        token
      )

    }

  }, [token])

  /* LOGIN */

  const login = (

    userData,
    jwtToken

  ) => {

    setUser(userData)

    setToken(jwtToken)

  }

  /* LOGOUT */

  const logout = () => {

    setUser(null)

    setToken(null)

    localStorage.removeItem(
      "user"
    )

    localStorage.removeItem(
      "token"
    )

  }

  return (

    <AuthContext.Provider
      value={{

        user,
        token,

        login,
        logout

      }}
    >

      {children}

    </AuthContext.Provider>

  )

}

export const useAuth = () =>
useContext(AuthContext) 