import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAccessibility } from './AccesibilidadContext';

export const ScreenMagnifier: React.FC = () => {
    const { settings } = useAccessibility();
    const [position, setPosition] = useState({ x: -1000, y: -1000 });
    const containerRef = useRef<HTMLDivElement>(null);
    const cloneRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!settings.mouseMagnifier) {
            if (cloneRef.current) {
                cloneRef.current.remove();
                cloneRef.current = null;
            }
            return;
        }

        const updateClone = () => {
            const rootEl = document.getElementById('root');
            if (rootEl && containerRef.current) {
                // Remove old clone
                if (cloneRef.current) {
                    cloneRef.current.remove();
                }
                
                const clone = rootEl.cloneNode(true) as HTMLElement;
                clone.style.pointerEvents = 'none';
                clone.style.userSelect = 'none';
                
                // Remove any nesting of magnifier inside the clone just in case
                const nestedMagnifier = clone.querySelector('.magnifier-lens');
                if (nestedMagnifier) {
                    nestedMagnifier.remove();
                }

                cloneRef.current = clone;
                containerRef.current.appendChild(clone);
            }
        };

        // Create the clone
        updateClone();

        // Refresh clone on user interactions so that dynamic content remains accurate
        const handleSync = () => {
            setTimeout(updateClone, 100);
        };

        window.addEventListener('click', handleSync, true);
        window.addEventListener('keydown', handleSync, true);
        window.addEventListener('scroll', handleSync, true);

        // Periodically refresh to catch other dynamic updates (animations, timers, etc.)
        const interval = setInterval(updateClone, 1500);

        return () => {
            window.removeEventListener('click', handleSync, true);
            window.removeEventListener('keydown', handleSync, true);
            window.removeEventListener('scroll', handleSync, true);
            clearInterval(interval);
            if (cloneRef.current) {
                cloneRef.current.remove();
                cloneRef.current = null;
            }
        };
    }, [settings.mouseMagnifier]);

    useEffect(() => {
        if (!settings.mouseMagnifier) return;

        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [settings.mouseMagnifier]);

    if (!settings.mouseMagnifier) return null;

    const radius = 90; // 180px diameter
    const scale = 2.0;  // 2x magnification

    // Compute lens viewport position
    const lensX = position.x - radius;
    const lensY = position.y - radius;

    // Get absolute page offsets for positioning the clone inside the lens
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const pageX = position.x + scrollX;
    const pageY = position.y + scrollY;

    // Shifts the cloned page content to align with the cursor zoom target
    const contentLeft = radius - pageX * scale;
    const contentTop = radius - pageY * scale;

    return createPortal(
        <div
            className="magnifier-lens"
            style={{
                position: 'fixed',
                left: `${lensX}px`,
                top: `${lensY}px`,
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                borderRadius: '50%',
                border: '4px solid #660000',
                boxShadow: '0 8px 32px rgba(102, 0, 0, 0.4), inset 0 0 16px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 999999,
                backgroundColor: '#FFF8F6',
            }}
        >
            {/* Cloned content container */}
            <div
                ref={containerRef}
                style={{
                    position: 'absolute',
                    left: `${contentLeft}px`,
                    top: `${contentTop}px`,
                    width: `${document.documentElement.scrollWidth}px`,
                    height: `${document.documentElement.scrollHeight}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                }}
            />

            {/* Lens Glossy reflection overlay for premium look */}
            <div 
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 100%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 10,
                }}
            />
        </div>,
        document.body
    );
};
