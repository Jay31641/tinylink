import { Link } from "react-router-dom";
import React from "react";

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      links: [],
      loading: true,
      error: "",
      longUrl: "",
      customCode: "",
      creating: false,
      createError: "",
      successMessage: "",
    };

    this.backendUrl = "https://tinylink-iwdp.onrender.com";
  }

  componentDidMount() {
    fetch(`${this.backendUrl}/api/links`)
      .then((res) => res.json())
      .then((data) => this.setState({ links: data, loading: false }))
      .catch(() =>
        this.setState({ error: "Unable to load links", loading: false })
      );
  }

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  createLink = (e) => {
    e.preventDefault();

    this.setState({
      createError: "",
      successMessage: "",
      creating: true,
    });

    const { longUrl, customCode } = this.state;

    if (!longUrl.startsWith("http://") && !longUrl.startsWith("https://")) {
      this.setState({
        createError: "URL must start with http:// or https://",
        creating: false,
      });
      return;
    }

    const bodyData = {
      url: longUrl,
      code: customCode.trim() === "" ? undefined : customCode.trim(),
    };

    fetch(`${this.backendUrl}/api/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error creating link");
        }
        return res.json();
      })
      .then((data) => {
        this.setState((prev) => ({
          successMessage: "Short link created: " + data.shortUrl,
          links: [
            {
              code: data.code,
              url: data.url,
              click_count: 0,
              last_clicked: null,
            },
            ...prev.links,
          ],
          longUrl: "",
          customCode: "",
        }));
      })
      .catch((err) => this.setState({ createError: err.message }))
      .finally(() => this.setState({ creating: false }));
  };

  deleteLink = (code) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;

    fetch(`${this.backendUrl}/api/links/${code}`, {
      method: "DELETE",
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error deleting link");
        }
        return res.json();
      })
      .then(() =>
        this.setState((prev) => ({
          links: prev.links.filter((l) => l.code !== code),
        }))
      )
      .catch((err) => alert("Delete failed: " + err.message));
  };

  render() {
    const {
      links,
      loading,
      error,
      longUrl,
      customCode,
      creating,
      createError,
      successMessage,
    } = this.state;

    return (
      <div className="dashboard-container">
        <h1>TinyLink Dashboard</h1>

        {/* Create Link */}
        <div className="card-box">
          <h2>Create Short Link</h2>
          <p>Enter a long URL and optional custom short code.</p>

          <form className="link-form" onSubmit={this.createLink}>
            <input
              type="text"
              name="longUrl"
              className="link-form-input"
              placeholder="Enter long URL..."
              value={longUrl}
              onChange={this.handleInputChange}
            />

            <input
              type="text"
              name="customCode"
              className="link-form-input"
              placeholder="Custom code (optional)"
              value={customCode}
              onChange={this.handleInputChange}
            />

            <button type="submit" disabled={creating} className="create-btn">
              {creating ? "Creating..." : "Create"}
            </button>
          </form>

          {createError && <p style={{ color: "red" }}>{createError}</p>}
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        </div>

        {/* Links Table */}
        <div className="card-box">
          <h2>All Short Links</h2>

          {loading && <p>Loading links...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && links.length === 0 && <p>No links created yet.</p>}

          {!loading && links.length > 0 && (
            <table className="links-table">
              <thead>
                <tr>
                  <th>Short URL</th>
                  <th>Clicks</th>
                  <th>Last Clicked</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {links.map((link) => (
                  <tr key={link.code}>
                    {/* Short URL - clickable */}
                    <td className="links-table-cell">
                      <a
                        href={`https://tinylink-iwdp.onrender.com/${link.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="short-url-link"
                      >
                        https://tinylink-iwdp.onrender.com/{link.code}
                      </a>
                    </td>
                    {/* Click count */}
                    <td className="links-table-cell">{link.click_count}</td>

                    {/* Last clicked time */}
                    <td className="links-table-cell">
                      {link.last_clicked || "Never"}
                    </td>

                    {/* Buttons */}
                    <td className="links-table-cell">
                      <Link to={`/code/${link.code}`}>
                        <button
                          className="view-btn"
                          style={{ marginRight: "8px" }}
                        >
                          View
                        </button>
                      </Link>

                      <button
                        className="delete-btn"
                        onClick={() => this.deleteLink(link.code)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }
}

export default Dashboard;
