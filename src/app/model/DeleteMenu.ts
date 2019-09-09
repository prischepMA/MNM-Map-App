export class DeleteMenu extends google.maps.OverlayView {
  divListener = null;
  div: HTMLDivElement;

  constructor() {
    super();
    this.div = document.createElement('div');
    this.div.className = 'delete-menu';
    this.div.innerHTML = 'Delete';

    google.maps.event.addDomListener(this.div, 'click', (event) => {
      this.removeVertex();
      event.stopPropagation();
    });
  }

  onAdd() {
    const map = this.getMap();
    this.getPanes().floatPane.appendChild(this.div);

    if (map instanceof google.maps.Map) {
      this.divListener = google.maps.event.addDomListener(map.getDiv(), 'mousedown', (e) => {
        if (e.target !== this.div) {
          this.close();
        }
      }, true);
    }
  }


  onRemove() {
    google.maps.event.removeListener(this.divListener);
    this.div.parentNode.removeChild(this.div);

    this.set('position', null);
    this.set('path', null);
    this.set('vertex', null);
  }

  close() {
    this.setMap(null);
  }

  draw() {
    const position = this.get('position');
    const projection = this.getProjection();

    if (!position || !projection) {
      return;
    }

    const point = projection.fromLatLngToDivPixel(position);
    this.div.style.top = point.y + 'px';
    this.div.style.left = point.x + 'px';
  }

  open(map, path, vertex) {
    this.set('position', path.getAt(vertex));
    this.set('path', path);
    this.set('vertex', vertex);
    this.setMap(map);
    this.draw();
  }

  removeVertex() {
    const path = this.get('path');
    const vertex = this.get('vertex');

    if (!path || vertex === undefined) {
      this.close();
      return;
    }

    path.removeAt(vertex);
    this.close();
  }
}
