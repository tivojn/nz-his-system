"use client";

interface LungScanProps {
  patientName?: string;
  date?: string;
  className?: string;
}

export function LungScanViewer({ patientName = "Demo Patient", date, className }: LungScanProps) {
  const displayDate = date || new Date().toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden select-none ${className || ""}`}>
      {/* DICOM-style SVG CT Scan */}
      <svg
        viewBox="0 0 512 512"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="512" height="512" fill="#0a0a0a" />

        {/* Grid overlay — subtle medical imaging grid */}
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#1a1a2e" strokeWidth="0.3" />
          </pattern>
          <pattern id="gridFine" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#111122" strokeWidth="0.15" />
          </pattern>

          {/* Radial gradient for body cross-section */}
          <radialGradient id="bodyGrad" cx="50%" cy="50%" r="45%">
            <stop offset="0%" stopColor="#2a2a35" />
            <stop offset="70%" stopColor="#1a1a25" />
            <stop offset="100%" stopColor="#0f0f18" />
          </radialGradient>

          {/* Lung tissue gradient - left */}
          <radialGradient id="lungL" cx="55%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#0d0d15" />
            <stop offset="60%" stopColor="#141420" />
            <stop offset="100%" stopColor="#1a1a2a" />
          </radialGradient>

          {/* Lung tissue gradient - right */}
          <radialGradient id="lungR" cx="45%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#0d0d15" />
            <stop offset="60%" stopColor="#141420" />
            <stop offset="100%" stopColor="#1a1a2a" />
          </radialGradient>

          {/* Suspicious mass glow */}
          <radialGradient id="massGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff4444" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#ff6600" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff6600" stopOpacity="0" />
          </radialGradient>

          {/* Mass core */}
          <radialGradient id="massCore" cx="45%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#ccccaa" />
            <stop offset="50%" stopColor="#999977" />
            <stop offset="100%" stopColor="#666655" />
          </radialGradient>

          {/* Spiculation filter */}
          <filter id="spiculate" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" seed="42" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* Subtle noise for tissue texture */}
          <filter id="tissueNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="7" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="overlay" />
          </filter>

          {/* Ground glass opacity effect */}
          <filter id="groundGlass">
            <feGaussianBlur stdDeviation="3" />
          </filter>

          {/* Annotation marker glow */}
          <filter id="annotGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Fine grid */}
        <rect width="512" height="512" fill="url(#gridFine)" />
        <rect width="512" height="512" fill="url(#grid)" />

        {/* Body cross-section outline */}
        <ellipse cx="256" cy="265" rx="195" ry="175" fill="url(#bodyGrad)" stroke="#2a2a3a" strokeWidth="1" filter="url(#tissueNoise)" />

        {/* Spine / vertebral body */}
        <ellipse cx="256" cy="370" rx="18" ry="22" fill="#d4d4c0" stroke="#aaa090" strokeWidth="1" />
        <ellipse cx="256" cy="370" rx="10" ry="14" fill="#bbbba8" />

        {/* Spinal canal */}
        <circle cx="256" cy="345" r="6" fill="#1a1a25" stroke="#444440" strokeWidth="0.5" />

        {/* Transverse processes */}
        <line x1="238" y1="370" x2="215" y2="358" stroke="#bbbba8" strokeWidth="3" strokeLinecap="round" />
        <line x1="274" y1="370" x2="297" y2="358" stroke="#bbbba8" strokeWidth="3" strokeLinecap="round" />

        {/* Ribs (cross-sections, bilateral) */}
        {/* Left ribs */}
        <ellipse cx="115" cy="200" rx="8" ry="6" fill="#c8c8b0" stroke="#999980" strokeWidth="0.5" />
        <ellipse cx="100" cy="260" rx="8" ry="7" fill="#c8c8b0" stroke="#999980" strokeWidth="0.5" />
        <ellipse cx="105" cy="320" rx="7" ry="6" fill="#c8c8b0" stroke="#999980" strokeWidth="0.5" />
        <ellipse cx="130" cy="365" rx="7" ry="5" fill="#c8c8b0" stroke="#999980" strokeWidth="0.5" />

        {/* Right ribs */}
        <ellipse cx="397" cy="200" rx="8" ry="6" fill="#c8c8b0" stroke="#999980" strokeWidth="0.5" />
        <ellipse cx="412" cy="260" rx="8" ry="7" fill="#c8c8b0" stroke="#999980" strokeWidth="0.5" />
        <ellipse cx="407" cy="320" rx="7" ry="6" fill="#c8c8b0" stroke="#999980" strokeWidth="0.5" />
        <ellipse cx="382" cy="365" rx="7" ry="5" fill="#c8c8b0" stroke="#999980" strokeWidth="0.5" />

        {/* Sternum */}
        <ellipse cx="256" cy="155" rx="12" ry="8" fill="#c8c8b0" stroke="#999980" strokeWidth="0.5" />

        {/* Left lung (patient's left = viewer's right) */}
        <path
          d="M 275 160 C 285 155, 340 155, 380 190 C 410 220, 420 280, 410 330 C 400 370, 350 400, 310 400 C 285 400, 270 380, 268 350 C 265 310, 270 200, 275 160 Z"
          fill="url(#lungL)"
          stroke="#2a2a3a"
          strokeWidth="0.8"
          opacity="0.9"
        />

        {/* Left lung fissure */}
        <path
          d="M 280 250 C 310 260, 370 275, 395 310"
          fill="none"
          stroke="#333345"
          strokeWidth="0.8"
          strokeDasharray="2,2"
        />

        {/* Left lung bronchi/vessels */}
        <path d="M 272 210 C 300 220, 330 230, 350 225" fill="none" stroke="#333348" strokeWidth="1.2" />
        <path d="M 275 240 C 300 250, 340 255, 365 260" fill="none" stroke="#333345" strokeWidth="0.9" />
        <path d="M 278 280 C 310 285, 340 295, 360 310" fill="none" stroke="#333345" strokeWidth="0.7" />

        {/* Right lung (patient's right = viewer's left) — has mass */}
        <path
          d="M 237 160 C 227 155, 172 155, 132 190 C 102 220, 92 280, 102 330 C 112 370, 162 400, 202 400 C 227 400, 242 380, 244 350 C 247 310, 242 200, 237 160 Z"
          fill="url(#lungR)"
          stroke="#2a2a3a"
          strokeWidth="0.8"
          opacity="0.9"
        />

        {/* Right lung fissures (major and minor) */}
        <path
          d="M 232 220 C 200 225, 150 240, 120 270"
          fill="none"
          stroke="#333345"
          strokeWidth="0.8"
          strokeDasharray="2,2"
        />
        <path
          d="M 230 290 C 200 295, 150 310, 115 330"
          fill="none"
          stroke="#333345"
          strokeWidth="0.8"
          strokeDasharray="2,2"
        />

        {/* Right lung bronchi/vessels */}
        <path d="M 240 210 C 212 220, 182 230, 162 225" fill="none" stroke="#333348" strokeWidth="1.2" />
        <path d="M 237 250 C 212 258, 175 265, 150 270" fill="none" stroke="#333345" strokeWidth="0.9" />
        <path d="M 234 310 C 210 315, 175 325, 155 340" fill="none" stroke="#333345" strokeWidth="0.7" />

        {/* Mediastinum / Trachea */}
        <rect x="249" y="130" width="14" height="40" rx="5" fill="#1a1a28" stroke="#333340" strokeWidth="0.5" />

        {/* Main bronchi */}
        <path d="M 256 170 C 256 185, 245 200, 240 210" fill="none" stroke="#333348" strokeWidth="2" />
        <path d="M 256 170 C 256 185, 267 200, 272 210" fill="none" stroke="#333348" strokeWidth="2" />

        {/* Heart silhouette */}
        <ellipse cx="280" cy="310" rx="40" ry="48" fill="#3a3a45" stroke="#4a4a55" strokeWidth="0.5" />
        <ellipse cx="275" cy="305" rx="32" ry="40" fill="#454550" />

        {/* Aorta */}
        <path d="M 260 180 C 260 200, 275 240, 280 270" fill="none" stroke="#555560" strokeWidth="6" />
        <path d="M 260 180 C 260 200, 275 240, 280 270" fill="none" stroke="#4a4a55" strokeWidth="4" />

        {/* Descending aorta */}
        <circle cx="268" cy="340" r="10" fill="#4a4a55" stroke="#555560" strokeWidth="1" />

        {/* === SUSPICIOUS MASS — Right Upper Lobe (viewer's left upper area) === */}

        {/* Ground-glass opacity surrounding the mass */}
        <ellipse cx="175" cy="205" rx="30" ry="25" fill="#333340" opacity="0.4" filter="url(#groundGlass)" />

        {/* Mass glow effect */}
        <ellipse cx="175" cy="205" rx="28" ry="24" fill="url(#massGlow)" />

        {/* Spiculated mass core */}
        <ellipse cx="175" cy="205" rx="14" ry="12" fill="url(#massCore)" filter="url(#spiculate)" />

        {/* Spiculations radiating from mass */}
        <line x1="161" y1="195" x2="150" y2="185" stroke="#999977" strokeWidth="0.8" opacity="0.7" />
        <line x1="163" y1="210" x2="148" y2="218" stroke="#999977" strokeWidth="0.6" opacity="0.6" />
        <line x1="189" y1="198" x2="202" y2="188" stroke="#999977" strokeWidth="0.7" opacity="0.7" />
        <line x1="186" y1="212" x2="198" y2="222" stroke="#999977" strokeWidth="0.6" opacity="0.6" />
        <line x1="173" y1="193" x2="170" y2="178" stroke="#999977" strokeWidth="0.7" opacity="0.7" />
        <line x1="178" y1="217" x2="182" y2="232" stroke="#999977" strokeWidth="0.6" opacity="0.6" />

        {/* Subcarinal lymph node */}
        <ellipse cx="256" cy="265" rx="7" ry="5" fill="#888870" stroke="#666650" strokeWidth="0.5" opacity="0.7" />

        {/* === ANNOTATIONS === */}

        {/* Mass annotation - arrow and label */}
        <g filter="url(#annotGlow)">
          {/* Arrow line */}
          <line x1="175" y1="205" x2="100" y2="145" stroke="#ff4444" strokeWidth="1.2" />
          {/* Arrow head */}
          <polygon points="175,205 168,196 165,205" fill="#ff4444" />
          {/* Label background */}
          <rect x="28" y="128" width="75" height="22" rx="3" fill="#ff4444" fillOpacity="0.15" stroke="#ff4444" strokeWidth="0.8" />
          <text x="65" y="143" fill="#ff6666" fontSize="10" fontFamily="monospace" textAnchor="middle">2.8cm MASS</text>
        </g>

        {/* Lymph node annotation */}
        <g filter="url(#annotGlow)">
          <line x1="256" y1="265" x2="320" y2="250" stroke="#ffaa00" strokeWidth="0.8" />
          <rect x="322" y="240" width="55" height="18" rx="3" fill="#ffaa00" fillOpacity="0.1" stroke="#ffaa00" strokeWidth="0.6" />
          <text x="349" y="253" fill="#ffcc44" fontSize="8" fontFamily="monospace" textAnchor="middle">LN 1.4cm</text>
        </g>

        {/* Measurement overlay on mass */}
        <line x1="159" y1="205" x2="191" y2="205" stroke="#ff4444" strokeWidth="0.5" strokeDasharray="2,1" />
        <line x1="159" y1="201" x2="159" y2="209" stroke="#ff4444" strokeWidth="0.5" />
        <line x1="191" y1="201" x2="191" y2="209" stroke="#ff4444" strokeWidth="0.5" />

        {/* Series / orientation markers */}
        <text x="20" y="25" fill="#4488aa" fontSize="10" fontFamily="monospace">A</text>
        <text x="256" y="480" fill="#4488aa" fontSize="10" fontFamily="monospace" textAnchor="middle">P</text>
        <text x="488" y="270" fill="#4488aa" fontSize="10" fontFamily="monospace" textAnchor="end">L</text>
        <text x="20" y="270" fill="#4488aa" fontSize="10" fontFamily="monospace">R</text>

        {/* Window level indicator (right side) */}
        <rect x="482" y="80" width="8" height="200" rx="2" fill="none" stroke="#336688" strokeWidth="0.5" />
        <defs>
          <linearGradient id="wlGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>
        <rect x="483" y="81" width="6" height="198" rx="1.5" fill="url(#wlGrad)" opacity="0.6" />
        {/* WL indicator triangle */}
        <polygon points="482,180 477,176 477,184" fill="#44aacc" />
        <text x="474" y="183" fill="#44aacc" fontSize="7" fontFamily="monospace" textAnchor="end">W:1500</text>
        <text x="474" y="193" fill="#44aacc" fontSize="7" fontFamily="monospace" textAnchor="end">L:-600</text>

        {/* Patient info overlay (top-left) */}
        <text x="20" y="45" fill="#66aacc" fontSize="9" fontFamily="monospace">{patientName}</text>
        <text x="20" y="57" fill="#558899" fontSize="8" fontFamily="monospace">CT CHEST W/ CONTRAST</text>
        <text x="20" y="69" fill="#558899" fontSize="8" fontFamily="monospace">{displayDate}</text>
        <text x="20" y="81" fill="#558899" fontSize="8" fontFamily="monospace">AX 2.5mm</text>

        {/* Series info (top-right) */}
        <text x="490" y="45" fill="#558899" fontSize="8" fontFamily="monospace" textAnchor="end">SER: 3/5</text>
        <text x="490" y="57" fill="#558899" fontSize="8" fontFamily="monospace" textAnchor="end">IMG: 67/245</text>
        <text x="490" y="69" fill="#558899" fontSize="8" fontFamily="monospace" textAnchor="end">512 x 512</text>

        {/* Lung-RADS indicator (bottom-right) */}
        <rect x="390" y="455" width="100" height="24" rx="4" fill="#ff4444" fillOpacity="0.12" stroke="#ff4444" strokeWidth="0.8" />
        <text x="440" y="471" fill="#ff6666" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Lung-RADS 4B</text>

        {/* AI detection indicator (bottom-left) */}
        <rect x="20" y="455" width="130" height="24" rx="4" fill="#00cc88" fillOpacity="0.1" stroke="#00cc88" strokeWidth="0.8" />
        <text x="85" y="471" fill="#00cc88" fontSize="9" fontFamily="monospace" textAnchor="middle">AI DETECTED: 94.2%</text>

        {/* Scale bar */}
        <line x1="20" y1="495" x2="70" y2="495" stroke="#558899" strokeWidth="1" />
        <line x1="20" y1="492" x2="20" y2="498" stroke="#558899" strokeWidth="0.5" />
        <line x1="70" y1="492" x2="70" y2="498" stroke="#558899" strokeWidth="0.5" />
        <text x="45" y="505" fill="#558899" fontSize="7" fontFamily="monospace" textAnchor="middle">5 cm</text>
      </svg>

      {/* Animated scanning line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400/30 to-transparent animate-scan-line"
          style={{ animationDuration: "4s" }}
        />
      </div>

      {/* Corner brackets (DICOM viewer style) */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-teal-500/40" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-teal-500/40" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-teal-500/40" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-teal-500/40" />
    </div>
  );
}
