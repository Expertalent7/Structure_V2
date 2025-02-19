document.addEventListener("DOMContentLoaded", async function () { 
    console.log("✅ Page Loaded, Assigning Global Fetch Function");

    // 🔄 Global variable to store beam data & selected drawing
    window.beamData = {}; 
    let currentDrawing = "STC01-DTSK-SS10-L933P01-0002"; // Default drawing
    let currentFrame = "A"; // Default frame

    // ✅ List of structure images per drawing and frame
    const frameImages = {
        "STC01-DTSK-SS10-L933P01-0002": {
            "A": "https://your-cdn-or-github-path/STC01-DTSK-SS10-L933P01-0002-A.jpg",
            "B": "https://your-cdn-or-github-path/STC01-DTSK-SS10-L933P01-0002-B.jpg",
            "2": "https://your-cdn-or-github-path/STC01-DTSK-SS10-L933P01-0002-2.jpg",
            "3": "https://your-cdn-or-github-path/STC01-DTSK-SS10-L933P01-0002-3.jpg",
            "4": "https://your-cdn-or-github-path/STC01-DTSK-SS10-L933P01-0002-4.jpg"
        },
        "STC01-DTSK-SS10-L933P01-0003": {
            "A": "https://your-cdn-or-github-path/STC01-DTSK-SS10-L933P01-0003-A.jpg",
            "B": "https://your-cdn-or-github-path/STC01-DTSK-SS10-L933P01-0003-B.jpg",
            "2": "https://your-cdn-or-github-path/STC01-DTSK-SS10-L933P01-0003-2.jpg",
            "3": "https://your-cdn-or-github-path/STC01-DTSK-SS10-L933P01-0003-3.jpg",
            "4": "https://your-cdn-or-github-path/STC01-DTSK-SS10-L933P01-0003-4.jpg"
        }
    };

    // ✅ DOM Elements
    const structureImage = document.getElementById("structureImage");
    const frameButtons = document.querySelectorAll(".frame-btn");
    const drawingSelector = document.getElementById("drawingSelector");

    // ✅ Load the default drawing & frame
    function updateDrawing(newDrawing) {
        currentDrawing = newDrawing;
        updateFrame(currentFrame);
    }

    function updateFrame(newFrame) {
        currentFrame = newFrame;
        structureImage.src = frameImages[currentDrawing][currentFrame];
        fetchBeamData();
    }

    // ✅ Drawing Selection Event
    drawingSelector.addEventListener("change", function () {
        updateDrawing(this.value);
    });

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

            // Convert Array to Dictionary (Only keep beams of current drawing & frame)
            window.beamData = {};
            data.forEach(beam => {
                if (beam.Drawing === currentDrawing && beam.Frame === currentFrame) { // ✅ Filter by selected drawing & frame
                    window.beamData[beam.Beam_ID] = beam; 
                }
            });

            console.log("✅ beamData Assigned:", window.beamData);
            updateInstallationProgress();
        } catch (error) {
            console.error("❌ Error fetching beam data:", error);
        }
    }

    // ✅ Load the first drawing and frame
    updateDrawing(currentDrawing);
});
