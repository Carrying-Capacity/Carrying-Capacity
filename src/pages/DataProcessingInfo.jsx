import "./PagesFormat.css";
import NetworkImage from '../assets/transformer.png'; // adjust the path

export default function DataProcessingInfo() {
  return (
    <div className="home-container">
      <div className="content-stripe">
        <h1>Data Processing information</h1>
        <p>Information about Data processing, usage of Parquets</p>
        <img src={NetworkImage} alt="Electrical Network" className="home-image" />
      </div>
    </div>
  );
}
