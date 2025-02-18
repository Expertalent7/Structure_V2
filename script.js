document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Page Loaded, Fetching Beam Data");

    async function fetchBeamData() {
        const GITHUB_API_URL = "https://raw.githubusercontent.com/expertalent7/Structure_V2/main/data/beams-data.json";

        try {
            const response = await fetch(GITHUB_API_URL);
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

            const beamData = await response.json();
            console.log("✅ Beam Data Loaded:", beamData);

            window.beamData = beamData;
            updateBeamUI();
        } catch (error) {
            console.error("❌ Error fetching beam data:", error);
        }
    }

    function updateBeamUI() {
        if (!window.beamData) {
            console.error("❌ beamData is missing!");
            return;
        }

        document.querySelectorAll(".beam").forEach(beamElement => {
            let beamName = beamElement.dataset.name?.toLowerCase().trim();
            let beamDataEntry = window.beamData.find(b =>
                b.Beam_Name.toLowerCase().trim() === beamName
            );

            if (beamDataEntry) {
                beamElement.classList.remove("installed", "not-installed", "in-progress", "highlight");

                if (beamDataEntry.Progress === "100.00%") {
                    beamElement.classList.add("installed");
                } else if (beamDataEntry.Progress !== "0.00%") {
                    beamElement.classList.add("in-progress");
                } else {
                    beamElement.classList.add("not-installed");
                }
            } else {
                console.warn(`⚠ No data found for beam: ${beamName}`);
            }
        });
    }

    // ✅ Fetch beam data every 5 seconds
    setInterval(fetchBeamData, 5000);

    // ✅ Initial Fetch
    fetchBeamData();
});
