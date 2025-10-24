import PageLayout from '../components/PageLayout';
import { InlineMath } from 'react-katex';
import CollapsibleDiv from "../components/CollapsableDiv";
export default function StreetGeneration() {
  return (
    <PageLayout variant="modern">
      <div className="modern-page-hero">
        <h1 className="modern-page-title">Street Generation</h1>
        <p className="modern-page-subtitle">
          Ant algorithm, custom built ant agents and Kernel density estimation
        </p>
      </div>
      <section className="modern-page-section fade-in-up">
        <div className="modern-content-wrapper">
          <h2 className="modern-section-title">Ant Function Algorithm</h2>
          <h3 className="modern-subsection-title">Custom Built ‘Ant’ Agents</h3>
          <p>Nodes are positioned using kernel density estimation (KDE) and custom agents called ants. The ant agents extend the TurtleStack class, which stores the current position, direction, and link to associated NetworkNodes, and provides functions for pushing and popping state and getting direction.
            <br />
          The Ant class adds logic that allows the agents to automatically generate street layouts by moving forward and turning in ways that make sense for an actual network topology. They should not cross paths, place houses on top of existing houses, run streets too close to each other, or extend too far from the main network.
          <br />
          <h3>Network Generation Algorithm</h3>
          </p>
          <CollapsibleDiv title={`Network Generation Algorithm`}>
          <ol class="list-decimal list-outside mx-6 my-6">
              <li>Each StreetNode represents a spatial position linked to a network node and tracks its previous and next nodes.</li>
              <li>Ant agents are initialised from transformer nodes and move through space to generate realistic street layouts.</li>
              <li>Each ant stores its current position, direction, and state, allowing it to branch or backtrack as needed.</li>
              <li>Node placement is determined using kernel density estimation (KDE) to measure proximity to existing nodes.</li>
              <li>When density is too high, ants move outwards.</li>
              <li>When density is too low, they move inwards.</li>
              <li>At each step, ants test multiple candidate directions, score them using KDE and short-range penalties, and move to the best position.</li>
              <li>When a branch in the network occurs, new ants are created for each child node.</li>
              <li>The process continues until all ants reach their terminal nodes, producing a spatially distributed network ready for JSON generation and front-end rendering.</li>
          </ol>
          </CollapsibleDiv>
                    <h3 className="modern-subsection-title">Kernel Density Estimation</h3>
                    <p>KDE is used to determine whether an ant is too close to or too far from existing nodes. Ants have two states: “moving in” and “moving out.”:
          <ul class="list-disc list-outside mx-6 my-6">
            <li>In the moving out state, the ant moves away from areas where nodes are too close together.</li>
          <li>In the moving in state, it moves toward areas with lower node density.</li>
            </ul>
          A smaller alternative kernel is used to detect when the next position is too close to an existing node. This smaller kernel is weighted heavily when scoring positions to prevent ants from placing new nodes right next to existing ones.
          </p>
          <img src="./figs/ant.png" alt="Ant street generation" style={{ width: "60%", display: "block", margin: "0 auto"}}/>
          </div>
          <div className="modern-card fade-in-up-delay-2">
            <h3 className="modern-subsection-title">JSON output file format</h3>

            <p>The most critical function of the data platform is JSON generation. The final output of the JSON files were formatted as below.</p>
            <div className='w-2/3 mx-auto'>
              <CollapsibleDiv title={`JSON file format`}>
                <div style={{ whiteSpace: "pre" }}>
                  <p>{
  `{"type": "house",
        "id": "95af7aadf50d4",
            "next_nodes": [
                  "9edaae5bdd214",
                  "8219340351aa4",
                  "b639bbe5f8664"
            ],
            "prev_nodes": [
                  "bb5fa844514d4"
            ],
        "prev_node_distance": 0.339760238135554,
        "x_meters": -9.679755130750904,
        "y_meters": -2.970386441008803,
        "transformer": 11,
        "voltage_data": [],
        "predicted_phase": "C",
        "solar": false,
        "house_number": 441
  }`}</p>
              </div>
              {/* <p>The idea here is that each node tracks previous nodes and next nodes and then have a payload associated with each node. Although our topology is a tree, we track previous nodes as an array instead of as a single node for consistency and in case we must handle different types of topologies going forward (where circuits are theoretically possible).</p> */}
            </CollapsibleDiv>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
