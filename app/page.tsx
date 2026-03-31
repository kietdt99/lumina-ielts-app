export default function Dashboard() {
  return (
    <div>
      <h1>Welcome to Lumina IELTS</h1>
      <p style={{ marginBottom: '2rem' }}>Your robust AI-driven platform for achieving your target band.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Target Band: 7.5</h2>
          <p>Consistent practice is the key to success. Keep going!</p>
        </div>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Recent Activity</h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><span style={{ color: 'var(--success)' }}>●</span> Writing Task 2 - Band 7.0 (2 days ago)</li>
            <li><span style={{ color: 'var(--primary)' }}>●</span> Reading Mock - Band 8.0 (Yesterday)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
