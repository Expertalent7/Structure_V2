document.addEventListener("DOMContentLoaded", async function () {
    const drawingSelect = document.getElementById("drawingSelect");
    const framesContainer = document.getElementById("framesContainer");

    const jsonUrl = "https://drive.google.com/uc?export=download&id=1wTeXYRrablsmlfx6rAje2dIcrl2G9hta"; // Replace with actual JSON file ID

    try {
        let response = await fetch(jsonUrl);
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
