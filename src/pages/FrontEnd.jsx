import "./PagesFormat.css";

export default function FrontEnd() {
  return (
    <div className="home-container">
      <div className="content-stripe">
        <h1>Front End</h1>
        <p>
          This is the main landing area of your React + Vite application. You can
          customize this section to introduce your project, display key
          information, or guide users to other sections of your site.
        </p>

        <p>
          Built with modern tools like <strong>React</strong> and <strong>Vite</strong>,
          this setup ensures fast development, hot reloading, and efficient
          production builds. Styling is handled via a separate CSS file to keep
          your code organized and maintainable.
        </p>

        <p>
          Feel free to experiment with layout, colors, and typography. This
          central stripe layout helps keep your content focused and readable on
          any screen size.
        </p>
      </div>
    </div>
  );
}
