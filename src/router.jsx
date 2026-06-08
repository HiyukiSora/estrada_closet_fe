
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { MainPage } from './screens/main-page/main-page'
import { NoPageFound } from './components/no-page-found/no-found-page'
import { Cart } from './screens/cart/cart'
import { Admin } from './screens/admin/admin'
import { Checkout } from './screens/checkout/checkout'
import { Order } from './screens/order/order'
import { HomePage } from './screens/home/home-page'
import { RegisterPage } from './screens/login/register-page'
import { ProtectedRoute } from './components/protected-route/protected-route'


export const Router = () => {
    return (
        <React.Fragment>
            <Routes>
                 <Route path="/" element={<HomePage />} />

    <Route path="/main" element={<MainPage />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/order" element={<Order />} />

    <Route path="/register" element={<RegisterPage />} />

    <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
            <Admin />
        </ProtectedRoute>
    } />

    <Route path="*" element={<NoPageFound />} />
            </Routes>
        </React.Fragment>
    )
}
