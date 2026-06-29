const fs = require('fs');
const glob = require('glob');

const files = [
  'src/App.jsx',
  'src/components/AnimatedPet.jsx',
  'src/index.css'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/'\/assets\//g, "'./assets/");
  content = content.replace(/"\/assets\//g, '"./assets/');
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Replaced absolute asset paths with relative paths');
