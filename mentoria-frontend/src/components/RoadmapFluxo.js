// /src/components/RoadmapFluxograma.jsx
import React from 'react';
import Mermaid from 'react-mermaid2';

export default function RoadmapFluxograma({ etapas }) {
  // Garante que cada etapa está limpa de quebras e aspas
  const mermaidString = `
graph TD
${etapas.map((etapa, i) => {
  const clean = etapa.replace(/\n/g, ' ').replace(/"/g, ''); // remove quebras e aspas
  const next = i + 1 < etapas.length ? ` --> E${i + 2}` : '';
  return `E${i + 1}[${clean}]${next}`;
}).join('\n')}
`;

  return (
    <div style={{ width: '100%', overflowX: 'auto', marginTop: '2rem' }}>
      <Mermaid chart={mermaidString} />
    </div>
  );
}
