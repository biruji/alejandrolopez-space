// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Publications from the public ORCID API
(function () {
  const ORCID = "0000-0001-5498-1746";
  const list = document.getElementById("pubs");

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fallback() {
    list.innerHTML =
      '<li>Could not load the list right now. See the full record on ' +
      '<a href="https://orcid.org/' + ORCID + '">ORCID</a>.</li>';
  }

  fetch("https://pub.orcid.org/v3.0/" + ORCID + "/works", {
    headers: { Accept: "application/json" }
  })
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(function (data) {
      const works = (data.group || []).map(function (g) {
        const w = g["work-summary"][0];
        const year = w["publication-date"] && w["publication-date"].year
          ? w["publication-date"].year.value : "";
        const ids = (g["external-ids"] && g["external-ids"]["external-id"]) || [];
        const doiObj = ids.find(function (i) { return i["external-id-type"] === "doi"; });
        const doi = doiObj ? doiObj["external-id-value"] : "";
        return {
          title: w.title && w.title.title ? w.title.title.value : "Untitled",
          venue: w["journal-title"] ? w["journal-title"].value : "",
          year: year,
          doi: doi
        };
      });

      works.sort(function (a, b) { return Number(b.year || 0) - Number(a.year || 0); });

      if (!works.length) { fallback(); return; }

      list.removeAttribute("reversed");
      list.innerHTML = works.map(function (w) {
        const title = w.doi
          ? '<a href="https://doi.org/' + encodeURI(w.doi) + '">' + esc(w.title) + "</a>"
          : esc(w.title);
        return "<li>" + title +
          (w.venue ? '<br><span class="venue">' + esc(w.venue) + "</span>" : "") +
          (w.year ? ' <span class="year">(' + esc(w.year) + ")</span>" : "") +
          "</li>";
      }).join("");
    })
    .catch(fallback);
})();
