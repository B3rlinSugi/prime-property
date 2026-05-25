import styles from './Skeleton.module.css';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  style?: React.CSSProperties;
}

export default function Skeleton({ className = '', width, height, circle = false, style = {} }: SkeletonProps) {
  const customStyles: React.CSSProperties = { ...style };
  if (width !== undefined) customStyles.width = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined) customStyles.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <span
      className={`${styles.skeleton} ${circle ? styles.circle : ''} ${className}`}
      style={customStyles}
    />
  );
}

export function SkeletonText({ count = 1, className = '' }: { count?: number; className?: string }) {
  return (
    <div style={{ width: '100%' }} className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={styles.text} />
      ))}
    </div>
  );
}

export function SkeletonTitle({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return <Skeleton className={`${styles.title} ${className}`} style={style} />;
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`${styles.card} ${className}`} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
      <Skeleton height={100} style={{ borderRadius: '8px' }} />
      <SkeletonTitle style={{ width: '80%' }} />
      <SkeletonText count={2} />
    </div>
  );
}

export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <Skeleton className={styles.tableCell} width={i === 0 ? '70%' : '90%'} />
        </td>
      ))}
    </tr>
  );
}
