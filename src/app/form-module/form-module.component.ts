import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import {CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-form-module',
  imports: [
    CommonModule,
    MatFormFieldModule, 
    MatSelectModule, 
    FormsModule, 
    ReactiveFormsModule,
    CdkDropList,
    CdkDrag
  ],
  templateUrl: './form-module.component.html',
  styleUrl: './form-module.component.scss'
})
export class FormModuleComponent implements OnInit{

  constructor(private fb: FormBuilder){}
  minEndDate: string | null = null;
  optionList: string[] = ['Option1', 'Option2', 'Option3'];
  items = ['Zero', 'One', 'Two', 'Three', 'Four'];
  
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null; // Holds the Base64-encoded image URL

  storedData : any = {};
  
  dynamicForm !: FormGroup;
  stepperForm !: FormGroup;

  isDefaultRadioOptionChecked:boolean=true;
  
  stepperPage: number = 1;
  ngOnInit(): void {
    this.stepperPage = 1;

    this.stepperForm = new FormGroup({
      inputText: new FormControl('', [Validators.required]),
      inputNumber: new FormControl('', [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
      singleSelect: new FormControl('', [Validators.required]),
      multiSelect: new FormControl([], [Validators.required]),
      isDefaultRadioOptionChecked: new FormControl(true),
      checkedOptions: new FormArray([]),
      dragDropItems: new FormArray(this.items.map(item => new FormControl(item))),
      file: new FormControl(null, [Validators.required]),
      formArrayData: this.fb.array([]),
    });
    
    this.dynamicForm = this.fb.group({
      inputTexts: ['', Validators.required],
      inputNumbers: ['', Validators.required],
    });
    this.addArrayData();

    this.stepperForm.get('isDefaultRadioOptionChecked')?.valueChanges.subscribe(value => {
      this.isDefaultRadioOptionChecked = value;
      console.log('Radio option changed:', this.isDefaultRadioOptionChecked);
    });

    this.loadFromLocalStorage(this.stepperForm, 'myForm');
  }
  
  onStartDateChange(){
    const startDateValue = this.stepperForm.get('startDate')?.value;
    if (startDateValue) {
      this.minEndDate = startDateValue;
      this.stepperForm.get('endDate')?.reset();
    }
  }

  get checkedOptions(): FormArray {
    return this.stepperForm.get('checkedOptions') as FormArray;
  }
  get dragDropItems(): FormArray {
    return this.stepperForm.get('dragDropItems') as FormArray;
  }

  
  onCheckboxChange(event: any, option: string) {
    if (event.target.checked) {
      if (!this.checkedOptions.controls.find(control => control.value === option)) {
        this.checkedOptions.push(new FormControl(option));
      }
    } else {
      const index = this.checkedOptions.controls.findIndex(control => control.value === option);
      if (index !== -1) {
        this.checkedOptions.removeAt(index);
      }
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
    this.updateDragDropFormArray();
  }
  updateDragDropFormArray(){
    while (this.dragDropItems.length !== 0) {
      this.dragDropItems.removeAt(0);
    }

    this.items.forEach(item => {
      this.dragDropItems.push(new FormControl(item));
    });
    this.items = this.dragDropItems.value;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;
      this.previewFile(file);
      this.stepperForm.get('file')?.setValue(file);

    }
  }
  previewFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string; // Set the Base64-encoded image URL
      this.stepperForm.get('file')?.setValue(this.previewUrl); // Update the form control
    };
    reader.readAsDataURL(file); // Converts the file to a Base64-encoded string
  }
  deleteFile(){
    this.selectedFile = null;
    this.previewUrl = null;
    this.stepperForm.get('file')?.setValue(null);
  }

  get formArrayData(): FormArray {
    return this.stepperForm.get('formArrayData') as FormArray;
  }
  

  addArrayData(){
    const dataGroup = this.fb.group({
      inputTexts: ['', Validators.required],
      inputNumbers: ['', Validators.required],
    });
    this.formArrayData.push(dataGroup);
  }
  removeArrayData(index: number){
    this.formArrayData.removeAt(index);
  }
  isLastGroupValid(): boolean {
    const lastGroup = this.formArrayData.at(this.formArrayData.length - 1) as FormGroup;
    return lastGroup.valid;
  }

  onPrevClick(){
    this.stepperPage--;
  }
  
  onNextClick(){
    this.stepperPage++;
  }

  postData(){
    localStorage.removeItem('myForm');
    this.saveToLocalStorage(this.stepperForm, 'myForm');
    this.loadFromLocalStorage(this.stepperForm, 'myForm');
  }

  saveToLocalStorage(form: FormGroup, key: string){
    let formData = form.value;
    let indexedData: { [key: number]: any } = {};
    formData.formArrayData.forEach((item: any, index: number) => {
      indexedData[index] = item;
  });
  
  formData.formArrayData = indexedData;
  localStorage.setItem(key, JSON.stringify(form.value));
  }
  
  
  loadFromLocalStorage(form: FormGroup, key: string): any {
    const stored = localStorage.getItem(key);
    if (stored) {
      this.storedData = JSON.parse(stored);
  
      // Convert indexed object back to an array before patching the form
      if (this.storedData.formArrayData) {
        const arrayData = Object.values(this.storedData.formArrayData); // Convert object to array
        this.storedData.formArrayData = arrayData;
      }
  
      form.patchValue(this.storedData); // Now patching will work
  
      if (this.storedData.formArrayData) {
        this.formArrayData.clear();
        
        Object.keys(this.storedData.formArrayData).forEach((key) => {
          const group = this.storedData.formArrayData[key];
          const dataGroup = this.fb.group({
            inputTexts: [group.inputTexts, Validators.required],
            inputNumbers: [group.inputNumbers, Validators.required],
          });
          this.formArrayData.push(dataGroup);
        });
      };
      if (this.storedData.checkedOptions) {
        this.checkedOptions.clear();
        this.storedData.checkedOptions.forEach((option: string) => {
          this.checkedOptions.push(new FormControl(option));
        });
      };
      
      if (this.storedData.dragDropItems) {
        this.dragDropItems.clear();
        this.storedData.dragDropItems.forEach((item: string) => {
          this.dragDropItems.push(new FormControl(item));
        });
        this.items = this.storedData.dragDropItems; // Update the items array
      };
      return this.storedData;
    }
    return null;
  }
  
}
