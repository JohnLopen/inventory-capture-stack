function escapeCsvValue(value) {
    // Always wrap values in double quotes
    if (typeof value === "string") {
        // Escape any double quotes inside the value by doubling them
        return `"${value.replace(/"/g, '""')}"`;
    }
    // If the value is not a string, convert it to a string and enclose in quotes
    return `"${String(value)}"`;
}

function generateCSV(array) {
    const headers = Object.keys(array[0]); // Get the object keys (column names)
    const csv = [
        headers.map(escapeCsvValue).join(","), // First row is the header, with each header enclosed in quotes
        ...array.map(row => headers.map(field => escapeCsvValue(row[field])).join(","))
    ].join("\n");
    return csv;
}

function downloadCSV(csvContent, filename = "data.csv") {
    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden'; // Hide the link

    // Append the link to the DOM and trigger the download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Release the object URL
}