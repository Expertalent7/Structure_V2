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

    // ✅ Fetch and Update Beam Data
    window.fetchBeamData = async function () {
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
    };

    // ✅ Update Beam UI
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
            } else {
                console.warn(`⚠ No data found for beam: ${beamName}`);
            }
        });

        // ✅ Ensure the installation progress is updated in UI
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

        // ✅ Update Progress Bar Width
        let progressBar = document.getElementById("progressBar");
        progressBar.style.width = `${progressPercentage}%`;

        // ✅ Update Green Percentage Text (inside the bar)
        let progressText = document.getElementById("progressText");
        progressText.innerText = `${progressPercentage}%`;

        // ✅ Update Black Percentage Text (outside the bar)
        let progressValue = document.getElementById("progressValue");
        progressValue.innerText = `${progressPercentage}%`;

        // ✅ Ensure Text is Green when Installed
        if (progressPercentage > 0) {
            progressText.style.color = "#ffffff"; // White text for contrast
            progressBar.style.backgroundColor = "#4CAF50"; // ✅ Green progress bar
        } else {
            progressText.style.color = "#000"; // Black for 0%
            progressBar.style.backgroundColor = "#ccc"; // Gray when empty
        }
    }

    // ✅ Beam Click Event (Show Details)
    beams.forEach(beamElement => {
        beamElement.addEventListener("click", function (event) {
            let beamName = this.dataset.name.trim().toLowerCase();
            let beamDataEntry = Object.values(window.beamData).find(b =>
                b.Beam_Name.toLowerCase().trim() === beamName
            );

            if (beamDataEntry) {
                let beamStatus = beamDataEntry.Progress === "100%" ? "Installed" : "Not Installed";
                let beamWeight = beamDataEntry.Weight ? `${beamDataEntry.Weight} kg` : "Unknown kg";
                let beamProgress = beamDataEntry.Progress || "0%";
                let beamQRCode = `https://quickchart.io/qr?text=${encodeURIComponent(beamDataEntry.Beam_Name)}`;

                document.getElementById("beamName").innerText = beamDataEntry.Beam_Name;
                document.getElementById("beamStatus").innerText = beamStatus;
                document.getElementById("beamWeight").innerText = beamWeight;
                document.getElementById("beamProgress").innerText = beamProgress;
                document.getElementById("beamQRCode").src = beamQRCode;

                // ✅ Correct Panel Positioning
                let beamRect = event.target.getBoundingClientRect();
                let panelWidth = beamDetailsPanel.offsetWidth;
                let panelHeight = beamDetailsPanel.offsetHeight;

                let posX = beamRect.left + window.scrollX + beamRect.width + 10; // Shift right
                let posY = beamRect.top + window.scrollY - (panelHeight / 2);

                // Prevent the panel from going off-screen
                posX = Math.max(10, Math.min(posX, window.innerWidth - panelWidth - 10));
                posY = Math.max(10, Math.min(posY, window.innerHeight - panelHeight - 10));

                beamDetailsPanel.style.left = `${posX}px`;
                beamDetailsPanel.style.top = `${posY}px`;
                beamDetailsPanel.style.display = "block";
            } else {
                console.warn(`⚠ No matching data found for ${beamName}`);
            }
        });
    });

    // ✅ Fetch data initially and then every 5 seconds
    await fetchBeamData();
    setInterval(fetchBeamData, 5000);
});
