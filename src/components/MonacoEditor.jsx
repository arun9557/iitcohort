import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
export default function MonacoEditor({ height = "600px", language = "javascript", theme = "vs-dark", value = "// Start coding here...", onChange }) {
    const [currentValue, setCurrentValue] = useState(value);
    const handleEditorChange = (value) => {
        setCurrentValue(value || '');
        onChange?.(value);
    };
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
}`
    };
    const getSampleCode = (lang) => {
        return sampleCode[lang] || sampleCode.javascript;
    };
    return (<div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Monaco Editor</span>
          <span className="text-xs text-gray-400">({language})</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleEditorChange(getSampleCode(language))} className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded">
            Load Sample
          </button>
          <button onClick={() => handleEditorChange('')} className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded">
            Clear
          </button>
        </div>
      </div>
      <Editor height={height} defaultLanguage={language} theme={theme} value={currentValue} onChange={handleEditorChange} options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
        }}/>
    </div>);
}
