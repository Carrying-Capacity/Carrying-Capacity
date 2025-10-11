import "./PagesFormat.css";
import NetworkImage from '../assets/transformer.png'; // adjust the path

export default function Home() {
  return (
    <div className="home-container">
      <div className="content-stripe">
        <h1>Welcome to Carrying Capacity.</h1>
        <p>
          We model, analyze, and optimize electrical networks.
          Navigate through the sections on the top right corner to explore our features:
        </p>
        <ul>
          <li><strong>Home:</strong> Overview and quick access to all tools.</li>
          <li><strong>Network Estimate:</strong> Predict and visualize network load and performance.</li>
          <li><strong>Phase Estimate:</strong> Analyze phase distribution across your network.</li>
          <li><strong>Street Generation:</strong> Automatically generate network layouts for streets and neighborhoods.</li>
          <li><strong>Front End:</strong> Interactive interface for data input and analysis.</li>
          <li><strong>Transformer Map:</strong> View and manage transformer locations and connectivity.</li>
        </ul>
        <p>
          Designed for engineers and planners, our platform makes electrical network planning smarter, faster, and more precise.
        </p>
        <img src={NetworkImage} alt="Electrical Network" className="home-image" />
      </div>
    </div>
  );
}
