import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DeleteMenu } from '../model/DeleteMenu';
import { FirebaseService } from '../services/firebase.service';

import MapsEventListener = google.maps.MapsEventListener;
import html2canvas from 'html2canvas';
import { MatDialog } from '@angular/material/dialog';
import { OpenDialogComponent } from '../dialogs/open-dialog/open-dialog.component';
import { SaveDialogComponent } from '../dialogs/save-dialog/save-dialog.component';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  map: google.maps.Map;
  polyline = null;
  polygon = null;
  polygonName = null;
  deleteMenu: DeleteMenu = null;
  isEditing: boolean;
  rightClickListener: MapsEventListener = null;
  mapClickListener: MapsEventListener = null;
  firstVertexClick: MapsEventListener = null;
  mapConfiguration: MapConfiguration = null;
  calculatedSquare: string;

  polylineConfig = {
    editable: true,
    strokeOpacity: 0.7,
    strokeColor: '#75d8ff',
    strokeWeight: 2,
    draggable: true
  };

  polygonConfig = {
    strokeColor: '#75d8ff',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#75d8ff',
    fillOpacity: 0.35
  };

  @ViewChild('map', {static: true}) mapElement: any;
  @ViewChild('canvas', {static: true}) canvas: ElementRef;
  @ViewChild('downloadLink', {static: true}) downloadLink: ElementRef;
  @ViewChild('selectMapType', {
    read: ElementRef,
    static: true
  }) private mapSelector: ElementRef;

  constructor(private firebaseService: FirebaseService,
              public dialog: MatDialog,
              private snackBar: MatSnackBar) {
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
    this.polygonName = null;
    this.isEditing = true;
    if (this.polygon) {
      this.polygon.setMap(null);
    }
    this.polyline = new google.maps.Polyline(this.polylineConfig);

    this.polyline.setMap(this.map);

    this.initListenersForEditing();
  }

  startEditingExistingPolygon() {
    this.isEditing = true;
    if (this.polygon) {
      this.polygon.setMap(null);
    }

    this.polyline.setMap(this.map);

    this.initListenersForEditing();
  }

  initListenersForEditing() {
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
    this.polygonName = null;
    this.cleanUp();
  }

  cleanUp() {
    google.maps.event.removeListener(this.mapClickListener);
    google.maps.event.removeListener(this.rightClickListener);
    google.maps.event.removeListener(this.firstVertexClick);
  }

  savePolygon(name, update = false) {
    this.calculatedSquare = google.maps.geometry.spherical.computeArea(this.polyline.getPath()).toFixed(1);
    this.isEditing = false;
    this.polygon = new google.maps.Polygon({
      paths: this.polyline.getPath(),
      ...this.polygonConfig
    });
    this.polygon.setMap(this.map);
    this.polyline.setMap(null);
    this.mapConfiguration = {
      id: name,
      mapCenter: this.map.getCenter(),
      path: this.polyline.getPath().getArray(),
      zoom: this.map.getZoom()
    };
    if (!update) {
      this.firebaseService.createPolygon(this.mapConfiguration)
        .then(
          (res) => console.log(res) /* здесь обработочка ошибки. возвращается success = true или false.*/);
    } else {
      this.firebaseService.updatePolygon(this.mapConfiguration)
        .then(
          (res) => console.log(res));
    }
    this.cleanUp();
  }

  openSaveDialog() {
    if (this.polygonName !== null) {
      this.savePolygon(this.polygonName, true);
      return;
    }
    const dialogRef = this.dialog.open(SaveDialogComponent, {
      width: '250px',
      data: {polygonName: ''}
    });

    dialogRef.afterClosed().subscribe(name => {

      if (name !== '') {
        if (name) {
          this.savePolygon(name);
          this.polygonName = name;
        }
      }
    });
  }

  openOpenDialog() {
    const dialogRef = this.dialog.open(OpenDialogComponent, {
      width: '240px',
      data: {polygonName: ''}
    });

    dialogRef.afterClosed().subscribe(name => {
      console.log(name);
      if (name === undefined || name === '') {
        return;
      }
      if (this.polygon) {
        this.polygon.setMap(null);
      }
      this.firebaseService.getPolygon(name).then(
        (res) => {
          const mapCfg = res['polygon'];
          if (mapCfg) {
            this.polygonName = name;

            this.polyline = new google.maps.Polyline({
              path: mapCfg.path,
              ...this.polylineConfig
            });
            this.calculatedSquare = google.maps.geometry.spherical.computeArea(this.polyline.getPath()).toFixed(1);
            this.polygon = new google.maps.Polygon({
              paths: this.polyline.getPath(),
              ...this.polygonConfig
            });
            this.polygon.setMap(this.map);

            this.map.setCenter(mapCfg.mapCenter);
            this.map.setZoom(mapCfg.zoom);
          } else {
            this.snackBar.open('Failed to get the specified file', 'OK', {
                duration: 3000,
                panelClass: ['snack-bar']
              }
            );
          }
        }
      );
    });
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

  onChangeMapType(event) {
    this.map.setMapTypeId(event);
  }
}
