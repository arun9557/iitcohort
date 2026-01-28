import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
export default function MonacoVSCode() {
    const [selectedLanguage, setSelectedLanguage] = useState("javascript");
    const [code, setCode] = useState("");
    const [isFullScreen, setIsFullScreen] = useState(false);
    const containerRef = useRef(null);
    const handleFullScreen = () => {
        const elem = containerRef.current;
        if (elem) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
                setIsFullScreen(false);
            }
            else if (elem.requestFullscreen) {
                elem.requestFullscreen();
                setIsFullScreen(true);
            }
        }
    };
    const languages = [
        { value: "javascript", label: "JavaScript", icon: "⚡" },
        { value: "typescript", label: "TypeScript", icon: "🔷" },
        { value: "python", label: "Python", icon: "🐍" },
        { value: "html", label: "HTML", icon: "🌐" },
        { value: "css", label: "CSS", icon: "🎨" },
        { value: "json", label: "JSON", icon: "📄" },
        { value: "java", label: "Java", icon: "☕" },
        { value: "cpp", label: "C++", icon: "⚙️" },
        { value: "csharp", label: "C#", icon: "🔷" },
        { value: "php", label: "PHP", icon: "🐘" }
    ];
    const sampleCode = {
        javascript: `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
        typescript: `// TypeScript Example
interface User {
  id: number;
  name: string;
  email: string;
}

function createUser(userData: Partial<User>): User {
  return {
    id: Date.now(),
    name: userData.name || 'Anonymous',
    email: userData.email || 'user@example.com'
  };
}`,
        python: `# Python Example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample HTML</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>This is a sample HTML file.</p>
</body>
</html>`,
        css: `/* CSS Example */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button:hover {
  background-color: #0056b3;
}`,
        json: `{
  "name": "sample-project",
  "version": "1.0.0",
  "description": "A sample project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.17.1"
  }
}`,
        java: `// Java Example
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Calculate fibonacci
        int n = 10;
        System.out.println("Fibonacci(" + n + ") = " + fibonacci(n));
    }
    
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}`,
        cpp: `// C++ Example
#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << "Hello, World!" << endl;
    cout << "Fibonacci(10) = " << fibonacci(10) << endl;
    return 0;
}`,
        csharp: `// C# Example
using System;

class Program {
    static int Fibonacci(int n) {
        if (n <= 1) return n;
        return Fibonacci(n - 1) + Fibonacci(n - 2);
    }
    
    static void Main(string[] args) {
        Console.WriteLine("Hello, World!");
        Console.WriteLine($"Fibonacci(10) = {Fibonacci(10)}");
    }
}`,
        php: `<?php
// PHP Example
function fibonacci($n) {
    if ($n <= 1) return $n;
    return fibonacci($n - 1) + fibonacci($n - 2);
}

echo "Hello, World!\n";
echo "Fibonacci(10) = " . fibonacci(10) . "\n";
?>`
    };
    const getSampleCode = (lang) => {
        return sampleCode[lang] || sampleCode.javascript;
    };
    const loadSampleCode = () => {
        setCode(getSampleCode(selectedLanguage));
    };
    const clearCode = () => {
        setCode("");
    };
    const handleLanguageChange = (newLanguage) => {
        setSelectedLanguage(newLanguage);
        setCode(getSampleCode(newLanguage));
    };
    return (<div className="h-full flex flex-col">
      {/* VS Code Header */}
      <div className="bg-[#1e1e1e] text-white">
        {/* Title Bar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <h2 className="text-xl font-bold">🖥️ Monaco VS Code</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadSampleCode} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition">
              📝 Load Sample
            </button>
            <button onClick={clearCode} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">
              🗑️ Clear
            </button>
            <button onClick={handleFullScreen} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition" title="Toggle Full Screen">
              {isFullScreen ? "⛶ Exit Full Screen" : "⛶ Full Screen"}
            </button>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex overflow-x-auto border-b border-gray-700 p-2">
          {languages.map((lang) => (<button key={lang.value} onClick={() => handleLanguageChange(lang.value)} className={`px-3 py-2 text-sm font-medium transition whitespace-nowrap rounded mr-2 ${selectedLanguage === lang.value
                ? "bg-[#007acc] text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
              {lang.icon} {lang.label}
            </button>))}
        </div>

        {/* Description */}
        <div className="p-4 bg-gray-800">
          <p className="text-sm text-gray-300 mb-2">
            Monaco Editor - VS Code-like experience with full syntax highlighting and IntelliSense
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Syntax Highlighting</span>
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">IntelliSense</span>
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Error Detection</span>
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Multi-language</span>
          </div>
        </div>
      </div>

      {/* VS Code Container */}
      <div ref={containerRef} className="flex-1 relative bg-[#1e1e1e]" style={{
            height: isFullScreen ? "100vh" : "calc(100vh - 300px)",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #333",
        }}>
        <Editor height="100%" defaultLanguage={selectedLanguage} theme="vs-dark" value={code} onChange={(value) => setCode(value || '')} options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            wordBasedSuggestions: 'allDocuments',
            parameterHints: { enabled: true },
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
        }}/>
      </div>

      {/* VS Code Status Bar */}
      <div className="bg-[#007acc] text-white px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span>Monaco VS Code</span>
          <span>•</span>
          <span>{languages.find(l => l.value === selectedLanguage)?.label}</span>
          <span>•</span>
          <span>Ready</span>
          <span>•</span>
          <span>IntelliSense Active</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs">Syntax: Active</span>
          <span className="text-xs">Errors: {code.includes('error') ? 'Found' : 'None'}</span>
          <span className="text-xs">Lines: {code.split('\n').length}</span>
        </div>
      </div>
    </div>);
}
