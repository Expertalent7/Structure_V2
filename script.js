async function loadDrawings() {
    try {
        const response = await fetch("https://expertalent7.github.io/Structure_V2/data/drawings_data.json");
        if (!response.ok) throw new Error("Failed to load drawings data!");

        const data = await response.json();
        const selectElement = document.getElementById("drawingSelect");

        if (!selectElement) {
            console.error("❌ Error: Select element not found!");
            return;
        }

        selectElement.innerHTML = '<option value="">Select a drawing...</option>';

        data.forEach(drawing => {
            let option = document.createElement("option");

            // ✅ Only use "Drawing Name" as the value, NOT Folder ID
            option.value = drawing["Drawing Name"];
            option.textContent = drawing["Drawing Name"];
            selectElement.appendChild(option);
        });

        selectElement.removeEventListener("change", handleDrawingChange);
        selectElement.addEventListener("change", function () {
            handleDrawingChange(this.value, data);
        });

    } catch (error) {
        console.error("❌ Error loading drawings:", error);
    }
}


async function loadBeamStatus() {
    try {
        const response = await fetch("https://expertalent7.github.io/Structure_V2/data/beams-data.json");
        if (!response.ok) throw new Error("Failed to load beam status data!");

        const data = await response.json();
        updateProgress(data);

    } catch (error) {
        console.error("❌ Error fetching beam status:", error);
    }
}

function handleDrawingChange(selectedDrawingName, data) {
    if (!selectedDrawingName) {
        console.warn("⚠ No drawing selected.");
        return;
    }

    const selectedDrawing = data.find(d => d["Drawing Name"] === selectedDrawingName);
    if (!selectedDrawing) {
        console.warn("⚠ No drawing found for the selected name.");
        return;
    }

    // ✅ Ensure we only use valid image URLs
    const validImages = selectedDrawing["Images"].filter(url => url.includes("googleusercontent.com") || url.includes(".jpg"));

    displayImages(validImages, selectedDrawing["Drawing Name"]);
    loadBeamStatus();
}


function displayImages(imageUrls, drawingName) {
    const imageContainer = document.getElementById("beamContainer");

    if (!imageContainer) {
        console.error("❌ Error: Image container not found!");
        return;
    }

    imageContainer.innerHTML = "";

    if (!imageUrls || imageUrls.length === 0) {
        imageContainer.innerHTML = "<p>⚠ No images found for this drawing.</p>";
        return;
    }

    imageUrls.forEach((url, index) => {
        let img = document.createElement("img");

        // ✅ Skip Folder ID if mistakenly included
        if (url.length === 33 && !url.includes("googleusercontent.com")) {
            console.warn(`⚠ Skipping folder ID in image list: ${url}`);
            return; // Prevents the 404 request
        }

        img.src = url;
        img.alt = `${drawingName} - Image ${index + 1}`;
        img.style.width = "150px";
        img.style.margin = "5px";
        img.style.border = "1px solid #ccc";
        img.style.borderRadius = "5px";
        img.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.1)";
        img.classList.add("selectable-image");

        img.addEventListener("click", function () {
            selectImage(url, drawingName);
        });

        imageContainer.appendChild(img);
    });
}




function selectImage(imageUrl, drawingName) {
    const selectedImageContainer = document.getElementById("selectedImageContainer");
    const selectedImage = document.getElementById("selectedImage");
    const imageLink = document.getElementById("imageLink");

    if (!selectedImageContainer || !selectedImage || !imageLink) {
        console.error("❌ Error: Selected image container or link not found!");
        return;
    }

    // ✅ If the URL is a Google Drive FOLDER ID, prevent opening it as an image
    if (imageUrl.includes("drive.google.com") || imageUrl.length === 33) {
        console.error("❌ Error: Cannot open Google Drive folder directly as an image.");
        alert("Selected item is a Google Drive folder, not an image!");
        return;
    }

    // ✅ Set the correct image path
    selectedImage.src = imageUrl;
    imageLink.href = imageUrl;
    imageLink.target = "_blank";
    selectedImageContainer.style.display = "block";
}


async function loadBeamOverlays(drawingName) {
    try {
        console.log(`🔍 Loading beam data for: ${drawingName}`);

        const response = await fetch("https://expertalent7.github.io/Structure_V2/data/beams-data.json");
        if (!response.ok) throw new Error(`Failed to load beam data! HTTP Status: ${response.status}`);

        const beams = await response.json();
        if (!Array.isArray(beams)) throw new Error("Invalid JSON format: Expected an array.");

        let overlayContainer = document.getElementById("overlayContainer");
        if (!overlayContainer) {
            overlayContainer = document.createElement("div");
            overlayContainer.id = "overlayContainer";
            document.body.appendChild(overlayContainer);
        }

        overlayContainer.innerHTML = "";

        beams.forEach(beam => {
            if (!beam.Coordinates || beam.Coordinates.x === undefined || beam.Coordinates.y === undefined) {
                console.error(`❌ Skipping beam due to missing coordinates:`, beam);
                return;
            }

            const x = parseFloat(beam.Coordinates.x);
            const y = parseFloat(beam.Coordinates.y);
            const width = parseFloat(beam.Coordinates.width) || 10;
            const height = parseFloat(beam.Coordinates.height) || 10;

            if (isNaN(x) || isNaN(y)) {
                console.error(`❌ Invalid numerical coordinates for beam:`, beam);
                return;
            }

            let beamDiv = document.createElement("div");
            beamDiv.classList.add("beam-overlay");

            beamDiv.style.position = "absolute";
            beamDiv.style.left = `${x}px`;
            beamDiv.style.top = `${y}px`;
            beamDiv.style.width = `${width}px`;
            beamDiv.style.height = `${height}px`;

            let progress = parseInt(beam.Progress) || 0;
            beamDiv.style.backgroundColor = progress >= 100 ? "green" : progress >= 50 ? "yellow" : "red";

            overlayContainer.appendChild(beamDiv);
        });

        console.log("✅ Beam overlays loaded successfully.");
    } catch (error) {
        console.error("❌ Error loading beam overlays:", error);
    }
}

function updateProgress(data) {
    if (!data || data.length === 0) {
        console.warn("⚠ No beam data found!");
        return;
    }

    let progressBar = document.getElementById("progress-bar");
    let progressText = document.getElementById("progress-text");

    if (!progressBar || !progressText) {
        console.error("❌ Error: Progress bar or progress text not found in the HTML!");
        return;
    }

    let installedBeams = data.filter(beam => parseInt(beam.Progress) === 100).length;
    let totalBeams = data.length;
    let progress = totalBeams > 0 ? (installedBeams / totalBeams) * 100 : 0;

    requestAnimationFrame(() => {
        progressBar.style.width = `${progress.toFixed(1)}%`;
        progressText.innerText = `${progress.toFixed(1)}%`;
    });
}

document.addEventListener("DOMContentLoaded", loadDrawings);
