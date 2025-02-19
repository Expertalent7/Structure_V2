document.addEventListener("DOMContentLoaded", async function () {
    console.log("✅ Page Loaded, Assigning Global Fetch Function");

    // 🔄 Global variable to store beam data
    window.beamData = { beams: [] };

    // ✅ Fetch data every 3 seconds to catch new updates immediately
    await fetchBeamData();
    setInterval(fetchBeamData, 3000);
});


    // 🔄 Cache frequently accessed elements
    const beamSearch = document.getElementById("beamSearch");
    const beamDetailsPanel = document.getElementById("beamDetailsPanel");
    const progressText = document.getElementById("progressValue");
    const progressBar = document.getElementById("progressBar");
    const tooltip = document.getElementById("tooltip");
    const beams = document.querySelectorAll(".beam");
    const closeButton = document.getElementById("closePanelBtn");

    // ✅ **Fetch Beam Data** (Key Function Restored)
   window.fetchBeamData = async function () {
    const GITHUB_API_URL = `https://raw.githubusercontent.com/expertalent7/Structure_V2/main/data/beams-data.json?nocache=${new Date().getTime()}`; // ⏳ Prevent caching

    try {
        console.log("🔄 Fetching Beam Data...");
        const response = await fetch(GITHUB_API_URL, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        
        let data = await response.json();
        console.log("📄 Raw Data Fetched:", data);

        if (!Array.isArray(data)) {
            throw new Error("⚠ Error: Data format incorrect! Expected an array.");
        }

        // ✅ Keep only the latest scan for each beam
        let latestBeamData = {};
        data.forEach(entry => {
            let beamName = entry.Beam_Name.toLowerCase().trim();
            if (!latestBeamData[beamName] || new Date(entry.Timestamp) > new Date(latestBeamData[beamName].Timestamp)) {
                latestBeamData[beamName] = entry;
            }
        });

        window.beamData = { beams: Object.values(latestBeamData) };
        console.log("✅ Processed beamData Assigned:", window.beamData);

        updateBeamUI();
        updateInstallationProgress();
    } catch (error) {
        console.error("❌ Error fetching beam data:", error);
        console.warn("⚠ Retrying fetch in 3 seconds...");
        setTimeout(fetchBeamData, 3000);
    }
};


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

    updateInstallationProgress(); // ✅ Ensure the installation progress updates immediately
}


    // ✅ Update Installation Progress
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

    let progressBar = document.getElementById("progressBar");
    let progressText = document.getElementById("progressText");
    let progressValue = document.getElementById("progressValue");

    progressBar.style.width = `${progressPercentage}%`;
    progressValue.innerText = `${progressPercentage}%`;

    // ✅ Ensure the percentage inside the bar is readable
    if (progressPercentage > 0) {
        progressText.innerText = `${progressPercentage}%`;
        progressText.style.color = "white";
        progressBar.style.backgroundColor = "#4CAF50"; // Green when updating
    } else {
        progressText.innerText = "0%";
        progressText.style.color = "black";
        progressBar.style.backgroundColor = "#ccc"; // Gray when empty
    }
}

    // ✅ Show Beam Details on Click
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
                document.getElementById("beamName").innerText = beamDataEntry.Beam_Name;
                document.getElementById("beamStatus").innerText = beamDataEntry.Progress === "100%" ? "Installed" : "Not Installed";
                document.getElementById("beamWeight").innerText = beamDataEntry.Weight ? `${beamDataEntry.Weight} kg` : "Unknown kg";
                document.getElementById("beamProgress").innerText = beamDataEntry.Progress || "0%";
                document.getElementById("beamQRCode").src = `https://quickchart.io/qr?text=${encodeURIComponent(beamDataEntry.Beam_Name)}`;

                beamDetailsPanel.style.display = "block";
                beamDetailsPanel.style.left = `${event.pageX + 15}px`;
                beamDetailsPanel.style.top = `${event.pageY - 20}px`;
            } else {
                console.warn(`⚠ No matching data found for ${beamName}`);
            }
        });
    });

    // ✅ Tooltip on Hover
    beams.forEach(beam => {
        beam.addEventListener("mouseenter", function (event) {
            tooltip.innerText = `Beam: ${this.dataset.name}`;
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
