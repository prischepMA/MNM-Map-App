import LatLng = google.maps.LatLng;
import MVCArray = google.maps.MVCArray;

 interface MapConfiguration {
  id: string,
  zoom: number;
  path: LatLng[];
  mapCenter: LatLng;
}
