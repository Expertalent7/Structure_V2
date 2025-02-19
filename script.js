async function loadDrawings() {
    try {
        const response = await fetch("https://expertalent7.github.io/Structure_V2/data/drawings_data.json");
        if (!response.ok) throw new Error("Failed to load data!");

        const data = await response.json();
        const selectElement = document.getElementById("drawingSelect");

        if (!selectElement) {
            console.error("Error: Select element not found!");
            return;
        }

        // ✅ Clear previous entries
        selectElement.innerHTML = '<option value="">Select a drawing...</option>';

        // ✅ Populate dropdown correctly
        data.forEach(drawing => {
            let option = document.createElement("option");
            option.value = drawing["Folder ID"]; 
            option.textContent = drawing["Drawing Name"];
            selectElement.appendChild(option);
        });

        // ✅ Attach event listener to handle drawing selection
        selectElement.addEventListener("change", function () {
            handleDrawingChange(this.value, data);
        });

    } catch (error) {
        console.error("Error loading drawings:", error);
    }
}

// ✅ Function to handle drawing selection and display images
function handleDrawingChange(selectedFolder, data) {
    const selectedDrawing = data.find(d => d["Folder ID"] === selectedFolder);
    if (!selectedDrawing) {
        console.warn("No drawing found for the selected folder.");
        return;
    }

    displayImages(selectedDrawing["Images"]);
}

function displayImages(imageUrls) {
    const imageContainer = document.getElementById("beamContainer");
    
    if (!imageContainer) {
        console.error("Error: Image container not found!");
        return;
    }

    imageContainer.innerHTML = ""; // Clear previous images

    if (!imageUrls || imageUrls.length === 0) {
        imageContainer.innerHTML = "<p>No images found.</p>";
        return;
    }

    imageUrls.forEach(url => {
        let img = document.createElement("img");
        img.src = url;
        img.alt = "Drawing Image";
        img.style.width = "150px";
        img.style.margin = "5px";
        imageContainer.appendChild(img);
    });
}

// ✅ Ensure function runs when the page loads
document.addEventListener("DOMContentLoaded", loadDrawings);
