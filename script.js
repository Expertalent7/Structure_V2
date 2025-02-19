async function loadDrawings() {
    try {
        console.log("🔄 Fetching drawings data...");
        const response = await fetch("https://expertalent7.github.io/Structure_V2/data/drawings_data.json");

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Drawings Data Loaded:", data);

        const selectElement = document.getElementById("drawingSelect");

        if (!selectElement) {
            throw new Error("❌ 'drawingSelect' element not found in the DOM!");
        }

        // ✅ Clear previous options
        selectElement.innerHTML = '<option value="">Select a drawing...</option>';

        // ✅ Populate dropdown correctly
        if (Array.isArray(data) && data.length > 0) {
            data.forEach(drawing => {
                if (drawing["Folder ID"] && drawing["Drawing Name"]) {
                    let option = document.createElement("option");
                    option.value = drawing["Folder ID"]; // Ensure correct key
                    option.textContent = drawing["Drawing Name"]; // Ensure correct key
                    selectElement.appendChild(option);
                } else {
                    console.warn("⚠️ Skipping invalid entry:", drawing);
                }
            });
        } else {
            console.warn("⚠️ No drawings found in JSON file.");
        }

    } catch (error) {
        console.error("❌ Error loading drawings:", error);
    }
}

// ✅ Run function when page loads
document.addEventListener("DOMContentLoaded", loadDrawings);
