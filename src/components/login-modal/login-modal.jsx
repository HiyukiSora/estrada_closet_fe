import React, { useState } from 'react'
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../services/auth/auth-services'
import { useAuthStore } from '../../stores/auth-store'

export const LoginModal = ({ show, onHide }) => {
    const navigate = useNavigate()
    const setAuth = useAuthStore((state) => state.setAuth)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await loginUser({ email, password })
            if (response.status === 200) {
                const { token, user } = response.data
                setAuth(user, token)
                setEmail('')
                setPassword('')
                onHide()
                if (user.role === 'admin') {
                    navigate('/admin')
                }
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Login failed. Please try again.'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    const handleRegisterClick = () => {
        onHide()
        navigate('/register')
    }

    const handleClose = () => {
        setEmail('')
        setPassword('')
        setError('')
        onHide()
    }

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Sign In</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button
                        variant="dark"
                        type="submit"
                        className="w-100"
                        disabled={loading}
                    >
                        {loading ? <Spinner size="sm" animation="border" /> : 'Sign In'}
                    </Button>
                </Form>
                <div className="text-center mt-3">
                    <span className="text-muted">Don't have an account? </span>
                    <span
                        style={{ cursor: 'pointer', color: '#0d6efd' }}
                        onClick={handleRegisterClick}
                    >
                        Register
                    </span>
                </div>
            </Modal.Body>
        </Modal>
    )
}
