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
            {/* Pentagon Gold Symbol */}
            <svg
              width="120"
              height="120"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.introEmblemSvg}
            >
              {/* Outer Golden Pentagon */}
              <polygon
                points="50,6 94,35 94,92 6,92 6,35"
                stroke="#C9A961"
                strokeWidth="4"
                strokeLinejoin="round"
                fill="rgba(201, 169, 97, 0.02)"
                className={styles.emblemPolygon}
              />
              {/* Golden Tree Symbol Trunk */}
              <line
                x1="50"
                y1="92"
                x2="50"
                y2="38"
                stroke="#C9A961"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Upper Chevron */}
              <path
                d="M 28,62 L 50,40 L 72,62"
                stroke="#C9A961"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
              {/* Lower Chevron */}
              <path
                d="M 28,78 L 50,56 L 72,78"
                stroke="#C9A961"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
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
