import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  polygonName: string;
}

@Component({
  selector: 'save-dialog',
  templateUrl: 'save-dialog.component.html',
})
export class SaveDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<SaveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    onCancelClick(): void {
      this.dialogRef.close();
  }

}