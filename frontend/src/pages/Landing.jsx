import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="brand">
          <span className="logo-icon">💰</span>
          <h1><span className="brand-accent">Fin</span>ora</h1>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-ghost">Log in</Link>
          <Link to="/signup" className="btn btn-primary">Get Started Free</Link>
        </div>
      </nav>

      <main className="landing-hero">
        <div className="hero-content">
          <div className="badge badge-blue animate-in">🚀 v2.0 Now Live</div>
          <h1 className="hero-title animate-in-delay-1">
            Master your money with <br/>
            <span className="text-gradient">intelligent tracking</span>
          </h1>
          <p className="hero-subtitle animate-in-delay-2">
            The premium expense tracker built for Gen-Z. Get AI insights, track subscriptions, set goals, and stop wondering where your money went.
          </p>
          <div className="hero-actions animate-in-delay-3">
            <Link to="/signup" className="btn btn-primary btn-lg">Start Tracking Now</Link>
            <a href="#features" className="btn btn-secondary btn-lg">Explore Features</a>
          </div>
        </div>

        {/* Abstract dashboard preview */}
        <div className="hero-image-wrapper animate-in-delay-3">
          <div className="hero-dashboard-mockup card-glass">
            <div className="mockup-header">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="m-nav-item active"></div>
                <div className="m-nav-item"></div>
                <div className="m-nav-item"></div>
                <div className="m-nav-item"></div>
              </div>
              <div className="mockup-content">
                <div className="mockup-cards">
                  <div className="m-card m-blue">
                    <div className="m-line short"></div>
                    <div className="m-line thick"></div>
                  </div>
                  <div className="m-card m-red">
                    <div className="m-line short"></div>
                    <div className="m-line thick"></div>
                  </div>
                  <div className="m-card m-green">
                    <div className="m-line short"></div>
                    <div className="m-line thick"></div>
                  </div>
                </div>
                <div className="mockup-chart">
                  <div className="m-bar" style={{height: '40%'}}></div>
                  <div className="m-bar" style={{height: '70%'}}></div>
                  <div className="m-bar" style={{height: '50%'}}></div>
                  <div className="m-bar" style={{height: '90%'}}></div>
                  <div className="m-bar" style={{height: '30%'}}></div>
                  <div className="m-bar" style={{height: '60%'}}></div>
                  <div className="m-bar" style={{height: '80%'}}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative blur blobs */}
          <div className="blob-bg blob-tr"></div>
          <div className="blob-bg blob-bl"></div>
        </div>
      </main>

      {/* FEATURES SECTION */}
      <section id="features" className="features-section">
        <div className="features-header animate-in">
          <h2>Everything you need to master your money</h2>
          <p>Built for the modern Gen-Z user, Finora packs premium features into a beautiful, lightning-fast dashboard.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="f-icon">✨</div>
            <h3>AI Spending Insights</h3>
            <p>Smart, rule-based algorithms analyze your past 3 months of spending to give you personalized alerts and saving tips.</p>
          </div>
          <div className="feature-card">
            <div className="f-icon">🎯</div>
            <h3>Savings Goals</h3>
            <p>Set custom targets for that new laptop or vacation. Track your progress visually with beautiful progress rings.</p>
          </div>
          <div className="feature-card">
            <div className="f-icon">📊</div>
            <h3>Deep Analytics</h3>
            <p>Understand exactly where your money goes with interactive charts, category breakdowns, and weekly heatmaps.</p>
          </div>
          <div className="feature-card">
            <div className="f-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your data is securely stored in a cloud database with enterprise-grade JWT authentication and hashed passwords.</p>
          </div>
          <div className="feature-card">
            <div className="f-icon">🌙</div>
            <h3>Premium Dark Mode</h3>
            <p>A stunning, glassmorphism-inspired UI that looks amazing late at night and is easy on the eyes.</p>
          </div>
          <div className="feature-card">
            <div className="f-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Built on React and Vite for a highly responsive, app-like experience with zero page reloads.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>Made with ❤️ by Madhuri | Finora SaaS © {new Date().getFullYear()}</p>
        <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
      </footer>
    </div>
  );
}
