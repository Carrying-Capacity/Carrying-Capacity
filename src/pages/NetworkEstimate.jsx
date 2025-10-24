import PageLayout from '../components/PageLayout';
import CollapsibleDiv from "../components/CollapsableDiv";
import MathBlock from '../components/Mathblock';
import {InlineMath } from 'react-katex';
import { AlignCenter } from 'lucide-react';

export default function NetworkEstimate() {
  return (
    <PageLayout variant="modern">
      <div className="modern-page-hero">
        <h1 className="modern-page-title">Network Structure Estimation</h1>
        <p className="modern-page-subtitle">
          Network Structure and Topology Generation
        </p>
      </div>

      <section className="modern-page-section fade-in-up">
        <div className="modern-card">
          <h2>Topology and Generation</h2>
          <h3>Rationale</h3>
          {/* <p>The purpose of this section is to explain how the network structure was constructed. This section follows after Phase estimation, and uses the same cleaned dataset.</p> */}
          <p>
          Generation of the electrical network topology allows for an intuitive user-friendly interface for network planners to interact with. It provides the opportunity for a visualisation of a transformers electrical network allowing for simplified analysis of factors such as network structure and phase distribution.</p>
          <h3>Methodology</h3>
          <p>Topology generation follows a multi-step approach. Initially, the data is extracted from the stored parquet form. Following this, for each candidate transformer, a variety of academically tested topology generation methods are performed. These methods are compared for consistency, with the most consistent method selected for the next stage. The data is then converted into minimum spanning tree (MST) format. The impedance between each node connection is then estimated to derive a value a standardised distance score. Finally, candidate nodes are selected to have connections to the transformer root node. The final MST with distances, root node, and integrated phase labelled is then returned to the next stage of the overall pipeline to be used in a ‘map’ like visualisation.</p>

          <h3>Application of Varying Academically Tested Topology Generation Methods</h3>
          <CollapsibleDiv title={`Mutual Information Scores`}>
          <p> Using the idea that the change in voltage distribution at a bus is conditionally independent to the change in voltage distributions of non-neighboring buses given the change in voltage distributions of neighboring buses (Liao et al. (2016)), it can be said that correlation with neighboring buses is higher than that of non-neighboring buses.</p>
          <p>Therefore, to construct a topology of nodes, connections must be checked for each node, where finding connectivity of bus i is simplified to finding neighbouring nodes. The connectivity is described as:</p>
          <MathBlock math={`P\\left(V_S\\right)=\\prod_{i=2}^{M}P_i\\left(V_i|V_{N\\left(i\\right)}\\right)`}/>
          <p>mutual information-based maximum spanning tree finds the optimal approximation of <InlineMath  math={`P\\left(V_S\\right)`}/></p>
          <p>where this mutual information is used as the weights for the edge. From these edge weights a maximum spanning tree can be created using the NX libraries maximum spanning tree function, and the topology is generated.</p>          
          </CollapsibleDiv><br />
          <CollapsibleDiv title={`Pearson Correlation`}>
          <p>This method first uses Pearson correlation coefficients to create a symmetric correlation matrix between all pairs of nodes (houses) in each transformer, using their voltage data. The calculated correlation values are then converted to a standardised distance metric to use as edge weights. This means a graph can be built where each house is represented as a node, and the calculated distances are the edges. Finally a minimum spanning tree selects the connections with smallest distances (highest correlations) to form the network topology. </p>
          </CollapsibleDiv><br />
          <CollapsibleDiv title={`Kendall-Tau Correlation`}>
          <p>Based on research by Tong et al. in “Topology and Impedance Identification Method of Low-Voltage Distribution Network Based on Smart Meter Measurements” an electrical network topology can be found by comparing the Kendall-Tau correlation coefficient for every pair of nodes using their voltage time series data. This methodology has strengths including applicability to irregular time stamps. </p>
          <p>Following the construction of the Kendall-Tau correlation matrix between each node, each value represents the strength of the correlation between the nodes. These edges can then be used to construct a maximum spanning tree utilising the python library networkx. This tree structure represents the likely topology of the network. This can be seen in the MST diagram below, before root node identification.</p>
          </CollapsibleDiv><br />
          <CollapsibleDiv title={`Graphical Lasso – Concentration Matrix`}>
          Based on research by Bolognani et al., this method follows a step-by-step approach to generate a candidate network topology. First, each nodes voltage measurements are converted from a raw measurement to a deviation from their voltage mean. Following this, graphical lasso with cross validation is applied to estimate a spare concentration matrix, identifying conditional dependencies between nodes. Finally, the absolute values of the concentration matrix are used in edge weights in a graph, with a maximum spanning tree forming the probable topology. 
          </CollapsibleDiv>
        </div>
        
        <div className="modern-content-wrapper fade-in-up-delay-1">
          <h3>Generated MST topologies</h3>
          <figure className="text-center">
            <img src="./figs/mst.png" alt="MST diagram" style={{ width: "50%", display: "block", margin: "0 auto"}} /> 
            <figcaption style={{ fontSize: "0.9rem", color: "#555", marginTop: "0.5rem" }}>
            Generated Topology MST before root node identification
            </figcaption>
          </figure>
          <br />
          <figure className="text-center">
            <img src="./figs/mst_2.png" alt="MST diagram 2" style={{ width: "80%", display: "block", margin: "0 auto"}} /> 
            <figcaption style={{ fontSize: "0.9rem", color: "#555", marginTop: "0.5rem" }}>
            Generated Topology MST after root node identification
            </figcaption>
          </figure>
        </div>

        <div className="modern-content-wrapper fade-in-up-delay-2">
          <h2>Accuracy and consistency testing - Topology</h2>
          <p>Due to the absence of ground truth network topology data, a consensus-based accuracy metric was developed. As described above, we implemented various peer-reviewed methodologies, each having been validated and reporting high levels of accuracy. From this set of proven techniques, we can score them based of two tests: </p>
          <ol className="list-decimal list-outside p-3 pl-6">
            <li>Consistency to Other Methods: Independent methods returning similar outputs despite using different approaches indicate the output is more likely to be correct.</li>
            <li>Consistency Across Time: We split our dataset into multiple segments, with methods returning similar results despite differing inputs showing robustness.</li>
          </ol>
          <p>As a result, the method that shows both consensus with peer methods and robustness can be deemed to be the most accurate and best fit for our data.</p>
          <p>For each transformer, an MST was generated using each method, as well for each time segment. The outputs were then compared to each other, with points being assigned for similarities on edge connections, branching similarity, degree similarity, and path similarity. Following testing, the most accurate method (utilising Kendall-Tau Correlation) is used to generate the displayed topology. </p> 
          <h3>Approximate Distance Calculation</h3>
          <p>In addition to generation of connected nodes using a tree, the approximated distance between nodes was also calculated using calculated impedance values for the connecting lines. This was done using a number of power equations: </p>
          <ul className="list-disc list-outside p-3 pl-6">
          <li>Ohm’s Law (proxy): <InlineMath math={`z=\\Delta V/I`}/></li>
          <li>Voltage Drop: <InlineMath math={`\\mathrm{\\Delta V}=V1-V2`}/></li>
          <li>Current Magnitude: <InlineMath math={`I=\\left|S\\right|/V`}/></li>
          <li>Apparent Power (from complex power): <InlineMath math={`\\left|S\\right|=\\sqrt(P^2+Q^2)`}/></li>
          <li>Therefore approximately: <InlineMath math={`z=\\frac{V1-V2}{\\sqrt(P^2+Q^2)}`}/></li>
          </ul>
          <p>Together this allowed impedance to be estimated from the available voltage, active and reactive power data. </p>
          <h2>Root Node Estimation</h2>
          <p>Without transformer data, the connections to the transformer (root node) are estimated separately to the generation of the MST. To do this, the house with highest percentile voltage was first taken as a reference voltage. Percentile was chosen as the baseline voltage is the desired feature, and many noisy peaks may be present that would drag up an average. </p>
          <p>Two key assumptions are then used to calculate any other connections. Firstly, it is assumed that the nodes with overall higher voltage are closet to the transformer, due to them having likely lower line impedance. Next, it is assumed that the corrections seen from the transformer as spikes in voltage will be higher as distance from the transformer grows. This is assumed as the noise seen will grow as distance increases.</p>
          <p>These two ideas are used as a weighted sum along with a score threshold to get the closest houses by voltage. This returns a list of houses that meet the criteria which are joined to the transformer by edges before MST creation.</p>
          <h2>Final Layering Process – Integration with Phase Labels</h2>
          <p>Following chosen method topology generation, distance scoring and root node assignment. The MST is then layered with each nodes identified phase label. The data is then returned to the next stage of the pipeline using a network graph. This graph is attached with labelled nodes for phase as well as estimated distance from the last node. This information is passed on to be converted into the appropriate JSON format.</p>
        </div>

        {/* <div className="modern-card fade-in-up-delay-2">
          <CollapsibleDiv title={'Minimal Spanning Tree Algorithm'}>
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
        </div> */}
      </section>
    </PageLayout>
  );
}
