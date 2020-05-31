export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia2FyYW5nb3JlIiwiYSI6ImNrYXM2ODFjdjA1MDQyeG8zaThtNjhsZ3gifQ.BvaYdlJhZtihjHstikwrvA';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/karangore/ckas6fq000si51io6ocvqpqix',
    scrollZoom: false
    // center: [-118.406916, 34.087804],
    // zoom: 9
    //   interactive:false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';
    // Add the marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popups
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extends thr map bounds to include the current location
    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 }
  });
};
