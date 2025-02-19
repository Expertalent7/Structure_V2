async function loadDrawings() {
    try {
        const response = await fetch("https://expertalent7.github.io/Structure_V2/data/drawings_data.json");
        if (!response.ok) throw new Error("Failed to load data!");

        const data = await response.json();
        const selectElement = document.getElementById("drawingSelect");

        // ✅ Clear previous entries
        selectElement.innerHTML = '<option value="">Select a drawing...</option>';

        // ✅ Populate dropdown correctly
        data.forEach(drawing => {
            let option = document.createElement("option");
            option.value = drawing["Folder ID"]; 
            option.textContent = drawing["Drawing Name"];
            selectElement.appendChild(option);
        });

        // ✅ Event Listener to Load Images When Selected
        selectElement.addEventListener("change", function () {
            const selectedFolder = this.value;
            const selectedDrawing = data.find(d => d["Folder ID"] === selectedFolder);
            displayImages(selectedDrawing["Images"]);
        });

    } catch (error) {
        console.error("Error loading drawings:", error);
    }
}

function displayImages(imageUrls) {
    const imageContainer = document.getElementById("imageContainer");
    imageContainer.innerHTML = ""; // Clear previous images

    if (imageUrls.length === 0) {
        imageContainer.innerHTML = "<p>No images found.</p>";
        return;
    }

    imageUrls.forEach(url => {
        let img = document.createElement("img");
        img.src = url;
        img.alt = "Drawing Image";
        img.style.width = "200px";
        img.style.margin = "10px";
        imageContainer.appendChild(img);
    });
}

// ✅ Ensure function runs when the page loads
document.addEventListener("DOMContentLoaded", loadDrawings);
