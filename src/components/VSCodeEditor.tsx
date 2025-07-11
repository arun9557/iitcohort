import React, { useRef, useState, useEffect } from "react";

export default function VSCodeEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFullScreen = () => {
    const elem = containerRef.current;
    if (elem) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullScreen(false);
      } else if (elem.requestFullscreen) {
        elem.requestFullscreen();
        setIsFullScreen(true);
      }
    }
  };

  // VS Code Web URLs with different configurations
  const vscodeOptions = [
    {
      id: "vscode-web",
      name: "VS Code Web (Full)",
      url: "https://vscode.dev/",
      description: "Complete VS Code Web with full features"
    },
    {
      id: "vscode-github",
      name: "VS Code Web (GitHub)",
      url: "https://vscode.dev/github/microsoft/vscode",
      description: "VS Code Web with GitHub integration"
    },
    {
      id: "vscode-local",
      name: "VS Code Web (Local)",
      url: "https://vscode.dev/",
      description: "VS Code Web for local development"
    },
    {
      id: "stackblitz-vscode",
      name: "StackBlitz VS Code",
      url: "https://stackblitz.com/edit/vscode?embed=1",
      description: "StackBlitz with VS Code interface"
    },
    {
      id: "codesandbox-vscode",
      name: "CodeSandbox VS Code",
      url: "https://codesandbox.io/s/new?embed=1&view=editor",
      description: "CodeSandbox with VS Code theme"
    }
  ];

  const [selectedVSCode, setSelectedVSCode] = useState("vscode-web");

  const currentVSCode = vscodeOptions.find(option => option.id === selectedVSCode);

  useEffect(() => {
    // Simulate loading time for VS Code
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Failed to load VS Code. Please try again or select a different option.");
  };

  return (
    <div className="h-full flex flex-col">
      {/* VS Code Header */}
      <div className="bg-[#1e1e1e] text-white p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <h2 className="text-xl font-bold">🖥️ VS Code Web</h2>
          </div>
          <button
            onClick={handleFullScreen}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            title="Toggle Full Screen"
          >
            {isFullScreen ? "⛶ Exit Full Screen" : "⛶ Full Screen"}
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {vscodeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setSelectedVSCode(option.id);
                setIsLoading(true);
                setError(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedVSCode === option.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
        
        {currentVSCode && (
          <p className="text-sm text-gray-400">
            {currentVSCode.description}
          </p>
        )}
      </div>

      {/* VS Code Container */}
      <div
        ref={containerRef}
        className="flex-1 relative bg-[#1e1e1e]"
        style={{ 
          height: isFullScreen ? "100vh" : "calc(100vh - 200px)",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #333",
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-[#1e1e1e] flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading VS Code Web...</p>
              <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-[#1e1e1e] flex items-center justify-center z-10">
            <div className="text-center max-w-md">
              <div className="text-red-400 text-4xl mb-4">⚠️</div>
              <p className="text-white text-lg mb-2">VS Code Web Error</p>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {currentVSCode && (
          <iframe
            src={currentVSCode.url}
            style={{ 
              width: "100%", 
              height: "100%", 
              border: "none",
              background: "#1e1e1e"
            }}
            title={`${currentVSCode.name} - VS Code Web`}
            allowFullScreen
            allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </div>

      {/* VS Code Status Bar */}
      <div className="bg-[#007acc] text-white px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span>VS Code Web</span>
          <span>•</span>
          <span>{currentVSCode?.name}</span>
          <span>•</span>
          <span>Ready</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.open(currentVSCode?.url, '_blank')}
            className="hover:bg-blue-700 px-2 py-1 rounded transition"
          >
            🔗 Open in New Tab
          </button>
          <button
            onClick={() => {
              const url = currentVSCode?.url;
              if (url) {
                navigator.clipboard.writeText(url);
                alert('VS Code URL copied to clipboard!');
              }
            }}
            className="hover:bg-blue-700 px-2 py-1 rounded transition"
          >
            📋 Copy URL
          </button>
        </div>
      </div>
    </div>
  );
}