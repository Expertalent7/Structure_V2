document.addEventListener("DOMContentLoaded", async function () {
    console.log("✅ Page Loaded, Assigning Global Fetch Function");

    // 🔄 Global variable to store beam data
    window.beamData = { beams: [] };

    // 🔄 Cache frequently accessed elements
    const beamSearch = document.getElementById("beamSearch");
    const beamDetailsPanel = document.getElementById("beamDetailsPanel");
    const progressText = document.getElementById("progressValue");
    const progressBar = document.getElementById("progressBar");
    const tooltip = document.getElementById("tooltip");
    const beams = document.querySelectorAll(".beam");
    const closeButton = document.getElementById("closePanelBtn");

    // ✅ Fetch Beam Data
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

            window.beamData = { beams: data }; 
            console.log("✅ beamData Assigned:", window.beamData);

            updateBeamUI();
            updateInstallationProgress();
        } catch (error) {
            console.error("❌ Error fetching beam data:", error);
            console.warn("⚠ Retrying fetch in 5 seconds...");
            setTimeout(fetchBeamData, 5000);
        }
    };

    // ✅ Ensure progress bar is gray at 0%
    if (progressText && parseFloat(progressText.innerText) === 0) {
        progressBar.style.backgroundColor = "#ccc";
    }

    // ✅ Global Fetch Function
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

        window.beamData = { beams: data }; // ✅ Assign fetched data
        console.log("✅ beamData Assigned:", window.beamData);

        updateBeamUI(); // ✅ Update UI
        updateInstallationProgress(); // ✅ Ensure progress updates
    } catch (error) {
        console.error("❌ Error fetching beam data:", error);
        console.warn("⚠ Retrying fetch in 5 seconds...");
        setTimeout(fetchBeamData, 5000); // Retry fetch
    }
}

    // ✅ Update Beam UI
    function updateBeamUI() {
    console.log("🔍 Checking beamData:", window.beamData);

    if (!window.beamData || !window.beamData.beams || window.beamData.beams.length === 0) {
        console.warn("⚠ No beam data available. Retrying in 3 seconds...");
        setTimeout(updateBeamUI, 3000);
        return;
    }

    console.log("✅ Beam data available, updating UI...");

    document.querySelectorAll(".beam").forEach(beamElement => {
        let beamName = beamElement.dataset.name?.toLowerCase().trim();
        let beamDataEntry = window.beamData.beams.find(b =>
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
    if (!window.beamData || !window.beamData.beams) {
        console.warn("⚠ No beam data available for progress update.");
        return;
    }

    let totalBeams = window.beamData.beams.length;
    if (totalBeams === 0) {
        console.warn("⚠ No beams found in data.");
        return;
    }

    let installedBeams = window.beamData.beams.filter(b => parseFloat(b.Progress) >= 100).length;
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

    // ✅ Search Beams
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
    document.getElementById("clearSearchBtn").addEventListener("click", function () {
        if (!beamSearch || !beams) {
            console.error("❌ Search input or beam elements not found!");
            return;
        }
        beamSearch.value = "";
        beams.forEach(beam => {
            beam.classList.remove("highlight");
            beam.style.border = "";
        });
        console.log("🔄 Search cleared");
    });

    // ✅ Function to Close the Beam Details Panel
    function closePanel() {
        if (beamDetailsPanel) {
            beamDetailsPanel.style.display = "none";
        } else {
            console.error("❌ Error: Beam details panel not found!");
        }
    }

    // ✅ Attach Close Button Event Listener
    if (closeButton) {
        closeButton.addEventListener("click", closePanel);
    } else {
        console.error("❌ Error: Close button not found!");
    }

    // ✅ Make QR Code Clickable
    const qrCodeElement = document.getElementById("beamQRCode");
    if (qrCodeElement) {
        qrCodeElement.addEventListener("click", function () {
            let qrCodeUrl = this.src;
            if (qrCodeUrl) {
                window.open(qrCodeUrl, "_blank");
            }
        });
    }

   // ✅ Show Beam Details on Click (with Correct Positioning)
beams.forEach(beamElement => {
    beamElement.addEventListener("click", function (event) {
        if (!window.beamData || !window.beamData.beams) {
            console.warn("⚠ No beam data available");
            return;
        }

        let beamName = this.dataset.name.trim().toLowerCase();
        let beamDataEntry = window.beamData.beams.find(b => 
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

            // ✅ CORRECT POSITIONING OF THE PANEL
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

    // ✅ Tooltip on Hover
    beams.forEach(beam => {
        beam.addEventListener("mouseenter", function (event) {
            let beamName = this.dataset.name;
            tooltip.innerText = `Beam: ${beamName}`;
            tooltip.style.display = "block";
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
