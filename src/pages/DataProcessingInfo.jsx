import PageLayout from '../components/PageLayout';
import ReactiveTable from "../components/TransformerDisplayTable";
import VoltageChart2 from "../components/VoltageChart2";

export default function DataProcessingInfo() {
  return (
    <PageLayout>
      <h1>Data Visualisation and Processing</h1>
      {/* <img src={NetworkImage} alt="Electrical Network" className="home-image" /> */}
      <p>The original data was given to us in CSV format. James helped with converting this format into 
        parquets, because this was faster for loading into python files. After the data was converted into Parquet format, Alex had made a standardized cleaned format for everyone
        to use, which is this format.
      </p>
      <h2>Raw Data Viewer</h2>
      <p>
        Due to the large size of the database, the viewer below is only for data between 01/03/2025 and 03/03/2025.
        Use the selector to change the house number and chart type. The grapher shows the data obtained from the parquet files, so they have only been sorted
        chronologically and the timestamps were ordered, but no further processing was done.
      </p>
      <div className="voltage-box">
        <VoltageChart2/>
      </div>

      <p className="mt-6">
        First, note that some of the graphs are 1-phase, whereas others are 3-phase. For example, house 665 is 3-phase since Voltage.PhB and Voltage.PhC exist. 
      </p>
      <p>The transformers and their corresponding houses is displayed as table here.</p>

      <div style={{ width: "100%", height: "100%", margin: "0 auto" }}>
          <ReactiveTable/>
      </div>
    </PageLayout>
  );
}
