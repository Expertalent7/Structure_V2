document.addEventListener("DOMContentLoaded", async function () { 
    console.log("✅ Page Loaded, Assigning Global Fetch Function");

    // 🔄 Global variable to store beam data as a dictionary
    window.beamData = {}; 

    const beamSearch = document.getElementById("beamSearch");
    const beamDetailsPanel = document.getElementById("beamDetailsPanel");
    const progressText = document.getElementById("progressValue");
    const progressBar = document.getElementById("progressBar");
    const tooltip = document.getElementById("tooltip");
    const closeButton = document.getElementById("closePanelBtn");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    const beamContainer = document.getElementById("beamContainer"); // ✅ Image Container
    const structureImage = document.getElementById("structureImage"); // ✅ Structure Image

    // ✅ Ensure image is loaded before proceeding
    structureImage.onload = function() {
        console.log("✅ Structure image loaded");
        fetchBeamData();
    };

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

    function updateBeamUI() {
        console.log("🔍 Checking beamData:", window.beamData);

        if (Object.keys(window.beamData).length === 0) {
            console.warn("⚠ No beam data available. Retrying in 3 seconds...");
            setTimeout(updateBeamUI, 3000);
            return;
        }

        console.log("✅ Beam data available, updating UI...");

        let containerRect = structureImage.getBoundingClientRect(); // ✅ Get image position

        // ✅ Clear any existing beams before updating
        document.querySelectorAll(".beam").forEach(beam => beam.remove());

        Object.values(window.beamData).forEach(beamDataEntry => {
            let beamElement = document.createElement("div");
            beamElement.classList.add("beam");
            beamElement.dataset.name = beamDataEntry.Beam_Name.toLowerCase().trim();

            let progressValue = parseFloat(beamDataEntry.Progress.replace(",", "").replace("%", ""));

            if (progressValue >= 100) {
                beamElement.classList.add("installed");
            } else if (progressValue > 0) {
                beamElement.classList.add("in-progress");
            } else {
                beamElement.classList.add("not-installed");
            }

            let left = parseFloat(beamDataEntry.x) || 0;
            let top = parseFloat(beamDataEntry.y) || 0;

            beamElement.style.position = "absolute";
            beamElement.style.left = `${left}px`; // Align with image
            beamElement.style.top = `${top}px`;   // Align with image
            beamElement.style.transform = "translate(-50%, -50%)"; // ✅ Center beam

            beamContainer.appendChild(beamElement);
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

        progressBar.style.width = `${progressPercentage}%`;
        progressText.innerText = `${progressPercentage}%`;
        progressValue.innerText = `Installation Progress: ${progressPercentage}%`; 

        progressText.style.color = progressPercentage > 0 ? "#ffffff" : "#000";
        progressBar.style.backgroundColor = progressPercentage > 0 ? "#4CAF50" : "#ccc";
    }

    // ✅ Fetch data initially and then every 5 seconds
    setInterval(fetchBeamData, 5000);
});
