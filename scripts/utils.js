
/**
 * Remove all script tags. We're letting the page evaluate scripts with networkidle0,
 * so we want to remove them after.
 * leave <head> scripts (eg: analytics)
 */
exports.rmScriptTags = function () {
  const els = [...document.querySelectorAll('body script')];
    els.forEach(tag =>
      tag.parentNode.removeChild(tag)
    );
}
