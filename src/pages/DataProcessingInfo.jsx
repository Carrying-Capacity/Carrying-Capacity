import PageLayout from '../components/PageLayout';
import ReactiveTable from "../components/TransformerDisplayTable";
import VoltageChart2 from "../components/VoltageChart2";

export default function DataProcessingInfo() {
  return (
    <PageLayout variant="modern">
      <div className="modern-page-hero">
        <h1 className="modern-page-title">Data Visualisation and Processing</h1>
        <p className="modern-page-subtitle">
          Exploring and understanding the electrical network data through interactive visualizations
        </p>
      </div>
      <section className="modern-page-section fade-in-up">
        <div className="modern-card fade-in-up-delay-1">
          <h2 className="modern-section-title">Raw Data Viewer</h2>
          <p className="modern-intro-text">
            The original data was given to us in CSV format. James helped with converting this format into 
            parquets, because this was faster for loading into python files. After the data was converted into Parquet format, Alex had made a standardized cleaned format for everyone
            to use, which is this format.

            <br />

            Due to the large size of the database, the viewer below is only for data between 01/03/2025 and 03/03/2025.
            Use the selector to change the house number and chart type. The grapher shows the data obtained from the parquet files, so they have only been sorted
            chronologically and the timestamps were ordered, but no further processing was done.
          </p>
          <div className="voltage-box">
            <VoltageChart2/>
          </div>
          <br />
          <p>
            First, note that some of the graphs are 1-phase, whereas others are 3-phase. For example, house 665 is 3-phase since Voltage.PhB and Voltage.PhC exist. 
          </p>
          <p>The transformers and their corresponding houses is displayed as table here.</p>

          <div style={{ width: "100%", height: "100%", margin: "0 auto" }}>
              <ReactiveTable/>
          </div>
        </div>
        <div className="modern-card fade-in-up-delay-2">
          <h2>Project Pipeline Overview</h2>
          <p>The phase identification project follows a multistage process as described in Figure 1. Firstly, the large dataset is converted into a Parquet file for compression purposes. Following this a custom “ImportData” function allows for consistent data extraction from the files across the project.  
          </p>
          <p>The pipeline then splits into two distinct processes. Seperatly, the dataset is analysed to identify and attach phase labels to each transformer, while also interpreted to generate a minimum spanning tree of the overarching electrical network. The two separate methods are then combined and layered, before being converted into a user-friendly network map. Finally, the results are displayed on a website. Further details about each described step can be found in their respective sections.</p>
          <img 
            src="./figs/pipeline.png" 
            alt="Pipeline" 
            style={{ height: "10%", display: "block", margin: "0 auto"}}
          />
        </div>
        <div className="modern-card fade-in-up-delay-2">
          <h2>Parquet file Usage</h2>
          <p>Due to the size of the database, a parquet-based file system was chosen for data storage. This is due to its superior compression and reading speed when compared to the traditionally csv format. The data was stored in six individual parquet files, each representing 2-3 transformers. The use of the parquet files also necessitated a custom importData function. This function ensured that data extraction across all methods within the code based followed a common style and output, ensuring overall reusability and portability. </p>
          <img src="./figs/parquets.png" alt="Parquet" style={{ width: "30%", display: "block", margin: "0 auto"}}/>
        </div>
      </section>
    </PageLayout>
  );
}
