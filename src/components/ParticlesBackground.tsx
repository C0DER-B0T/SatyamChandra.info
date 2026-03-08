import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Container, Engine } from "tsparticles-engine";
import { useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const ParticlesBackground = () => {
    const location = useLocation();
    const { theme } = useTheme();

    const particlesInit = useCallback(async (engine: Engine) => {
        // This loads the tsparticles package bundle, giving us all features
        await loadFull(engine);
    }, []);

    const particlesLoaded = useCallback(async (container: Container | undefined) => {
        // Optional callback if we needed to hook into load events
    }, []);

    // Do not render on admin pages to keep the dashboard clean
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    const isDark = theme === 'dark';

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            options={{
                background: {
                    color: {
                        value: "transparent",
                    },
                },
                fpsLimit: 120,
                interactivity: {
                    events: {
                        onHover: {
                            enable: true,
                            mode: "grab", // Draws lines to the cursor on hover
                        },
                        resize: true,
                    },
                    modes: {
                        grab: {
                            distance: 200,
                            links: {
                                opacity: 0.5,
                                color: isDark ? "#60A5FA" : "#3B82F6", // Blue grabbing lines
                            }
                        },
                    },
                },
                particles: {
                    color: {
                        value: isDark ? "#9CA3AF" : "#6B7280", // Gray dots
                    },
                    links: {
                        color: isDark ? "#4B5563" : "#D1D5DB", // De-emphasized base links
                        distance: 150,
                        enable: true,
                        opacity: 0.3,
                        width: 1,
                    },
                    collisions: {
                        enable: true,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "bounce",
                        },
                        random: true,
                        speed: 1.5, // Slow, elegant floating
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800,
                        },
                        value: 60, // A balanced amount of particles
                    },
                    opacity: {
                        value: 0.7,
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 1, max: 3 },
                    },
                },
                detectRetina: true,
            }}
            className="absolute inset-0 -z-10 pointer-events-none" // Places it solidly in the background
        />
    );
};

export default ParticlesBackground;
