
const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/page.jsx');
const dashboardDir = path.join(__dirname, 'src/components/dashboard');

if (!fs.existsSync(dashboardDir)) {
    fs.mkdirSync(dashboardDir, { recursive: true });
}

const pageContent = fs.readFileSync(pagePath, 'utf8');
const lines = pageContent.split('\n');

function extractComponent(name, startLine, endLine, imports) {
    let componentContent = lines.slice(startLine - 1, endLine).join('\n');

    // Add imports
    let fileContent = "'use client';\nimport React, { useState } from 'react';\n";
    if (imports && imports.length > 0) {
        fileContent += `import { ${imports.join(', ')} } from 'lucide-react';\n`;
    }
    if (name === 'ChatSection') {
        fileContent += "import { isOwner } from '../../utils/auth';\n";
    }

    fileContent += "\n" + componentContent + "\n\nexport default " + name + ";";

    fs.writeFileSync(path.join(dashboardDir, `${name}.jsx`), fileContent);
    console.log(`Extracted ${name}`);
}

// Line numbers based on previous view_file_outline and view_file
// ProjectsSection: 26-173
extractComponent('ProjectsSection', 26, 173, ['Users', 'Plus', 'X']);

// ChatSection: 174-219
extractComponent('ChatSection', 174, 219, ['MessageCircle']);

// LibrarySection: 220-296
extractComponent('LibrarySection', 220, 296, ['FileText', 'Video', 'ImageIcon', 'Music', 'BookOpen', 'Download']);

// FuturePlanningSection: 297-486
extractComponent('FuturePlanningSection', 297, 486, ['Lightbulb', 'Plus', 'X']);

// ActivityFeed: 487-582
extractComponent('ActivityFeed', 487, 582, []);

// QuickActions: 583-664
extractComponent('QuickActions', 583, 664, []);

// Now rewrite page.jsx to remove these components and add imports
let newPageContent = lines.slice(0, 25).join('\n') + "\n";
newPageContent += "import ProjectsSection from '../components/dashboard/ProjectsSection';\n";
newPageContent += "import ChatSection from '../components/dashboard/ChatSection';\n";
newPageContent += "import LibrarySection from '../components/dashboard/LibrarySection';\n";
newPageContent += "import FuturePlanningSection from '../components/dashboard/FuturePlanningSection';\n";
newPageContent += "import ActivityFeed from '../components/dashboard/ActivityFeed';\n";
newPageContent += "import QuickActions from '../components/dashboard/QuickActions';\n";
newPageContent += "\n";

// Append the rest of the file from line 665
newPageContent += lines.slice(664).join('\n');

fs.writeFileSync(pagePath, newPageContent);
console.log('Updated page.jsx');
