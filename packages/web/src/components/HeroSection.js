import React from 'react';
import { Container, Button } from 'react-bootstrap';

function HeroSection() {
  return (
    <div className="hero-section text-center">
      <Container>
        <h1 className="display-4 fw-bold">프로젝트 관리, 이제 TF-Planner와 함께</h1>
        <p className="lead text-muted my-4">
          복잡한 업무와 쏟아지는 아이디어를 한 곳에서 체계적으로 관리하고 팀과 공유하세요.
        </p>
        <Button variant="primary" size="lg">지금 바로 시작하기</Button>
      </Container>
    </div>
  );
}

export default HeroSection;
