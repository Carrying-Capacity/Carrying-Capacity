import PageLayout from '../components/PageLayout';
import { InlineMath } from 'react-katex';

export default function StreetGeneration() {
  return (
    <PageLayout variant="modern">
      <div className="modern-page-hero">
        <h1 className="modern-page-title">Street Generation</h1>
        <p className="modern-page-subtitle">
          The street generation functionality was difficult to implement, and it was done by Tyler and James.
        </p>
      </div>

      <section className="modern-page-section fade-in-up">
        <div className="modern-content-wrapper">
          <p>
            We were given the network estimate. However, due to privacy concerns, there was no data given on the location of the hosues.
            This was quite annoying for display, since we then were required to make an artificial neighborhood so that the houses could be displayed properly.
          </p>
        </div>

        <div className="modern-card fade-in-up-delay-1">
          <h2 className="modern-section-title">Ant Function Algorithm</h2>
          <p className="modern-intro-text">The mapping was done using an ant function.</p>
          
          <ol className="modern-ordered-list">
            <li>The nodes were created following data from the network estimation. Therefore, each node will have parents, children etc.</li>
            <li>use an ant crawler that goes out on density estimate to decide whether to turn. It is assumed that all streets are equally far away and the ant has 4 options:
              <ul className="modern-unordered-list">
                <li>Terminate tree, when all nodes are completed</li>
                <li>Go left</li>
                <li>Go right</li>
                <li>Go forward (distance is based on density of housing).</li>
              </ul>
            </li>
            <li>Sometimes, a "street" node has an associated house, which will have an associated house ID attached to it.</li>
            <li>try to avoid positions that have existing houses, but also try to stay near the houses, using density functions.
            This means that the ant will not stray too far from the neighborhood but also try to avoid existing houses.</li>
            <li>Once all ants have completed their node tree, then the neighborhood is constructed.</li>
          </ol>
        </div>

        <div className="modern-content-wrapper fade-in-up-delay-2">
          <p>
            The resulting street structure was then given to the Frontend team (Chris, Owen) to create the interactible map.
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
