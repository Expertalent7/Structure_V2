document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Page Loaded, Assigning Global Fetch Function");

    // 🔄 Cache frequently accessed elements
    const beamSearch = document.getElementById("beamSearch");
    const beamDetailsPanel = document.getElementById("beamDetailsPanel");
    const progressText = document.getElementById("progressValue");
    const progressBar = document.getElementById("progressBar");
    const tooltip = document.getElementById("tooltip");
    const beams = document.querySelectorAll(".beam");

    // ✅ Ensure progress bar is grey when at 0%
    progressBar.style.backgroundColor = "#ccc";
    progressBar.style.width = "0%";

    // ✅ Search Beams Efficiently & Highlight in BLUE
    beamSearch.addEventListener("input", function () {
        let input = this.value.toLowerCase().trim();
        console.log("🔍 Searching for:", input);

        beams.forEach(beam => {
            let beamName = beam.getAttribute("data-name").toLowerCase();
            let isMatch = beamName.includes(input) && input !== "";
            
            if (isMatch) {
                console.log("✅ Highlighting Beam:", beamName);
                beam.classList.add("highlight"); 
                beam.style.border = "2px solid blue"; // Visual blue highlight
            } else {
                beam.classList.remove("highlight");
                beam.style.border = ""; // Reset if not matching
            }
        });
    });

    // ❌ Clear Search
    window.clearSearch = function () {
        beamSearch.value = "";
        beams.forEach(beam => {
            beam.classList.remove("highlight");
            beam.style.border = ""; 
        });
    };

    // 📌 Close Details Panel
    window.closePanel = function () {
        beamDetailsPanel.style.display = "none";
    };

    // ✅ Make QR Code Clickable
    document.getElementById("beamQRCode").addEventListener("click", function () {
        let qrCodeUrl = this.src;
        if (qrCodeUrl) {
            window.open(qrCodeUrl, "_blank");
        }
    });

    // 🎯 Tooltip for Beam Info on Hover
    beams.forEach(beam => {
        beam.addEventListener("mouseenter", (e) => {
            let beamName = e.target.dataset.name;
            let beamStatus = e.target.classList.contains("installed") ? "Installed" : "Not Installed";

            tooltip.innerText = `${beamName} - ${beamStatus}`;
            document.body.appendChild(tooltip);
            tooltip.style.display = "block";

            let x = e.pageX + 15;
            let y = e.pageY + 15;

            // ✅ Prevent tooltip from going off-screen
            if (x + tooltip.offsetWidth > window.innerWidth) {
                x = e.pageX - tooltip.offsetWidth - 15;
            }
            if (y + tooltip.offsetHeight > window.innerHeight) {
                y = e.pageY - tooltip.offsetHeight - 15;
            }

            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        });

        beam.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });
    });

    // 🔄 Fetch Beam Status
    async function fetchBeamStatus() {
        console.log("🔄 Fetching beam status...");

        try {
            const response = await fetch("https://script.google.com/macros/s/AKfycbwnu9BV4qSzWZ2Wfs5hMMsy7WtePg19FSCNO7ZKaAzuUkjxG8Wjx1YPCtAX4u5GgNXE/exec");
            if (!response.ok) throw new Error(`❌ HTTP error! Status: ${response.status}`);

            const data = await response.json();
            console.log("✅ JSON Data Received:", data);
            window.beamData = data;

            updateBeamUI();
            updateTotalProgress();
        } catch (error) {
            console.error("❌ Error fetching beam data:", error);
        }
    }

    function updateBeamUI() {
        if (!window.beamData || !window.beamData.beams) {
            console.error("❌ beamData is missing!");
            return;
        }

        document.querySelectorAll(".beam").forEach(beamElement => {
            let beamName = beamElement.dataset.name?.toLowerCase().trim();
            let beamDataEntry = window.beamData.beams.find(b =>
                b.Beam_Name.toLowerCase().trim() === beamName
            );

            if (beamDataEntry) {
                console.log(`🔄 Updating Beam: ${beamDataEntry.Beam_Name}, Progress: ${beamDataEntry.Progress}%`);

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

    function updateTotalProgress() {
        if (!window.beamData || !window.beamData.beams) return;

        let totalWeight = 0, installedWeight = 0;
        window.beamData.beams.forEach(beam => {
            totalWeight += beam.Weight || 0;
            if (beam.Progress > 0) installedWeight += beam.Weight || 0;
        });

        let overallProgress = totalWeight > 0 ? (installedWeight / totalWeight) * 100 : 0;

        progressBar.style.width = `${overallProgress}%`;
        progressBar.innerText = `${overallProgress.toFixed(2)}%`;
        document.getElementById("installationProgress").innerText = `Installation Progress: ${overallProgress.toFixed(2)}%`;

        // ✅ Update progress bar color
        progressBar.style.backgroundColor = overallProgress > 0 ? "green" : "#ccc";
    }

    setInterval(fetchBeamStatus, 5000);
});
