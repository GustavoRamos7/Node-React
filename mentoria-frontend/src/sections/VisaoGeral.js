import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

export default function VisaoGeral() {
  return (
    <>
      <Row>
        <Col><Card body>👥 Total de Alunos: 120</Card></Col>
        <Col><Card body>✅ Ativos: 90</Card></Col>
        <Col><Card body>⏳ Pendentes: 20</Card></Col>
        <Col><Card body>❌ Inativos: 10</Card></Col>
      </Row>
      <hr />
      <h5>🔍 Estatísticas rápidas</h5>
      <p>Aqui você poderá ver gráficos futuristas com Plotly ou Chart.js.</p>
    </>
  );
}
