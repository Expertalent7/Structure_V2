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
            option.value = drawing["Folder ID"]; // Using correct key name
            option.textContent = drawing["Drawing Name"]; // Using correct key name
            selectElement.appendChild(option);
        });

    } catch (error) {
        console.error("Error loading drawings:", error);
    }
}

// ✅ Ensure function runs when the page loads
document.addEventListener("DOMContentLoaded", loadDrawings);
