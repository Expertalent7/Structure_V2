async function loadDrawings() {
    try {
        // ✅ Fetch Drawings JSON
        const response = await fetch("https://expertalent7.github.io/Structure_V2/data/drawings_data.json");
        if (!response.ok) throw new Error("Failed to load drawings data!");

        const data = await response.json();
        const selectElement = document.getElementById("drawingSelect");

        if (!selectElement) {
            console.error("❌ Error: Select element not found!");
            return;
        }

        // ✅ Clear previous entries and add default option
        selectElement.innerHTML = '<option value="">Select a drawing...</option>';

        // ✅ Populate dropdown correctly
        data.forEach(drawing => {
            let option = document.createElement("option");
            option.value = drawing["Folder ID"];
            option.textContent = drawing["Drawing Name"];
            selectElement.appendChild(option);
        });

        // ✅ Attach event listener (Ensures only one instance)
        selectElement.removeEventListener("change", handleDrawingChange);
        selectElement.addEventListener("change", function () {
            handleDrawingChange(this.value, data);
        });

    } catch (error) {
        console.error("❌ Error loading drawings:", error);
    }
}

// ✅ Function to fetch and process beam status
async function loadBeamStatus() {
    try {
        const response = await fetch("https://expertalent7.github.io/Structure_V2/data/beams-data.json"); // Adjust filename if needed
        if (!response.ok) throw new Error("Failed to load beam status data!");

        const data = await response.json();
        updateProgress(data);

    } catch (error) {
        console.error("❌ Error fetching beam status:", error);
    }
}

// ✅ Function to handle drawing selection and display images
function handleDrawingChange(selectedFolder, data) {
    if (!selectedFolder) {
        console.warn("⚠ No drawing selected.");
        return;
    }

    const selectedDrawing = data.find(d => d["Folder ID"] === selectedFolder);
    if (!selectedDrawing) {
        console.warn("⚠ No drawing found for the selected folder.");
        return;
    }

    displayImages(selectedDrawing["Images"], selectedDrawing["Drawing Name"]);

    // ✅ Force progress update after drawing selection
    loadBeamStatus();
}

// ✅ Function to display images for a selected drawing
function displayImages(imageUrls, drawingName) {
    const imageContainer = document.getElementById("beamContainer");

    if (!imageContainer) {
        console.error("❌ Error: Image container not found!");
        return;
    }

    imageContainer.innerHTML = ""; // Clear previous images

    if (!imageUrls || imageUrls.length === 0) {
        imageContainer.innerHTML = "<p>⚠ No images found for this drawing.</p>";
        return;
    }

    imageUrls.forEach((url, index) => {
        let img = document.createElement("img");
        img.src = url;
        img.alt = `${drawingName} - Image ${index + 1}`;
        img.style.width = "150px";
        img.style.margin = "5px";
        img.style.border = "1px solid #ccc";
        img.style.borderRadius = "5px";
        img.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.1)";
        img.classList.add("selectable-image");

        // ✅ Add click event to select an image
        img.addEventListener("click", function () {
            selectImage(url, drawingName);
        });

        imageContainer.appendChild(img);
    });
}

// ✅ Function to select an image and load overlays
function selectImage(imageUrl, drawingName) {
    const selectedImageContainer = document.getElementById("selectedImageContainer");
    const selectedImage = document.getElementById("selectedImage");

    if (!selectedImageContainer || !selectedImage) {
        console.error("❌ Error: Selected image container not found!");
        return;
    }

    // ✅ Show the selected image
    selectedImage.src = imageUrl;
    selectedImageContainer.style.display = "block";

    // ✅ Load beam overlays for the selected image
    loadBeamOverlays(drawingName);
}

// ✅ Function to load and display beam overlays
async function loadBeamOverlays(drawingName) {
    try {
        const response = await fetch("https://expertalent7.github.io/Structure_V2/data/beams-data.json"); // Adjust filename if needed
        if (!response.ok) throw new Error("Failed to load beam data!");

        const beams = await response.json();
        const overlayContainer = document.getElementById("overlayContainer");

        if (!overlayContainer) {
            console.error("❌ Error: Beam overlay container not found!");
            return;
        }

        // ✅ Clear previous overlays
        overlayContainer.innerHTML = "";

        beams.forEach(beam => {
            // ✅ Validate Coordinates
            if (!beam.Coordinates || beam.Coordinates.x === undefined || beam.Coordinates.y === undefined) {
                console.error(`❌ Missing coordinates for beam:`, beam);
                return;
            }

            let beamDiv = document.createElement("div");
            beamDiv.classList.add("beam-overlay");

            // ✅ Set beam position (Assuming coordinates exist)
            beamDiv.style.position = "absolute";
            beamDiv.style.left = beam.Coordinates.x + "px";
            beamDiv.style.top = beam.Coordinates.y + "px";
            beamDiv.style.width = beam.Coordinates.width + "px";
            beamDiv.style.height = beam.Coordinates.height + "px";

            // ✅ Apply color based on progress
            if (beam.Progress === "100") {
                beamDiv.style.backgroundColor = "green"; // Installed
            } else if (beam.Progress >= "50") {
                beamDiv.style.backgroundColor = "yellow"; // In progress
            } else {
                beamDiv.style.backgroundColor = "red"; // Not installed
            }

            overlayContainer.appendChild(beamDiv);
        });

        console.log("✅ Beam overlays loaded successfully.");

    } catch (error) {
        console.error("❌ Error loading beam overlays:", error);
    }
}

// ✅ Function to update installation progress
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

    // ✅ Convert `Progress` to a number if it's a string
    let installedBeams = data.filter(beam => parseInt(beam.Progress) === 100).length;
    let totalBeams = data.length;
    let progress = totalBeams > 0 ? (installedBeams / totalBeams) * 100 : 0;

    console.log(`✅ Installed: ${installedBeams}, Total: ${totalBeams}, Progress: ${progress.toFixed(1)}%`);

    // ✅ Update Progress Bar Smoothly
    requestAnimationFrame(() => {
        progressBar.style.width = progress.toFixed(1) + "%";
        progressText.innerText = progress.toFixed(1) + "%";
    });

    // ✅ Debugging
    setTimeout(() => {
        console.log("🔍 Debug: Progress Bar Width After Update:", progressBar.style.width);
    }, 500);
}

// ✅ Ensure function runs when the page loads
document.addEventListener("DOMContentLoaded", loadDrawings);
