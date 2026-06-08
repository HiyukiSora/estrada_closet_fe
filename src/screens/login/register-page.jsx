import React, { useState } from 'react'
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../../services/auth/auth-services'
import './styles/auth-styles.css'

export const RegisterPage = () => {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const response = await registerUser({ email, password })
            if (response.status === 200) {
                navigate('/login', {
                    state: { message: 'Registration successful! Please sign in.' }
                })
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Registration failed. Please try again.'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <Container>
                <div className="auth-wrapper">
                    <Card className="auth-card">
                        <Card.Body>
                            <div className="text-center mb-4">
                                <img
                                    src="./estrada_closet_logo.jpg"
                                    alt="Logo"
                                    width="60"
                                    height="60"
                                    className="mb-2"
                                />
                                <h3>Create Account</h3>
                                <p className="text-muted">Register for a new account</p>
                            </div>

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
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Button
                                    variant="dark"
                                    type="submit"
                                    className="w-100 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Spinner size="sm" animation="border" />
                                    ) : (
                                        'Register'
                                    )}
                                </Button>
                            </Form>

                            <div className="text-center">
                                <span className="text-muted">Already have an account? </span>
                                <Link to="/login">Sign in</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        </div>
    )
}
