import { Component, OnInit, ViewChild } from '@angular/core';
import { DeleteMenu } from '../model/DeleteMenu';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  @ViewChild('map', {static: true})
  mapElement: any;
  map: google.maps.Map;
  poly = null;

  constructor() {
  }

  ngOnInit() {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 7,
      center: {lat: 41.879, lng: -87.624}
    });

    this.poly = new google.maps.Polyline({
      editable: true,
      strokeOpacity: 0.7,
      strokeColor: '#75d8ff',
      strokeWeight: 2,
      draggable: true
    });
    this.poly.setMap(this.map);

    this.map.addListener('click', this.addLatLng.bind(this));

    const deleteMenu = new DeleteMenu();

    google.maps.event.addListener(this.poly, 'rightclick', (e) => {
      if (e.vertex === undefined) {
        return;
      }
      deleteMenu.open(this.map, this.poly.getPath(), e.vertex);
    });

    google.maps.event.addListener(this.poly, 'click', (e) => {
      const poly = this.poly.getPath();

      if (e.vertex === 0 && this.poly.getPath().getLength() > 2) {
        poly.push(poly.getAt(0));
      }
    });
  }

  addLatLng(event) {
    const path = this.poly.getPath();
    if (path.getAt(0) === path.getAt(path.getLength() - 1) && path.getLength() > 1) {
      return;
    }

    path.push(event.latLng);
  }
}
