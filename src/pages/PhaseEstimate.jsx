import React from "react";
import VoltageChart from "../components/VoltageChart";
import "./PagesFormat.css";

export default function PhaseEstimate() {
  return (
    <div className="home-container">
      <div className="content-stripe">
        <h1 className="text-xl font-semibold mb-4">Phase Estimation</h1>

        <p>
          After cleaning and ordering the given data from the meters, for a single house, in this case House 635 of Transformer Tx15
          The resulting data for a single house, with a solar panel, for the first month, will look like this:


        </p>
      <div className="voltage-box">
        <div style={{ width: "100%", height: "100%" }}>
          <VoltageChart
            startDate="2025-01-01"
            endDate="2025-10-10"
            rowLimit={10000}
          />
        </div>
      </div>


        <p className="mt-6">
          Ok, so we have the data. The first requirement is to estimate the
          Phases with the given data. 
        </p>
      </div>
    </div>
  );
}
