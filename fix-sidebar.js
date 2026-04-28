const fs = require('fs');
const path = 'c:/Users/Rupesh kumar sah/OneDrive/Desktop/rupesh3/frontend/src/components/layout/Sidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add missing </div> after the logo section
const search = '          )}\n        </div>\n\n      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">';
const replace = '          )}\n        </div>\n      </div>\n\n      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">';

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(path, content);
    console.log('Fixed Sidebar.tsx successfully');
} else {
    console.log('Pattern not found, trying alternative...');
    // Try with different whitespace
    const altSearch = ')}\n        </div>\n\n      <nav';
    const altReplace = ')}\n        </div>\n      </div>\n\n      <nav';
    if (content.includes(altSearch)) {
        content = content.replace(altSearch, altReplace);
        fs.writeFileSync(path, content);
        console.log('Fixed Sidebar.tsx with alternative pattern');
    } else {
        console.log('Could not find pattern to fix');
    }
}
