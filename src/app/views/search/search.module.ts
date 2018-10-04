import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatKeyboardModule } from '@ngx-material-keyboard/core';
import { MatInputModule } from '@angular/material/input';

import { SearchRoutingModule } from './search-routing.module';

import { SearchComponent } from './search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IKeyboardLayouts, keyboardLayouts, MAT_KEYBOARD_LAYOUTS } from '@ngx-material-keyboard/core';

const customLayouts: IKeyboardLayouts = {
  ...keyboardLayouts,
  'Amharic Layout': {
    'name': 'Amharic layout',
    'keys': [
      [
        ['`', '~'],
        ['1', '!'],
        ['2', '@'],
        ['3', '#'],
        ['4', '$'],
        ['5', '%'],
        ['6', '^'],
        ['7', '&'],
        ['8', '*'],
        ['9', '('],
        ['0', ')'],
        ['-', '_'],
        ['=', '+'],
        ['Backspace', 'Backspace']
      ],
      [
        ['Tab', 'Tab'],
        ['ቅ', 'ቅ'],
        ['ው', 'ው'],
        ['እ', 'ኤ'],
        ['ር', 'ር'],
        ['ት', 'ጥ'],
        ['ይ', 'ይ'],
        ['ኡ', 'ኡ'],
        ['ኢ', 'እ'],
        ['ኦ', 'ኦ'],
        ['ፕ', 'ጵ'],
        ['[', '{'],
        [']', '}'],
        ['\\', '|']
      ],
      [
        ['CapsLock', 'CapsLock'],
        ['አ', 'ዐ'],
        ['ስ', 'ጽ'],
        ['ድ', 'ድ'],
        ['ፍ', 'ፍ'],
        ['ግ', 'ግ'],
        ['ህ', 'ሕ'],
        ['ጅ', 'ጅ'],
        ['ክ', 'ኽ'],
        ['ል', 'ል'],
        ['፤', '፡'],
        ['\'', '"'],
        ['Enter', 'Enter']
      ],
      [
        ['Shift', 'Shift'],
        ['ዝ', 'ዥ'],
        ['ሽ', 'ሽ'],
        ['ች', 'ጭ'],
        ['ቭ', 'ቭ'],
        ['ብ', 'ብ'],
        ['ን', 'ኝ'],
        ['ም', 'ም'],
        ['፣', '<'],
        ['.', '>'],
        ['/', '?'],
        ['Shift', 'Shift']
      ],
      [
        [' ', ' ']
      ]
    ],
    'lang': ['am']
  }
};

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
  providers: [
    { provide: MAT_KEYBOARD_LAYOUTS, useValue: customLayouts }
  ],
  declarations: [SearchComponent]
})
export class SearchModule { }
