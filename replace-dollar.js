const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('dist')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./apps/admin/src');
let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  // Replace $$ { with ₹ ${
  newContent = newContent.replace(/\$\$\{/g, '₹${');
  
  // Replace $ \d with ₹ \d
  newContent = newContent.replace(/\$(\d)/g, '₹$1');
  
  // Replace >$ with >₹
  newContent = newContent.replace(/>\$/g, '>₹');

  // Replace '$' with '₹'
  newContent = newContent.replace(/'\$'/g, "'₹'");
  newContent = newContent.replace(/"\$"/g, '"₹"');
  
  // Replace `$ ` with `₹ `
  newContent = newContent.replace(/`\$ /g, '`₹ ');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changed++;
    console.log('Updated:', file);
  }
});

console.log('Total files changed:', changed);
