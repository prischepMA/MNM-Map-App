import LatLng = google.maps.LatLng;
import MVCArray = google.maps.MVCArray;

 interface MapConfiguration {
  zoom: number;
  path: LatLng[];
  mapCenter: LatLng;
}
