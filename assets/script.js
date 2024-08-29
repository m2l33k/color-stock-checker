let df = null;

function colorDistance(rgb1, rgb2) {
    return Math.sqrt(
        (rgb1[0] - rgb2[0]) ** 2 +
        (rgb1[1] - rgb2[1]) ** 2 +
        (rgb1[2] - rgb2[2]) ** 2
    );
}

function findClosestColor(inputRgb, df) {
    let minDistance = Infinity;
    let closestRow = null;

    df.forEach(row => {
        let rgb = row['RVB'].replace(/[()]/g, '').split(',').map(Number); // Convert "(R, G, B)" to [R, G, B]
        let distance = colorDistance(inputRgb, rgb);
        // Ensure the color has stock greater than 0 before considering it
        if (distance < minDistance && row['stock'] > 0) {
            minDistance = distance;
            closestRow = row;
        }
    });

    return closestRow;
}

function loadFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        df = XLSX.utils.sheet_to_json(firstSheet);
        alert("File loaded successfully!");
    };
    reader.readAsArrayBuffer(file);
}

document.getElementById('file-input').addEventListener('change', loadFile);

function checkColor() {
    if (df === null) {
        alert("Please load an Excel file first.");
        return;
    }

    const inputHtmlCode = document.getElementById('color-input').value.trim().toUpperCase();
    if (!inputHtmlCode.startsWith("#") || inputHtmlCode.length !== 7) {
        alert("Invalid HTML color code. Use format like #FF5733.");
        return;
    }

    const exactMatch = df.find(row => row["CODE HTML"] === inputHtmlCode);
    if (exactMatch && exactMatch['stock'] > 0) {
        document.getElementById('output').textContent = `Color ${inputHtmlCode} is in stock under the name '${exactMatch.COULEUR}'.`;
    } else {
        const inputRgb = [
            parseInt(inputHtmlCode.slice(1, 3), 16),
            parseInt(inputHtmlCode.slice(3, 5), 16),
            parseInt(inputHtmlCode.slice(5, 7), 16)
        ];

        const closestMatch = findClosestColor(inputRgb, df);
        if (closestMatch !== null) {
            document.getElementById('output').textContent = `The exact color is not in stock. The closest available color is ${closestMatch["CODE HTML"]} (Name: ${closestMatch.COULEUR}) with a stock of ${closestMatch['stock']}.`;
        } else {
            document.getElementById('output').textContent = "No available colors close to the requested one.";
        }
    }
}
