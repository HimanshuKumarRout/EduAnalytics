import React from 'react';

/**
 * Reusable Live Sync Status Badge with glowing pulse dot
 */
export const LiveSyncBadge = ({ text = 'Syncing data from Supabase...' }) => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.4rem 0.95rem',
    background: '#ffffff',
    borderRadius: '24px',
    border: '1px solid #a7f3d0',
    fontSize: '0.825rem',
    fontWeight: 600,
    color: '#065f46',
    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)'
  }}>
    <span className="live-pulse-dot" />
    {text}
  </div>
);

/**
 * Skeleton table rows for list/table views (Students, Results, Rankings, Subjects)
 */
export const TableRowsSkeleton = ({ columns = 6, rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, rIdx) => (
      <tr key={rIdx} className="fade-in">
        {Array.from({ length: columns }).map((_, cIdx) => (
          <td key={cIdx}>
            <div 
              className="skeleton" 
              style={{ 
                height: '18px', 
                width: cIdx === 0 ? '55%' : cIdx === 1 ? '80%' : '65%', 
                borderRadius: '4px' 
              }} 
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

/**
 * Full page skeleton for the main Dashboard
 */
export const DashboardSkeleton = () => (
  <div className="fade-in">
    {/* Syncing status indicator */}
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
      <LiveSyncBadge text="Syncing analytics from Supabase..." />
    </div>

    {/* 4 Skeleton Stat Cards */}
    <div className="stat-grid" style={{ marginBottom: '2rem' }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.35rem' }}>
          <div className="skeleton skeleton-circle" style={{ width: '48px', height: '48px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text" style={{ width: '60%', height: '12px' }} />
            <div className="skeleton" style={{ width: '40%', height: '26px', borderRadius: '6px', marginTop: '0.4rem' }} />
          </div>
        </div>
      ))}
    </div>

    {/* Row 1: Skeletons for Subject Average & Grade Distribution */}
    <div className="grid-2" style={{ marginBottom: '2rem' }}>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="skeleton skeleton-circle" style={{ width: '20px', height: '20px' }} />
          <div className="skeleton skeleton-title" style={{ width: '45%', margin: 0 }} />
        </div>
        <div className="card-body" style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '1.5rem', padding: '1.5rem 2rem' }}>
          {[65, 85, 55, 90, 70].map((h, idx) => (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <div className="skeleton" style={{ width: '100%', height: `${h}%`, borderRadius: '6px 6px 0 0' }} />
              <div className="skeleton skeleton-text" style={{ width: '70%', height: '10px' }} />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="skeleton skeleton-circle" style={{ width: '20px', height: '20px' }} />
          <div className="skeleton skeleton-title" style={{ width: '40%', margin: 0 }} />
        </div>
        <div className="card-body" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '200px', height: '200px' }}>
            <div className="skeleton skeleton-circle" style={{ width: '200px', height: '200px' }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '130px',
              height: '130px',
              background: '#ffffff',
              borderRadius: '50%',
            }} />
          </div>
        </div>
      </div>
    </div>

    {/* Row 2: Skeletons for Top Students & Exam Trend */}
    <div className="grid-2">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="skeleton skeleton-circle" style={{ width: '20px', height: '20px' }} />
          <div className="skeleton skeleton-title" style={{ width: '35%', margin: 0 }} />
        </div>
        <div className="card-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[95, 88, 80, 75, 68].map((w, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="skeleton skeleton-text" style={{ width: '80px', height: '12px', margin: 0 }} />
              <div className="skeleton" style={{ flex: 1, height: '18px', maxWidth: `${w}%`, borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="skeleton skeleton-circle" style={{ width: '20px', height: '20px' }} />
          <div className="skeleton skeleton-title" style={{ width: '45%', margin: 0 }} />
        </div>
        <div className="card-body" style={{ height: '220px', padding: '1.5rem', display: 'flex', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: '100%', height: '120px', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Full page skeleton for Analytics & Performance Analysis
 */
export const AnalysisSkeleton = () => (
  <div className="fade-in">
    {/* Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <div className="skeleton skeleton-title" style={{ width: '280px', height: '24px' }} />
        <div className="skeleton skeleton-text" style={{ width: '380px', height: '14px' }} />
      </div>
      <LiveSyncBadge text="Calculating performance metrics..." />
    </div>

    {/* Charts Row 1 Skeletons */}
    <div className="grid-2" style={{ marginBottom: '2rem' }}>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="skeleton skeleton-circle" style={{ width: '20px', height: '20px' }} />
          <div className="skeleton skeleton-title" style={{ width: '40%', margin: 0 }} />
        </div>
        <div className="card-body" style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '1.5rem', padding: '1.5rem 2rem' }}>
          {[70, 85, 60, 90, 75].map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <div className="skeleton" style={{ width: '100%', height: `${h}%`, borderRadius: '6px 6px 0 0' }} />
              <div className="skeleton skeleton-text" style={{ width: '60%', height: '10px' }} />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="skeleton skeleton-circle" style={{ width: '20px', height: '20px' }} />
          <div className="skeleton skeleton-title" style={{ width: '45%', margin: 0 }} />
        </div>
        <div className="card-body" style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '1.5rem', padding: '1.5rem 2rem' }}>
          {[80, 65, 75, 88].map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <div className="skeleton" style={{ width: '100%', height: `${h}%`, borderRadius: '6px 6px 0 0' }} />
              <div className="skeleton skeleton-text" style={{ width: '50%', height: '10px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Charts Row 2 Skeletons */}
    <div className="grid-2" style={{ marginBottom: '2rem' }}>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="skeleton skeleton-circle" style={{ width: '20px', height: '20px' }} />
          <div className="skeleton skeleton-title" style={{ width: '35%', margin: 0 }} />
        </div>
        <div className="card-body" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '200px', height: '200px' }}>
            <div className="skeleton skeleton-circle" style={{ width: '200px', height: '200px' }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '130px',
              height: '130px',
              background: '#ffffff',
              borderRadius: '50%',
            }} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="skeleton skeleton-circle" style={{ width: '20px', height: '20px' }} />
          <div className="skeleton skeleton-title" style={{ width: '40%', margin: 0 }} />
        </div>
        <div className="card-body" style={{ height: '300px', padding: '2rem', display: 'flex', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: '100%', height: '180px', borderRadius: '8px' }} />
        </div>
      </div>
    </div>

    {/* Table Skeleton */}
    <div className="card">
      <div className="card-header">
        <div className="skeleton skeleton-title" style={{ width: '25%', margin: 0 }} />
      </div>
      <div className="card-body p-0">
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton" style={{ width: '100%', height: '36px', borderRadius: '6px' }} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Skeleton for Student Profile / Detail view
 */
export const StudentDetailSkeleton = () => (
  <div className="fade-in">
    <div className="skeleton" style={{ width: '140px', height: '32px', borderRadius: '6px', marginBottom: '1.5rem' }} />
    <div className="grid-2" style={{ gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
      <div className="card" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="skeleton skeleton-circle" style={{ width: '84px', height: '84px', marginBottom: '1rem' }} />
        <div className="skeleton skeleton-title" style={{ width: '60%', height: '20px' }} />
        <div className="skeleton skeleton-text" style={{ width: '40%', height: '14px' }} />
        <div style={{ width: '100%', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ width: '100%', height: '24px', borderRadius: '4px' }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', height: '260px' }}>
          <div className="skeleton skeleton-title" style={{ width: '30%' }} />
          <div className="skeleton" style={{ width: '100%', height: '160px', marginTop: '1rem', borderRadius: '8px' }} />
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="skeleton skeleton-title" style={{ width: '25%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ width: '100%', height: '32px', borderRadius: '4px' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * General purpose centered loading spinner
 */
export const LoadingSpinner = ({ message = 'Loading data...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    minHeight: '300px',
    gap: '1rem'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #e2e8f0',
      borderTopColor: '#059669',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
      {message}
    </span>
  </div>
);

export default {
  LiveSyncBadge,
  TableRowsSkeleton,
  DashboardSkeleton,
  AnalysisSkeleton,
  StudentDetailSkeleton,
  LoadingSpinner
};
