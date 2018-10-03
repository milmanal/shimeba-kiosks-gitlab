import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatKeyboardModule } from '@ngx-material-keyboard/core';
import { MatInputModule } from '@angular/material/input';

import { SearchRoutingModule } from './search-routing.module';

import { SearchComponent } from './search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  imports: [
    CommonModule,
    SearchRoutingModule,
    TranslateModule,
    MatKeyboardModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule
  ],
  declarations: [SearchComponent]
})
export class SearchModule { }
