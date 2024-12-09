async function extractText() {
    const fileInput = document.getElementById('file-input');
    const textOutput = document.getElementById('text-output');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select an image file first.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function (event) {
        const imgElement = new Image();
        imgElement.src = event.target.result;

        imgElement.onload = async function () {
            const canvas = document.createElement('canvas');
            canvas.width = imgElement.width;
            canvas.height = imgElement.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

            const src = cv.imread(canvas);
            const gray = new cv.Mat();
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
            const blurred = new cv.Mat();
            cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
            const threshold = new cv.Mat();
            cv.threshold(blurred, threshold, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

            cv.imshow(canvas, threshold);
            const dataUrl = canvas.toDataURL('image/png');
            const { data: { text } } = await Tesseract.recognize(dataUrl, 'ben', {
                logger: m => console.log(m),
            });
            textOutput.innerText = text;

            src.delete();
            gray.delete();
            blurred.delete();
            threshold.delete();
        };
    };

    reader.readAsDataURL(file);
}
