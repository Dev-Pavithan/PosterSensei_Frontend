const fs = require('fs');
const data = JSON.parse(fs.readFileSync('test-results.json', 'utf16le').replace(/^\uFEFF/, ''));
data.suites[0].suites[0].specs.forEach(s => { 
    const r=s.tests[0].results[0]; 
    if(r.status!=='expected') {
        console.log(`\n\n=== ${s.title} ===\n`);
        console.log(r.error?.message); 
    }
});
