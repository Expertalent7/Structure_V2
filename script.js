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

    let beamDataLoaded = false; // 🟢 Track if data is loaded

    // ✅ Ensure progress bar is gray at 0%
    if (progressText && parseFloat(progressText.innerText) === 0) {
        progressBar.style.backgroundColor = "#ccc";
    }

    // ✅ Search Beams
    if (beamSearch) {
        beamSearch.addEventListener("input", function () {
            let input = this.value.toLowerCase().trim();
            beams.forEach(beam => {
                let beamName = beam.getAttribute("data-name").toLowerCase();
                if (beamName.includes(input) && input !== "") {
                    beam.classList.add("highlight");
                } else {
                    beam.classList.remove("highlight");
                }
            });
        });
    }

    // ✅ Clear Search
    document.getElementById("clearSearchBtn").addEventListener("click", function () {
        beamSearch.value = "";
        beams.forEach(beam => {
            beam.classList.remove("highlight");
        });
    });

    // ✅ Close Beam Details Panel
    function closePanel() {
        if (beamDetailsPanel) {
            beamDetailsPanel.style.display = "none";
        }
    }
    if (closeButton) {
        closeButton.addEventListener("click", closePanel);
    }

    // ✅ Tooltip for Beam Info on Hover
    beams.forEach(beam => {
        beam.addEventListener("mouseenter", (e) => {
            let beamName = e.target.dataset.name;
            tooltip.innerText = `Beam: ${beamName}`;
            tooltip.style.display = "block";
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
        });

        beam.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });
    });

    // ✅ Show Beam Details on Click
    beams.forEach(beamElement => {
        beamElement.addEventListener("click", function (event) {
            if (!beamDataLoaded || !window.beamData || !window.beamData.beams) {
                console.warn("⚠ No beam data available yet...");
                return;
            }

            let beamName = this.dataset.name.trim().toLowerCase();
            let beamDataEntry = window.beamData.beams.find(b => 
                b.Beam_Name.toLowerCase().trim() === beamName
            );

            if (beamDataEntry) {
                let beamStatus = beamDataEntry.Progress > 0 ? "Installed" : "Not Installed";
                let beamWeight = beamDataEntry.Weight ? `${beamDataEntry.Weight} kg` : "Unknown kg";
                let beamProgress = `${(beamDataEntry.Progress * 100).toFixed(2)}%`;
                let beamQRCode = beamDataEntry.QR_Code || "https://via.placeholder.com/150";

                document.getElementById("beamName").innerText = beamDataEntry.Beam_Name;
                document.getElementById("beamStatus").innerText = beamStatus;
                document.getElementById("beamWeight").innerText = beamWeight;
                document.getElementById("beamProgress").innerText = beamProgress;
                document.getElementById("beamQRCode").src = beamQRCode;

                // ✅ Position Details Panel
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

    async function fetchBeamData(retryCount = 3) {
        const GITHUB_API_URL = "https://raw.githubusercontent.com/expertalent7/Structure_V2/main/data/beams-data.json";

        try {
            const response = await fetch(GITHUB_API_URL);
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

            const beamData = await response.json();
            console.log("✅ Beam Data Loaded:", beamData);

            window.beamData = beamData;
            beamDataLoaded = true; // 🟢 Mark data as loaded
            updateBeamUI();
        } catch (error) {
            console.error("❌ Error fetching beam data:", error);

            if (retryCount > 0) {
                console.log(`🔄 Retrying... (${retryCount} attempts left)`);
                setTimeout(() => fetchBeamData(retryCount - 1), 3000);
            }
        }
    }

    function updateBeamUI() {
        if (!beamDataLoaded || !window.beamData || !window.beamData.beams) {
            console.error("❌ beamData is missing!");
            return;
        }

        document.querySelectorAll(".beam").forEach(beamElement => {
            let beamName = beamElement.dataset.name?.toLowerCase().trim();
            let beamDataEntry = window.beamData.beams.find(b =>
                b.Beam_Name.toLowerCase().trim() === beamName
            );

            if (beamDataEntry) {
                beamElement.classList.remove("installed", "not-installed", "in-progress", "highlight");

                if (beamDataEntry.Progress === 100) {
                    beamElement.classList.add("installed");
                } else if (beamDataEntry.Progress > 0) {
                    beamElement.classList.add("in-progress");
                } else {
                    beamElement.classList.add("not-installed");
                }
            } else {
                console.warn(`⚠ No data found for beam: ${beamName}`);
            }
        });
    }

    fetchBeamData(); // Load data on page load
    setInterval(fetchBeamData, 5000); // Refresh every 5 seconds
});
