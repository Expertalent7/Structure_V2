document.addEventListener("DOMContentLoaded", async function () {
    const drawingSelect = document.getElementById("drawingSelect");
    const framesContainer = document.getElementById("framesContainer");

    // ✅ Correct JSON URL
    const DRAWINGS_JSON_URL = "https://expertalent7.github.io/Structure_V2/data/drawings_data.json";
 

    try {
        let response = await fetch(DRAWINGS_JSON_URL);  // ✅ Use the correct variable
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        let data = await response.json();

        console.log("📄 Drawings Data Loaded:", data);

        // ✅ Populate drawing dropdown
        data.forEach(drawing => {
            let option = document.createElement("option");
            option.value = drawing["Folder ID"];
            option.textContent = drawing["Drawing Name"];
            drawingSelect.appendChild(option);
        });

        // ✅ Show frames only when a drawing is selected
        drawingSelect.addEventListener("change", function () {
            framesContainer.style.display = this.value ? "block" : "none";
        });

    } catch (error) {
        console.error("❌ Error fetching drawings data:", error);
    }
});
