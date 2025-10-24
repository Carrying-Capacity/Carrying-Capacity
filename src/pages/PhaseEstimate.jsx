import React from "react";
import AlexResultTable from "../components/AlexResultsTable";
import PageLayout from '../components/PageLayout';
import MathBlock from '../components/Mathblock';
import { InlineMath } from "react-katex";
import CollapsibleDiv from "../components/CollapsableDiv";
// <MathBlock math={``} />
// <MathBlock math={`R_{hg}(\\tau) = \\int_{-\\infty}^{\\infty} f(t) \\, g(t + \\tau) \\, dt`} />
export default function PhaseEstimate() {

  return (
    <PageLayout variant="modern">
      <div className="modern-page-hero">
        <h1 className="modern-page-title">Phase Estimation</h1>
        <p className="modern-page-subtitle">
        Estimation of Phase from Voltage Data
        </p>
      </div>

      <section className="modern-page-section fade-in-up">
        <div className="modern-content-wrapper">
          <h2>Phase Estimation</h2>
          <p>Phase identification was a major part of our work, as electrical companies do not keep track of the phases of each of their customers. This can lead to overloading on specific phases reducing the ability of customers on that overloaded phase to feed eneegry back into the grid, and in worst cases cause blackouts or fires in the transformers.</p>
          <h2 className="modern-section-title">Methodology</h2>
          <p>To identify the phase of each customer on the network, clustering algorithims were used. Our data however, had to be transformed first in order to fit each algorithm</p>
          <h3 className="modern-subsection-title">Data formating</h3>
          <CollapsibleDiv title={'Dynamic Time Warping'}>
            <p>DTW measure similarity between two waves taking into account they might be out of phase or streched/ compressed. For our time series data, two waves were compared</p>
            <MathBlock math={`\\bold{x} = \\{x_1, x_2, x_3, ..., x_n\\}, \\quad \\bold{y} = \\{y_1, y_2, y_3, ..., y_m\\}`}/>
            <p>For our waves, a Euclidian distance metric was chosen to construct our cost matrix <InlineMath math={`D_{i, j} = d(x_i, y_j) = (x_i - y_j)^2, \\text{ where } D \\in \\mathbb{R}^{n\\times m}`} />.</p>
            <p>As we are only after the DTW distance between two waves, we only need to calculate the cumulative distance matrix <InlineMath math={`C`}/> not the warping path.</p>
            <MathBlock math={`
            C_{i, j} = D_{i, j} + \\min \\left\\{
            \\begin{aligned}
            C_{i-1,j} \\\\
            C_{i,j-1} \\\\
            C_{i-1,j-1}
            \\end{aligned}
            \\right.
            `} />
            <p>where <InlineMath math={`C_{1, 1} = D_{1, 1}`}/></p>
            <p>From our cumulative distance matrix, the normalized DTW distance can be caluclated, using the warping path length <InlineMath math={`K`}/></p>
            <MathBlock math={`\\text{DTW}(\\bold{x}, \\bold{y}) = \\frac{C_{n, m}}{K}`}/>
            <p>It should be noted that this does not take the square root unlike a true euclidian distance, but averages to find the MSE between two waves providing a more accurate result in our case.</p>
          </CollapsibleDiv>
          <br />
          <CollapsibleDiv title={`Pearson's Correlation Matrix`}>
            <h4></h4>
            <p>Unbaised pearsons correlation for samples were used, this is a similartiy score between two waves,</p>
            <MathBlock math={`\\bold{x} = \\{x_1, x_2, x_3, ..., x_n\\}, \\quad \\bold{y} = \\{y_1, y_2, y_3, ..., y_n\\}`} />
            <p>A unbaised sample covariance was then constructed,</p>
            <MathBlock math={`\\text{cov}(\\bold{x}, \\bold{y}) = \\frac{1}{n-1} \\sum^{n}_{i=1}(x_i-\\bar{\\bold{x}})(y_i-\\bar{\\bold{y}})`}/>
            Using this, we can get the pearsons correlation between two waves of size <InlineMath math={`n`}/>, between <InlineMath math={`[-1,1]`}/>.
            <MathBlock math={`r_{xy} = \\frac{\\text{cov}(\\bold{x}, \\bold{y})}{\\sqrt{\\text{cov}(\\bold{x}, \\bold{x})}\\,\\sqrt{\\text{cov}(\\bold{y}, \\bold{y})}}`} />
            This was appllied to the stacked wave matrix, to give us the <InlineMath math={`n \\times n`}/> pearsons correlation matrix.
          </CollapsibleDiv>
          <br />
          <CollapsibleDiv title={`Spearman's rank correlation`}>
            <p>The Spearman rank correlation coefficient was used as a similarity score between two waves, scoring the monotonic relationship between two waves,</p>
            <MathBlock math={`\\bold{x} = \\{x_1, x_2, x_3, ..., x_n\\}, \\quad \\bold{y} = \\{y_1, y_2, y_3, ..., y_n\\}`} />
            <p>These waves are then replaced with their corresponding ranked waves;</p>
            <MathBlock math={`R(\\bold{x}) = \\{R(x_1), R(x_2), ..., R(x_n)\\}, \\quad R(\\bold{y}) = \\{R(y_1), R(y_2), ..., R(y_n)\\}`}/>
            <p>The rank of each element in the wave <InlineMath math={`R(x_i)`}/> reflects its index in the sorted wave. If there are duplicate entires, it will represent the average rank of all duplicate entries. Using this, we can construct the unbaised sample covariance,</p>
            <MathBlock math={`\\text{cov}(R(\\bold{x}), R(\\bold{y})) = \\frac{1}{n-1} \\sum_{i=1}^{n} (R(x_i) - \\overline{R(\\bold{x})}) (R(y_i) - \\overline{R(\\bold{y})})`} />
            The unbaised Spearman rank correlation between waves <InlineMath math={`\\bold{x}`}/> and <InlineMath math={`\\bold{y}`}/> is then
            <MathBlock math={`\\rho_{xy} = \\frac{\\text{cov}(R(\\bold{x}), R(\\bold{y}))}{\\sqrt{\\text{cov}(R(\\bold{x}), R(\\bold{x}))} \\, \\sqrt{\\text{cov}(R(\\bold{y}), R(\\bold{y}))}}`} />
            <p>This was appllied to the stacked wave matrix, to give us the <InlineMath math={`n \\times n`}/> Spearman correlation matrix.</p>
          </CollapsibleDiv>
          <h3 className="modern-section-title">Creation of an Accuracy Score for Phase Assignment </h3>
          <p>Due to the lack of ground truth for customer phases and transformer data, a custom accuracy metric was developed. GridQube provided insights into the typical phase distribution per transformer and confirmed that three-phase houses had three unique phases. This allowed partial ground truth to be inferred, forming the basis for two key accuracy tests:
          <ol class="list-decimal list-outside mx-6 my-6">
            <li>The phase distribution. A normalised penalty rate was applied to each transformers phase distribution as it drifted further away from the perfect distribution of [1/3, 1/3, 1/3].
          It should be noted that the perfect distribution is never found in real life, however since this is the ideal it is more likely to be close to this ideal that have a large swing to one phase. This was confirmed by GridQube and research and had a 30% weight on the accuracy of each transformer.</li>
          <li>The correct identification of three-phase households. A % score was applied to each transformer with a three-phase household, based on the number of correctly assigned three phase household. A correct assignment allocated each voltage time series a unique phase. If a transformer did not have a three-phase house, a score of 100% was allocated.</li>
          </ol>
          With 33 three-phase households, partial ground truth was available for transformers containing them. Assuming that three-phase houses have three unique phases, a principle supported both academically and industrially, these transformers were weighted at 70%. A weighted average produced a score between 0 and 1 for each transformer, which was then averaged to yield the final method score. Applying this across all data processing and clustering combinations resulted in a highest accuracy of 93.504% for fuzzy c-means with Pearson correlation and a lowest accuracy of 73.921% for spectral clustering with dynamic time warping.
          </p></div>
          <div className="modern-content-wrapper">
            <h2 className="modern-section-title">Results</h2>
            <p>Using these methods, it is possible to group all of the houses from the transformers, and calculate each of their accuracy scores. This was tabulated into a JSON file and the results are shown as below.</p>
          <AlexResultTable/>
          </div>
          {/* From the table, the method with the highest average total score is the Pearson fuzzy C-means method with an accuracy rating of 0.93, meaning it has the highest accuracy. Therefore it was used for the following methods. */}
      </section>
    </PageLayout>
  );
}
