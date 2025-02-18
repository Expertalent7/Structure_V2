document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Page Loaded, Assigning Global Fetch Function");

    let manualUpdate = false;  // Flag to control auto-refresh

    // ✅ Function to Fetch and Update Beam Data
    async function fetchBeamStatus() {
        if (manualUpdate) return;  // Prevent redundant API calls

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

    // ✅ Function to Fetch Data Instantly After Scanning
    window.updateBeamData = async function () {
        manualUpdate = true;  // Stop auto-refresh temporarily
        console.log("🔄 Manual Beam Update Triggered!");

        await fetchBeamStatus();  // Fetch immediately

        // ✅ Resume Auto-Refresh After 5 Seconds
        setTimeout(() => {
            manualUpdate = false;
        }, 5000);
    };

    // ✅ Function to Update Beam UI
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

    // ✅ Function to Update Progress Bar
    function updateTotalProgress() {
        if (!window.beamData || !window.beamData.beams) return;

        let totalWeight = 0, installedWeight = 0;
        window.beamData.beams.forEach(beam => {
            totalWeight += beam.Weight || 0;
            if (beam.Progress > 0) installedWeight += beam.Weight || 0;
        });

        let overallProgress = totalWeight > 0 ? (installedWeight / totalWeight) * 100 : 0;
        let progressBar = document.getElementById("progressBar");

        // ✅ Update Progress Bar Width & Text
        progressBar.style.width = `${overallProgress}%`;
        progressBar.innerText = `${overallProgress.toFixed(2)}%`;

        // ✅ Dynamically Change Background Color
        progressBar.style.backgroundColor = overallProgress > 0 ? "#4caf50" : "#bbb";

        document.getElementById("installationProgress").innerText = `Installation Progress: ${overallProgress.toFixed(2)}%`;
    }

    // ✅ Auto-Refresh Every 5 Seconds (unless manual update is active)
    setInterval(fetchBeamStatus, 5000);
});
