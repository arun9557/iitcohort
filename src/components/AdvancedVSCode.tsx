import React, { useRef, useState, useEffect } from "react";

export default function AdvancedVSCode() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("stackblitz-vscode");

  // VS Code configurations
  const vscodeConfigs = {
    "stackblitz-vscode": {
      name: "StackBlitz VS Code",
      url: "https://stackblitz.com/edit/vscode?embed=1&file=index.js",
      description: "StackBlitz with VS Code interface - Most reliable",
      features: ["Real-time Collaboration", "Instant Setup", "NPM Packages", "Live Preview"]
    },
    "codesandbox-vscode": {
      name: "CodeSandbox VS Code",
      url: "https://codesandbox.io/s/new?embed=1&view=editor",
      description: "CodeSandbox with VS Code theme",
      features: ["Sandbox Environment", "Templates", "Deployment", "React/Node.js Focus"]
    },
    "replit-vscode": {
      name: "Replit VS Code",
      url: "https://replit.com/@replit/Hello-world?embed=1",
      description: "Replit with VS Code interface",
      features: ["Multi-language", "Hosting", "Database Integration", "Real-time Collaboration"]
    },
    "gitpod": {
      name: "Gitpod (VS Code)",
      url: "https://gitpod.io/#https://github.com/microsoft/vscode",
      description: "Gitpod with VS Code interface",
      features: ["Cloud Development", "Pre-built Environments", "Team Collaboration", "Full IDE Features"]
    },
    "stackblitz-react": {
      name: "StackBlitz React",
      url: "https://stackblitz.com/edit/react?embed=1&file=src/App.js",
      description: "StackBlitz React environment",
      features: ["React Development", "Hot Reload", "NPM Packages", "Live Preview"]
    },
    "stackblitz-typescript": {
      name: "StackBlitz TypeScript",
      url: "https://stackblitz.com/edit/typescript?embed=1&file=index.ts",
      description: "StackBlitz TypeScript environment",
      features: ["TypeScript", "Type Checking", "IntelliSense", "Error Detection"]
    },
    "stackblitz-node": {
      name: "StackBlitz Node.js",
      url: "https://stackblitz.com/edit/node?embed=1&file=index.js",
      description: "StackBlitz Node.js environment",
      features: ["Node.js", "Backend Development", "NPM Packages", "API Development"]
    }
  };

  const currentConfig = vscodeConfigs[selectedTab as keyof typeof vscodeConfigs];

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedTab]);

  // Fullscreen API logic
  useEffect(() => {
    function handleFullscreenChange() {
      const isFs = !!document.fullscreenElement &&
        (containerRef.current && document.fullscreenElement === containerRef.current);
      setIsFullScreen(Boolean(isFs));
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleFullScreen = () => {
    const elem = containerRef.current;
    if (!isFullScreen && elem && elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (isFullScreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Failed to load VS Code environment. Please try a different option.");
  };

  const openInNewTab = () => {
    if (currentConfig?.url) {
      window.open(currentConfig.url, '_blank');
    }
  };

  const copyUrl = () => {
    if (currentConfig?.url) {
      navigator.clipboard.writeText(currentConfig.url);
      alert('VS Code URL copied to clipboard!');
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col flex-1 bg-[#181a20] font-sans" style={{height: '100%', minHeight: 0}}>
      {/* Provider Bar */}
      <div className="flex items-center justify-between px-0 py-0 bg-[#181a20]" style={{minHeight: 0}}>
        {/* Providers */}
        <div className="flex flex-1">
          {Object.entries(vscodeConfigs).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key)}
              className={`px-4 py-3 text-sm font-medium transition whitespace-nowrap border-0 rounded-none focus:outline-none focus:bg-[#1e293b] ${
                selectedTab === key
                  ? "bg-[#2563eb] text-white"
                  : "bg-transparent text-gray-300 hover:bg-[#23272e] hover:text-white"
              }`}
              style={{boxShadow: 'none', borderRadius: 0, margin: 0, fontWeight: 500, letterSpacing: 0.1}}
            >
              {config.name}
            </button>
          ))}
        </div>
        {/* Minimal Buttons */}
        <div className="flex items-center gap-2 pr-4">
          <button
            onClick={openInNewTab}
            className="px-3 py-1 text-xs font-medium bg-[#2563eb] text-white rounded hover:bg-[#1d4ed8] transition border-0 shadow-none"
          >
            Open in New Tab
          </button>
          <button
            onClick={copyUrl}
            className="px-3 py-1 text-xs font-medium bg-[#23272e] text-gray-200 rounded hover:bg-[#1e293b] transition border-0 shadow-none"
          >
            Copy URL
          </button>
          <button
            onClick={handleFullScreen}
            className="px-3 py-1 text-xs font-medium bg-[#23272e] text-gray-200 rounded hover:bg-[#1e293b] transition border-0 shadow-none"
          >
            {isFullScreen ? "Exit Full Screen" : "Full Screen"}
          </button>
        </div>
      </div>
      {/* Description */}
      {currentConfig && (
        <div className="px-4 py-2 bg-[#23272e] text-gray-200 text-sm font-normal border-0" style={{letterSpacing: 0.05}}>
          <span className="font-semibold text-white">{currentConfig.name}:</span> {currentConfig.description}
          <div className="flex flex-wrap gap-2 mt-2">
            {currentConfig.features.map((feature, index) => (
              <span
                key={index}
                className="bg-[#2563eb] text-white px-2 py-1 rounded text-xs font-medium"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* VS Code Container */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 relative bg-[#181a20]"
        style={{
          borderRadius: 0,
          overflow: "hidden",
          border: "none",
          height: '100%',
          minHeight: 0
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-[#181a20] flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white text-base mb-2">Loading VS Code Environment...</p>
              <p className="text-gray-400 text-xs">{currentConfig?.name}</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#181a20] z-10">
            <div className="bg-[#23272e] text-red-400 px-6 py-4 rounded text-sm shadow-none border-0">
              {error}
            </div>
          </div>
        )}
        <iframe
          src={currentConfig?.url}
          title={currentConfig?.name}
          className="w-full h-full min-h-0 min-w-0 border-0"
          style={{ minHeight: 0, minWidth: 0, background: '#181a20', height: '100%' }}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allowFullScreen
        />
      </div>
    </div>
  );
} 