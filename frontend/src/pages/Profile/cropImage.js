// cropImage.js
export const getCroppedImg = (imageSrc, croppedAreaPixels) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.crossOrigin = "anonymous"; // handle CORS issues if needed

        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;
            const ctx = canvas.getContext("2d");

            // Draw the cropped portion of the image onto the canvas
            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            // Convert canvas to Blob (JPEG)
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Canvas is empty"));
                    return;
                }
                resolve(blob);
            }, "image/jpeg", 0.9); // quality 0.9
        };

        image.onerror = (err) => {
            reject(err);
        };
    });
};
