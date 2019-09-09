import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DeleteMenu } from '../model/DeleteMenu';
import MapsEventListener = google.maps.MapsEventListener;
import { CalculateSquareService } from '../services/calculate-square.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  @ViewChild('map', {static: true})
  mapElement: any;
  map: google.maps.Map;
  polyline = null;
  polygon = null;
  deleteMenu: DeleteMenu = null;
  isEditing: boolean;
  rightClickListener: MapsEventListener = null;
  mapClickListener: MapsEventListener = null;
  firstVertexClick: MapsEventListener = null;

  constructor(private calculateSquare: CalculateSquareService) {
  }

  ngOnInit() {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 4,
      center: {lat: 41.879, lng: -87.624},
      fullscreenControl: false
    });

    this.deleteMenu = new DeleteMenu();
  }

  addLatLng(event) {
    const path = this.polyline.getPath();
    if (path.getAt(0) === path.getAt(path.getLength() - 1) && path.getLength() > 1) {
      return;
    }

    path.push(event.latLng);
  }

  startEditing() {
    this.isEditing = true;
    if (this.polygon) {
      this.polygon.setMap(null);
    }
    this.polyline = new google.maps.Polyline({
      editable: true,
      strokeOpacity: 0.7,
      strokeColor: '#75d8ff',
      strokeWeight: 2,
      draggable: true
    });

    this.polyline.setMap(this.map);

    this.mapClickListener = this.map.addListener('click', this.addLatLng.bind(this));

    this.rightClickListener = google.maps.event.addListener(this.polyline, 'rightclick', (e) => {
      if (e.vertex === undefined) {
        return;
      }
      this.deleteMenu.open(this.map, this.polyline.getPath(), e.vertex);
    });

    this.firstVertexClick = google.maps.event.addListener(this.polyline, 'click', (e) => {
      const poly = this.polyline.getPath();

      if (e.vertex === 0 && this.polyline.getPath().getLength() > 2) {
        poly.push(poly.getAt(0));
      }
    });
  }

  cancelEditing() {
    this.isEditing = false;
    this.polyline.setMap(null);
    this.cleanUp();
  }

  cleanUp() {
    google.maps.event.removeListener(this.mapClickListener);
    google.maps.event.removeListener(this.rightClickListener);
    google.maps.event.removeListener(this.firstVertexClick);
  }

  savePolygon() {
    console.log(this.calculateSquare.calculateSquare(this.polyline.getPath()));
    this.isEditing = false;
    this.polygon = new google.maps.Polygon({
      paths: this.polyline.getPath(),
      strokeColor: '#75d8ff',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#75d8ff',
      fillOpacity: 0.35
    });
    this.polygon.setMap(this.map);
    this.polyline.setMap(null);
    this.cleanUp();
  }
}
