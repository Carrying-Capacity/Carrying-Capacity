import "./PagesFormat.css";

export default function NetworkEstimate() {
  return (
    <div className="home-container">
      <div className="content-stripe">
      <h2>Network Structure Estimation</h2>
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
      <p>
          The Chow-Liu Algorithm was used in order to get the network structure.
          
      </p>
      </div>
    </div>
  );
}
