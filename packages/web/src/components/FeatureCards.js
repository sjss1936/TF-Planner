import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const features = [
  {
    title: '새로운 프로젝트 생성',
    text: '칸반 보드, 타임라인 등 다양한 템플릿으로 프로젝트를 시작하세요.',
    icon: '🚀' // 아이콘은 나중에 이미지나 아이콘 라이브러리로 대체
  },
  {
    title: '최근 문서 바로가기',
    text: '가장 최근에 작업한 문서들을 빠르게 확인하고 작업을 이어가세요.',
    icon: '📄'
  },
  {
    title: '다가오는 일정 보기',
    text: '캘린더와 연동하여 중요한 마감일과 미팅을 놓치지 마세요.',
    icon: '📅'
  }
];

function FeatureCards() {
  return (
    <Container className="py-5">
      <Row className="text-center">
        {features.map((feature, index) => (
          <Col md={4} key={index} className="mb-4">
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-4">
                <div className="fs-1 mb-3">{feature.icon}</div>
                <Card.Title as="h5" className="fw-bold">{feature.title}</Card.Title>
                <Card.Text className="text-muted">
                  {feature.text}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default FeatureCards;
