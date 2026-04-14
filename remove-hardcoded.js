import fs from 'fs';

let content = fs.readFileSync('trip-mode.jsx', 'utf8');

const startMapSpots = content.indexOf('const mapSpots = [');
const endFeatures = content.indexOf('const typeColors = {');

if (startMapSpots !== -1 && endFeatures !== -1) {
  content = content.slice(0, startMapSpots) + content.slice(endFeatures);
  fs.writeFileSync('trip-mode.jsx', content, 'utf8');
  console.log("Successfully deleted hardcoded mapSpots and discoveryFeatures arrays.");
} else {
  console.log("Could not locate the variables in the file.");
}
