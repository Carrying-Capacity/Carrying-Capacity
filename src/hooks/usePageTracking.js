import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Simple session ID generator
const getSessionId = () => {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
};

export const usePageTracking = () => {
    const location = useLocation();
    const lastPathRef = useRef(null);

    useEffect(() => {
        const trackPageView = async () => {
            const currentPath = location.pathname + location.search;

            // Prevent duplicate tracking for the same path (React.StrictMode double invoke protection)
            if (lastPathRef.current === currentPath) return;
            lastPathRef.current = currentPath;

            try {
                const { error } = await supabase
                    .from('page_views')
                    .insert({
                        path: currentPath,
                        user_agent: navigator.userAgent,
                        session_id: getSessionId(),
                        screen_width: window.innerWidth,
                        language: navigator.language
                    });

                if (error) {
                    console.error('Error tracking page view:', error);
                }
            } catch (err) {
                console.error('Failed to track page view:', err);
            }
        };

        trackPageView();
    }, [location]);
};
