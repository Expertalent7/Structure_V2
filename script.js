document.addEventListener("DOMContentLoaded", async function () { 
    console.log("✅ Page Loaded, Assigning Global Fetch Function");

    // 🔄 Global variable to store beam data as a dictionary (not an array)
    window.beamData = {}; 

    const beamSearch = document.getElementById("beamSearch");
    const beamDetailsPanel = document.getElementById("beamDetailsPanel");
    const progressText = document.getElementById("progressValue");
    const progressBar = document.getElementById("progressBar");
    const tooltip = document.getElementById("tooltip");
    const beams = document.querySelectorAll(".beam");
    const closeButton = document.getElementById("closePanelBtn");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    const beamContainer = document.getElementById("beamContainer"); // ✅ Image Container
    const structureImage = document.getElementById("structureImage"); // ✅ Structure Image

    // ✅ Ensure image is not duplicated dynamically
    if (!structureImage) {
        console.error("❌ Error: Structure image not found!");
        return;
    }

    // ✅ Fetch and Update Beam Data
    async function fetchBeamData() {
        const GITHUB_API_URL = "https://raw.githubusercontent.com/expertalent7/Structure_V2/main/data/beams-data.json";

        try {
            console.log("🔄 Fetching Beam Data...");
            const response = await fetch(GITHUB_API_URL);
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
            
            let data = await response.json();
            console.log("📄 Raw Data Fetched:", data);

            if (!Array.isArray(data)) {
                throw new Error("⚠ Error: Data format incorrect! Expected an array.");
            }

            // Convert Array to Dictionary (Keeps only latest scan per Beam_ID)
            window.beamData = {};
            data.forEach(beam => {
                window.beamData[beam.Beam_ID] = beam; 
            });

            console.log("✅ beamData Assigned:", window.beamData);

            updateBeamUI();
            updateInstallationProgress();
        } catch (error) {
            console.error("❌ Error fetching beam data:", error);
            console.warn("⚠ Retrying fetch in 5 seconds...");
            setTimeout(fetchBeamData, 5000);
        }
    }

    // ✅ Update Beam UI
    function updateBeamUI() {
        console.log("🔍 Checking beamData:", window.beamData);

        if (Object.keys(window.beamData).length === 0) {
            console.warn("⚠ No beam data available. Retrying in 3 seconds...");
            setTimeout(updateBeamUI, 3000);
            return;
        }

        console.log("✅ Beam data available, updating UI...");

        let containerRect = structureImage.getBoundingClientRect(); // ✅ Get image position

        document.querySelectorAll(".beam").forEach(beamElement => {
            let beamName = beamElement.dataset.name?.toLowerCase().trim();
            let beamDataEntry = Object.values(window.beamData).find(b =>
                b.Beam_Name.toLowerCase().trim() === beamName
            );

            if (beamDataEntry) {
                beamElement.classList.remove("installed", "not-installed", "in-progress", "highlight");

                let progressValue = parseFloat(beamDataEntry.Progress.replace(",", "").replace("%", ""));

                if (progressValue >= 100) {
                    beamElement.classList.add("installed");
                } else if (progressValue > 0) {
                    beamElement.classList.add("in-progress");
                } else {
                    beamElement.classList.add("not-installed");
                }

                // ✅ Get beam's correct position relative to the image container
                let left = parseFloat(beamDataEntry.x) || 0;
                let top = parseFloat(beamDataEntry.y) || 0;

                // ✅ Adjust beam position relative to container
                beamElement.style.position = "absolute";
                beamElement.style.left = `${left}px`; // Align with image
                beamElement.style.top = `${top}px`;   // Align with image
                beamElement.style.transform = "translate(-50%, -50%)"; // ✅ Center beam
            } else {
                console.warn(`⚠ No data found for beam: ${beamName}`);
            }
        });

        updateInstallationProgress();
    }

    function updateInstallationProgress() {
        if (!window.beamData) {
            console.warn("⚠ No beam data available for progress update.");
            return;
        }

        let totalBeams = Object.keys(window.beamData).length;
        if (totalBeams === 0) {
            console.warn("⚠ No beams found in data.");
            return;
        }

        let installedBeams = Object.values(window.beamData).filter(b => parseFloat(b.Progress) >= 100).length;
        let progressPercentage = ((installedBeams / totalBeams) * 100).toFixed(2);

        console.log(`📊 Updating Progress: ${progressPercentage}%`);

        // ✅ Update Progress Bar
        progressBar.style.width = `${progressPercentage}%`;
        progressText.innerText = `${progressPercentage}%`;
        progressValue.innerText = `Installation Progress: ${progressPercentage}%`; 

        // ✅ Change text color for better visibility
        progressText.style.color = progressPercentage > 0 ? "#ffffff" : "#000";
        progressBar.style.backgroundColor = progressPercentage > 0 ? "#4CAF50" : "#ccc";
    }

    // ✅ Attach Close Button Event Listener
    if (closeButton) {
        closeButton.addEventListener("click", function () {
            beamDetailsPanel.style.display = "none";
        });
    } else {
        console.error("❌ Close button not found!");
    }

    // ✅ Search Function
    if (beamSearch) {
        beamSearch.addEventListener("input", function () {
            let input = this.value.toLowerCase().trim();
            beams.forEach(beam => {
                let beamName = beam.getAttribute("data-name").toLowerCase();
                if (beamName.includes(input) && input !== "") {
                    beam.classList.add("highlight");
                    beam.style.border = "3px solid blue";
                } else {
                    beam.classList.remove("highlight");
                    beam.style.border = "";
                }
            });
        });
    }

    // ✅ Clear Search
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", function () {
            beamSearch.value = "";
            beams.forEach(beam => {
                beam.classList.remove("highlight");
                beam.style.border = "";
            });
            console.log("🔄 Search cleared");
        });
    }

    // ✅ Tooltip for Beam Info on Hover
    beams.forEach(beam => {
        beam.addEventListener("mouseenter", function (event) {
            let beamName = this.dataset.name;
            tooltip.innerText = `Beam: ${beamName}`;
            tooltip.style.display = "block";

            // ✅ Position tooltip near mouse pointer
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
        });

        beam.addEventListener("mouseleave", function () {
            tooltip.style.display = "none";
        });
    });

    // ✅ Fetch data initially and then every 5 seconds
    await fetchBeamData();
    setInterval(fetchBeamData, 5000);
});
