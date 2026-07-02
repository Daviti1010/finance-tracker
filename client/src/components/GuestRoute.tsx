import { Navigate } from "react-router-dom"

interface Props {
  children: React.ReactNode
}

function GuestRoute({ children }: Props) {
    const token = localStorage.getItem("accessToken")

    if (token) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default GuestRoute