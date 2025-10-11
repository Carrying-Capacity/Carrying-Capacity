import React from "react";
import VoltageChart from "../components/VoltageChart";
import "./PagesFormat.css";

export default function PhaseEstimate() {
    const transformers = [
      {'id': 'TX1', 'threePhase': '1/1', 'split': [18, 20, 24], 'score': '0.946'},
      {'id': 'TX2', 'threePhase': '0/0', 'split': [16, 16, 17], 'score': '0.986'},
      {'id': 'TX3', 'threePhase': '0/0', 'split': [4, 5, 3], 'score': '0.917'},
      {'id': 'TX4', 'threePhase': '0/1', 'split': [10, 6, 1], 'score': '0.225'},
      {'id': 'TX5', 'threePhase': '4/6', 'split': [22, 23, 19], 'score': '0.797'},
      {'id': 'TX6', 'threePhase': '16/16', 'split': [20, 25, 16], 'score': '0.923'},
      {'id': 'TX7', 'threePhase': '2/2', 'split': [25, 23, 31], 'score': '0.941'},
      {'id': 'TX8', 'threePhase': '0/0', 'split': [4, 4, 3], 'score': '0.939'},
      {'id': 'TX9', 'threePhase': '2/2', 'split': [18, 18, 18], 'score': '1.000'},
      {'id': 'TX10', 'threePhase': '0/0', 'split': [24, 22, 22], 'score': '0.980'},
      {'id': 'TX11', 'threePhase': '2/2', 'split': [30, 33, 27], 'score': '0.967'},
      {'id': 'TX12', 'threePhase': '1/1', 'split': [5, 6, 6], 'score': '0.961'},
      {'id': 'TX13', 'threePhase': '0/0', 'split': [21, 20, 22], 'score': '0.984'},
      {'id': 'TX14', 'threePhase': '0/0', 'split': [16, 18, 14], 'score': '0.958'},
      {'id': 'TX15', 'threePhase': '0/0', 'split': [7, 6, 6], 'score': '0.965'},
      {'id': 'TX16', 'threePhase': '0/0', 'split': [2, 3, 3], 'score': '0.917'},
      {'id': 'TX17', 'threePhase': '2/2', 'split': [4, 4, 5], 'score': '0.949'}
    ];

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
      Basically, we just used some magic here, and we could magically envisage the result, which we have proceeded to place here. 
      </p>

        <table style={{ width: "80%", margin: "2rem auto", borderCollapse: "collapse", textAlign: "center" }}>
          <thead style={{ background: "#f3f4f6" }}>
            <tr>
              <th>Transformer</th>
              <th>3 Phase</th>
              <th>Split</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {transformers.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.threePhase}</td>
                <td>[{tx.split.join(", ")}]</td>
                <td>{tx.score}</td>
              </tr>
            ))}
          </tbody>
          <tfoot style={{ background: "#f9fafb", fontWeight: "bold" }}>
            <tr>
              <td colSpan="3">Average Score</td>
              <td>{0.903}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
