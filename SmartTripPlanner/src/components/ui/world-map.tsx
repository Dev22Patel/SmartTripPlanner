    import { useRef } from "react";
    import DottedMap from "dotted-map";

    // Define interfaces for props and coordinates
    interface Coordinates {
    lat: number;
    lng: number;
    label?: string;
    }

    interface MapProps {
    dots?: Array<{
        start: Coordinates;
        end: Coordinates;
    }>;
    lineColor?: string;
    theme?: 'dark' | 'light';
    }

    export default function WorldMap({
    dots = [],
    lineColor = "#0ea5e9",
    theme = 'light'
    }: MapProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const map = new DottedMap({ height: 100, grid: "diagonal" });

    const svgMap = map.getSVG({
        radius: 0.22,
        color: theme === "dark" ? "#FFFFFF40" : "#00000040",
        shape: "circle",
        backgroundColor: theme === "dark" ? "black" : "white",
    });

    const projectPoint = (lat: number, lng: number) => {
        const x = (lng + 180) * (800 / 360);
        const y = (90 - lat) * (400 / 180);
        return { x, y };
    };

    const createCurvedPath = (
        start: { x: number; y: number },
        end: { x: number; y: number }
    ) => {
        const midX = (start.x + end.x) / 2;
        const midY = Math.min(start.y, end.y) - 50;
        return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
    };

    return (
        <div className="w-full aspect-[2/1] relative font-sans" style={{ backgroundColor: theme === 'dark' ? 'black' : 'white', borderRadius: '0.5rem', height: '100%' }}>
        <img
            src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
            className="h-full w-full pointer-events-none select-none"
            alt="world map"
            style={{
            maskImage: 'linear-gradient(to bottom, transparent, white 10%, white 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, white 10%, white 90%, transparent)'
            }}
            draggable={false}
        />
        <svg
            ref={svgRef}
            viewBox="0 0 800 400"
            className="w-full h-full absolute inset-0 pointer-events-none select-none"
        >
            {dots.map((dot, i) => {
            const startPoint = projectPoint(dot.start.lat, dot.start.lng);
            const endPoint = projectPoint(dot.end.lat, dot.end.lng);
            return (
                <g key={`path-group-${i}`}>
                <path
                    d={createCurvedPath(startPoint, endPoint)}
                    fill="none"
                    stroke="url(#path-gradient)"
                    strokeWidth="1"
                    style={{
                    animation: `drawPath 1s ${0.5 * i}s ease-out forwards`,
                    }}
                />
                </g>
            );
            })}

            <defs>
            <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
                <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            </defs>

            {dots.map((dot, i) => (
            <g key={`points-group-${i}`}>
                <g key={`start-${i}`}>
                <circle
                    cx={projectPoint(dot.start.lat, dot.start.lng).x}
                    cy={projectPoint(dot.start.lat, dot.start.lng).y}
                    r="2"
                    fill={lineColor}
                />
                <circle
                    cx={projectPoint(dot.start.lat, dot.start.lng).x}
                    cy={projectPoint(dot.start.lat, dot.start.lng).y}
                    r="2"
                    fill={lineColor}
                    opacity="0.5"
                    className="pulsing-circle"
                />
                </g>
                <g key={`end-${i}`}>
                <circle
                    cx={projectPoint(dot.end.lat, dot.end.lng).x}
                    cy={projectPoint(dot.end.lat, dot.end.lng).y}
                    r="2"
                    fill={lineColor}
                />
                <circle
                    cx={projectPoint(dot.end.lat, dot.end.lng).x}
                    cy={projectPoint(dot.end.lat, dot.end.lng).y}
                    r="2"
                    fill={lineColor}
                    opacity="0.5"
                    className="pulsing-circle"
                />
                </g>
            </g>
            ))}
        </svg>
        <style>
            {`
            @keyframes drawPath {
                from {
                stroke-dasharray: 1000;
                stroke-dashoffset: 1000;
                }
                to {
                stroke-dasharray: 1000;
                stroke-dashoffset: 0;
                }
            }

            .pulsing-circle {
                animation: pulse 1.5s infinite;
            }

            @keyframes pulse {
                0% {
                r: 2;
                opacity: 0.5;
                }
                100% {
                r: 8;
                opacity: 0;
                }
            }
            `}
        </style>
        </div>
    );
    }
