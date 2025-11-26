"use client";

import {useEffect} from "react";

export default function DisableAutoScroll() {
    useEffect(() => {
        // Disable browser restoring last scroll
        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }

        // Force top at hydration
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 10);
    }, []);

    return null;
}
