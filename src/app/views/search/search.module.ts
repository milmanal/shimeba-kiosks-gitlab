import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SearchComponent } from './search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IKeyboardLayouts, keyboardLayouts, MAT_KEYBOARD_LAYOUTS, MatKeyboardModule} from '@ngx-material-keyboard/core';


import { AmharicLayoutConfig } from './../../configs/amharic-keyboard.config';
import { SearchRoutingModule } from './search-routing.module';
import { SharedModule } from '../../shared.module';

const customLayouts: IKeyboardLayouts = {
  ...keyboardLayouts,
  'Amharic Layout': AmharicLayoutConfig,
};

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    MatKeyboardModule,
    FormsModule,
    ReactiveFormsModule,
    SearchRoutingModule,
    SharedModule
  ],
  providers: [{ provide: MAT_KEYBOARD_LAYOUTS, useValue: customLayouts }],
  declarations: [SearchComponent],
})
export class SearchModule {}
