import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './styles/no-found-page-styles.css';

export const NoPageFound = () => {
  const navigate = useNavigate()

  return (
    <React.Fragment>
      <div className="nopagefound-wrapper">
        <div className="nopagefound-glow" />
        <div className="nopagefound-ring" />
        <div className="nopagefound-ring nopagefound-ring-outer" />

        <Container className="text-center position-relative" style={{ zIndex: 1 }}>
          <div className="nopagefound-404">404</div>

          <div className="nopagefound-star my-2">✦</div>

          <p className="nopagefound-title mt-3 mb-2">Page Not Found</p>
          <p className="nopagefound-desc mb-4">
            The page you're looking for has wandered off.
          </p>

          <Button
            className="nopagefound-btn"
            onClick={() => navigate('/')}
          >
            Go Back Home
          </Button>
        </Container>
      </div>
    </React.Fragment>
  )
}