import React, { useEffect, useState } from 'react'
import { Navbar, Container, Badge, NavDropdown } from 'react-bootstrap'
import { FaShoppingCart, FaBoxOpen, FaUser } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import { getCartItemCount } from '../../services/cart/cart-services';
import { useCartItemCountStore, useCartItemSelectionStore } from '../../stores/use-context-stores';
import { useAuthStore } from '../../stores/auth-store';
import { logoutUser } from '../../services/auth/auth-services';
import { LoginModal } from '../login-modal/login-modal';

export const Header = () => {
    const navigation = useNavigate();
    const [cartItemCount, setCartItemCount] = useState(0);
    const [showLogin, setShowLogin] = useState(false);
    const { refreshCart } = useCartItemCountStore();
    const { clearSelectedIds } = useCartItemSelectionStore();
    const { user, isAuthenticated, clearAuth } = useAuthStore();

    const handleNavigateCart = () => {
        clearSelectedIds();
        navigation('/cart');
    };

    const handleNavigateOrders = () => {
        clearSelectedIds();
        navigation('/order');
    };

    const handleNavigateMainPage = () => {
        clearSelectedIds();
        navigation('/');
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch {
        }
        clearAuth();
        window.location.href = '/';
    };

    useEffect(() => {
        const fetchCartItemCount = async () => {
            const response = await getCartItemCount();
            if (response.status === 200) {
                setCartItemCount(response.data.cart_count);
            } else {
                console.error('Failed to fetch cart item count');
            }
        };

        fetchCartItemCount();
    }, [refreshCart]);

    return (
        <React.Fragment>
            <Navbar bg="dark" data-bs-theme="dark" sticky="top">
                <Container>
                    <Navbar.Brand className="d-flex align-items-center" style={{ cursor: "pointer" }} onClick={handleNavigateMainPage}>
                        <img
                            src="./estrada_closet_logo.jpg"
                            alt="Logo"
                            width="40"
                            height="40"
                            className="me-2"
                        />
                        Estrada Closet Co.
                    </Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Navbar.Text
                            onClick={handleNavigateOrders}
                            style={{ cursor: 'pointer', marginRight: '15px' }}
                        >
                            <FaBoxOpen className="me-1" />
                            Orders
                        </Navbar.Text>

                        <Navbar.Text onClick={handleNavigateCart} style={{ cursor: 'pointer', marginRight: '15px' }}>
                            <FaShoppingCart className="me-1" />
                            {cartItemCount > 0 && (
                                <Badge bg="danger" text="light">
                                    {cartItemCount}
                                </Badge>
                            )}
                        </Navbar.Text>

                        {isAuthenticated ? (
                            <NavDropdown
                                title={<FaUser />}
                                id="user-dropdown"
                                align="end"
                                className="text-light"
                            >
                                <NavDropdown.ItemText className="text-muted small">
                                    {user?.email}
                                </NavDropdown.ItemText>
                                <NavDropdown.Divider />
                                {user?.role === 'admin' && (
                                    <NavDropdown.Item onClick={() => navigation('/admin')}>
                                        Admin Panel
                                    </NavDropdown.Item>
                                )}
                                <NavDropdown.Item onClick={handleLogout}>
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Navbar.Text
                                onClick={() => setShowLogin(true)}
                                style={{ cursor: 'pointer' }}
                            >
                                <FaUser className="me-1" />
                                Login
                            </Navbar.Text>
                        )}
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <LoginModal show={showLogin} onHide={() => setShowLogin(false)} />
        </React.Fragment>
    )
}
