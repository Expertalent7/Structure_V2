document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Page Loaded, Assigning Global Fetch Function");

    // 🔄 Cache frequently accessed elements
    const beamSearch = document.getElementById("beamSearch");
    const beamDetailsPanel = document.getElementById("beamDetailsPanel");
    const progressText = document.getElementById("progressValue");
    const progressBar = document.getElementById("progressBar");
    const tooltip = document.getElementById("tooltip"); // ✅ Use the tooltip div from HTML
    const beams = document.querySelectorAll(".beam");

    // ✅ Search Beams Efficiently
    beamSearch.addEventListener("input", function () {
        let input = this.value.toLowerCase().trim();
        beams.forEach(beam => {
            let beamName = beam.getAttribute("data-name").toLowerCase();
            beam.classList.toggle("highlight", beamName.includes(input) && input !== "");
        });
    });

    // ❌ Clear Search
    window.clearSearch = function () {
        beamSearch.value = "";
        beams.forEach(beam => beam.classList.remove("highlight"));
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

// 🎯 Show Beam Details on Click (Fix Positioning)
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
            let beamStatus = beamDataEntry.Progress > 0 ? "Installed" : "Not Installed";
            let beamWeight = beamDataEntry.Weight ? `${beamDataEntry.Weight} kg` : "Unknown kg";
            let beamProgress = (beamDataEntry.Progress * 100).toFixed(2) + "%";
            let beamQRCode = beamDataEntry.QR_Code || "https://via.placeholder.com/150";

            document.getElementById("beamName").innerText = beamDataEntry.Beam_Name;
            document.getElementById("beamStatus").innerText = beamStatus;
            document.getElementById("beamWeight").innerText = beamWeight;
            document.getElementById("beamProgress").innerText = beamProgress;
            document.getElementById("beamQRCode").src = beamQRCode;

            // ✅ Fix Positioning: Ensure Beam Details Panel is Near the Clicked Beam
            let beamRect = event.target.getBoundingClientRect();
            let panelWidth = beamDetailsPanel.offsetWidth;
            let panelHeight = beamDetailsPanel.offsetHeight;

            let posX = beamRect.left + window.scrollX + beamRect.width / 2 - panelWidth / 2;
            let posY = beamRect.top + window.scrollY - panelHeight - 10; // 10px margin above the beam

            // ✅ Prevent Panel from Going Off-Screen
            posX = Math.max(10, Math.min(posX, window.innerWidth - panelWidth - 10)); // Keep within horizontal bounds
            posY = Math.max(10, posY); // Ensure it's not hidden above viewport

            beamDetailsPanel.style.left = `${posX}px`;
            beamDetailsPanel.style.top = `${posY}px`;
            beamDetailsPanel.style.display = "block";
        } else {
            console.warn(`⚠ No matching data found for ${beamName}`);
        }
    });
});



    // 🎯 Tooltip for Beam Info on Hover (Auto-position)
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
        const response = await fetch("https://script.google.com/macros/s/AKfycbxSpS5r6DTVFG3dRlUhbfNMmTRRcd2cPZNIG39wTvtagzM4OFg-zLSWs8cV2yKHe6ROMA/exec");
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

            beamElement.classList.remove("installed", "not-installed", "in-progress");

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
    }

    // ✅ Fetch beam data every 5 seconds and update UI
    setInterval(async () => {
        try {
            await fetchBeamStatus(); // Fetch new data
            updateTotalProgress();  // Update progress after fetching
        } catch (error) {
            console.error("❌ Error updating beam status:", error);
        }
    }, 5000);
});
