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

            // ✅ Adjust position dynamically
            let left = parseFloat(beamElement.style.left) || 0; // Default to 0 if NaN
            let top = parseFloat(beamElement.style.top) || 0;

            beamElement.style.left = `${left - 5}px`; // Move left
            beamElement.style.top = `${top + 10}px`;  // Move down

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

    let progressBar = document.getElementById("progressBar");
    let progressText = document.getElementById("progressText"); // ✅ Inside Bar
    let progressValue = document.getElementById("progressValue"); // ✅ Outside Bar (main text)

    // ✅ Update Progress Bar
    progressBar.style.width = `${progressPercentage}%`;
    progressText.innerText = `${progressPercentage}%`; // ✅ Ensure inside text updates

    // ✅ Update the main "Installation Progress" text
    if (progressValue) {
        progressValue.innerText = `Installation Progress: ${progressPercentage}%`; // ✅ Fixing the main progress text
    }

    // ✅ Change text color for better visibility
    if (progressPercentage > 0) {
        progressText.style.color = "#ffffff"; // White for contrast
        progressBar.style.backgroundColor = "#4CAF50"; // Green progress bar
    } else {
        progressText.style.color = "#000"; // Black for 0%
        progressBar.style.backgroundColor = "#ccc"; // Gray when empty
    }
}



    // ✅ Show Beam Details on Click (with Correct Positioning)
beams.forEach(beamElement => {
    beamElement.addEventListener("click", function (event) {
        if (!window.beamData || !window.beamData[beamElement.dataset.name]) {
            console.warn("⚠ No beam data available");
            return;
        }

        let beamName = beamElement.dataset.name.trim().toLowerCase();
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

            // ✅ Get Beam Position
            let beamRect = beamElement.getBoundingClientRect();
            let panelWidth = beamDetailsPanel.offsetWidth;
            let panelHeight = beamDetailsPanel.offsetHeight;

            // ✅ Calculate Position
            let posX = beamRect.left + window.scrollX + beamRect.width + 15; // Shift right
            let posY = beamRect.top + window.scrollY;

            // ✅ Prevent the panel from going off-screen
            if (posX + panelWidth > window.innerWidth) {
                posX = beamRect.left + window.scrollX - panelWidth - 15; // Shift left
            }
            if (posY + panelHeight > window.innerHeight) {
                posY = beamRect.top + window.scrollY - panelHeight - 15; // Shift up
            }

            // ✅ Apply Positioning
            beamDetailsPanel.style.left = `${posX}px`;
            beamDetailsPanel.style.top = `${posY}px`;
            beamDetailsPanel.style.display = "block";
        } else {
            console.warn(`⚠ No matching data found for ${beamName}`);
        }
    });
});

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


    // ✅ Close Panel Function
    function closePanel() {
        beamDetailsPanel.style.display = "none";
    }

    // ✅ Attach Close Button Event Listener
    if (closeButton) {
        closeButton.addEventListener("click", closePanel);
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

    // ✅ Fetch data initially and then every 5 seconds
    await fetchBeamData();
    setInterval(fetchBeamData, 5000);
});
