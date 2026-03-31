import { signout } from '@/app/auth/actions'

export default function Dashboard() {
  return (
    <div className="dashboard-stack">
      <div className="dashboard-header">
        <div className="dashboard-copy">
          <p className="section-label">Dashboard</p>
          <h1>Welcome to Lumina IELTS</h1>
          <p>
            Your AI-supported workspace for building a reliable study rhythm
            and reaching your target band.
          </p>
        </div>
        <form action={signout}>
          <button type="submit" className="secondary-button">
            Sign Out
          </button>
        </form>
      </div>

      <div className="dashboard-grid">
        <div className="glass dashboard-card">
          <h2 className="card-title accent-text">Target Band: 7.5</h2>
          <p>Consistent practice is the key to success. Keep going!</p>
        </div>
        <div className="glass dashboard-card">
          <h2 className="card-title">Recent Activity</h2>
          <ul className="activity-list">
            <li>
              <span className="status-dot success-dot" aria-hidden="true" />
              Writing Task 2 review - estimated band 7.0
            </li>
            <li>
              <span className="status-dot primary-dot" aria-hidden="true" />
              Reading mock review - estimated band 8.0
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
