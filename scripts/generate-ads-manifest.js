/*
 Generates public/ads/manifest.json listing all images under public/ads.
 This allows the client to dynamically load all ad images without hardcoding names.
*/

const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(directoryPath) {
	if (!fs.existsSync(directoryPath)) {
		fs.mkdirSync(directoryPath, { recursive: true });
	}
}

function isImageFile(fileName) {
	const lower = fileName.toLowerCase();
	return (
		lower.endsWith('.jpg') ||
		lower.endsWith('.jpeg') ||
		lower.endsWith('.png') ||
		lower.endsWith('.webp') ||
		lower.endsWith('.gif') ||
		lower.endsWith('.svg')
	);
}

function naturalCompare(a, b) {
	return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function generateManifest() {
	const adsDir = path.join(__dirname, '..', 'public', 'ads');
	const manifestPath = path.join(adsDir, 'manifest.json');

	ensureDirectoryExists(adsDir);

	let files = [];
	try {
		files = fs.readdirSync(adsDir).filter(isImageFile).sort(naturalCompare);
	} catch (error) {
		// If read fails, keep files as empty
	}

	const urls = files.map((name) => `/ads/${name}`);
	const payload = { images: urls, generatedAt: new Date().toISOString() };

	try {
		fs.writeFileSync(manifestPath, JSON.stringify(payload, null, 2), 'utf8');
		console.log(`Generated ads manifest with ${urls.length} image(s) at ads/manifest.json`);
	} catch (error) {
		console.error('Failed to write ads manifest:', error);
		process.exitCode = 1;
	}
}

generateManifest();


