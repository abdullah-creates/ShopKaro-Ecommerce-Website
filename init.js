// Global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    if (errorMessage && errorText) {
        errorText.textContent = 'An error occurred. Please refresh the page.';
        errorMessage.classList.add('show');
        setTimeout(() => errorMessage.classList.remove('show'), 5000);
    }
    return false;
};

// Check if all required files are loaded
window.addEventListener('load', function() {
    const requiredFiles = ['animations.js', 'auth.js', 'wishlist.js', 'cart.js', 'script.js'];
    const loadedScripts = Array.from(document.scripts).map(script => {
        const src = script.src;
        return src.substring(src.lastIndexOf('/') + 1);
    });
    
    const missingFiles = requiredFiles.filter(file => 
        !loadedScripts.some(script => script.includes(file))
    );

    if (missingFiles.length > 0) {
        console.error('Missing required files:', missingFiles);
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        if (errorMessage && errorText) {
            errorText.textContent = 'Some required files failed to load. Please refresh the page.';
            errorMessage.classList.add('show');
        }
    }
}); 