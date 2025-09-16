import React from 'react';
import { Container } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="footer">
      <Container className="text-center">
        <p>&copy; 2025 TF-Planner. All Rights Reserved.</p>
        <a href="https://github.com/your-github-repo" target="_blank" rel="noopener noreferrer" className="text-white">
          GitHub
        </a>
      </Container>
    </footer>
  );
}

export default Footer;
