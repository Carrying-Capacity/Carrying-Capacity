import React from "react";
// import VoltageChart from "../components/VoltageChart";
import ReactiveTable from "../components/ReactiveTable";
import VoltageChart2 from "../components/VoltageChart2";
import PageLayout from '../components/PageLayout';

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
    <PageLayout>
        <h1 className="text-xl font-semibold mb-4">Phase estimation</h1>
        <h2>Raw Data Viewer</h2>

        <p>
          Due to the large size of the database, the viewer below is only for data between 01/03/2025 and 03/03/2025.
          Use the selector to change the house number and chart type.
        </p>
      <div className="voltage-box">
        <div style={{ width: "100%", height: "100%" }}>
          <VoltageChart2/>
        </div>
      </div>

      <p className="mt-6">
        First, note that some of the graphs are 1-phase, whereas others are 3-phase. For example, house 665 is 3-phase since Voltage.PhB and Voltage.PhC exist. 
      </p>
      <p>The transformers and their corresponding houses is displayed as table here.</p>
        <div style={{ width: "100%", height: "100%" }}>
          <ReactiveTable/>
        </div>
      <p>Basically, we just used some magic here, and we could magically envisage the result, which we have proceeded to place here.</p>

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
    </PageLayout>
  );
}
