import PageLayout from '../components/PageLayout';
import { InlineMath } from 'react-katex';
import CollapsibleDiv from "../components/CollapsableDiv";
export default function StreetGeneration() {
  return (
    <PageLayout variant="modern">
      <div className="modern-page-hero">
        <h1 className="modern-page-title">Street Generation</h1>
        <p className="modern-page-subtitle">
          Street generation algorithm
        </p>
      </div>

      <section className="modern-page-section fade-in-up">
        <div className="modern-content-wrapper">
          <h2 className="modern-section-title">Ant Function Algorithm</h2>
          <h3 className="modern-subsection-title">Custom Built ‘Ant’ Agents</h3>
          <p>Nodes were positioned using kernel density estimation and custom agents called ants. The ant agents extend another class called TurtleStack, which itself was inspired by the python turtle library -- although we do not use this library. The TurtleStack class basically stores our current position, direction, and our link to NetworkNodes. It has functions for popping state, pushing state, getting direction, etc. The ant class provides more intelligence than the turtle. The idea is that ants will automatically generate street layouts by moving forward and turning in a way which makes sense for an actual network topology (i.e.,  they should cross over each other’s paths, should not place houses on top of existing houses, should not generate streets which run too close to other streets, and should not extend excessively far from the main network).</p>
        </div>

        <div className="modern-card fade-in-up-delay-1">
          <h3 className="modern-subsection-title">Kernel Density Estimation</h3>
          <p>This was achieved using kernel density estimation to determine whether any given ant is too close to, or to far from existing nodes. The ants then have two states: “moving in” and “moving out”. In the moving out state, the ant has realised it is too close to existing nodes, and will try to minimize kernel density, and in the “moving in” state, the opposite is true. To avoid landing directly on other housing in the “moving in” state, we also use a smaller kernel to identify nodes which are too close to our next position, to stop the ant landing immediately adjacent to them. This smaller kernel is weighted very heavily when we score positions because we never want this to happen.</p>
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
              <p>The idea here is that each node tracks previous nodes and next nodes and then have a payload associated with each node. Although our topology is a tree, we track previous nodes as an array instead of as a single node for consistency and in case we must handle different types of topologies going forward (where circuits are theoretically possible).</p>
            </CollapsibleDiv>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
