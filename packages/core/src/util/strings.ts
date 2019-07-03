/**
 * Transform a query string to an object.
 *
 * @param {Object} obj Object that should be transformed.
 * @param {String} prefix Optional prefix.
 * @returns {String}
 * @api public
 */
export function querystringify(obj: Object, prefix: string = "") {
  prefix = prefix || "";

  const pairs: string[] = [];

  //
  // Optionally prefix with a '?' if needed
  //
  if ("string" !== typeof prefix) prefix = "?";

  Object.entries(obj).forEach(([key, value]) => {
    //
    // Edge cases where we actually want to encode the value to an empty
    // string instead of the stringified value.
    //
    if (!value && (value === null || value === undefined || isNaN(value))) {
      value = "";
    }

    key = encodeURIComponent(key);
    value = encodeURIComponent(value);

    //
    // If we failed to encode the strings, we should bail out as we don't
    // want to add invalid strings to the query.
    //
    if (key === null || value === null) return;
    pairs.push(`${key}=${value}`);
  });

  return pairs.length ? prefix + pairs.join("&") : "";
}
