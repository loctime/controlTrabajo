import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Navigate, Outlet } from "react-router-dom"

const ProtectedAdmin = () => {
    const {user} = useContext(AuthContext)
    const rolAdmin = import.meta.env.VITE_ROL_ADMIN
    const rolAdminEspecial = "eEI7F72asd"
    
    // Permitir acceso si el rol es el de la variable de entorno O el rol especial
    const isAdmin = user.rol === rolAdmin || user.rol === rolAdminEspecial

  return <>
  
  {
    isAdmin ? <Outlet /> : <Navigate to="/" />
  }

  </>
}

export default ProtectedAdmin