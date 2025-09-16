import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

function NavigationBar() {
  return (
    <Navbar bg="white" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand href="#home" className="fw-bold">TF-Planner</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#dashboard">대시보드</Nav.Link>
            <Nav.Link href="#projects">프로젝트</Nav.Link>
            <Nav.Link href="#documents">내 문서</Nav.Link>
          </Nav>
          <Nav>
            <Button variant="outline-primary" className="me-2">로그인</Button>
            <Button variant="primary">가입하기</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
