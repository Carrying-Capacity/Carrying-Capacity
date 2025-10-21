import React from "react";
import AlexResultTable from "../components/AlexResultsTable";
import PageLayout from '../components/PageLayout';
import MathBlock from '../components/Mathblock';

export default function PhaseEstimate() {

  return (
    <PageLayout>
      <h1>Phase Estimation</h1>
      <p>The initial goal of the project was phase estimation. To accomplish this, research was done to find the simplest way to classify time-series data into distinct categories, a classic machine learning problem. 
        The methods that we used are as follows:
        <ul className="list-disc list-inside text-center">
          <li>Fuzzy c-means</li>
          <li>Pearson's correlation</li>
          <li>Spearman's Correlation</li>
          <li>Spectral clustering</li>
        </ul>
      </p>
      <p>The underlying math behind this is as follows:</p>
      <p>I have displayed some example mathematics formatting here.</p>
      {/* Quadratic equation */}
      <MathBlock math={`R_{hg}(\\tau) = \\int_{-\\infty}^{\\infty} f(t) \\, g(t + \\tau) \\, dt`} />
      
      <p>The accuracy score of the transformers was calculated by...</p>
      <AlexResultTable/>
      The final results can be tablulated in the final thing:
    </PageLayout>
  );
}
