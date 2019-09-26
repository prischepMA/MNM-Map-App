import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class FirebaseService {
  constructor(private firestore: AngularFirestore) {
  }

  createPolygon(data: MapConfiguration) {
    const polygonsRef = this.firestore.collection("polygons");

    return polygonsRef.doc(data.id)
      .get()
      .toPromise()
      .then((doc) => {
        if (doc.exists) {
          return false;
        } else {
          polygonsRef.add(JSON.parse(JSON.stringify(data)))
            .then(() => true);
        }
      });
  }

  getPolygon(id: string) {
    this.firestore
      .collection("polygons")
      .doc(id)
      .get().toPromise()
      .then(function (doc) {
        if (doc.exists) {
          console.log(doc);
          return { success: true }; //, polygon: JSON.parse(doc) 
        } else {
          return { success: false };
        }
      }).catch(function (error) {
        console.log("Error getting document:", error);
      });
  }
}
