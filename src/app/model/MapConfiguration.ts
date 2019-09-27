import LatLng = google.maps.LatLng;

interface MapConfiguration {
  id: string;
  zoom: number;
  path: LatLng[];
  mapCenter: LatLng;
}
