import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  polygonName: string;
}

@Component({
  selector: 'open-dialog',
  templateUrl: 'open-dialog.component.html',
})
export class OpenDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<OpenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    onCancelClick(): void {
      this.dialogRef.close();
  }

}