document.addEventListener("DOMContentLoaded", async function () { 
    console.log("✅ Page Loaded, Assigning Global Fetch Function");

    // 🔄 Global variable to store beam data & current frame
    window.beamData = {}; 
    let currentFrame = "A"; // Default frame

    // ✅ List of structure images per frame
    const frameImages = {
        "A": "https://your-cdn-or-github-path/frame-axis-a.jpg",
        "B": "https://your-cdn-or-github-path/frame-axis-b.jpg",
        "2": "https://your-cdn-or-github-path/frame-axis-2.jpg",
        "3": "https://your-cdn-or-github-path/frame-axis-3.jpg",
        "4": "https://your-cdn-or-github-path/frame-axis-4.jpg"
    };

    // ✅ DOM Elements
    const structureImage = document.getElementById("structureImage");
    const frameButtons = document.querySelectorAll(".frame-btn");
    const beamContainer = document.getElementById("beamContainer");

    // ✅ Load the default frame
    function updateFrame(newFrame) {
        currentFrame = newFrame;
        structureImage.src = frameImages[currentFrame];
        fetchBeamData();
    }

    // ✅ Frame Button Click Event
    frameButtons.forEach(button => {
        button.addEventListener("click", function () {
            updateFrame(this.dataset.frame);
        });
    });

    // ✅ Fetch Beam Data
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

            // Convert Array to Dictionary (Only keep beams of current frame)
            window.beamData = {};
            data.forEach(beam => {
                if (beam.Frame === currentFrame) { // ✅ Filter by selected frame
                    window.beamData[beam.Beam_ID] = beam; 
                }
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

                // ✅ Adjust beam position relative to container
                beamElement.style.position = "absolute";
                beamElement.style.left = `${beamDataEntry.x}px`; // Align with image
                beamElement.style.top = `${beamDataEntry.y}px`;   // Align with image
                beamElement.style.transform = "translate(-50%, -50%)"; // ✅ Center beam
            } else {
                console.warn(`⚠ No data found for beam: ${beamName}`);
            }
        });

        updateInstallationProgress();
    }

    function updateInstallationProgress() {
        let totalBeams = Object.keys(window.beamData).length;
        let installedBeams = Object.values(window.beamData).filter(b => parseFloat(b.Progress) >= 100).length;
        let progressPercentage = ((installedBeams / totalBeams) * 100).toFixed(2);

        console.log(`📊 Updating Progress: ${progressPercentage}%`);

        document.getElementById("progressBar").style.width = `${progressPercentage}%`;
        document.getElementById("progressText").innerText = `${progressPercentage}%`;
        document.getElementById("progressValue").innerText = `Installation Progress: ${progressPercentage}%`; 
    }

    // ✅ Load the first frame
    updateFrame("A");
});
