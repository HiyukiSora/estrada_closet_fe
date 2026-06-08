import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Spinner, Container } from 'react-bootstrap'
import { useAuthStore } from '../../stores/auth-store'
import { verifyToken } from '../../services/auth/auth-services'

export const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore()
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setChecking(false)
                return
            }

            try {
                const response = await verifyToken()
                if (response.status === 200) {
                    setAuth(response.data.user, token)
                } else {
                    clearAuth()
                }
            } catch {
                clearAuth()
            } finally {
                setChecking(false)
            }
        }

        verify()
    }, [])

    if (checking) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="dark" />
            </Container>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/" replace />
    }

    return children
}
