import PageLayout from '../components/PageLayout';
import CollapsibleDiv from "../components/CollapsableDiv";
import {InlineMath } from 'react-katex';

export default function NetworkEstimate() {
  return (
    <PageLayout>
      <h1>Network Structure Estimation</h1>
      <hr className="my-4 border-gray-300" />
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
      <CollapsibleDiv title={'Minimal Spanning Tree'}>
          <p><strong>Input</strong>: Correlation Matrix <span>{`K`}</span> for <span>{`U`}</span> nodes </p>
          <p><strong>Output</strong>: Node adjacency matrix <span>{`A`}</span></p>
          <ol className="list-decimal ml-6 space-y-2 text-left">
          <li>
            Initialize node pool <InlineMath math={"V = [0, 1, \\dots, U-1]"} />, Initialize line pool <InlineMath math={"B = []"} />,
            node adjacency matrix <InlineMath math={"A \\in \\mathbb{R}^{U \\times U}"} /> (all elements <InlineMath math={"a_{ij} = 0"} />)
          </li>
          <li>Sort matrix <span>K</span> in ascending order of rows to obtain index matrix <span>M</span></li>
          <li>Traverse matrix <span>M</span>:</li>
          <li>If <InlineMath math={"M_{i1} = M_{j0}"} /> and <InlineMath math={"M_{i0} = M_{j1}"} />:</li>
          <li>Establish a connection between node <span>i</span> and node <span>j</span>, update <span>B</span></li>
          <li>If <InlineMath math={"M_{i2} = M_{j2}"} />:</li>
          <li>Connect <InlineMath math={"M_{i2}"} />'s corresponding node based on minimum distance, update <span>B</span></li>
          <li>Remove nodes in <span>B</span> from <span>V</span></li>
          <li>While <InlineMath math={`V > 0`}/>:</li>
          <li>
            Traverse <span>V</span>, <span>k = v_i</span>, establish a connection between node <span>k</span> and
            <InlineMath math={"M_{k1}"} />'s corresponding node, update <span>B</span>, remove nodes in <span>B</span> from <span>V</span>
          </li>
          <li>Update <span>A</span> by <span>B</span>, return <span>A</span></li>
        </ol>
      </CollapsibleDiv>
    </PageLayout>
  );
}
