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

    // ✅ Ensure progress bar is gray at 0%
    if (progressText && parseFloat(progressText.innerText) === 0) {
        progressBar.style.backgroundColor = "#ccc";
    }

    // ✅ Fetch Beam Data from GitHub
    async function fetchBeamData() {
        const GITHUB_API_URL = "https://raw.githubusercontent.com/expertalent7/Structure_V2/main/data/beams-data.json";

        try {
            console.log("🔄 Fetching Beam Data...");
            const response = await fetch(GITHUB_API_URL);
            
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
            
            let data = await response.json();
            console.log("📄 Raw Data Fetched:", data);  // Debugging

            // ✅ Ensure fetched data is an array
            if (!Array.isArray(data)) {
                throw new Error("⚠ Error: Data format incorrect! Expected an array.");
            }

            window.beamData.beams = data; // ✅ Corrected data assignment
            console.log("✅ beamData Assigned:", window.beamData); // Debugging
            
            updateBeamUI(); // Call UI update after successful data load
        } catch (error) {
            console.error("❌ Error fetching beam data:", error);
            console.warn("⚠ Retrying fetch in 5 seconds...");
            setTimeout(fetchBeamData, 5000); // Retry fetch
        }
    }

    // ✅ Update Beam UI
   function updateBeamUI() {
    console.log("🔍 Checking beamData:", window.beamData);

    if (!window.beamData.beams || window.beamData.beams.length === 0) {
        console.warn("⚠ No beam data available. Retrying in 3 seconds...");
        setTimeout(updateBeamUI, 3000);
        return;
    }

    console.log("✅ Beam data available, updating UI...");

    // Store all JSON beam names for fast lookup
    let jsonBeams = window.beamData.beams.map(b => b.Beam_Name.trim().toLowerCase());
    let missingBeams = []; // Track missing beams

    document.querySelectorAll(".beam").forEach(beamElement => {
        let beamName = beamElement.dataset.name?.trim().toLowerCase();

        if (jsonBeams.includes(beamName)) {
            let beamDataEntry = window.beamData.beams.find(b => b.Beam_Name.trim().toLowerCase() === beamName);

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
            missingBeams.push(beamName);
        }
    });

    // Only log missing beams once
    if (missingBeams.length > 0) {
        console.warn(`⚠ Beams missing from JSON:`, [...new Set(missingBeams)]);
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

    // ✅ Show Beam Details on Click
    beams.forEach(beamElement => {
        beamElement.addEventListener("click", function (event) {
            if (!window.beamData.beams) {
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
                let beamQRCode = beamDataEntry.QR_Code || "https://via.placeholder.com/150";

                document.getElementById("beamName").innerText = beamDataEntry.Beam_Name;
                document.getElementById("beamStatus").innerText = beamStatus;
                document.getElementById("beamWeight").innerText = beamWeight;
                document.getElementById("beamProgress").innerText = beamProgress;
                document.getElementById("beamQRCode").src = beamQRCode;

                // ✅ Fix Positioning
                let beamRect = event.target.getBoundingClientRect();
                let panelWidth = beamDetailsPanel.offsetWidth;
                let panelHeight = beamDetailsPanel.offsetHeight;

                let posX = beamRect.left + window.scrollX + beamRect.width / 2 - panelWidth / 2;
                let posY = beamRect.top + window.scrollY - panelHeight - 10;

                posX = Math.max(10, Math.min(posX, window.innerWidth - panelWidth - 10));
                posY = Math.max(10, posY);

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
