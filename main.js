"use strict";
const _ = (e) => document.querySelector(e);
const cropButton = _("#cropButton");
const imageForCrop = _("#imageForCrop");
const rowsSelect = _("#rowsSelect");
const colsSelect = _("#colsSelect");
const reCropButton = _("#reCropButton");
const cropImageWrapper = _("#cropImageWrapper");
const outputCanvas = _("#outputCanvas");

let originalImageMimeType = null;
let isImageLoaded = false;
let cropper = null;
let croppedImageUrl = null;
let croppedCanvas = null;

let targetImageWidth = 360;
let targetImageHeight = 450;

let backgroundColor = "#008080"; // Default background color (white)

const paperSize = {
    A4: { width: 2480, height: 3505 },
    _4x6: { width: 1200, height: 1800 },
    _5x7: { width: 1500, height: 2100 },
};
// set internally
const gap = 50; // Adjust gap as needed
const margin = gap / 2;

// Handle image input change event
_("#imageInput").addEventListener("change", handleImage);
// Handle background color input change event
_("#backgroundColorInput").addEventListener("input", setBackgroundColor);
// Handle rows select change event
rowsSelect.addEventListener("change", updateGrid);
// Handle columns select change event
colsSelect.addEventListener("change", updateGrid);
reCropButton.addEventListener("click", function () {

    enableCropDisableCanvasTools(true);
});
// Handle download button click
const downloadImageButton = _("#downloadImageButton");

downloadImageButton.addEventListener("click", downloadCanvas);

// get from user
let numRows = parseInt(rowsSelect.value, 10) || 1; // Default number of rows
let numCols = parseInt(colsSelect.value, 10) || 6; // Default number of columns

cropButton.addEventListener("click", cropImage);

// detect upload image
function handleImage(event) {
    const file = event.target.files[0];
    if (file) {
        originalImageMimeType = file.type;
        // image onload
        imageForCrop.onload = function () {
            isImageLoaded = true;
            // console.log("image loaded");
            initCropper();
            cropImageWrapper.style.display = "block";
            enableCropDisableCanvasTools(true);
        };
        imageForCrop.src = URL.createObjectURL(file);
    }
}

// initialisation of cropper
function initCropper() {
    if (cropper) {
        destroyCrooper();
    }

    outputCanvas.style.display = "none";
    reCropButton.disabled = true;

    cropper = new Cropper(imageForCrop, {
        viewMode: 3,
        dragMode: "move",
        aspectRatio: 20 / 25,
        autoCropArea: 1,
        restore: !1,
        modal: !1,
        highlight: !1,
        cropBoxMovable: !1,
        cropBoxResizable: !1,
        toggleDragModeOnDblclick: !1,
    });
}

function destroyCrooper() {
    cropper.destroy();
    cropper = null;
}

function cropImage() {
    if (cropper) {
        croppedCanvas = cropper.getCroppedCanvas({
            width: targetImageWidth,
            height: targetImageHeight,
        });

        if (croppedCanvas !== null) {
            // enable tools
            enableCropDisableCanvasTools(false);
            drawImageGrid();
        }
    }
}

function enableCropDisableCanvasTools(statusTrue) {
    document
        .querySelectorAll("#canvasToolGroup>*")
        .forEach((el) => (el.disabled = statusTrue));
    cropButton.disabled = !statusTrue;
    reCropButton.disabled = statusTrue;
    cropImageWrapper.style.display = statusTrue ? "block" : "none";
    outputCanvas.style.display = statusTrue ? "none" : "block";
}

// outputCanvas grid
const ctx = outputCanvas.getContext("2d");
outputCanvas.width = paperSize.A4.width; // Adjust outputCanvas size as needed
outputCanvas.height = paperSize.A4.height;

let outputCanvasImageBlob = null;

function drawImageGrid() {
    if (isImageLoaded) {
        // set background colour white
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
        // arrange image in rows by for loop
        for (let row = 0; row < numRows; row++) {
            // arrange image in columns by for loop
            for (let col = 0; col < numCols; col++) {
                const x = col * (targetImageWidth + gap) + margin; // Adjusted x position
                const y = row * (targetImageHeight + gap) + margin; // Adjusted y position

                // for maintain original image ratio
                // const y = row * (img.height / img.width * targetImageWidth + gap) + margin; // Adjusted y position

                ctx.fillStyle = backgroundColor;
                ctx.fillRect(x, y, targetImageWidth, targetImageHeight);

                ctx.strokeStyle = "black";
                ctx.lineWidth = 5;

                ctx.drawImage(
                    croppedCanvas, x, y, targetImageWidth, targetImageHeight
                );

                ctx.strokeRect(x, y, targetImageWidth, targetImageHeight); // Stroke around the image
            }
        }
    }

    // Store outputCanvas image as Blob
    outputCanvas.toBlob(function (blob) {
        outputCanvasImageBlob = blob;
    }, originalImageMimeType); // Pass original image MIME type
}

function setBackgroundColor(event) {
    backgroundColor = event.target.value;
    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    drawImageGrid();
}

function updateGrid() {
    numRows = parseInt(rowsSelect.value, 10);
    numCols = parseInt(colsSelect.value, 10);
    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    drawImageGrid();
}

function downloadCanvas() {
    if (outputCanvasImageBlob) {
        const timestamp = new Date().getTime();
        const fileName = `${document.URL}_IMG_${timestamp}.png`;
        const link = document.createElement("a");
        link.download = fileName;
        link.href = URL.createObjectURL(outputCanvasImageBlob);
        link.click();
    }
}

setBackgroundColor({ target: { value: backgroundColor } });

console.log(document.URL)
