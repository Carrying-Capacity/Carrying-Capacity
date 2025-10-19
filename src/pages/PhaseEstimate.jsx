import React from "react";
import AlexResultTable from "../components/AlexResultsTable";
import PageLayout from '../components/PageLayout';
import MathBlock from '../components/Mathblock';
import 'katex/dist/katex.min.css';

export default function PhaseEstimate() {

  return (
    <PageLayout>

      <p>I have displayed some example mathematics formatting here. Use the katex library.</p>
      {/* Quadratic equation */}
      <MathBlock math={`R_{hg}(\\tau) = \\int_{-\\infty}^{\\infty} f(t) \\, g(t + \\tau) \\, dt`} />
      
      <p>The accuracy score of the transformers was calculated by...</p>
      <AlexResultTable/>

    </PageLayout>
  );
}
