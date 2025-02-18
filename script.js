document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Page Loaded, Assigning Global Fetch Function");

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

    // ✅ Search Beams Efficiently & Highlight in BLUE
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
    window.clearSearch = function () {
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
    };

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

    // 🎯 Fetch Latest Beam Data from GitHub
    async function fetchBeamStatus() {
        console.log("🔄 Fetching latest beam scans from GitHub...");
        const GITHUB_API_URL = "https://raw.githubusercontent.com/expertalent7/Structure_V2/main/data/beams-data.json";

        try {
            const response = await fetch(GITHUB_API_URL);
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

            const beamData = await response.json();
            console.log("✅ Beam Data Loaded:", beamData);

            window.beamData = beamData;
            updateBeamUI();
            updateTotalProgress();
        } catch (error) {
            console.error("❌ Error fetching beam data:", error);
        }
    }

    // 🎯 Update UI with Latest Beam Data
    function updateBeamUI() {
        if (!window.beamData || !window.beamData.length) {
            console.warn("⚠ No beam data available to update UI!");
            return;
        }

        document.querySelectorAll(".beam").forEach(beamElement => {
            let beamName = beamElement.dataset.name?.toLowerCase().trim();
            let beamDataEntry = window.beamData.find(b => 
                b.Beam_Name.toLowerCase().trim() === beamName
            );

            if (beamDataEntry) {
                beamElement.classList.remove("installed", "not-installed", "in-progress", "highlight");

                if (parseFloat(beamDataEntry.Progress) === 100) {
                    beamElement.classList.add("installed");
                } else if (parseFloat(beamDataEntry.Progress) > 0) {
                    beamElement.classList.add("in-progress");
                } else {
                    beamElement.classList.add("not-installed");
                }
            } else {
                console.warn(`⚠ No matching data found for beam: ${beamName}`);
            }
        });
    }

    // 🔄 Auto-fetch updates every 5 seconds
    setInterval(fetchBeamStatus, 5000);
});
