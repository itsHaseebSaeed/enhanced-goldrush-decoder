/**
 * Recursively cleans an object by removing fields with zero, null, undefined,
 * empty objects, or empty arrays.
 *
 * @param {Object|Array} data - The data to be cleaned.
 * @returns {Object|Array} - The cleaned data.
 */
export function cleanData(data) {
    if (Array.isArray(data)) {
        // Process each element in the array
        const cleanedArray = data
            .map((item) => cleanData(item)) // Recursively clean each item
            .filter((item) => {
                // Remove items that are null, undefined, empty objects, or empty arrays
                if (item === null || item === undefined) return false;
                if (typeof item === "object") {
                    return Object.keys(item).length > 0;
                }
                return true;
            });
        return cleanedArray;
    } else if (typeof data === "object" && data !== null) {
        // Process each key in the object
        const cleanedObject = Object.entries(data).reduce(
            (acc, [key, value]) => {
                const cleanedValue = cleanData(value); // Recursively clean the value

                // Determine whether to include the key based on the cleaned value
                const shouldInclude =
                    cleanedValue !== null &&
                    cleanedValue !== undefined &&
                    !(typeof cleanedValue === "number" && cleanedValue === 0) &&
                    !(
                        typeof cleanedValue === "object" &&
                        !Array.isArray(cleanedValue) &&
                        Object.keys(cleanedValue).length === 0
                    ) &&
                    !(Array.isArray(cleanedValue) && cleanedValue.length === 0);

                if (shouldInclude) {
                    acc[key] = cleanedValue;
                }

                return acc;
            },
            {}
        );

        return cleanedObject;
    }

    // For all other data types (number, string, boolean, etc.)
    return data;
}
