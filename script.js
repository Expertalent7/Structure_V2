async function loadDrawings() {
    try {
        const response = await fetch("https://expertalent7.github.io/Structure_V2/data/drawings_data.json");
        if (!response.ok) throw new Error("Failed to load data!");

        const data = await response.json();
        const selectElement = document.getElementById("drawingSelect");
        const imageContainer = document.getElementById("imageContainer");

        // ✅ Ensure `imageContainer` exists
        if (!imageContainer) {
            console.error("Error: 'imageContainer' element not found in the DOM.");
            return;
        }

        // ✅ Clear previous dropdown options
        selectElement.innerHTML = '<option value="">Select a drawing...</option>';

        // ✅ Populate dropdown with drawing options
        data.forEach(drawing => {
            let option = document.createElement("option");
            option.value = drawing["Folder ID"];
            option.textContent = drawing["Drawing Name"];
            selectElement.appendChild(option);
        });

        // ✅ Load images when a drawing is selected
        selectElement.addEventListener("change", function () {
            const selectedFolder = this.value;
            const selectedDrawing = data.find(d => d["Folder ID"] === selectedFolder);

            // ✅ Check if drawing exists and has images
            if (!selectedDrawing || !selectedDrawing["Images"]) {
                console.warn("No images found for the selected drawing.");
                displayImages([]); // Call with empty array
            } else {
                displayImages(selectedDrawing["Images"]);
            }
        });

    } catch (error) {
        console.error("Error loading drawings:", error);
    }
}

function displayImages(imageUrls) {
    const imageContainer = document.getElementById("beamContainer"); // Ensure the correct container ID
    imageContainer.innerHTML = ""; // Clear previous images

    if (!imageUrls || imageUrls.length === 0) {
        imageContainer.innerHTML = "<p>No images found.</p>";
        return;
    }

    imageUrls.forEach(url => {
        let img = document.createElement("img");
        img.src = url;
        img.alt = "Drawing Image";
        img.style.width = "200px"; // Adjust size as needed
        img.style.margin = "10px";
        imageContainer.appendChild(img);
    });
}


// ✅ Run `loadDrawings()` when the page loads
document.addEventListener("DOMContentLoaded", loadDrawings);
