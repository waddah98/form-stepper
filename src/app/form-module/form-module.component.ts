import { Component, OnInit } from '@angular/core';
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-module',
  imports: [
    MatFormFieldModule, 
    MatSelectModule, 
    FormsModule, 
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './form-module.component.html',
  styleUrl: './form-module.component.scss'
})
export class FormModuleComponent implements OnInit{
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
      // checkedOption: new FormControl([], [Validators.required]),
    });

    this.stepperForm.get('isDefaultRadioOptionChecked')?.valueChanges.subscribe(value => {
      this.isDefaultRadioOptionChecked = value;
      console.log('Radio option changed:', this.isDefaultRadioOptionChecked);
    });
  }
  
  get checkedOptions(): FormArray {
    return this.stepperForm.get('checkedOptions') as FormArray;
  }

  onCheckboxChange(event: any, option: string) {
    if (event.target.checked) {
      this.checkedOptions.push(new FormControl(option));
    } else {
      const index = this.checkedOptions.controls.findIndex(control => control.value === option);
      this.checkedOptions.removeAt(index);
    }
  }

  postData(){
    console.log("🚀 ~ FormModuleComponent ~ ngOnInit ~ this.stepperForm:", this.stepperForm.value)
    
    const jsonBody = {};
  }

  optionList: string[] = ['Option1', 'Option2', 'Option3', 'Option4', 'Option5'];
  
  onPrevClick(){
    this.stepperPage--;
  }

  onNextClick(){
    this.stepperPage++;
  }
}
