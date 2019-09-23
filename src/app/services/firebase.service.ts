import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class FirebaseService {
  constructor(  private firestore: AngularFirestore ) {
  }

  createPolygon(data: MapConfiguration) {
    return new Promise<any>((resolve, reject) =>{
        this.firestore
            .collection("polygons")
            .add(JSON.parse(JSON.stringify(data)))
            .then(res => {}, err => reject(err));
    });
  }
}
