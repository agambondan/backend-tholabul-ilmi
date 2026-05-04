export const CopyImageToClipboard = async ({ canvas }) => {
	try {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			// Use Clipboard API if supported
			canvas.toBlob(async (blob) => {
				const item = new ClipboardItem({ 'image/png': blob });
				await navigator.clipboard.write([item]);
				console.log('Image copied to clipboard');
			});
		} else {
			// Fallback for browsers that do not support Clipboard API
			const dataUrl = canvas.toDataURL('image/png');
			const input = document.createElement('textarea');
			input.value = dataUrl;
			document.body.appendChild(input);
			input.select();
			document.execCommand('copy');
			document.body.removeChild(input);
			console.log('Image copied to clipboard (fallback)');
		}
	} catch (error) {
		console.error('Error copying image to clipboard:', error);
	}
};

export const CopyToClipboard = async ({ textToCopy }) => {
	try {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			// Use the Clipboard API if supported
			await navigator.clipboard.writeText(textToCopy);
			console.log('Text copied to clipboard');
		} else {
			// Fallback for browsers that do not support the Clipboard API
			const input = document.createElement('textarea');
			input.value = textToCopy;
			document.body.appendChild(input);
			input.select();
			document.execCommand('copy');
			document.body.removeChild(input);
			console.log('Text copied to clipboard (fallback)');
		}
	} catch (error) {
		console.error('Error copying to clipboard:', error);
	}
};
