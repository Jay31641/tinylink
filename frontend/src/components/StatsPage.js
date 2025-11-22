import React from "react";
import { Link, useParams } from "react-router-dom";

class StatsPageBase extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      link: null,
      loading: true,
      error: "",
    };

    this.backendUrl = "https://tinylink-iwdp.onrender.com";
  }

  componentDidMount() {
    const { code } = this.props.params;

    fetch(`${this.backendUrl}/api/links/${code}`)
      .then((res) => {
        if (!res.ok) throw new Error("Code not found");
        return res.json();
      })
      .then((data) => this.setState({ link: data, loading: false }))
      .catch((err) => this.setState({ error: err.message, loading: false }));
  }

  render() {
    const { code } = this.props.params;
    const { link, loading, error } = this.state;

    return (
      <div className="dashboard-container">
        <h1 className="code-title">Stats for: {code}</h1>
        <Link to="/">← Back to Dashboard</Link>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {link && (
          <div className="stats-card">
            <p><b>Code:</b> {link.code}</p>
            <p><b>URL:</b> {link.url}</p>
            <p><b>Clicks:</b> {link.click_count}</p>
            <p><b>Created At:</b> {link.created_at}</p>
            <p><b>Last Clicked:</b> {link.last_clicked || "Never clicked"}</p>
          </div>
        )}
      </div>
    );
  }
}

function StatsPage() {
  const params = useParams();
  return <StatsPageBase params={params} />;
}

export default StatsPage;
