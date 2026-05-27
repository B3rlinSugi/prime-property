'use client';

import { useState, useEffect } from 'react';
import styles from './GlassRevealIntro.module.css';
import { BRAND_NAME, BRAND_SUB_NAME } from '@/components/layout/Logo';

export default function GlassRevealIntro() {
  const [step, setStep] = useState(1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if the intro has already been displayed in this browser session
    const hasSeenIntro = sessionStorage.getItem('prime_property_intro_seen');
    
    if (hasSeenIntro) {
      setVisible(false);
      return;
    }

    // Trigger visibility and start sequence
    setVisible(true);

    // Sequence timing mapping
    // Step 1 (0ms - 2200ms): Layar Glass Blur (Emblem pulsing under deep blur)
    // Step 2 (2200ms - 5200ms): Efek Glass Terbuka (Blur dissipates, rings expand, gold light sweep)
    // Step 3 (5200ms - 6700ms): Logo Terlihat Jelas (Overlay fades out completely showing crisp logo)
    // Step 4 (6700ms - 7700ms): Masuk ke Website (Logo expands and overlay melts away to reveal site)

    const timer2 = setTimeout(() => setStep(2), 2200);
    const timer3 = setTimeout(() => setStep(3), 5200);
    const timer4 = setTimeout(() => setStep(4), 6700);
    const timerEnd = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('prime_property_intro_seen', 'true');
    }, 7700);

    return () => {
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timerEnd);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`${styles.introContainer} ${step === 4 ? styles.introFadeOut : ''}`}>
      {/* Cinematic grid lines in the background */}
      <div className={styles.introLinesGrid}>
        <div className={styles.lineVertical} style={{ left: '20%' }}></div>
        <div className={styles.lineVertical} style={{ left: '40%' }}></div>
        <div className={styles.lineVertical} style={{ left: '60%' }}></div>
        <div className={styles.lineVertical} style={{ left: '80%' }}></div>
        <div className={styles.lineHorizontal} style={{ top: '25%' }}></div>
        <div className={styles.lineHorizontal} style={{ top: '50%' }}></div>
        <div className={styles.lineHorizontal} style={{ top: '75%' }}></div>
      </div>

      {/* Main Glassmorphic Panel Wrapper */}
      <div 
        className={`
          ${styles.glassPanel} 
          ${step === 1 ? styles.glassBlurStep1 : ''} 
          ${step === 2 ? styles.glassRevealStep2 : ''} 
          ${step === 3 ? styles.glassClearStep3 : ''}
          ${step === 4 ? styles.glassScaleOutStep4 : ''}
        `}
      >
        {/* Shimmer golden light ray overlay for Step 2 */}
        <div className={`${styles.shimmerRay} ${step === 2 ? styles.shimmerRayActive : ''}`}></div>

        {/* Center Logo Showcase */}
        <div className={styles.logoCenterCard}>
          <div className={`${styles.emblemContainer} ${step >= 2 ? styles.emblemScaleUp : ''}`}>
            {/* Custom Brand Logo Emblem with premium gold-bordered white backing card */}
            <svg
              width="120"
              height="120"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.introEmblemSvg}
            >
              {/* White Backing Card with premium gold border to prevent dark overlaps */}
              <rect
                x="2"
                y="2"
                width="96"
                height="96"
                rx="18"
                fill="#FFFFFF"
                stroke="#C9A961"
                strokeWidth="3"
              />

              {/* Pillar 1: Left Wing / Arrowhead (Gold) */}
              <path
                d="M 42,82 L 42,20 L 32,30 L 12,50 L 32,44 L 32,92 Z"
                fill="#C9A961"
              />
              
              {/* Pillar 2: Center Vertical Pillar (Red) - Diagonal cuts */}
              <path
                d="M 45,89 L 55,79 L 55,7 L 45,17 Z"
                fill="#B33A3A"
              />

              {/* Pillar 3: Right Hollow Geometric "P" (Charcoal Black) */}
              <path
                d="M 58,7 L 68,17 L 88,37 L 88,47 L 68,67 L 68,69 L 58,79 Z M 68,27 L 68,57 L 78,47 L 78,37 Z"
                fill="#1A1A1A"
                fillRule="evenodd"
              />
            </svg>

            {/* Glowing Rings expanding on step 2 */}
            <div className={`${styles.glowRing} ${step >= 2 ? styles.glowRingExpand1 : ''}`}></div>
            <div className={`${styles.glowRing} ${step >= 2 ? styles.glowRingExpand2 : ''}`}></div>
          </div>

          {/* Staged brand text */}
          <div className={`${styles.brandTextGroup} ${step >= 2 ? styles.brandTextReveal : ''}`}>
            <h1 className={styles.introTitle}>{BRAND_NAME}</h1>
            <p className={styles.introSubtitle}>{BRAND_SUB_NAME}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
