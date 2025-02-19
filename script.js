document.addEventListener("DOMContentLoaded", async function () { 
    console.log("✅ Page Loaded, Assigning Global Fetch Function");

    // 🔄 Global variable to store beam data & current frame
    window.beamData = {}; 
    let currentFrame = "A"; // Default frame

    // ✅ Corrected List of Images per Frame
    const frameImages = {
        "A": "https://raw.githubusercontent.com/expertalent7/Structure_V2/main/images/frame-axis-a.jpg",
        "B": "https://raw.githubusercontent.com/expertalent7/Structure_V2/main/images/frame-axis-b.jpg",
        "2": "https://raw.githubusercontent.com/expertalent7/Structure_V2/main/images/frame-axis-2.jpg",
        "3": "https://raw.githubusercontent.com/expertalent7/Structure_V2/main/images/frame-axis-3.jpg",
        "4": "https://raw.githubusercontent.com/expertalent7/Structure_V2/main/images/frame-axis-4.jpg"
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

    function updateInstallationProgress() {
        let totalBeams = Object.keys(window.beamData).length;
        let installedBeams = Object.values(window.beamData).filter(b => parseFloat(b.Progress) >= 100).length;

        // ✅ Fix: Prevent NaN% by ensuring totalBeams > 0
        let progressPercentage = totalBeams > 0 ? ((installedBeams / totalBeams) * 100).toFixed(2) : "0%";

        console.log(`📊 Updating Progress: ${progressPercentage}`);

        document.getElementById("progressBar").style.width = progressPercentage;
        document.getElementById("progressText").innerText = progressPercentage;
        document.getElementById("progressValue").innerText = `Installation Progress: ${progressPercentage}`; 
    }

    // ✅ Load the first frame
    updateFrame("A");
});
