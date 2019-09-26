import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { JSDocCommentStmt } from '@angular/compiler';

@Injectable()
export class FirebaseService {
  constructor(private firestore: AngularFirestore) {
  }

  createPolygon(data: MapConfiguration) {
    const polygonsRef = this.firestore.collection("polygons");
    console.log("poly to add: " + JSON.stringify(data))

    return polygonsRef.doc(data.id)
      .get()
      .toPromise()
      .then((doc) => {
        if (doc.exists) {
          return false;
        } else {
          console.log('added  ')
          polygonsRef.doc(data.id)
            .set(JSON.parse(JSON.stringify(data)));
          return true;
        }
      });
  }

  getPolygon(id: string) {
    return this.firestore
        .collection("polygons")
        .doc(id)
        .get().toPromise()
        .then(function (doc) {
          if (doc.exists) {
            console.log(doc.data());
            return { success: true, polygon: doc.data() };
          } else {
            return { success: false };
          }
        }).catch(function (error) {
          console.log("Error getting document:", error);
        });
  }

  updatePolygon(data: MapConfiguration) {
    const polygonsRef = this.firestore.collection("polygons");

    return polygonsRef.doc(data.id)
      .get()
      .toPromise()
      .then((doc) => {
        if (!doc.exists) {
          return false;
        } else {
          return polygonsRef.doc(data.id)
            .update(JSON.parse(JSON.stringify(data)))
            .then(() => true);
        }
      });
  }
}
