import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Navigate, Outlet } from "react-router-dom"

const ProtectedAdmin = () => {
    const {user, isLogged} = useContext(AuthContext)
    const rolAdmin = import.meta.env.VITE_ROL_ADMIN
    const rolAdminEspecial = "eEI7F72asd"
    
    // Verificar que el usuario existe y está logueado antes de verificar el rol
    const isAdmin = isLogged && user && (user.rol === rolAdmin || user.rol === rolAdminEspecial)

  return <>
  
  {
    isAdmin ? <Outlet /> : <Navigate to="/" />
  }

  </>
}

export default ProtectedAdmin