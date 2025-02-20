document.addEventListener("DOMContentLoaded", function () {
    loadDrawings();

    const drawingSelect = document.getElementById("drawingSelect");
    if (drawingSelect) {
        drawingSelect.addEventListener("change", updateSelectedImage);
    }
});

// ✅ Function to load drawings dynamically
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

        // ✅ Clear previous entries and add default option
        selectElement.innerHTML = '<option value="">Select a drawing...</option>';

        data.forEach(drawing => {
            if (drawing["Images"] && drawing["Images"].length > 0) {
                let option = document.createElement("option");
                option.value = drawing["Drawing Name"]; // Store Drawing Name
                option.textContent = drawing["Drawing Name"];
                selectElement.appendChild(option);
            }
        });

        // ✅ Attach event listener
        selectElement.addEventListener("change", function () {
            handleDrawingChange(this.value, data);
        });

    } catch (error) {
        console.error("❌ Error loading drawings:", error);
    }
}


// ✅ Function to update selected image
function updateSelectedImage() {
    const dropdown = document.getElementById("drawingSelect");
    const selectedImage = document.getElementById("selectedImage");
    const imageContainer = document.getElementById("selectedImageContainer");
    const imageLink = document.getElementById("imageLink");

    if (dropdown.value && isValidImageURL(dropdown.value)) {
        selectedImage.src = dropdown.value;
        imageLink.href = dropdown.value;
        selectedImage.style.display = "block"; // Show image
        imageContainer.style.display = "block";  // Show the image container
    } else {
        imageContainer.style.display = "none";  // Hide if no selection
        selectedImage.style.display = "none";   // Hide the image
    }
}

// ✅ Function to check if a URL is a valid image
function isValidImageURL(url) {
    return url.includes("googleusercontent.com") || url.includes(".jpg") || url.includes(".png");
}

// ✅ Function to fetch and process beam status
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

// ✅ Function to handle drawing selection and display images
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

    // ✅ Display all images related to the drawing
    displayImages(selectedDrawing["Images"], selectedDrawing["Drawing Name"]);
}


// ✅ Function to display images for a selected drawing
function displayImages(imageUrls, drawingName) {
    const imageContainer = document.getElementById("beamContainer");

    if (!imageContainer) {
        console.error("❌ Error: Image container not found!");
        return;
    }

    imageContainer.innerHTML = ""; // ✅ Clear previous images

    if (!imageUrls || imageUrls.length === 0) {
        imageContainer.innerHTML = "<p>⚠ No images found for this drawing.</p>";
        return;
    }

    imageUrls.forEach((url, index) => {
        let img = document.createElement("img");

        if (!isValidImageURL(url)) {
            console.warn(`⚠ Skipping invalid entry: ${url}`);
            return;
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

    console.log(`✅ Loaded ${imageUrls.length} images for ${drawingName}`);
}


// ✅ Function to update selected image and prevent folder IDs
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
    imageLink.href = imageUrl;
    imageLink.target = "_blank";
    selectedImageContainer.style.display = "block";
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

    let installedBeams = data.filter(beam => parseInt(beam.Progress) === 100).length;
    let totalBeams = data.length;
    let progress = totalBeams > 0 ? (installedBeams / totalBeams) * 100 : 0;

    requestAnimationFrame(() => {
        progressBar.style.width = `${progress.toFixed(1)}%`;
        progressText.innerText = `${progress.toFixed(1)}%`;
    });
}

document.addEventListener("DOMContentLoaded", loadDrawings);
