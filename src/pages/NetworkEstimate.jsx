import PageLayout from '../components/PageLayout';
import {InlineMath } from 'react-katex';

export default function NetworkEstimate() {
  return (
    <PageLayout>
      <h1>Network Structure Estimation</h1>
      <p>
        The purpose of this section is to explain how the network structure was constructed. This section foollows after Phase estimation, and uses the same cleaned dataset.
      </p>
      <ol>
        <li>
          <strong>Feature Extraction:</strong> Identify relevant electrical or
          statistical features that characterize connections.
        </li>
        <li>
          <strong>Similarity and Correlation Analysis:</strong> Compute pairwise
          relationships between houses (e.g., Pearson correlation, spectral
          methods).
        </li>
        <li>
          <strong>Clustering or Grouping:</strong> Group houses based on
          similarity metrics or connectivity patterns.
        </li>
        <li>
          <strong>Network Reconstruction:</strong> Build a representative graph
          or mapping of house-to-transformer and phase relationships.
        </li>
        <li>
          <strong>Validation and Scoring:</strong> Evaluate the estimated
          structure against known data or benchmark metrics.
        </li>
        <li>
          <strong>Visualization and Interpretation:</strong> Present the
          reconstructed network through maps, tables, or diagrams.
        </li>
      </ol>
      <p> The minimal distance algorithm was used in order to get the network structure. It is described below: </p>
      <div className="max-w-3xl mx-auto p-6 bg-gray-50 shadow-md rounded-lg mt-8">
          <div>
            <p className="ml-4 text-left">Input: Correlation Matrix <InlineMath math="K" /> for <InlineMath math="U" /> nodes <br />
            Output: Node adjacency matrix <InlineMath math="A" /></p>
          <ol className="list-decimal ml-6 space-y-2 text-left">
            <li>
              Initialize node pool <InlineMath math={"V = [0, 1, \\dots, U-1]"} />, Initialize line pool <InlineMath math={"B = []"} />,
              node adjacency matrix <InlineMath math={"A \\in \\mathbb{R}^{U \\times U}"} /> (all elements <InlineMath math={"a_{ij} = 0"} />)</li>
            <li>Sort matrix <InlineMath math={"K"} /> in ascending order of rows to obtain index matrix <InlineMath math={"M"} /></li>
            <li>Traverse matrix <InlineMath math={"M"} />:</li>
            <li>If <InlineMath math={"M_{i1} = M_{j0}"} /> and <InlineMath math={"M_{i0} = M_{j1}"} />:</li>
            <li>Establish a connection between node <InlineMath math={"i"} /> and node <InlineMath math={"j"} />, update <InlineMath math={"B"} /></li>
            <li>If <InlineMath math={"M_{i2} = M_{j2}"} />:</li>
            <li>Connect <InlineMath math={"M_{i2}"} />'s corresponding node based on minimum distance, update <InlineMath math={"B"} /></li>
            <li>Remove nodes in <InlineMath math={"B"} /> from <InlineMath math={"V"} /></li>
            <li>While <InlineMath math={"V > 0"} />:</li>
            <li> Traverse <InlineMath math={"V"} />, <InlineMath math={"k = v_i"} />, establish a connection between node <InlineMath math="k" /> and
              <InlineMath math={"M_{k1}"} />'s corresponding node, update <InlineMath math={"B"} />, remove nodes in <InlineMath math="B" /> from <InlineMath math="V" />

            </li>
            <li>Update <InlineMath math={"A"} /> by <InlineMath math={"B"} />, return <InlineMath math={"A"} /></li>
          </ol>
        </div>
      </div>
    </PageLayout>
  );
}
