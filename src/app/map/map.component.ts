import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DeleteMenu } from '../model/DeleteMenu';
import { FirebaseService } from '../services/firebase.service';

import MapsEventListener = google.maps.MapsEventListener;
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  map: google.maps.Map;
  polyline = null;
  polygon = null;
  deleteMenu: DeleteMenu = null;
  isEditing: boolean;
  rightClickListener: MapsEventListener = null;
  mapClickListener: MapsEventListener = null;
  firstVertexClick: MapsEventListener = null;
  mapConfiguration: MapConfiguration = null;

  @ViewChild('map', {static: true}) mapElement: any;
  @ViewChild('canvas', {static: true}) canvas: ElementRef;
  @ViewChild('downloadLink', {static: true}) downloadLink: ElementRef;

  constructor( private firebaseService:FirebaseService ) {
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
    console.log(google.maps.geometry.spherical.computeArea(this.polyline.getPath()));
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
    this.mapConfiguration = {
      // id: сюда докинуть айди которое вели 
      mapCenter: this.map.getCenter(),
      path: this.polyline.getPath().getArray(),
      zoom: this.map.getZoom()
    };

    this.firebaseService.createPolygon(this.mapConfiguration)
    .then(
      (res) => console.log(res) /* здесь обработочка ошибки. возвращается success = true или false.*/ );
    this.cleanUp();
  }

  downloadImage() {
    html2canvas(document.querySelector('.gm-style'), {
      useCORS: true,
    }).then(canvas => {
      this.canvas.nativeElement.src = canvas.toDataURL();
      this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
      this.downloadLink.nativeElement.download = 'map.png';
      this.downloadLink.nativeElement.click();
    });
  }
}
