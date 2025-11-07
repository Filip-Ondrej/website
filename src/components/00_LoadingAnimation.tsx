'use client';

import { useState, useEffect, ReactNode } from 'react';

export default function LoadingScreen({ children }: { children: ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Animate progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setLoading(false), 300);
                    return 100;
                }
                return prev + 2;
            });
        }, 20);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="loading-screen">
                {/* Progress bar */}
                <div className="progress-container">
                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="progress-text">{progress}%</p>
                </div>

                <style jsx>{`
          .loading-screen {
            position: fixed;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--color-bg, #0b0b0d);
            z-index: 9999;
          }

          .progress-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }

          .progress-track {
            width: 280px;
            height: 2px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 1px;
            overflow: hidden;
            position: relative;
          }

          .progress-fill {
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
          }

          .progress-fill::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 40px;
            height: 100%;
            background: linear-gradient(
              to right,
              transparent,
              rgba(255, 255, 255, 0.4)
            );
            animation: shimmer 1s ease-in-out infinite;
          }

          @keyframes shimmer {
            0%, 100% {
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
          }

          .progress-text {
            margin: 0;
            font-family: var(--font-sans, Rajdhani), monospace;
            font-size: 13px;
            font-weight: 400;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.6);
          }

          @media (prefers-reduced-motion: reduce) {
            .progress-fill {
              transition: none;
            }
            .progress-fill::after {
              animation: none;
            }
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="fade-in-content">
            {children}
            <style jsx>{`
        .fade-in-content {
          animation: fadeIn 0.6s ease-out;
        }

      @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-in-content {
            animation: none;
          }
        }
      `}</style>
        </div>
    );
}