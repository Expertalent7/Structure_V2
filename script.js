document.addEventListener("DOMContentLoaded", function () {
    loadDrawings();

    const drawingSelect = document.getElementById("drawingSelect");
    if (drawingSelect) {
        drawingSelect.addEventListener("change", function () {
            handleDrawingChange(this.value);
        });
    }
});

// ✅ Load Drawings
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
            if (drawing["Images"] && drawing["Images"].length > 0) {
                let option = document.createElement("option");
                option.value = drawing["Drawing Name"];
                option.textContent = drawing["Drawing Name"];
                selectElement.appendChild(option);
            }
        });

    } catch (error) {
        console.error("❌ Error loading drawings:", error);
    }
}

// ✅ Handle Image Selection
function handleDrawingChange(selectedDrawingName) {
    if (!selectedDrawingName) {
        console.warn("⚠ No drawing selected.");
        return;
    }

    fetch("https://expertalent7.github.io/Structure_V2/data/drawings_data.json")
        .then(response => response.json())
        .then(data => {
            const selectedDrawing = data.find(d => d["Drawing Name"] === selectedDrawingName);
            if (!selectedDrawing) {
                console.warn("⚠ No drawing found for the selected name.");
                return;
            }

            displayImages(selectedDrawing["Images"], selectedDrawing["Drawing Name"]);
        })
        .catch(error => console.error("❌ Error loading drawing data:", error));
}

// ✅ Display Images
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
        if (!isValidImageURL(url)) {
            console.warn(`⚠ Skipping invalid entry: ${url}`);
            return;
        }

        let img = document.createElement("img");
        img.src = url;
        img.alt = `${drawingName} - Image ${index + 1}`;
        img.crossOrigin = "anonymous";
        img.style.width = "100%";
        img.style.maxWidth = "700px";
        img.style.margin = "10px 0";
        img.classList.add("selectable-image");

        img.addEventListener("click", function () {
            selectImage(url, drawingName);
        });

        imageContainer.appendChild(img);
    });

    console.log(`✅ Loaded ${imageUrls.length} images for ${drawingName}`);
}

// ✅ Extract Image_ID
function extractImageID(imageUrl) {
    const match = imageUrl.match(/\/d\/([^/]+)/);
    return match ? match[1] : null;
}

// ✅ Select & Apply Overlays
function selectImage(imageUrl, drawingName) {
    const selectedImageContainer = document.getElementById("selectedImageContainer");
    const selectedImage = document.getElementById("selectedImage");
    const imageLink = document.getElementById("imageLink");

    if (!selectedImageContainer || !selectedImage || !imageLink) {
        console.error("❌ Error: Selected image container or link not found!");
        return;
    }

    if (!isValidImageURL(imageUrl)) {
        console.error("❌ Error: Cannot open invalid image URL.");
        alert("Invalid image URL!");
        return;
    }

    selectedImage.src = imageUrl;
    selectedImage.dataset.imageId = extractImageID(imageUrl);
    imageLink.href = imageUrl;
    imageLink.target = "_blank";
    selectedImageContainer.style.display = "block";
    selectedImage.style.display = "block";

    loadBeamOverlays(selectedImage.dataset.imageId);
}

// ✅ Apply Overlays
async function loadBeamOverlays(imageId) {
    try {
        console.log(`🔍 Fetching beam data for image ID: ${imageId}`);

        const response = await fetch("https://expertalent7.github.io/Structure_V2/data/beams-data.json");
        if (!response.ok) throw new Error("Failed to load beam data!");

        const beamsData = await response.json();
        const overlayContainer = document.getElementById("overlayContainer");

        if (!overlayContainer) {
            console.error("❌ Error: Overlay container not found!");
            return;
        }

        overlayContainer.innerHTML = "";

        const filteredBeams = beamsData.filter(beam => beam.Image_ID === imageId);

        filteredBeams.forEach(beam => {
            if (!beam.Coordinates || !beam.Coordinates.x || !beam.Coordinates.y) {
                console.warn(`⚠ Skipping beam ${beam.Beam_ID} due to missing coordinates`);
                return;
            }

            let beamOverlay = document.createElement("div");
            beamOverlay.classList.add("beam-overlay");

            beamOverlay.style.position = "absolute";
            beamOverlay.style.left = `${beam.Coordinates.x}px`;
            beamOverlay.style.top = `${beam.Coordinates.y}px`;
            beamOverlay.style.width = `${beam.Coordinates.width}px`;
            beamOverlay.style.height = `${beam.Coordinates.height}px`;

            let progress = parseInt(beam.Progress) || 0;
            beamOverlay.style.backgroundColor = progress >= 100 ? "green" : progress >= 50 ? "yellow" : "red";

            let imageContainer = document.getElementById("selectedImageContainer");
            if (imageContainer) {
                imageContainer.appendChild(beamOverlay);
            } else {
                console.warn(`⚠ No image container found for Beam_ID: ${beam.Beam_ID}`);
            }
        });

        console.log(`✅ Applied ${filteredBeams.length} overlays for image ID: ${imageId}`);

    } catch (error) {
        console.error("❌ Error loading beam overlays:", error);
    }
}
